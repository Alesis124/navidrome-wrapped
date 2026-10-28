"""Temas (plantillas) de Navidrome Wrapped.

Un tema es una carpeta con un `theme.json` (manifiesto), CSS, plantillas HTML
de diapositivas, fuentes e imágenes. Se busca primero en THEMES_DIR (tus temas,
p. ej. ./themes montado en /themes) y después en app/themes (los incluidos), así
que un tema tuyo con el mismo id sustituye al incluido.

Un tema puede heredar de otro con `"extends": "<id>"` y solo sobrescribir lo
que cambie (tokens, CSS, fuentes, textos, plantillas, transición, orden…).
Ver THEMES.md para la guía completa.

Motores: cada tema declara `"engine"` en su manifiesto.
  · "html"  (por defecto): plantillas HTML + CSS + script de ganchos, con Swiper.
  · "react": un bundle ESM ya compilado (`"entry": "dist/theme.js"`) que exporta un componente
    de React; usa `react` y `motion` que la página ya sirve (import map), así que el tema no
    los incluye. Cada motor tiene su propia estructura de carpetas y su propia validación.

Este módulo no depende de FastAPI para poder usarlo desde scripts/theme.py.
"""
import io
import json
import re
import shutil
import stat
import tempfile
import zipfile
from pathlib import Path

from .config import DEFAULT_THEME, THEMES_DIR

BUILTIN_DIR = Path(__file__).parent / "themes"

ID_RE = re.compile(r"^[a-z0-9][a-z0-9_-]{0,40}$")
TYPE_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,40}$")
TOKEN_RE = re.compile(r"^--[a-zA-Z0-9_-]{1,40}$")
FAMILY_RE = re.compile(r"^[A-Za-z0-9 _-]{1,40}$")
COLOR_RE = re.compile(r"^(#[0-9a-fA-F]{3,8}|(rgb|hsl)a?\([\d\s.,%/-]+\))$")

# Extensiones comunes a todos los motores + las propias de cada uno
COMMON_EXT = {
    ".css", ".js", ".json", ".txt", ".md",
    ".woff2", ".woff", ".ttf", ".otf",
    ".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg", ".ico",
    ".mp4", ".webm", ".mp3", ".ogg",
}
ENGINES = ("html", "react")
ENGINE_EXT = {
    "html": {".html"},
    # fuentes (.jsx/.tsx/.ts) y mapas opcionales junto al bundle compilado (.js/.mjs)
    "react": {".mjs", ".jsx", ".tsx", ".ts", ".map"},
}
ALLOWED_EXT = COMMON_EXT | set().union(*ENGINE_EXT.values())   # unión: solo para listados genéricos
REACT_BARE = {"react", "react/jsx-runtime", "react/jsx-dev-runtime", "react-dom", "react-dom/client",
              "motion/react", "motion"}
MAX_ENTRY = 3 * 1024 * 1024
SWIPER_EFFECTS = {"slide", "fade", "cube", "coverflow", "flip", "creative", "cards"}
SWIPER_OBJECTS = {"creativeEffect", "cubeEffect", "coverflowEffect", "flipEffect",
                  "cardsEffect", "fadeEffect"}
MAX_JSON = 256 * 1024
MAX_TEMPLATE = 64 * 1024
MAX_DEPTH = 4


class ThemeError(ValueError):
    pass


class ThemeNotFound(ThemeError):
    pass


# ---------------------------------------------------------------- localizar

def _roots():
    return [Path(THEMES_DIR), BUILTIN_DIR]


def find_dir(theme_id: str) -> Path:
    if not isinstance(theme_id, str) or not ID_RE.match(theme_id):
        raise ThemeError(f"id de tema inválido: «{theme_id}» (usa a-z, 0-9, - y _)")
    for root in _roots():
        d = root / theme_id
        if (d / "theme.json").is_file():
            return d
    raise ThemeNotFound(f"tema «{theme_id}» no encontrado")


def exists(theme_id: str) -> bool:
    try:
        find_dir(theme_id)
        return True
    except ThemeError:
        return False


def default_id(year=None) -> str:
    """?theme= > WRAPPED_THEME > tema con el nombre del año (p. ej. «2026») > frecuencia."""
    if DEFAULT_THEME and exists(DEFAULT_THEME):
        return DEFAULT_THEME
    if year and exists(str(year)):
        return str(year)
    return "frecuencia"


def _read_manifest(d: Path) -> dict:
    f = d / "theme.json"
    if f.stat().st_size > MAX_JSON:
        raise ThemeError(f"{d.name}/theme.json es demasiado grande")
    try:
        m = json.loads(f.read_text(encoding="utf-8"))
    except (OSError, ValueError) as e:
        raise ThemeError(f"{d.name}/theme.json no es un JSON válido: {e}")
    if not isinstance(m, dict):
        raise ThemeError(f"{d.name}/theme.json debe ser un objeto")
    return m


def list_themes() -> list[dict]:
    seen, out = set(), []
    for root in _roots():
        if not root.is_dir():
            continue
        for d in sorted(p for p in root.iterdir() if p.is_dir()):
            if d.name in seen or not ID_RE.match(d.name) or not (d / "theme.json").is_file():
                continue
            seen.add(d.name)
            item = {"id": d.name, "builtin": root == BUILTIN_DIR}
            try:
                m = _read_manifest(d)
                item.update({k: str(m.get(k, "")) for k in ("name", "author", "version", "description", "extends")})
                item["engine"] = load(d.name)["engine"]  # además detecta herencia rota, ficheros que faltan, etc.
            except ThemeError as e:
                item["error"] = str(e)
            item["name"] = item.get("name") or d.name
            out.append(item)
    return out


# ---------------------------------------------------------------- ficheros

def _engine_of(m: dict) -> str:
    e = m.get("engine", "html")
    if e not in ENGINES:
        raise ThemeError(f"«engine» debe ser uno de {', '.join(ENGINES)} (tiene {e!r})")
    return e


def _allowed_ext(engine: str) -> set:
    return COMMON_EXT | ENGINE_EXT[engine]


def _dir_engine(d: Path) -> str:
    """Motor efectivo de la carpeta de un tema (sigue «extends» si no lo declara)."""
    seen = set()
    while d and d.name not in seen:
        seen.add(d.name)
        m = _read_manifest(d)
        if "engine" in m:
            return _engine_of(m)
        if not m.get("extends"):
            return "html"
        try:
            d = find_dir(str(m["extends"]))
        except ThemeError:
            return "html"
    return "html"


def _safe_rel(d: Path, rel, engine: str | None = None) -> Path:
    if not isinstance(rel, str) or not rel or rel.startswith(("/", "\\")):
        raise ThemeError(f"{d.name}: ruta de fichero inválida: {rel!r}")
    p = (d / rel).resolve()
    if d.resolve() not in p.parents:
        raise ThemeError(f"{d.name}: «{rel}» sale de la carpeta del tema")
    if any(part.startswith(".") for part in Path(rel).parts):
        raise ThemeError(f"{d.name}: no se permiten ficheros ocultos («{rel}»)")
    if p.suffix.lower() not in _allowed_ext(engine or _dir_engine(d)):
        raise ThemeError(f"{d.name}: tipo de fichero no permitido para este motor («{rel}»)")
    if not p.is_file():
        raise ThemeError(f"{d.name}: no existe «{rel}»")
    return p


def resolve_file(theme_id: str, rel: str) -> Path:
    """Fichero de un tema para servirlo en /themes/<id>/<rel> (a prueba de ../)."""
    return _safe_rel(find_dir(theme_id), rel)


def _url(tid: str, d: Path, rel: str) -> str:
    _safe_rel(d, rel)
    return f"/themes/{tid}/{Path(rel).as_posix()}"


# ---------------------------------------------------------------- secciones

def _tokens(v):
    out = {}
    for k, val in (v or {}).items():
        if TOKEN_RE.match(str(k)) and isinstance(val, (str, int, float)) and len(str(val)) <= 300:
            out[k] = str(val)
    return out


def _swiper(v):
    out = {}
    v = v or {}
    if v.get("effect") in SWIPER_EFFECTS:
        out["effect"] = v["effect"]
    if isinstance(v.get("speed"), (int, float)):
        out["speed"] = int(min(max(v["speed"], 100), 3000))
    if v.get("direction") in ("horizontal", "vertical"):
        out["direction"] = v["direction"]
    if isinstance(v.get("spaceBetween"), (int, float)):
        out["spaceBetween"] = v["spaceBetween"]
    for k in SWIPER_OBJECTS:
        if isinstance(v.get(k), dict):
            out[k] = v[k]
    return out


def _audio(v):
    v = v or {}
    out = {}
    if isinstance(v.get("enabled"), bool):
        out["enabled"] = v["enabled"]
    if isinstance(v.get("fade"), (int, float)):
        out["fade"] = float(min(max(v["fade"], 0), 3))
    return out


def _font(tid, d, f):
    if not isinstance(f, dict) or not FAMILY_RE.match(str(f.get("family", ""))):
        raise ThemeError(f"{tid}: fuente inválida (falta «family» o tiene caracteres raros)")
    return {"family": f["family"], "url": _url(tid, d, f.get("src")),
            "weight": str(f.get("weight", "400")),
            "style": f.get("style") if f.get("style") in ("normal", "italic") else "normal"}


def _slides(tid, v):
    if not isinstance(v, list):
        raise ThemeError(f"{tid}: «slides» debe ser una lista")
    out = []
    for e in v:
        e = {"type": e} if isinstance(e, str) else e
        if not isinstance(e, dict) or not TYPE_RE.match(str(e.get("type", ""))):
            raise ThemeError(f"{tid}: entrada de «slides» inválida: {e!r}")
        item = {"type": e["type"]}
        if e.get("template"):
            if not TYPE_RE.match(str(e["template"])):
                raise ThemeError(f"{tid}: nombre de plantilla inválido: {e['template']!r}")
            item["template"] = e["template"]
        if isinstance(e.get("duration"), (int, float)):
            item["duration"] = int(min(max(e["duration"], 1500), 30000))
        if isinstance(e.get("opts"), dict):
            item["opts"] = e["opts"]
        out.append(item)
    return out


def _palette(tid, v):
    if not isinstance(v, list):
        raise ThemeError(f"{tid}: «palette» debe ser una lista de colores")
    bad = [c for c in v if not (isinstance(c, str) and COLOR_RE.match(c))]
    if bad:
        raise ThemeError(f"{tid}: colores no válidos en «palette»: {bad}")
    return v[:12]


def _templates(d: Path, sub) -> dict:
    out = {}
    folder = d / (sub if isinstance(sub, str) else "slides")
    if not folder.is_dir():
        return out
    for f in sorted(folder.glob("*.html")):
        if not TYPE_RE.match(f.stem):
            continue
        if f.stat().st_size > MAX_TEMPLATE:
            raise ThemeError(f"{d.name}: la plantilla {f.name} es demasiado grande")
        out[f.stem] = f.read_text(encoding="utf-8")
    return out


def _entry_path(d: Path, rel) -> Path:
    p = _safe_rel(d, rel, "react")
    if p.suffix.lower() not in (".js", ".mjs"):
        raise ThemeError(f"{d.name}: «entry» debe ser un .js o .mjs ya compilado (no {p.suffix})")
    if p.stat().st_size > MAX_ENTRY:
        raise ThemeError(f"{d.name}: «{rel}» pesa más de {MAX_ENTRY // 1024 // 1024} MB")
    return p


def _entry_url(tid: str, d: Path, rel: str) -> str:
    _entry_path(d, rel)
    return f"/themes/{tid}/{Path(rel).as_posix()}"


# import estático o dinámico con literal: from"x" · import"x" · import("x") (también minificado)
IMPORT_RE = re.compile(r"""(?:\bfrom|\bimport)\s*\(?\s*(["'])([^"'\n]{1,200})\1""")


def check_entry(d: Path, rel) -> tuple[list[str], list[str]]:
    """Mira los import del bundle: (errores, avisos).

    No es una barrera de seguridad (un tema es código y puede hacer fetch/eval); evita el fallo
    típico de subir un bundle sin compilar o que carga código de otro servidor.
    """
    errors, warnings = [], []
    entry = _entry_path(d, rel)
    seen, todo = set(), [entry]
    while todo:
        f = todo.pop()
        if f in seen or len(seen) > 40:
            continue
        seen.add(f)
        text = f.read_text(encoding="utf-8", errors="replace")
        for _, spec in IMPORT_RE.findall(text):
            if spec.startswith(("http://", "https://", "//", "data:", "blob:")):
                errors.append(f"«{f.name}» importa código externo ({spec[:60]}): incluye todo en el bundle")
            elif spec.startswith((".", "/")):
                if spec.startswith("/"):
                    errors.append(f"«{f.name}» importa una ruta absoluta ({spec}); usa rutas relativas")
                    continue
                try:
                    todo.append(_entry_path(d, (f.parent / spec).resolve().relative_to(d.resolve()).as_posix()))
                except (ThemeError, ValueError) as e:
                    errors.append(f"«{f.name}» importa «{spec}»: {e}")
            elif spec not in REACT_BARE and re.match(r"^[@a-z][\w./@-]*$", spec):
                warnings.append(f"«{f.name}» importa «{spec}», que la página no ofrece: compílalo dentro del bundle "
                                "(solo react, react-dom/client y motion/react son externos) (aviso)")
    return errors, warnings


# ---------------------------------------------------------------- carga

def load(theme_id: str) -> dict:
    """Devuelve el tema ya resuelto (con herencia) listo para el frontend."""
    chain, seen, cur = [], set(), theme_id
    while cur:
        if cur in seen or len(chain) >= MAX_DEPTH:
            raise ThemeError("herencia («extends») circular o demasiado profunda")
        seen.add(cur)
        d = find_dir(cur)
        chain.append((cur, d, _read_manifest(d)))
        cur = chain[-1][2].get("extends")
    chain.reverse()  # primero el tema base

    out = {"id": theme_id, "name": theme_id, "author": "", "version": "", "description": "",
           "tokens": {}, "strings": {}, "swiper": {}, "audio": {}, "fonts": [], "css": [],
           "script": None, "slides": None, "palette": None, "templates": {}, "wide": False,
           "engine": "html", "entry": None}
    engine = None
    for tid, d, m in chain:
        declared = _engine_of(m) if "engine" in m else None
        if declared and engine and declared != engine:
            raise ThemeError(f"{tid}: usa el motor «{declared}» pero hereda de un tema «{engine}» "
                             "(un tema solo puede heredar de otro del mismo motor)")
        engine = declared or engine or "html"
        for k in ("name", "author", "version", "description"):
            if k in m:
                out[k] = str(m[k])
        out["tokens"].update(_tokens(m.get("tokens")))
        out["strings"].update({str(k): str(v) for k, v in (m.get("strings") or {}).items()})
        out["swiper"].update(_swiper(m.get("swiper")))
        out["audio"].update(_audio(m.get("audio")))
        out["fonts"] += [_font(tid, d, f) for f in (m.get("fonts") or [])]
        out["css"] += [_url(tid, d, c) for c in (m.get("css") or [])]
        if "wide" in m:
            out["wide"] = m["wide"] is True   # el tema trae maquetación apaisada para ordenador
        if m.get("slides"):
            out["slides"] = _slides(tid, m["slides"])
        if m.get("palette"):
            out["palette"] = _palette(tid, m["palette"])
        if engine == "html":
            if m.get("script"):
                out["script"] = _url(tid, d, m["script"])
            out["templates"].update(_templates(d, m.get("templates", "slides")))
        else:   # react: ni plantillas, ni script de ganchos, ni Swiper (lo anima el propio componente)
            out["swiper"] = {}
            if m.get("entry"):
                out["entry"] = _entry_url(tid, d, m["entry"])
    out["engine"] = engine
    if engine == "react" and not out["entry"]:
        raise ThemeError(f"{theme_id}: un tema React necesita «entry» (p. ej. \"dist/theme.js\")")
    out["extends"] = [t for t, _, _ in chain[:-1]]
    return out


# ---------------------------------------------------------------- instalar zips

MAX_ZIP_FILES = 500
MAX_ZIP_BYTES = 30 * 1024 * 1024


class ThemeWriteError(ThemeError):
    """No se puede escribir en la carpeta de temas (permisos / montaje de solo lectura)."""


def extract_zip(src, tmp: Path, forced_id=None, name_hint="") -> Path:
    """Extrae un zip (ruta o fichero abierto) en `tmp/<id>` con comprobaciones de seguridad.

    El zip debe llevar theme.json en la raíz o dentro de UNA carpeta. Rechaza rutas absolutas,
    «..», enlaces simbólicos, demasiados ficheros o un tamaño descomprimido excesivo.
    """
    try:
        z = zipfile.ZipFile(src)
    except zipfile.BadZipFile:
        raise ThemeError("el fichero no es un zip válido")
    with z:
        infos = [i for i in z.infolist() if not i.is_dir()]
        if len(infos) > MAX_ZIP_FILES:
            raise ThemeError(f"demasiados ficheros ({len(infos)} > {MAX_ZIP_FILES})")
        if sum(i.file_size for i in infos) > MAX_ZIP_BYTES:
            raise ThemeError("el zip descomprimido supera 30 MB")
        parts_list = []
        for i in infos:
            name = i.filename.replace("\\", "/")
            parts = Path(name).parts
            if not parts or name.startswith("/") or Path(name).is_absolute() or ".." in parts:
                raise ThemeError(f"ruta peligrosa en el zip: {i.filename}")
            if stat.S_ISLNK(i.external_attr >> 16):
                raise ThemeError(f"enlace simbólico en el zip: {i.filename}")
            parts_list.append(parts)
        # Los metadatos de macOS no son del tema
        keep = [(i, p) for i, p in zip(infos, parts_list)
                if "__MACOSX" not in p and p[-1] != ".DS_Store" and "node_modules" not in p]
        infos, parts_list = [k[0] for k in keep], [k[1] for k in keep]
        if any(p == ("theme.json",) for p in parts_list):
            prefix, tid = (), forced_id or name_hint
        else:
            tops = {p[0] for p in parts_list}
            if len(tops) != 1 or not any(len(p) == 2 and p[1] == "theme.json" for p in parts_list):
                raise ThemeError("el zip debe contener theme.json en la raíz o dentro de una única carpeta")
            prefix, tid = (next(iter(tops)),), forced_id or next(iter(tops))
        if not ID_RE.match(tid or ""):
            raise ThemeError(f"id de tema inválido «{tid}»: usa a-z, 0-9, - y _ (indica otro id)")
        dest = tmp / tid
        total = 0
        for i, parts in zip(infos, parts_list):
            target = dest.joinpath(*parts[len(prefix):])
            target.parent.mkdir(parents=True, exist_ok=True)
            data = z.read(i)
            total += len(data)
            if total > MAX_ZIP_BYTES:  # por si la cabecera mentía
                raise ThemeError("el zip descomprimido supera 30 MB")
            target.write_bytes(data)
    return dest


def install_staged(staged: Path, force=False) -> tuple[Path, list[str]]:
    """Valida una carpeta de tema y la copia a THEMES_DIR. Devuelve (destino, avisos)."""
    problems = check_dir(staged)
    errors = [p for p in problems if "(aviso)" not in p]
    if errors:
        raise ThemeError("tema no válido: " + "; ".join(errors))
    root = Path(THEMES_DIR)
    dest = root / staged.name
    if staged.name in {d.name for d in BUILTIN_DIR.iterdir() if d.is_dir()}:
        raise ThemeError(f"«{staged.name}» es un tema incluido y no se puede sustituir; usa otro id")
    if dest.exists() and not force:
        raise ThemeError(f"el tema «{staged.name}» ya existe (marca «sustituir» para reemplazarlo)")
    try:
        root.mkdir(parents=True, exist_ok=True)
        part = root / f".{staged.name}.new"
        old = root / f".{staged.name}.old"
        for leftover in (part, old):
            shutil.rmtree(leftover, ignore_errors=True)
        shutil.copytree(staged, part)
        if dest.exists():
            dest.rename(old)
        part.rename(dest)
        shutil.rmtree(old, ignore_errors=True)
    except OSError as e:
        raise ThemeWriteError(f"no se puede escribir en {root}: {e.strerror or e}")
    return dest, [p for p in problems if "(aviso)" in p]


def install_zip(raw, force=False, forced_id=None) -> dict:
    """Instala un tema desde los bytes de un zip (importación desde la web)."""
    with tempfile.TemporaryDirectory() as t:
        staged = extract_zip(io.BytesIO(raw), Path(t), forced_id)
        dest, warnings = install_staged(staged, force)
    return {"id": dest.name, "warnings": warnings}


# ---------------------------------------------------------------- validar (CLI)

def check_dir(d: Path) -> list[str]:
    """Problemas de una carpeta de tema (para scripts/theme.py validate y la importación).

    Cada motor tiene su propia comprobación; lo que acaba en «(aviso)» no bloquea la instalación.
    """
    d = Path(d)
    problems = []
    if not (d / "theme.json").is_file():
        return ["falta theme.json"]
    if not ID_RE.match(d.name):
        problems.append(f"el nombre de la carpeta «{d.name}» no es un id válido (a-z, 0-9, - y _)")
    try:
        m = _read_manifest(d)
        engine = _engine_of(m) if "engine" in m else None
        if engine is None:   # sin «engine»: el de su base (extends) o html
            engine = _dir_engine(d)
    except ThemeError as e:
        return [str(e)]
    tid = d.name
    for k in ("tokens", "strings", "swiper", "audio"):
        if k in m and not isinstance(m[k], dict):
            problems.append(f"«{k}» debe ser un objeto")
    try:
        for c in m.get("css") or []:
            _safe_rel(d, c, engine)
        for f in m.get("fonts") or []:
            _font(tid, d, f)
        if m.get("slides"):
            _slides(tid, m["slides"])
        if m.get("palette"):
            _palette(tid, m["palette"])
        if engine == "html":
            if m.get("script"):
                _safe_rel(d, m["script"], engine)
            _templates(d, m.get("templates", "slides"))
            if m.get("entry"):
                problems.append("«entry» solo lo usa el motor react; aquí se ignora (aviso)")
        else:
            if not m.get("entry"):
                problems.append("falta «entry» (el bundle compilado, p. ej. \"dist/theme.js\")")
            else:
                errors, warns = check_entry(d, m["entry"])
                problems += errors + warns
            for k in ("script", "swiper", "templates"):
                if k in m:
                    problems.append(f"«{k}» no se usa con el motor react; se ignora (aviso)")
            if (d / "slides").is_dir() and any((d / "slides").glob("*.html")):
                problems.append("las plantillas de slides/ no se usan con el motor react (aviso)")
    except ThemeError as e:
        problems.append(str(e))
    if m.get("extends") and not exists(str(m["extends"])):
        problems.append(f"hereda de «{m['extends']}», que no está instalado (aviso)")
    elif m.get("extends"):
        try:
            base = _dir_engine(find_dir(str(m["extends"])))
            if "engine" in m and base != engine:
                problems.append(f"usa el motor «{engine}» pero hereda de un tema «{base}»")
        except ThemeError:
            pass
    allowed = _allowed_ext(engine)
    files = [p for p in d.rglob("*") if p.is_file()]
    if any("node_modules" in p.relative_to(d).parts for p in files):
        problems.append("el zip incluye node_modules: compila el tema y entrega solo dist/ (y, si quieres, src/)")
    bad = [p.relative_to(d).as_posix() for p in files
           if p.suffix.lower() not in allowed and "node_modules" not in p.relative_to(d).parts]
    if bad:
        problems.append(f"ficheros con extensión no permitida para el motor {engine} (no se servirán): {bad[:5]}")
    return problems
