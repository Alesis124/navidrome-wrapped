"""Acceso a la BD de Navidrome.

Primero intenta abrirla directamente en solo lectura (mode=ro). Si el volumen
está montado :ro y SQLite está en modo WAL, esa apertura puede fallar
("unable to open database file" / "readonly database"). En ese caso se usa un
snapshot: se copian navidrome.db y navidrome.db-wal a /cache y se consulta la
copia, que sí es escribible para SQLite. El snapshot se regenera solo cuando
cambian los ficheros originales (y como mucho cada SNAPSHOT_TTL segundos,
para no copiar la BD en cada petición de audio).
"""
import shutil
import sqlite3
import threading
import time
from contextlib import contextmanager
from pathlib import Path

from .config import CACHE_DIR, DB_ACCESS, DB_PATH, SNAPSHOT_TTL

_SNAP_ROOT = Path(CACHE_DIR) / "snapshot"
_lock = threading.Lock()
_direct_ok: bool | None = None
_snap_cache: tuple | None = None  # (firma, ruta, instante)


def _open_direct() -> sqlite3.Connection:
    conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True, timeout=10)
    conn.row_factory = sqlite3.Row
    try:
        conn.execute("SELECT count(*) FROM sqlite_master").fetchone()
    except sqlite3.Error:
        conn.close()
        raise
    return conn


def _signature(files):
    out = []
    for f in files:
        try:
            st = f.stat()
            out.append((f.name, st.st_mtime_ns, st.st_size))
        except FileNotFoundError:
            out.append((f.name, None, None))
    return tuple(out)


def _snapshot_path() -> Path:
    global _snap_cache
    src = Path(DB_PATH)
    files = [src, Path(str(src) + "-wal")]
    sig = _signature(files)
    with _lock:
        if _snap_cache and _snap_cache[1].exists():
            fresh = time.monotonic() - _snap_cache[2] < SNAPSHOT_TTL
            if _snap_cache[0] == sig or fresh:
                return _snap_cache[1]
        _SNAP_ROOT.mkdir(parents=True, exist_ok=True)
        dest_dir = _SNAP_ROOT / f"s{abs(hash(sig))}"
        tmp = _SNAP_ROOT / f"tmp-{threading.get_ident()}"
        shutil.rmtree(tmp, ignore_errors=True)
        tmp.mkdir()
        for f in files:
            if f.exists():
                shutil.copyfile(f, tmp / f.name)
        shutil.rmtree(dest_dir, ignore_errors=True)
        tmp.rename(dest_dir)
        # conserva solo el snapshot actual y el anterior
        olds = sorted((p for p in _SNAP_ROOT.iterdir() if p.is_dir() and p != dest_dir),
                      key=lambda p: p.stat().st_mtime, reverse=True)
        for p in olds[1:]:
            shutil.rmtree(p, ignore_errors=True)
        path = dest_dir / src.name
        _snap_cache = (sig, path, time.monotonic())
        return path


def _open_snapshot() -> sqlite3.Connection:
    conn = sqlite3.connect(str(_snapshot_path()), timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA query_only = ON")
    return conn


def source() -> str:
    return "direct" if (_direct_ok and DB_ACCESS != "snapshot") else "snapshot"


@contextmanager
def connect():
    """DB_ACCESS=auto (por defecto): directo y, si falla, snapshot.
    DB_ACCESS=direct / snapshot fuerzan uno de los dos."""
    global _direct_ok
    conn = None
    if DB_ACCESS != "snapshot" and _direct_ok is not False:
        try:
            conn = _open_direct()
            _direct_ok = True
        except sqlite3.Error:
            if DB_ACCESS == "direct":
                raise
            _direct_ok = False
    if conn is None:
        conn = _open_snapshot()
    try:
        yield conn
    finally:
        conn.close()


def has_table(conn, name: str) -> bool:
    return conn.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (name,)
    ).fetchone() is not None


def detect_mode(conn) -> str:
    return "scrobbles" if has_table(conn, "scrobbles") else "annotation"
