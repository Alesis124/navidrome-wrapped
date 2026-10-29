"""Login opcional con usuario y contraseña del .env (AUTH_USER / AUTH_PASSWORD). Vacíos = sin login.

La sesión es una cookie firmada (HMAC) de 30 días: no hay base de datos de sesiones y, si cambias la
contraseña o el usuario del .env, todas las sesiones abiertas dejan de valer."""
import base64
import hashlib
import hmac
import json
import time

from fastapi import Request
from fastapi.responses import JSONResponse, RedirectResponse

from .config import AUTH_PASSWORD, AUTH_USER

ENABLED = bool(AUTH_USER and AUTH_PASSWORD)
if bool(AUTH_USER) != bool(AUTH_PASSWORD):
    raise RuntimeError("Login a medias: define AUTH_USER y AUTH_PASSWORD los dos, o deja los dos vacíos (sin login)")

COOKIE = "wrapped_session"
TTL = 30 * 24 * 3600
KEY = hashlib.sha256(f"wrapped-session:{AUTH_USER}:{AUTH_PASSWORD}".encode()).digest()
# Rutas que se pueden ver sin sesión: la pantalla de login y lo que necesita para pintarse
PUBLIC = {"/login", "/login.html", "/api/login", "/api/health", "/favicon.svg", "/favicon-32.png", "/apple-touch-icon.png"}

_fails: dict[str, list[float]] = {}   # ip -> instantes de los últimos fallos
MAX_FAILS, WINDOW = 5, 300


def _b64(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).decode().rstrip("=")


def make_token() -> str:
    payload = _b64(json.dumps({"u": AUTH_USER, "e": int(time.time()) + TTL}).encode())
    return payload + "." + _b64(hmac.new(KEY, payload.encode(), hashlib.sha256).digest())


def valid_token(tok: str | None) -> bool:
    if not tok or "." not in tok:
        return False
    payload, sig = tok.rsplit(".", 1)
    good = _b64(hmac.new(KEY, payload.encode(), hashlib.sha256).digest())
    if not hmac.compare_digest(sig, good):
        return False
    try:
        data = json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))
    except Exception:
        return False
    return data.get("u") == AUTH_USER and data.get("e", 0) > time.time()


def check_credentials(user: str, password: str) -> bool:
    ok_u = hmac.compare_digest(hashlib.sha256((user or "").encode()).digest(), hashlib.sha256(AUTH_USER.encode()).digest())
    ok_p = hmac.compare_digest(hashlib.sha256((password or "").encode()).digest(), hashlib.sha256(AUTH_PASSWORD.encode()).digest())
    return ok_u and ok_p


def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    return (fwd.split(",")[0].strip() if fwd else "") or (request.client.host if request.client else "?")


def locked(ip: str) -> int:
    """Segundos que faltan para poder reintentar (0 = libre)."""
    now = time.time()
    xs = [t for t in _fails.get(ip, []) if now - t < WINDOW]
    _fails[ip] = xs
    return int(WINDOW - (now - xs[0])) + 1 if len(xs) >= MAX_FAILS else 0


def fail(ip: str):
    _fails.setdefault(ip, []).append(time.time())


def clear(ip: str):
    _fails.pop(ip, None)


def secure(request: Request) -> bool:
    return request.url.scheme == "https" or request.headers.get("x-forwarded-proto", "") == "https"


async def middleware(request: Request, call_next):
    if not ENABLED:
        return await call_next(request)
    path = request.url.path
    if path in PUBLIC or valid_token(request.cookies.get(COOKIE)):
        return await call_next(request)
    if path.startswith("/api/"):
        return JSONResponse({"detail": "Hace falta iniciar sesión"}, status_code=401)
    nxt = request.url.path + (("?" + request.url.query) if request.url.query else "")
    from urllib.parse import quote
    return RedirectResponse("/login?next=" + quote(nxt, safe=""), status_code=303)
