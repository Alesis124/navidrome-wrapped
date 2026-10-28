from itertools import accumulate
from collections import Counter, defaultdict
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from . import queries
from .config import TZ

LOCAL = ZoneInfo(TZ)


def parse_ts(v):
    """Acepta epoch (s/ms/ns), ISO o formato Go; devuelve datetime local."""
    if v is None:
        return None
    if isinstance(v, str):
        s = v.strip()
        if s.replace(".", "", 1).isdigit():
            v = float(s)
        else:
            try:
                dt = datetime.fromisoformat(s.replace(" +0000 UTC", "+00:00"))
            except ValueError:
                return None
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(LOCAL)
    if v > 1e17:
        v /= 1e9
    elif v > 1e11:
        v /= 1e3
    return datetime.fromtimestamp(v, tz=timezone.utc).astimezone(LOCAL)


def _aid(p):
    return p["artist_id"] or p["artist"]


def _track(p):
    tid = p["track_id"]
    return {"id": tid, "title": p["title"], "artist": p["artist"], "album": p["album"],
            "clip": f"/api/clip/{tid}", "cover": f"/api/cover/{tid}"}


def _year_expr(conn):
    """Año de lanzamiento de media_file: junta todas las columnas que existan (varía según la versión de Navidrome)."""
    cols = {r[1] for r in conn.execute("PRAGMA table_info(media_file)")}
    parts = []
    for c in ("original_year", "year", "release_year", "max_year"):
        if c in cols:
            parts.append(f"NULLIF(mf.{c}, 0)")
    for c in ("original_date", "release_date", "date"):
        if c in cols:
            parts.append(f"NULLIF(CAST(substr(mf.{c}, 1, 4) AS INTEGER), 0)")
    return f"COALESCE({', '.join(parts)}, NULL)" if parts else "NULL"


def load_plays(conn, user):
    plays = []
    sql = queries.HISTORY_SCROBBLES.replace("{year_expr}", _year_expr(conn))
    for r in conn.execute(sql, {"user": user}):
        dt = parse_ts(r["ts"])
        if dt:
            d = dict(r)
            d["dt"] = dt
            d["duration"] = d["duration"] or 0
            plays.append(d)
    plays.sort(key=lambda p: p["dt"])
    return plays


def count_added(conn, year):
    n = 0
    for (c,) in conn.execute(queries.MEDIA_CREATED):
        dt = parse_ts(c)
        if dt and dt.year == year:
            n += 1
    return n


# Edad musical (para pasar el rato): la música que más nos marca es la que salió cuando teníamos ~18 años.
# Se toma la mediana del año de lanzamiento de lo escuchado y se resta a ese «momento de los 18».
BUMP_AGE = 18


def listening_age(ys, year):
    rated = [p for p in ys if p.get("rel_year") and 1930 <= p["rel_year"] <= year]
    if len(rated) < 10 or len(rated) < 0.1 * len(ys):      # sin datos suficientes de año
        return None
    years = sorted(p["rel_year"] for p in rated)
    median = years[len(years) // 2]
    estimate = max(13, min(80, year - median + BUMP_AGE))
    dec = Counter((y // 10) * 10 for y in years)
    decades = [{"decade": d, "plays": c, "pct": round(100 * c / len(years), 1)} for d, c in sorted(dec.items())]
    top = max(decades, key=lambda d: d["plays"])
    oldest = min(rated, key=lambda p: p["rel_year"])
    newest = max(rated, key=lambda p: p["rel_year"])
    return {"estimate": estimate, "median_year": median, "decade": top["decade"], "decade_share": top["pct"],
            "decades": decades, "coverage": round(100 * len(rated) / len(ys)),
            "oldest": {**_track(oldest), "year": oldest["rel_year"]},
            "newest": {**_track(newest), "year": newest["rel_year"]}}


def from_history(plays, year, added_count):
    ys = [p for p in plays if p["dt"].year == year]
    if not ys:
        return None

    info = {p["track_id"]: p for p in plays}

    # --- Descubrimientos ---
    # Si el historial empieza este mismo año (Navidrome recién actualizado),
    # "primera escucha" no es fiable: usamos la fecha de alta en la biblioteca.
    reliable = plays[0]["dt"].year < year
    first_t, first_a = {}, {}
    for p in plays:
        when = p["dt"] if reliable else parse_ts(p["added_at"])
        if when is None:
            continue
        first_t[p["track_id"]] = min(first_t.get(p["track_id"], when), when)
        first_a[_aid(p)] = min(first_a.get(_aid(p), when), when)

    # --- Conteos ---
    t_count = Counter(p["track_id"] for p in ys)
    a_count, a_secs, a_name = Counter(), defaultdict(float), {}
    a_tracks = defaultdict(Counter)
    for p in ys:
        a = _aid(p)
        a_count[a] += 1
        a_secs[a] += p["duration"]
        a_name[a] = p["artist"]
        a_tracks[a][p["track_id"]] += 1

    def artist_row(i, a, c):
        tid = a_tracks[a].most_common(1)[0][0]
        return {"rank": i + 1, "id": a, "name": a_name[a], "plays": c,
                "minutes": round(a_secs[a] / 60),
                "clip": f"/api/clip/{tid}", "cover": f"/api/cover/{tid}"}

    top_tracks = [{**_track(info[t]), "rank": i + 1, "plays": c}
                  for i, (t, c) in enumerate(t_count.most_common(10))]
    top_artists = [artist_row(i, a, c) for i, (a, c) in enumerate(a_count.most_common(5))]

    # --- Carrera de artistas: reproducciones acumuladas mes a mes de los 5 más escuchados ---
    race = None
    top5 = [a for a, _ in a_count.most_common(5)]
    if len(top5) >= 2:
        per_month = {a: [0] * 12 for a in top5}
        for p in ys:
            a = _aid(p)
            if a in per_month:
                per_month[a][p["dt"].month - 1] += 1
        race = {"artists": [{**artist_row(i, a, a_count[a]), "monthly": per_month[a],
                             "cumulative": list(accumulate(per_month[a]))}
                            for i, a in enumerate(top5)]}

    age = listening_age(ys, year)

    new_t = [t for t in t_count if t in first_t and first_t[t].year == year]
    new_a = [a for a in a_count if a in first_a and first_a[a].year == year]
    top_new_t = sorted(new_t, key=lambda t: -t_count[t])[:5]
    top_new_a = sorted(new_a, key=lambda a: -a_count[a])[:5]

    # --- Datos curiosos ---
    per_day = Counter(p["dt"].date() for p in ys)
    day_secs = defaultdict(float)
    for p in ys:
        day_secs[p["dt"].date()] += p["duration"]
    bday, bplays = per_day.most_common(1)[0]

    hours, weekdays, months = [0] * 24, [0] * 7, [0] * 12
    for p in ys:
        hours[p["dt"].hour] += 1
        weekdays[p["dt"].weekday()] += 1
        months[p["dt"].month - 1] += 1

    night = [p for p in ys if p["dt"].hour < 6]
    night_info = None
    if night:
        nt = Counter(p["track_id"] for p in night)
        tid, c = nt.most_common(1)[0]
        latest = max(night, key=lambda p: (p["dt"].hour, p["dt"].minute))
        night_info = {
            "plays": len(night),
            "share": round(100 * len(night) / len(ys), 1),
            "top_track": {**_track(info[tid]), "plays": c},
            "latest": {"time": latest["dt"].strftime("%H:%M"),
                       "date": latest["dt"].date().isoformat(),
                       "track": _track(latest)},
        }

    (lday, ltid), lc = Counter((p["dt"].date(), p["track_id"]) for p in ys).most_common(1)[0]
    loop = {"day": lday.isoformat(), "plays": lc, "track": _track(info[ltid])} if lc >= 3 else None

    run, prev, best_run = 0, None, (0, None)
    for p in ys:
        run = run + 1 if p["track_id"] == prev else 1
        if run > best_run[0]:
            best_run = (run, p["track_id"])
        prev = p["track_id"]
    repeat = ({"times": best_run[0], "track": _track(info[best_run[1]])}
              if best_run[0] >= 3 else None)

    days = sorted(per_day)
    streak = cur = 1
    for a, b in zip(days, days[1:]):
        cur = cur + 1 if (b - a).days == 1 else 1
        streak = max(streak, cur)

    return {
        "totals": {"plays": len(ys),
                   "minutes": round(sum(p["duration"] for p in ys) / 60),
                   "tracks": len(t_count), "artists": len(a_count),
                   "days_active": len(per_day)},
        "top_artists": top_artists,
        "top_tracks": top_tracks,
        "discoveries": {
            "basis": "first_listen" if reliable else "added_to_library",
            "new_tracks": len(new_t), "new_artists": len(new_a),
            "added_to_library": added_count,
            "top_new_tracks": [{**_track(info[t]), "plays": t_count[t]} for t in top_new_t],
            "top_new_artists": [artist_row(i, a, a_count[a]) for i, a in enumerate(top_new_a)],
        },
        "race": race,
        "age": age,
        "age_why": None if age else f"{sum(1 for p in ys if p.get('rel_year'))} de {len(ys)} reproducciones tienen año de lanzamiento (hacen falta 10 y un 10 %)",
        "fun": {
            "night": night_info,
            "loop": loop,
            "repeat_run": repeat,
            "busiest_day": {"day": bday.isoformat(), "plays": bplays,
                            "minutes": round(day_secs[bday] / 60)},
            "peak_hour": hours.index(max(hours)),
            "streak_days": streak,
            "hours": hours, "weekdays": weekdays, "months": months,
        },
    }


def from_annotation(conn, user, year):
    rows = [dict(r) for r in conn.execute(queries.TOP_FALLBACK, {"user": user})]
    if not rows:
        return None
    for r in rows:
        r["duration"] = r["duration"] or 0
    a_count, a_secs, a_name, a_top = Counter(), defaultdict(float), {}, {}
    for r in rows:
        a = _aid(r)
        a_count[a] += r["play_count"]
        a_secs[a] += r["play_count"] * r["duration"]
        a_name[a] = r["artist"]
        a_top.setdefault(a, r["track_id"])  # rows ya vienen ordenadas por plays
    top_artists = [{"rank": i + 1, "id": a, "name": a_name[a], "plays": c,
                    "minutes": round(a_secs[a] / 60),
                    "clip": f"/api/clip/{a_top[a]}", "cover": f"/api/cover/{a_top[a]}"}
                   for i, (a, c) in enumerate(a_count.most_common(5))]
    new = [r for r in rows if (d := parse_ts(r["added_at"])) and d.year == year][:5]
    return {
        "totals": {"plays": sum(r["play_count"] for r in rows),
                   "minutes": round(sum(r["play_count"] * r["duration"] for r in rows) / 60),
                   "tracks": len(rows), "artists": len(a_count), "days_active": 0},
        "top_artists": top_artists,
        "top_tracks": [{**_track(r), "rank": i + 1, "plays": r["play_count"]}
                       for i, r in enumerate(rows[:10])],
        "discoveries": {"basis": "added_to_library", "new_tracks": len(new), "new_artists": 0,
                        "added_to_library": len(new),
                        "top_new_tracks": [{**_track(r), "plays": r["play_count"]} for r in new],
                        "top_new_artists": []},
        "fun": {},
    }
