"""Small, memory-only Subsonic API client for API data-source sessions."""
import hashlib
import http.client
import ipaddress
import json
import re
import secrets
import socket
import ssl
import threading
import time
from dataclasses import dataclass
from urllib.parse import urlencode, urlsplit, urlunsplit

from .config import NAVIDROME_URL

SUBSONIC_VERSION = "1.16.1"
CLIENT_NAME = "navidrome-wrapped"
SESSION_TTL = 8 * 60 * 60
MAX_SESSIONS = 2000
MAX_RESPONSE_BYTES = 5 * 1024 * 1024
_COVER_ID = re.compile(r"^[A-Za-z0-9._-]{1,128}$")
_sessions: dict[str, "ApiSession"] = {}
_sessions_lock = threading.RLock()


class NavidromeError(Exception):
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


@dataclass(frozen=True)
class ApiSession:
    base_url: str
    username: str
    token: str
    salt: str
    expires_at: float


class _PinnedHTTPConnection(http.client.HTTPConnection):
    def __init__(self, host, port, address, timeout):
        self._address = address
        super().__init__(host, port, timeout=timeout)

    def connect(self):
        self.sock = socket.create_connection((self._address, self.port), self.timeout)


class _PinnedHTTPSConnection(http.client.HTTPSConnection):
    def __init__(self, host, port, address, timeout):
        self._address = address
        super().__init__(host, port, timeout=timeout, context=ssl.create_default_context())

    def connect(self):
        sock = socket.create_connection((self._address, self.port), self.timeout)
        try:
            self.sock = self._context.wrap_socket(sock, server_hostname=self.host)
        except Exception:
            sock.close()
            raise


def validate_base_url(value: str) -> str:
    """Validate and normalize a public Navidrome base URL without contacting it."""
    if not isinstance(value, str) or not value or len(value) > 2048:
        raise NavidromeError("Enter a valid public Navidrome URL.", 422)
    if any(ord(char) < 32 or char.isspace() for char in value) or "\\" in value:
        raise NavidromeError("Enter a valid public Navidrome URL.", 422)
    try:
        parsed = urlsplit(value)
        host = parsed.hostname
        port = parsed.port
    except ValueError:
        raise NavidromeError("Enter a valid public Navidrome URL.", 422) from None
    if (parsed.scheme.lower() != "https" or not host or
            parsed.username is not None or parsed.password is not None or
            parsed.query or parsed.fragment):
        raise NavidromeError("Use an https URL without credentials, query, or fragment.", 422)
    host = host.rstrip(".")
    if not host or "%" in host:
        raise NavidromeError("Enter a valid public Navidrome URL.", 422)
    try:
        ascii_host = host.encode("idna").decode("ascii").lower()
    except UnicodeError:
        raise NavidromeError("Enter a valid public Navidrome URL.", 422) from None
    if ascii_host == "localhost" or ascii_host.endswith((".localhost", ".local", ".internal")):
        raise NavidromeError("Local hostnames are not allowed.", 422)
    path = parsed.path.rstrip("/")
    if (not re.fullmatch(r"/[A-Za-z0-9._~/-]*", path or "/") or
            any(part in {".", ".."} for part in path.split("/")) or "//" in path):
        raise NavidromeError("The URL path is not supported.", 422)
    if port is not None and not 1 <= port <= 65535:
        raise NavidromeError("Enter a valid public Navidrome URL.", 422)
    netloc_host = f"[{ascii_host}]" if ":" in ascii_host else ascii_host
    netloc = f"{netloc_host}:{port}" if port is not None else netloc_host
    return urlunsplit((parsed.scheme.lower(), netloc, path, "", ""))


def _resolve_public_address(host: str, port: int) -> str:
    try:
        literal = ipaddress.ip_address(host)
        addresses = [literal]
    except ValueError:
        try:
            records = socket.getaddrinfo(host, port, type=socket.SOCK_STREAM)
        except OSError:
            raise NavidromeError("Could not resolve the Navidrome host.", 422) from None
        addresses = []
        for record in records:
            try:
                address = ipaddress.ip_address(record[4][0])
            except ValueError:
                continue
            if address not in addresses:
                addresses.append(address)
    if not addresses or any(not address.is_global for address in addresses):
        raise NavidromeError("Navidrome URL must resolve only to public IP addresses.", 422)
    return str(addresses[0])


def _post(base_url: str, endpoint: str, fields: dict[str, str], max_bytes=MAX_RESPONSE_BYTES):
    normalized = validate_base_url(base_url)
    parsed = urlsplit(normalized)
    host = parsed.hostname
    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    address = _resolve_public_address(host, port)
    connection_type = _PinnedHTTPSConnection if parsed.scheme == "https" else _PinnedHTTPConnection
    conn = connection_type(host, port, address, timeout=8)
    path = f"{parsed.path}/rest/{endpoint}.view"
    body = urlencode(fields).encode("ascii")
    host_header = parsed.netloc
    try:
        conn.request("POST", path, body=body, headers={
            "Host": host_header,
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json, image/*",
            "Accept-Encoding": "identity",
            "Connection": "close",
            "User-Agent": CLIENT_NAME,
        })
        response = conn.getresponse()
        if 300 <= response.status < 400:
            raise NavidromeError("Navidrome redirected the request; redirects are not followed.")
        if response.status in {401, 403}:
            raise NavidromeError("Navidrome rejected these credentials.", 401)
        if response.status != 200:
            raise NavidromeError(f"Navidrome returned HTTP {response.status}.")
        length = response.getheader("Content-Length")
        if length and int(length) > max_bytes:
            raise NavidromeError("Navidrome response is too large.")
        content = response.read(max_bytes + 1)
        if len(content) > max_bytes:
            raise NavidromeError("Navidrome response is too large.")
        return content, response.getheader("Content-Type", "").split(";", 1)[0].lower()
    except NavidromeError:
        raise
    except (OSError, http.client.HTTPException, ssl.SSLError, ValueError):
        raise NavidromeError("Could not connect safely to Navidrome.") from None
    finally:
        conn.close()


def _credentials_fields(session: ApiSession) -> dict[str, str]:
    return {
        "u": session.username,
        "t": session.token,
        "s": session.salt,
        "v": SUBSONIC_VERSION,
        "c": CLIENT_NAME,
        "f": "json",
    }


def _json_call(session: ApiSession, endpoint: str, extra: dict[str, str] | None = None):
    fields = _credentials_fields(session)
    fields.update(extra or {})
    raw, _ = _post(session.base_url, endpoint, fields)
    try:
        result = json.loads(raw)
        envelope = result["subsonic-response"]
    except (ValueError, KeyError, TypeError):
        raise NavidromeError("Navidrome returned an unsupported API response.") from None
    if not isinstance(envelope, dict):
        raise NavidromeError("Navidrome returned an unsupported API response.")
    if envelope.get("status") != "ok":
        error = envelope.get("error") or {}
        if isinstance(error, dict) and error.get("code") in {40, 41}:
            raise NavidromeError("Navidrome rejected these credentials.", 401)
        raise NavidromeError("Navidrome could not provide this data.")
    return envelope


def _list(value):
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value] if isinstance(value, dict) else []


def fetch_summary(session: ApiSession) -> dict:
    folders_response = _json_call(session, "getMusicFolders")
    albums_response = _json_call(session, "getAlbumList2", {"type": "newest", "size": "20"})
    folder_data = folders_response.get("musicFolders")
    album_data = albums_response.get("albumList2")
    folders = _list(folder_data.get("musicFolder")) if isinstance(folder_data, dict) else []
    albums = _list(album_data.get("album")) if isinstance(album_data, dict) else []
    recent_albums = []
    for album in albums[:20]:
        if not isinstance(album, dict):
            continue
        cover_id = str(album.get("coverArt") or "")
        recent_albums.append({
            "title": str(album.get("name") or album.get("title") or "Unknown album")[:256],
            "artist": str(album.get("artist") or "Unknown artist")[:256],
            "cover_id": cover_id if _COVER_ID.fullmatch(cover_id) else None,
        })
    return {
        "source": "api",
        "limited": True,
        "scope": "current library metadata and recently added albums",
        "library": {
            "music_folder_count": len(folders),
            "music_folders": [str(folder.get("name") or "")[:256]
                              for folder in folders if isinstance(folder, dict)],
        },
        "recent_albums": recent_albums,
        "notice": ("This summary uses current library metadata and newest albums. The Subsonic API "
                   "does not expose per-play history, so no calendar-year listening statistics are generated."),
    }


def fetch_cover(session: ApiSession, cover_id: str) -> tuple[bytes, str]:
    if not _COVER_ID.fullmatch(cover_id):
        raise NavidromeError("Invalid cover identifier.", 404)
    fields = _credentials_fields(session)
    fields["id"] = cover_id
    raw, content_type = _post(session.base_url, "getCoverArt", fields)
    if content_type not in {"image/jpeg", "image/png", "image/webp", "image/gif"}:
        raise NavidromeError("Navidrome did not return a supported image.", 502)
    return raw, content_type


def create_session(url: str, username: str, password: str = "",
                   token: str = "", salt: str = "") -> tuple[str, dict]:
    username = username.strip()
    if not username or len(username) > 128:
        raise NavidromeError("Enter a valid Navidrome username.", 422)
    if len(password) > 1024 or len(token) > 256 or len(salt) > 128:
        raise NavidromeError("Credentials are too long.", 422)
    if password and (token or salt):
        raise NavidromeError("Use either a password or a token and salt.", 422)
    if password:
        salt = secrets.token_hex(8)
        token = hashlib.md5((password + salt).encode("utf-8"), usedforsecurity=False).hexdigest()
    elif not token or not salt:
        raise NavidromeError("Enter a password or both a token and salt.", 422)
    if not re.fullmatch(r"[A-Za-z0-9._~-]+", token) or not re.fullmatch(r"[A-Za-z0-9._~-]+", salt):
        raise NavidromeError("The token or salt contains unsupported characters.", 422)

    if NAVIDROME_URL:
        if url:
            raise NavidromeError("The server URL is fixed by the deployment.", 422)
        url = NAVIDROME_URL
    base_url = validate_base_url(url)
    # Resolve before storing anything, and pin the resolved public address for each request.
    parsed = urlsplit(base_url)
    _resolve_public_address(parsed.hostname, parsed.port or (443 if parsed.scheme == "https" else 80))
    session = ApiSession(base_url, username, token, salt, time.time() + SESSION_TTL)
    summary = fetch_summary(session)
    session_id = secrets.token_urlsafe(32)
    with _sessions_lock:
        now = time.time()
        for key in [key for key, value in _sessions.items() if value.expires_at <= now]:
            _sessions.pop(key, None)
        if len(_sessions) >= MAX_SESSIONS:
            raise NavidromeError("The server is at session capacity; try again later.", 503)
        _sessions[session_id] = session
    return session_id, summary


def get_session(session_id: str | None) -> ApiSession | None:
    if not session_id:
        return None
    with _sessions_lock:
        session = _sessions.get(session_id)
        if not session or session.expires_at <= time.time():
            _sessions.pop(session_id, None)
            return None
        return session


def delete_session(session_id: str | None) -> None:
    if session_id:
        with _sessions_lock:
            _sessions.pop(session_id, None)
