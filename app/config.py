import os
from datetime import datetime

DB_PATH = os.getenv("DB_PATH", "/data/navidrome.db")
MUSIC_DIR = os.getenv("MUSIC_DIR", "/music")
CACHE_DIR = os.getenv("CACHE_DIR", "/cache")
TZ = os.getenv("TZ", "Europe/Madrid")
DEFAULT_USER = os.getenv("NAVIDROME_USER", "")
DEFAULT_YEAR = int(os.getenv("WRAPPED_YEAR") or datetime.now().year)
CLIP_SECONDS = int(os.getenv("CLIP_SECONDS", "30"))
SNAPSHOT_TTL = int(os.getenv("SNAPSHOT_TTL", "60"))
DB_ACCESS = os.getenv("DB_ACCESS", "auto")  # auto | direct | snapshot
THEMES_DIR = os.getenv("THEMES_DIR", "/themes")
DEFAULT_THEME = os.getenv("WRAPPED_THEME", "")
ADMIN_KEY = os.getenv("ADMIN_KEY", "")   # vacío = importar temas desde la web desactivado
MAX_THEME_ZIP = 30 * 1024 * 1024
AUTH_USER = os.getenv("AUTH_USER", "").strip()          # usuario y contraseña para entrar a la web (los dos vacíos = sin login)
AUTH_PASSWORD = os.getenv("AUTH_PASSWORD", "")
