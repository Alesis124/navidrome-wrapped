// Tipos de diapositiva que entiende el motor. Cada tema decide cuáles usa,
// en qué orden y con qué plantilla; aquí solo se prepara el dato de cada una.
//
// build(datos) → null si no aplica (p. ej. no hay madrugadas) o
//   { clip, cover, x }
//     clip  : URL del audio de fondo de la diapositiva
//     cover : URL de la carátula (en CSS: var(--cover) y var(--cover-blur))
//     x     : datos extra para la plantilla ({{x.…}}) y para los textos del tema ({clave})
import { dayLabel, fmt } from './tpl.js';

const pad2 = (n) => String(n).padStart(2, '0');
const nf1 = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 });
const pct = (v, max) => Math.round(((v || 0) / (max || 1)) * 1000) / 10;
const top = (d) => d.top_tracks?.[0];
const mk = (t, x = {}) => ({ clip: t?.clip, cover: t?.cover, x });
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const reps = (n, max) => Array.from({ length: Math.min(n, max) }, (_, k) => ({ k }));
const withPct = (list) => {
  const max = Math.max(...list.map((i) => i.plays || 0), 1);
  return list.map((i) => ({ ...i, pct: pct(i.plays, max) }));
};

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
  'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MONTH_INITIAL = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const WEEKDAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const WEEK_INITIAL = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const SLIDES = {
  intro: { dur: 5000, build: (d) => mk(top(d), { track: top(d) }) },

  minutes: {
    dur: 6500,
    build: (d) => {
      const m = d.totals.minutes, act = d.totals.days_active;
      return mk(top(d), {
        minutes: fmt(m), plays: fmt(d.totals.plays),
        artists: fmt(d.totals.artists), tracks: fmt(d.totals.tracks),
        hours: fmt(m / 60), days: nf1.format(m / 1440), albums: fmt(m / 45),
        per_day: act ? fmt(m / act) : '', days_active: fmt(act),
        covers: (d.top_tracks || []).slice(0, 5).map((t) => ({ cover: t.cover })),
      });
    },
  },

  'top-artists': {
    dur: 7000,
    build: (d) => {
      const a = d.top_artists;
      if (!a?.length) return null;
      const list = withPct(a);
      return mk(a[0], {
        first: list[0], rest: list.slice(1), artists: list,
        artist: a[0].name, artist_plays: fmt(a[0].plays), artist_minutes: fmt(a[0].minutes),
      });
    },
  },

  // Carrera de artistas: reproducciones acumuladas mes a mes de los 5 primeros; gana el más escuchado del año.
  // Solo la usan los temas que la listan en «slides» (no está en la secuencia por defecto).
  race: {
    dur: 12500,
    build: (d) => {
      const a = d.race?.artists;
      if (!a || a.length < 2) return null;
      const max = Math.max(...a.map((r) => r.cumulative.at(-1)), 1);
      const artists = a.map((r) => ({ ...r, frac: r.cumulative.map((v) => v / max) }));
      const win = artists.reduce((best, r) => (r.plays > best.plays ? r : best), artists[0]);
      return { ...mk(win, { artists, months: MONTHS.map(cap), max, winner: win, winner_name: win.name, winner_plays: fmt(win.plays) }), clip: undefined };   // la música la pone el propio tema según quién vaya ganando
    },
  },

  'top-tracks': {
    dur: 7000,
    build: (d) => {
      if (!d.top_tracks?.length) return null;
      const list = withPct(d.top_tracks.slice(0, 5));
      return mk(top(d), { tracks: list, first: list[0] });
    },
  },

  'number-one': {
    dur: 6500,
    build: (d) => {
      const t = top(d);
      return t ? mk(t, { track: t, track_title: t.title, track_artist: t.artist, track_plays: fmt(t.plays) }) : null;
    },
  },

  discoveries: {
    dur: 7000,
    build: (d) => {
      const n = d.discoveries?.top_new_tracks;
      return n?.length ? mk(n[0], {
        new_tracks: fmt(d.discoveries.new_tracks), new_artists: fmt(d.discoveries.new_artists),
        first: n[0],
      }) : null;
    },
  },

  night: {
    dur: 7000,
    build: (d) => {
      const n = d.fun?.night;
      return n ? mk(n.top_track, {
        night_plays: fmt(n.plays), night_share: n.share, night_time: n.latest.time,
        night_track: n.latest.track.title, night_top: n.top_track.title, track: n.top_track,
      }) : null;
    },
  },

  loop: {
    dur: 7000,
    build: (d) => {
      const l = d.fun?.loop;
      return l ? mk(l.track, {
        loop_plays: l.plays, loop_day: dayLabel(l.day), loop_track: l.track.title,
        track: l.track, reps: reps(l.plays, 7),
      }) : null;
    },
  },

  repeat: {
    dur: 6500,
    build: (d) => {
      const r = d.fun?.repeat_run;
      return r ? mk(r.track, {
        repeat_times: r.times, repeat_track: r.track.title, track: r.track, reps: reps(r.times, 9),
      }) : null;
    },
  },

  hour: {
    dur: 7000,
    build: (d) => {
      const f = d.fun;
      if (!f?.hours) return null;
      const max = Math.max(...f.hours) || 1;
      const wmax = Math.max(...f.weekdays) || 1;
      const wi = f.weekdays.indexOf(wmax);
      return mk(d.top_tracks?.[1] ?? top(d), {
        peak: pad2(f.peak_hour),
        hist: f.hours.map((h, i) => ({ h: i, plays: h, pct: pct(h, max), peak: i === f.peak_hour })),
        week: f.weekdays.map((v, i) => ({ d: WEEK_INITIAL[i], plays: v, pct: pct(v, wmax), peak: i === wi })),
        peak_day: WEEKDAYS[wi],
        busiest_day: dayLabel(f.busiest_day.day), busiest_plays: f.busiest_day.plays,
        busiest_minutes: f.busiest_day.minutes, streak: f.streak_days,
      });
    },
  },

  // Reproducciones por mes del año
  months: {
    dur: 7000,
    build: (d) => {
      const m = d.fun?.months;
      if (!m || !m.some((v) => v > 0)) return null;
      const max = Math.max(...m), pi = m.indexOf(max);
      return mk(d.top_tracks?.[2] ?? top(d), {
        bars: m.map((v, i) => ({ m: MONTH_INITIAL[i], plays: v, pct: pct(v, max), peak: i === pi })),
        peak_month: MONTHS[pi], peak_month_cap: cap(MONTHS[pi]), peak_plays: fmt(max),
      });
    },
  },

  // Edad musical (estimación para pasar el rato): según el año de lanzamiento de lo que escuchas
  age: {
    dur: 8200,
    build: (d) => {
      const a = d.age;
      if (!a?.decades?.length) return null;
      const max = Math.max(...a.decades.map((e) => e.pct), 1);
      return mk(a.oldest?.cover ? a.oldest : top(d), {
        age: a.estimate, median_year: a.median_year, decade: a.decade, decade_share: nf1.format(a.decade_share),
        coverage: a.coverage, oldest_title: a.oldest?.title, oldest_artist: a.oldest?.artist, oldest_year: a.oldest?.year,
        newest_title: a.newest?.title, newest_artist: a.newest?.artist, newest_year: a.newest?.year,
        decades: a.decades.map((e) => ({ label: `${e.decade}s`, pct: pct(e.pct, max), share: nf1.format(e.pct), peak: e.decade === a.decade })),
      });
    },
  },

  // Tarjeta-resumen pensada para compartir: mosaico con las carátulas de todo lo que ha salido
  recap: {
    dur: 9000,
    build: (d) => {
      const t = top(d);
      if (!t) return null;
      const f = d.fun || {};
      const seen = new Set(), covers = [];
      for (const x of [...(d.top_tracks || []), ...(d.top_artists || []), ...(d.discoveries?.top_new_tracks || []),
        f.night?.top_track, f.loop?.track, f.repeat_run?.track]) {
        if (x?.cover && !seen.has(x.cover) && covers.length < 13) { seen.add(x.cover); covers.push({ cover: x.cover }); }
      }
      // Un cuadro grande + minis que completen filas de 4 (sin huecos sueltos)
      const minis = covers.length - 1;
      if (minis >= 4) covers.length = 1 + 4 + Math.floor((minis - 4) / 4) * 4;
      const list = (a) => a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} y ${a.at(-1)}`;
      return mk(t, {
        minutes: fmt(d.totals.minutes), plays: fmt(d.totals.plays),
        artists: fmt(d.totals.artists), tracks: fmt(d.totals.tracks),
        peak: f.hours ? pad2(f.peak_hour) : '',
        top_artist: d.top_artists?.[0]?.name ?? '',
        artists_line: list((d.top_artists || []).slice(0, 3).map((a) => a.name)),
        tracks_line: list((d.top_tracks || []).slice(0, 3).map((x) => x.title)),
        covers, n_covers: covers.length,
      });
    },
  },

  outro: { dur: 6000, build: (d) => mk(top(d), { track: top(d) }) },

  // Collage final con una miniatura de cada diapositiva. El motor lo rellena (collage.js); solo se muestra
  // si el tema trae la plantilla «collage»
  collage: { dur: 60000, build: (d) => mk(top(d), {}) },
};

export const DEFAULT_SEQUENCE = ['intro', 'minutes', 'top-artists', 'top-tracks', 'number-one',
  'discoveries', 'night', 'loop', 'hour', 'outro', 'collage'];
