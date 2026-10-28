#!/usr/bin/env python3
"""Genera una BD con el esquema mínimo de Navidrome + música de mentira (tonos)
para probar Navidrome Wrapped sin tocar tu servidor real.

    python scripts/make_demo.py --out demo
    DB_PATH=demo/navidrome.db MUSIC_DIR=demo/music CACHE_DIR=demo/cache \
    NAVIDROME_USER=demo WRAPPED_YEAR=2026 uvicorn app.main:app

Requiere ffmpeg en el PATH.
"""
import argparse
import random
import sqlite3
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

TZ = ZoneInfo("Europe/Madrid")

# (artista, álbum, título, frecuencia, color de carátula, año en que "se descubre")
TRACKS = [
    ("Los Planetas", "Super 8", "Segundo premio", 220, "0x6e1d4a", 2025),
    ("Los Planetas", "Super 8", "Un buen día", 247, "0x6e1d4a", 2025),
    ("Extremoduro", "Agila", "So payaso", 262, "0x5c3b0f", 2025),
    ("Extremoduro", "Agila", "Estrella polar", 294, "0x5c3b0f", 2025),
    ("Vetusta Morla", "Un día en el mundo", "Copenhague", 330, "0x0f4c5c", 2025),
    ("Vetusta Morla", "Un día en el mundo", "ValMeñá", 349, "0x0f4c5c", 2025),
    ("Kiko Veneno", "Échale Veneno", "Volando voy", 392, "0x1d3b6e", 2025),
    ("Nacho Vegas", "Actos inexplicables", "El hombre que casi conoció a Michi Panero", 440, "0x4a1d6e", 2026),
    ("Bunbury", "Las consecuencias", "Lady Blue", 494, "0x3b1d6e", 2026),
    ("Rosalía", "El mal querer", "Malamente", 523, "0x6e1d4a", 2026),
    ("Rosalía", "El mal querer", "Pienso en tu mirá", 587, "0x6e1d4a", 2026),
    ("Carolina Durante", "Carolina Durante", "Cayetano", 659, "0x0f4c5c", 2026),
]
DUR = 75  # segundos

# Colores (centro, borde, detalle) de la carátula de cada álbum, para que el demo se parezca
# a una biblioteca real y se vea de verdad el color que sale de cada portada.
ALBUM_ART = {
    "Super 8": ("e63946", "1d3557", "f1faee"),
    "Agila": ("f4a261", "264653", "e9c46a"),
    "Un día en el mundo": ("2a9d8f", "e9c46a", "264653"),
    "Échale Veneno": ("06d6a0", "118ab2", "ffd166"),
    "Actos inexplicables": ("7b2cbf", "ffd166", "10002b"),
    "Las consecuencias": ("9d0208", "ffba08", "03071e"),
    "El mal querer": ("ff006e", "8338ec", "ffbe0b"),
    "Carolina Durante": ("3a86ff", "ffbe0b", "ff006e"),
}


def make_cover(path, album, k):
    """Carátula 600x600 con degradado radial, un círculo y una franja (determinista)."""
    c = [tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) for h in ALBUM_ART[album]]

    def ch(i):
        base = (f"lerp({c[0][i]},{c[1][i]},clip(hypot(X-{150 + k * 37 % 300},"
                f"Y-{120 + k * 53 % 320})/560,0,1))")
        circle = f"lt(hypot(X-{380 - k * 23 % 140},Y-{230 + k * 31 % 200}),{110 + k * 9 % 60})"
        bar = f"between(X+Y,{600 + k * 17 % 120},{690 + k * 17 % 120})"
        return f"if({circle}+{bar},{c[2][i]},{base})"

    ffmpeg("-f", "lavfi", "-i", "color=c=black:s=600x600:d=1", "-frames:v", "1",
           "-vf", f"format=gbrp,geq=r='{ch(0)}':g='{ch(1)}':b='{ch(2)}'", str(path))


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="demo")
    ap.add_argument("--plays", type=int, default=1800)
    ap.add_argument("--user", default="demo")
    ap.add_argument("--wal", action="store_true", help="BD en modo WAL (como Navidrome)")
    a = ap.parse_args()

    out = Path(a.out).resolve()
    music = out / "music"
    music.mkdir(parents=True, exist_ok=True)
    random.seed(7)

    rows = []
    for i, (artist, album, title, freq, color, first) in enumerate(TRACKS):
        d = music / artist / album
        d.mkdir(parents=True, exist_ok=True)
        f = d / f"{i + 1:02d} - {title[:30].replace('/', '-')}.mp3"
        if not f.exists():
            ffmpeg("-f", "lavfi", "-i", f"sine=frequency={freq}:duration={DUR}",
                   "-f", "lavfi", "-i", f"sine=frequency={freq * 1.5:.0f}:duration={DUR}",
                   "-filter_complex", "amix=inputs=2:duration=first,volume=0.6",
                   "-c:a", "libmp3lame", "-b:a", "64k", str(f))
        cover = d / "cover.jpg"
        if not cover.exists():
            make_cover(cover, album, list(ALBUM_ART).index(album))
        rows.append((f"trk{i:019d}", str(f), title, album, f"alb{i // 2:019d}",
                     artist, f"art{TRACKS.index(next(t for t in TRACKS if t[0] == artist)):019d}",
                     float(DUR), first))

    db = out / "navidrome.db"
    db.unlink(missing_ok=True)
    con = sqlite3.connect(db)
    if a.wal:
        con.execute("PRAGMA journal_mode=WAL")
    con.executescript("""
    CREATE TABLE user (id varchar(255) primary key, user_name varchar(255) unique not null);
    CREATE TABLE media_file (id varchar(255) primary key, path varchar(1024), title varchar(255),
        album varchar(255), album_id varchar(255), artist varchar(255), artist_id varchar(255),
        duration real, created_at datetime);
    CREATE TABLE scrobbles (media_file_id varchar(255), user_id varchar(255), submission_time integer);
    CREATE TABLE annotation (user_id varchar(255), item_id varchar(255), item_type varchar(255),
        play_count integer, play_date datetime);
    """)
    con.execute("INSERT INTO user VALUES ('u1', ?)", (a.user,))
    for r in rows:
        created = datetime(r[8], 3 if r[8] == 2026 else 6, 1, 12, tzinfo=TZ).isoformat()
        con.execute("INSERT INTO media_file VALUES (?,?,?,?,?,?,?,?,?)", (*r[:8], created))

    def ts(dt):
        return int(dt.timestamp())

    weights = [10, 8, 7, 6, 5, 4, 3, 6, 5, 9, 7, 6]
    plays = []
    start, end = datetime(2025, 6, 1, tzinfo=TZ), datetime(2026, 10, 20, tzinfo=TZ)
    span = int((end - start).total_seconds())
    hour_w = [6, 5, 4, 3, 2, 1, 1, 2, 3, 3, 3, 3, 4, 4, 3, 3, 4, 5, 6, 8, 10, 12, 12, 9]
    for _ in range(a.plays):
        t = start + timedelta(seconds=random.randrange(span))
        t = t.replace(hour=random.choices(range(24), hour_w)[0], minute=random.randrange(60))
        idx = random.choices(range(len(TRACKS)), weights)[0]
        if TRACKS[idx][5] == 2026 and t.year < 2026:
            idx = random.randrange(7)  # las canciones "nuevas" solo suenan desde 2026
        plays.append((rows[idx][0], t))
    # un día de bucle: 9 veces la misma canción seguidas
    loop_day = datetime(2026, 5, 17, 23, 10, tzinfo=TZ)
    for k in range(9):
        plays.append((rows[9][0], loop_day + timedelta(minutes=2 * k)))
    # una escucha tardía
    plays.append((rows[4][0], datetime(2026, 8, 2, 4, 47, tzinfo=TZ)))

    con.executemany("INSERT INTO scrobbles VALUES (?,?,?)", [(m, "u1", ts(t)) for m, t in plays])
    from collections import Counter
    for m, c in Counter(m for m, _ in plays).items():
        con.execute("INSERT INTO annotation VALUES ('u1', ?, 'media_file', ?, ?)",
                    (m, c, datetime(2026, 10, 20, tzinfo=TZ).isoformat()))
    con.commit()
    con.close()
    print(f"OK: {db}  ({len(plays)} reproducciones, {len(rows)} canciones)")


if __name__ == "__main__":
    main()
