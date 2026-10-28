import asyncio
import re
from asyncio.subprocess import DEVNULL, PIPE
from pathlib import Path

from fastapi import HTTPException

from . import db, queries
from .config import CACHE_DIR, CLIP_SECONDS, MUSIC_DIR

ID_RE = re.compile(r"^[A-Za-z0-9_-]{6,64}$")
CLIPS = Path(CACHE_DIR) / "clips"
COVERS = Path(CACHE_DIR) / "covers"
BLURS = Path(CACHE_DIR) / "blur"
for _d in (CLIPS, COVERS, BLURS):
    _d.mkdir(parents=True, exist_ok=True)

_locks: dict[str, asyncio.Lock] = {}
_sem = asyncio.Semaphore(2)  # no saturar la máquina con ffmpeg en paralelo


def _lookup(track_id):
    with db.connect() as conn:
        return conn.execute(queries.TRACK_BY_ID, (track_id,)).fetchone()


def _resolve(rel: str):
    p = Path(rel)
    cands = ([p] if p.is_absolute() else []) + [Path(MUSIC_DIR) / rel.lstrip("/")]
    return next((c for c in cands if c.is_file()), None)


async def _source(track_id: str):
    if not ID_RE.match(track_id):
        raise HTTPException(400, "id inválido")
    row = await asyncio.to_thread(_lookup, track_id)
    if not row:
        raise HTTPException(404, "pista no encontrada")
    src = _resolve(row["path"])
    if not src:
        raise HTTPException(404, "fichero no accesible: revisa el volumen de MUSIC_DIR")
    return row, src


async def _ffmpeg(*args):
    async with _sem:
        proc = await asyncio.create_subprocess_exec(
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args,
            stdout=DEVNULL, stderr=PIPE)
        _, err = await proc.communicate()
    return proc.returncode, err.decode(errors="ignore")[-300:]


async def get_clip(track_id: str, seconds: int | None = None) -> Path:
    seconds = seconds or CLIP_SECONDS
    out = CLIPS / f"{track_id}_{seconds}.mp3"
    if out.exists():
        return out
    row, src = await _source(track_id)
    async with _locks.setdefault(out.name, asyncio.Lock()):
        if out.exists():
            return out
        dur = float(row["duration"] or 0)
        length = min(seconds, dur) if dur else seconds
        start = max(0.0, min(dur * 0.35, dur - length)) if dur else 0.0
        tmp = out.with_suffix(".tmp.mp3")
        code, err = await _ffmpeg(
            "-ss", f"{start:.2f}", "-t", f"{length:.2f}", "-i", str(src), "-vn",
            "-af", f"afade=t=in:d=1,afade=t=out:st={max(0, length - 2):.2f}:d=2",
            "-ac", "2", "-c:a", "libmp3lame", "-b:a", "96k", str(tmp))
        if code != 0:
            raise HTTPException(500, f"ffmpeg: {err}")
        tmp.replace(out)
    return out


async def get_cover(track_id: str) -> Path:
    out = COVERS / f"{track_id}.jpg"
    if out.exists():
        return out
    _, src = await _source(track_id)
    candidates = [src] + [src.parent / n for n in
                          ("cover.jpg", "folder.jpg", "front.jpg", "cover.png", "folder.png")
                          if (src.parent / n).is_file()]
    async with _locks.setdefault(out.name, asyncio.Lock()):
        for c in candidates:
            tmp = out.with_suffix(".tmp.jpg")
            code, _ = await _ffmpeg("-i", str(c), "-an", "-frames:v", "1",
                                    "-vf", "crop='min(iw,ih)':'min(iw,ih)',scale=600:600", str(tmp))
            if code == 0 and tmp.exists():
                tmp.replace(out)
                return out
    raise HTTPException(404, "sin carátula")


# Fondo "malla" de la carátula: se reduce a 6x6 píxeles (media de colores por zona), se sube la
# saturación y se levantan los negros (así la tinta negra siempre se lee) y se amplía con
# interpolación bicúbica: queda un degradado suave con los colores reales de la portada.
# Se genera en el servidor, como imagen, para que salga también al exportar la tarjeta a PNG
# (html2canvas no pinta filter ni backdrop-filter).
BLUR_VF = ("crop='min(iw,ih)':'min(iw,ih)',scale=6:6:flags=area,"
           "eq=saturation=1.7:gamma=1.08,"
           "curves=all='0/0.52 0.5/0.76 1/0.98',"
           "scale=256:256:flags=bicubic")


async def get_cover_blur(track_id: str) -> Path:
    out = BLURS / f"{track_id}.jpg"
    if out.exists():
        return out
    cover = await get_cover(track_id)
    async with _locks.setdefault(out.name, asyncio.Lock()):
        if out.exists():
            return out
        tmp = out.with_suffix(".tmp.jpg")
        code, err = await _ffmpeg("-i", str(cover), "-frames:v", "1", "-vf", BLUR_VF,
                                  "-q:v", "3", str(tmp))
        if code != 0 or not tmp.exists():
            raise HTTPException(500, f"ffmpeg: {err}")
        tmp.replace(out)
    return out


async def warm_covers(ids, limit=2):
    """Genera carátulas y fondos en segundo plano (de pocas en pocas) para que estén listas cuando el cliente las pida."""
    sem = asyncio.Semaphore(limit)

    async def one(i):
        async with sem:
            try:
                await get_cover_blur(i)
            except Exception:
                pass

    await asyncio.gather(*(one(i) for i in ids))
