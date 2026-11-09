[English 🇬🇧](README.md) | [Deutsch 🇩🇪](README.de.md) | [Español 🇪🇸](README.es.md) | [Português 🇵🇹](README.pt.md) | [Français 🇫🇷](README.fr.md) | [Русский 🇷🇺](README.ru.md) | [中文 🇨🇳](README.zh.md) | [日本語 🇯🇵](README.ja.md) | [한국어 🇰🇷](README.ko.md) | [العربية 🇸🇦](README.ar.md)

> **Translation notice:** Translations in this project were made with AI and may contain errors.

# Navidrome Wrapped

An annual Wrapped-style recap for Navidrome: top artists and tracks, listening minutes, discoveries, fun stats (late-night listening, repeats, favorite hour, and more), plus a story player with background music (30-second clips from your top tracks) and PNG export for every card.

- **Backend:** FastAPI + read-only SQLite + ffmpeg for audio clips.
- **Frontend:** HTML/CSS/JS + Swiper, with no build step or CDN (all assets are in `app/static/vendor`).
- **Themes:** The appearance (progress bar, transitions, background, typography, text, and slide order) is an interchangeable theme that can be imported as a folder or ZIP. See [THEMES.md](THEMES.md).
- **On demand:** No background jobs; stats are calculated when you open the page.
- **Accessibility:** Keyboard-operable pause, visible focus, and slide announcements for screen readers. Accessibility has not been formally audited and does not guarantee WCAG conformance.

## Preview

Watch the Wrapped and see its first slides:

![Wrapped demo](res/tuto.gif)

The login screen is optional and can be enabled with `AUTH_USER` and `AUTH_PASSWORD`:

![Login screen](res/login.png)

## Deployment

The application runs in a Linux container. On 64-bit Windows, you can deploy it with Docker Desktop and the WSL 2 backend by following these steps from WSL 2. There is no native Windows executable or support for 32-bit Windows (x86). x86-64, also called x64 or amd64, means 64-bit.

```bash
cp .env.example .env      # then edit it (see below)
./deploy.sh               # on first setup and whenever you change the code
# → http://SERVER-IP:8100/
```

`deploy.sh` runs the following commands:

```bash
sudo chmod -R 755 app/
docker compose down
docker compose up -d --build
```

It also sets `./themes` to owner `PUID:PGID` so the web app can install imported themes.

### Usage

- **Mobile:** The Wrapped fills the screen. Tap the right side to advance, the left side to go back, or press and hold to pause.
- **Accessible controls:** Focus the story area and use ←/→ to navigate, or use the Pause/Resume button / `P`; slide changes are announced to screen readers. The interface respects reduced-motion preferences.
- **Desktop** (landscape window at least 1000 px wide): With any included theme, the card fills the **entire window** using a dedicated landscape layout (text on the left, records, charts, and covers on the right). Shortcuts: ← → or Space to navigate, `H` to return to the start, `M` to mute (hover over the speaker to adjust volume), and `S` to save the card as an image (on desktop, choose landscape or portrait; wide view exports in landscape). The view is selected automatically: landscape on desktop, 9:16 on mobile or in a narrow window. You can also jump to a slide by clicking its segment in the progress bar. Classic and Neon also have a wide layout; themes without a landscape layout always use the 9:16 frame.
- **When opening the page,** each person enters their Navidrome username (case-insensitive; the page remembers the last one) and selects a year with listening history. Other users are not listed. Direct links still work: `/?user=Alesis&year=2026`.
- **Import themes:** Use the “Import theme (.zip)” button on the start screen. It asks for the `ADMIN_KEY`; `./deploy.sh` generates one in `.env` on first run and displays it.

### `.env` settings

| Variable | What to set |
|---|---|
| `NAVIDROME_NETWORK` | Navidrome's Docker network: `docker inspect navidrome --format '{{json .NetworkSettings.Networks}}'` |
| `NAVIDROME_DATA_DIR` | Host directory containing `navidrome.db` (the one Navidrome mounts at `/data`) |
| `MUSIC_DIR_HOST` | Host directory containing the music (the same one Navidrome mounts at `/music`) |
| `WRAPPED_LANGUAGE` | Interface language: `en` (default), `de`, `es`, `pt`, `fr` (French), `ru`, `zh`, `ja`, `ko`, or `ar` |
| `NAVIDROME_USER` | Optional default user for the API only; the page asks for a user when opened |
| `ADMIN_KEY` | Key for importing `.zip` themes from the web. If empty, `./deploy.sh` generates one; if left empty manually, importing is disabled |
| `PUID` / `PGID` | User allowed to read those directories (`ls -ln /opt/navidrome/data`) |

If Navidrome stores its data in a **named volume** instead of a directory, change
`${NAVIDROME_DATA_DIR}:/data:ro` in `docker-compose.yml` to `navidrome_data:/data:ro` and declare the volume as `external: true` at the end of the file.

Set `WRAPPED_LANGUAGE` in `.env` to the desired language code, then run `./deploy.sh` to apply it.
The interface, login screen, built-in themes, dates, and numbers use the selected language. Custom themes use their default text unless they include a translation for that language.
Visitors can also change the language from the selector in the upper-right corner; their choice is remembered in that browser and does not change the server default.

### Two important details

**1. Mount the music at the same path Navidrome uses.** The `media_file` table stores absolute paths as seen by the Navidrome container (usually `/music/...`). This container mounts it at `/music` too. If your Navidrome uses another path (`ND_MUSICFOLDER`), mount your music directory at that same path inside this container.

**2. Read-only SQLite database in WAL mode.** Navidrome uses WAL, and opening a WAL database on a read-only volume can fail with `unable to open database file`. Therefore, `app/db.py` first tries to open the database directly (`mode=ro`); if that fails, it copies `navidrome.db` and `navidrome.db-wal` to `/cache/snapshot` and queries the copy. The snapshot is refreshed when the database changes (at most every `SNAPSHOT_TTL` seconds, 60 by default). The active mode is shown at `/api/health` → `db_access`. You can force it with `DB_ACCESS=direct` or `DB_ACCESS=snapshot`.

### Security

The container runs as a non-root user, with a read-only filesystem (except `/cache` and `/tmp`), no capabilities, and `no-new-privileges`. There is no built-in authentication: anyone who can reach the port can request any user's Wrapped. If you expose it outside your home network, put it behind an authenticated reverse proxy or remove `ports:` and access it only through the Navidrome network.

Theme importing is disabled unless you define `ADMIN_KEY`, because a theme can run JavaScript in the browser of anyone who opens it. ZIP files are validated (paths, symbolic links, size, and extensions) and cannot replace the included themes.

## API

| Route | Description |
|---|---|
| `GET /api/health` | Status, mode (`scrobbles` / `annotation`), and database access type |
| `GET /api/users` | Navidrome users |
| `GET /api/years?user=` | Years with listening history for a user (and the user's exact name) |
| `GET /api/config` | Default year and whether theme importing is enabled |
| `POST /api/themes/import` | Installs a theme from a `.zip` (`application/zip` body, `X-Admin-Key` header; `?force=true` replaces an existing theme) |
| `GET /api/wrapped?user=&year=` | All metrics as JSON |
| `GET /api/themes` · `GET /api/themes/{id}` | Installed themes / a resolved theme (with inheritance) |
| `GET /themes/{id}/{file}` | Theme files (CSS, fonts, images) |
| `GET /api/clip/{track_id}?seconds=30` | MP3 clip (cached in `/cache/clips`) |
| `GET /api/cover/{track_id}` | Cover art (cached in `/cache/covers`) |
| `GET /api/cover/{track_id}/blur` | Blurred color mesh from the cover art (cached in `/cache/blur`) |

Without the `scrobbles` table (older Navidrome versions), the app falls back to `annotation`: top tracks and approximate listening minutes, without listening times or repeat stats.

## Themes (a different design each year)

```bash
python scripts/theme.py new 2027 --extends frecuencia   # creates themes/2027/ (inherits from an included theme)
python scripts/theme.py install theme.zip              # imports a theme from another person or machine
python scripts/theme.py pack themes/2027               # packages it for backup or sharing
```

`./themes` is mounted in the container, so **there is no need to rebuild or restart**: just reload the page.
Select a theme with `?theme=2027`, `WRAPPED_THEME`, or automatically by creating a theme whose name matches the requested year (for example, `themes/2027` for `year=2027`). Included themes: `frecuencia` (default) and `remix` (React + motion). See [THEMES.md](THEMES.md) for details on manifests, templates, CSS, hooks, and transitions.

## Try it without your server

```bash
pip install -r requirements.txt
python scripts/make_demo.py --out demo          # fake database and music (requires ffmpeg)
DB_PATH=demo/navidrome.db MUSIC_DIR=demo/music CACHE_DIR=demo/cache \
NAVIDROME_USER=demo WRAPPED_YEAR=2026 uvicorn app.main:app --reload
# → http://localhost:8000
```

## Project structure

```
app/
  main.py      FastAPI routes
  config.py    environment variables
  db.py        database connection (direct or snapshot)
  queries.py   SQL
  stats.py     metrics and fun stats
  audio.py     clips and cover art with ffmpeg
  themes.py    theme loading, inheritance, and validation
  themes/      included themes (frecuencia, remix)
  static/      index.html, css/base.css, js/ (engine), vendor/ (Swiper, html2canvas)
themes/        your themes (mounted at /themes)
scripts/       make_demo.py (test data) · theme.py (new/validate/pack/install)
Dockerfile · docker-compose.yml · .env.example · THEMES.md
```

## Troubleshooting

- **`file not accessible` at `/api/clip`:** The music is not mounted at the same path Navidrome uses.
- **`unable to open database file`:** Set `DB_ACCESS=snapshot`, or check that `PUID`/`PGID` can read the data directory.
- **A theme does not load:** Run `python scripts/theme.py validate themes/<id>` or check `/api/themes` (invalid themes show their error).
- **No sound on startup:** Browsers require a user gesture; use the start screen's “Start” button.
- **“Cannot write to /themes” when importing a theme:** Run `sudo chown -R PUID:PGID themes` (`deploy.sh` does this).
- **“No plays for X in 2026”:** Check `?user=` (case-sensitive) and `?year=`.

## React + motion themes (optional)

Themes can choose their engine in `theme.json`: `"engine": "html"` (default, templates + CSS) or `"engine": "react"` (a React component using the open-source `motion` library).
The React theme “Remix” is included; open it with `/?theme=remix`. See the “Engines” section in [THEMES.md](THEMES.md) and the build tools in `theme-kit/`. Node is not required for deployment.

## Optional login

To require a username and password on the website, add these to `.env`:

    AUTH_USER=alesis
    AUTH_PASSWORD=a-long-password

Then run `./deploy.sh`. If both are empty (or omitted), login is disabled. If only one is set, the server will not start and will display an error. Sessions last 30 days (signed, HTTP-only cookie); changing the username or password invalidates all sessions.
After 5 failed attempts from the same IP address, login is blocked for 5 minutes. A “Log out” button appears on the start screen.
Login protects the entire site, including the API, cover art, and clips. If you expose the app to the internet, put it behind HTTPS. If the password contains `$`, write it as `$$` in `.env` (a Docker Compose requirement).

## Updates and releases

The version is defined in `app/version.py` (and shown at `/api/health`). Each push to `main` publishes the `ghcr.io/alesis124/navidrome-wrapped` image to GHCR with the `latest` and version tags (for example, `1.1.0`). To publish a new release, update the version in `app/version.py` and add an entry to `CHANGELOG.md`.

    docker compose pull && docker compose up -d      # update to the latest published image
    ./deploy.sh                                      # or build it on the server from source

To let others pull the image, make the package public (GitHub → your profile → Packages → navidrome-wrapped → Package settings → Change visibility).
