from pathlib import Path

import asyncio
import hmac
import json
import re

from fastapi import BackgroundTasks, FastAPI, HTTPException, Query, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

import mimetypes

from . import audio, db, queries, stats, themes
from .config import ADMIN_KEY, DEFAULT_USER, DEFAULT_YEAR, MAX_THEME_ZIP

app = FastAPI(title="Navidrome Wrapped")
mimetypes.add_type("font/woff2", ".woff2")
mimetypes.add_type("text/javascript", ".js")
CACHE = {"Cache-Control": "public, max-age=86400"}


@app.get("/api/health")
def health():
    with db.connect() as conn:
        return {"ok": True, "mode": db.detect_mode(conn), "db_access": db.source()}


@app.get("/api/users")
def users():
    with db.connect() as conn:
        return [r["user_name"] for r in conn.execute(queries.USERS)]


def resolve_user(conn, name: str) -> str | None:
    """Nombre canónico del usuario (acepta otra capitalización: «alesis» → «Alesis»)."""
    name = (name or "").strip()
    if not name:
        return None
    row = conn.execute(queries.USER_EXACT, (name,)).fetchone() \
        or conn.execute(queries.USER_NOCASE, (name,)).fetchone()
    return row["user_name"] if row else None


@app.get("/api/config")
def config():
    return {"default_year": DEFAULT_YEAR, "import_enabled": bool(ADMIN_KEY)}


@app.get("/api/years")
def years(user: str = Query(...)):
    """Años con reproducciones de un usuario (para el selector de la pantalla de inicio)."""
    with db.connect() as conn:
        name = resolve_user(conn, user)
        if not name:
            raise HTTPException(404, f"No encuentro el usuario «{user.strip()}»")
        plays = stats.load_plays(conn, name) if db.detect_mode(conn) == "scrobbles" else []
        ys = sorted({p["dt"].year for p in plays}, reverse=True)
    return {"user": name, "years": ys or [DEFAULT_YEAR]}


@app.get("/api/wrapped")
def wrapped(background: BackgroundTasks, user: str = Query(DEFAULT_USER), year: int = Query(DEFAULT_YEAR)):
    if not user:
        raise HTTPException(400, "Falta ?user= (o la variable NAVIDROME_USER)")
    with db.connect() as conn:
        name = resolve_user(conn, user)
        if not name:
            raise HTTPException(404, f"No encuentro el usuario «{user.strip()}»")
        user = name
        mode = db.detect_mode(conn)
        plays = stats.load_plays(conn, user) if mode == "scrobbles" else []
        if plays:
            data = stats.from_history(plays, year, stats.count_added(conn, year))
        else:
            mode = "annotation"
            data = stats.from_annotation(conn, user, year)
    if data is None:
        raise HTTPException(404, f"Sin reproducciones de «{user}» en {year}")
    result = {"user": user, "year": year, "mode": mode, **data}
    ids = list(dict.fromkeys(re.findall(r"/api/cover/([A-Za-z0-9_-]+)", json.dumps(result))))[:60]
    if ids:
        background.add_task(audio.warm_covers, ids)
    return result


@app.get("/api/cover/{track_id}/blur")
async def cover_blur(track_id: str):
    return FileResponse(await audio.get_cover_blur(track_id),
                        media_type="image/jpeg", headers=CACHE)


@app.get("/api/themes")
def themes_list():
    return {"default": themes.default_id(DEFAULT_YEAR), "themes": themes.list_themes()}


@app.post("/api/themes/import")
async def theme_import(request: Request, force: bool = Query(False), id: str | None = Query(None)):
    """Instala un tema desde un .zip enviado como cuerpo de la petición (application/zip).

    Un tema puede ejecutar JavaScript en el navegador de quien lo abra, así que solo se
    acepta con la clave ADMIN_KEY (cabecera X-Admin-Key); sin clave configurada está desactivado.
    """
    if not ADMIN_KEY:
        raise HTTPException(403, "La importación está desactivada: define ADMIN_KEY en .env y reinicia")
    if not hmac.compare_digest(request.headers.get("x-admin-key", "").encode(), ADMIN_KEY.encode()):
        await asyncio.sleep(1.5)  # frena la fuerza bruta
        raise HTTPException(401, "Clave incorrecta")
    if int(request.headers.get("content-length") or 0) > MAX_THEME_ZIP:
        raise HTTPException(413, "El zip pesa más de 30 MB")
    raw = bytearray()
    async for chunk in request.stream():
        raw += chunk
        if len(raw) > MAX_THEME_ZIP:
            raise HTTPException(413, "El zip pesa más de 30 MB")
    try:
        return themes.install_zip(bytes(raw), force=force, forced_id=id)
    except themes.ThemeWriteError as e:
        raise HTTPException(500, f"{e}. Revisa que ./themes sea escribible por PUID:PGID (ver deploy.sh)")
    except themes.ThemeError as e:
        raise HTTPException(422, str(e))


@app.get("/api/themes/{theme_id}")
def theme_bundle(theme_id: str, year: int = Query(DEFAULT_YEAR)):
    """theme_id = «default» resuelve ?theme > WRAPPED_THEME > tema del año > frecuencia."""
    try:
        return themes.load(themes.default_id(year) if theme_id == "default" else theme_id)
    except themes.ThemeNotFound as e:
        raise HTTPException(404, str(e))
    except themes.ThemeError as e:
        raise HTTPException(422, str(e))


@app.get("/themes/{theme_id}/{path:path}")
def theme_file(theme_id: str, path: str):
    try:
        f = themes.resolve_file(theme_id, path)
    except themes.ThemeError:
        raise HTTPException(404, "no encontrado")
    return FileResponse(f, headers={"Cache-Control": "no-cache"})


@app.get("/api/clip/{track_id}")
async def clip(track_id: str, seconds: int | None = Query(None, ge=5, le=60)):
    return FileResponse(await audio.get_clip(track_id, seconds),
                        media_type="audio/mpeg", headers=CACHE)


@app.get("/api/cover/{track_id}")
async def cover(track_id: str):
    return FileResponse(await audio.get_cover(track_id),
                        media_type="image/jpeg", headers=CACHE)


@app.middleware("http")
async def no_stale_static(request, call_next):
    """El código del front (js/css/html) siempre se revalida: así un despliegue nuevo se ve sin vaciar caché."""
    resp = await call_next(request)
    p = request.url.path
    if not p.startswith("/api/") and p.endswith((".js", ".css", ".html", "/")):
        resp.headers["Cache-Control"] = "no-cache"
    return resp


app.mount("/", StaticFiles(directory=Path(__file__).parent / "static", html=True),
          name="static")
