#!/usr/bin/env python3
"""Gestión de temas de Navidrome Wrapped.

    python scripts/theme.py list
    python scripts/theme.py new mi-tema [--extends frecuencia]     # crea themes/mi-tema/
    python scripts/theme.py validate themes/mi-tema
    python scripts/theme.py pack themes/mi-tema                  # → mi-tema.zip
    python scripts/theme.py install mi-tema.zip [--force]        # → themes/mi-tema/

Por defecto trabaja con ./themes (la carpeta que el compose monta en /themes).
Otra carpeta:  python scripts/theme.py --dir /ruta install tema.zip
"""
import argparse
import json
import os
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# --dir hay que leerlo antes de importar la app (config lee THEMES_DIR al importarse)
_pre = argparse.ArgumentParser(add_help=False)
_pre.add_argument("--dir", default=os.getenv("THEMES_DIR") or str(ROOT / "themes"))
_dir = Path(_pre.parse_known_args()[0].dir).resolve()
os.environ["THEMES_DIR"] = str(_dir)
sys.path.insert(0, str(ROOT))

from app import themes  # noqa: E402



def fail(msg):
    print(f"✗ {msg}", file=sys.stderr)
    sys.exit(1)


def errors_of(problems):
    return [p for p in problems if "(aviso)" not in p]


def cmd_list(_):
    for t in themes.list_themes():
        extra = f"  (hereda de {t['extends']})" if t.get("extends") else ""
        origin = "incluido" if t["builtin"] else "tuyo"
        print(f"{t['id']:<20} {t['name']:<20} {origin}{extra}" + (f"  ERROR: {t['error']}" if t.get("error") else ""))


def cmd_new(a):
    if not themes.ID_RE.match(a.id):
        fail("el id solo puede llevar a-z, 0-9, - y _ (máx. 41 caracteres); p. ej. «2027»")
    dest = _dir / a.id
    if dest.exists():
        fail(f"{dest} ya existe")
    if a.engine == "react":
        return _new_react(dest)
    (dest / "slides").mkdir(parents=True)
    manifest = {"name": a.id, "author": "", "version": "1.0.0", "description": "",
                "extends": a.extends, "tokens": {}, "strings": {}, "css": ["theme.css"]}
    (dest / "theme.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    (dest / "theme.css").write_text(
        f"/* Tema «{a.id}» (hereda de {a.extends}). Escribe aquí solo lo que cambie. */\n"
        "/* .card > * se anima al entrar; #progress i es la barra; var(--cover) es la carátula. */\n")
    print(f"✓ creado {dest}\n  Edita theme.json / theme.css y ábrelo con  /?theme={a.id}")


def _new_react(dest: Path):
    """Esqueleto de un tema React + motion (se compila con theme-kit)."""
    (dest / "src").mkdir(parents=True)
    manifest = {"name": dest.name, "author": "", "version": "1.0.0", "description": "", "engine": "react",
                "entry": "dist/theme.js", "wide": True, "tokens": {"--bg": "#14101f", "--fg": "#f5efe4", "--accent": "#ff7a59"},
                "css": ["theme.css"], "slides": ["intro", "minutes", "top-artists", "top-tracks", "outro"],
                "strings": {"splash_title": "Tu {year}<br>en música", "splash_button": "Dale al play"}}
    (dest / "theme.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    (dest / "theme.css").write_text("/* Estilos del tema. Dibuja dentro de #react-root. */\n"
                                    ".t-card { position:absolute; inset:0; display:grid; place-content:center; background:var(--bg); color:var(--fg); }\n")
    (dest / "src" / "index.jsx").write_text(
        "import { AnimatePresence, motion } from 'motion/react';\n\n"
        "// Props: data, slides, index, direction, next, prev, goTo, view, vars, strings, theme, asset (ver THEMES.md)\n"
        "export default function Theme({ slides, index, direction, vars }) {\n"
        "  const s = slides[index];\n"
        "  return (\n"
        "    <AnimatePresence initial={false} custom={direction}>\n"
        "      <motion.div key={index} className=\"t-card\" data-card=\"active\"\n"
        "        initial={{ opacity: 0, x: 60 * direction }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>\n"
        "        <h1>{s.type} · {vars.year}</h1>\n"
        "      </motion.div>\n"
        "    </AnimatePresence>\n"
        "  );\n"
        "}\n")
    print(f"✓ creado {dest}\n  Compila:  cd theme-kit && npm install && npm run build -- {dest}\n"
          f"  y ábrelo con  /?theme={dest.name}")


def cmd_validate(a):
    d = Path(a.path).resolve()
    problems = themes.check_dir(d)
    for p in problems:
        print(("⚠ " if "(aviso)" in p else "✗ ") + p)
    if errors_of(problems):
        sys.exit(1)
    print(f"✓ {d.name}: OK")


def _iter_files(d: Path):
    for p in sorted(d.rglob("*")):
        rel = p.relative_to(d)
        if p.is_file() and not any(part.startswith(".") or part == "node_modules" for part in rel.parts) \
                and p.suffix.lower() in themes.ALLOWED_EXT:
            yield p, rel


def cmd_pack(a):
    d = Path(a.path).resolve()
    errs = errors_of(themes.check_dir(d))
    if errs:
        fail("el tema no es válido: " + "; ".join(errs))
    out = Path(a.output or f"{d.name}.zip").resolve()
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for p, rel in _iter_files(d):
            z.write(p, f"{d.name}/{rel.as_posix()}")
    print(f"✓ {out} ({out.stat().st_size // 1024} KB)")


def _extract_zip(zpath: Path, tmp: Path, forced_id=None) -> Path:
    """Extrae con las comprobaciones de seguridad (las mismas que la importación web)."""
    try:
        return themes.extract_zip(zpath, tmp, forced_id, zpath.stem)
    except themes.ThemeError as e:
        fail(str(e))


def cmd_install(a):
    src = Path(a.source).resolve()
    with tempfile.TemporaryDirectory() as t:
        tmp = Path(t)
        if src.is_dir():
            staged = tmp / (a.id or src.name)
            shutil.copytree(src, staged)
        elif zipfile.is_zipfile(src):
            staged = _extract_zip(src, tmp, a.id)
        else:
            fail(f"{src} no es un zip ni una carpeta")
        problems = themes.check_dir(staged)
        for p in problems:
            print(("⚠ " if "(aviso)" in p else "✗ ") + p)
        if errors_of(problems):
            fail("instalación cancelada")
        dest = _dir / staged.name
        if dest.exists():
            if not a.force:
                fail(f"{dest} ya existe (usa --force para sustituirlo)")
            shutil.rmtree(dest)
        _dir.mkdir(parents=True, exist_ok=True)
        shutil.copytree(staged, dest)
    print(f"✓ instalado en {dest}\n  Ábrelo con  /?theme={dest.name}  (no hace falta reiniciar nada)")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter,
                                 parents=[_pre])
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("list").set_defaults(fn=cmd_list)
    p = sub.add_parser("new"); p.add_argument("id"); p.add_argument("--extends", default="frecuencia"); p.add_argument("--engine", choices=themes.ENGINES, default="html"); p.set_defaults(fn=cmd_new)
    p = sub.add_parser("validate"); p.add_argument("path"); p.set_defaults(fn=cmd_validate)
    p = sub.add_parser("pack"); p.add_argument("path"); p.add_argument("-o", "--output"); p.set_defaults(fn=cmd_pack)
    p = sub.add_parser("install"); p.add_argument("source"); p.add_argument("--id"); p.add_argument("--force", action="store_true"); p.set_defaults(fn=cmd_install)
    a = ap.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
