// Remix: tema React + motion. Compilar:  cd theme-kit && npm run build -- ../app/themes/remix
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useTransform } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

let VIEW = 'phone';   // se actualiza en cada render del tema
const ease = [0.16, 1, 0.3, 1];
const spring = { type: 'spring', stiffness: 210, damping: 24 };
const nf = new Intl.NumberFormat('es-ES');
const num = (v) => parseInt(String(v).replace(/\D/g, ''), 10) || 0;
const rng = (seed) => { let s = seed * 9301 + 49297; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };

// Texto que sube palabra a palabra desde una máscara (como los titulares de Spotify/Apple)
function Words({ text, delay = 0, className = 'rx-h', tag: Tag = 'div' }) {
  return (
    <Tag className={className} aria-label={text}>
      {String(text).split(' ').map((w, i) => (
        <span key={i} className="rx-w" aria-hidden="true">
          <motion.span initial={{ y: '118%', rotate: 5 }} animate={{ y: 0, rotate: 0 }}
            transition={{ duration: 0.85, ease, delay: delay + i * 0.07 }}>{w}</motion.span>
        </span>
      ))}
    </Tag>
  );
}

// Número grande que entra de lado y sube contando
function Ticker({ to, delay = 0.3, suffix = '' }) {
  const n = num(to), mv = useMotionValue(0);
  const text = useTransform(mv, (v) => nf.format(Math.round(v)) + suffix);
  useEffect(() => { const c = animate(mv, n, { duration: 1.9, ease, delay }); return () => c.stop(); }, [n]);
  return (
    <motion.div className="rx-num" initial={{ x: '60%', opacity: 0 }} animate={{ x: 0, opacity: 1 }}
      transition={{ ...spring, delay }}><motion.span>{text}</motion.span></motion.div>
  );
}

// Fondo fluido: manchas de color que se mueven despacio
function Mesh({ colors }) {
  return (
    <div className="rx-mesh" aria-hidden="true">
      {colors.map((c, i) => (
        <motion.i key={i} style={{ background: `radial-gradient(circle at center, ${c} 0%, transparent 66%)` }}
          animate={{ x: [0, i % 2 ? -70 : 60, 0], y: [0, 50 - i * 35, 0], scale: [1, 1.22, 1] }}
          transition={{ duration: 7 + i * 2.3, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

// Carátulas que saltan a posiciones repartidas, ligeramente giradas
function Scatter({ covers, seed = 1, n = 7, delay = 0.1, size = [16, 15], yr = [4, 74] }) {
  const items = useMemo(() => {
    const r = rng(seed);
    return covers.filter(Boolean).slice(0, n).map((src, i) => ({
      src, x: VIEW === 'wide' ? 60 + r() * 26 : 4 + r() * 66,
      y: VIEW === 'wide' ? 4 + r() * 62 : yr[0] + r() * (yr[1] - yr[0]), w: size[0] + r() * size[1], rot: (r() - 0.5) * 30, d: delay + i * 0.13,
    }));
  }, [covers.join('|')]);
  return items.map((it, i) => (
    <motion.img key={i} className="rx-pop" src={it.src} alt="" style={{ left: `${it.x}%`, top: `${it.y}%`, width: `${it.w}cqmin` }}
      initial={{ scale: 0, rotate: it.rot * 4, opacity: 0 }} animate={{ scale: 1, rotate: it.rot, opacity: 1 }}
      transition={{ ...spring, delay: it.d }} />
  ));
}

const STAR = 'M50 4C53 34 66 47 96 50C66 53 53 66 50 96C47 66 34 53 4 50C34 47 47 34 50 4Z';
const Spark = ({ style, delay = 0 }) => (
  <svg className="rx-spark" viewBox="0 0 100 100" style={style} aria-hidden="true">
    <motion.path d={STAR} initial={{ pathLength: 0, rotate: -40 }} animate={{ pathLength: 1, rotate: 0 }}
      transition={{ duration: 1.1, ease, delay }} style={{ transformOrigin: '50% 50%' }} />
  </svg>
);

function Rings({ fg, bg, n = 10 }) {
  return (
    <svg className="rx-rings" viewBox="-50 -50 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {Array.from({ length: n }, (_, k) => (
        <motion.circle key={k} r={(n - k) * 6.2} fill={k % 2 ? bg : fg} initial={{ scale: 0.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }} transition={{ ...spring, delay: k * 0.045 }} />
      ))}
    </svg>
  );
}

const Cover = ({ src, className, ...rest }) =>
  src ? <motion.img className={className} src={src} alt="" {...rest} /> : null;

/* ─────────────── Diapositivas ─────────────── */

function Intro({ data, slide, vars }) {
  const covers = useMemo(() => (data.top_tracks || []).map((t) => t.cover).filter(Boolean), []);
  const [k, setK] = useState(0);
  useEffect(() => {
    if (covers.length < 2) return;
    const t = setInterval(() => setK((v) => v + 1), 320);
    const stop = setTimeout(() => clearInterval(t), 320 * 6);
    return () => { clearInterval(t); clearTimeout(stop); };
  }, []);
  const src = k >= 6 || covers.length < 2 ? slide.cover : covers[k % covers.length];
  return (
    <>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div key={src} className="rx-cv" style={{ backgroundImage: `url('${encodeURI(src || '')}/blur')` }}
          initial={{ opacity: 0, scale: 1.15 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} />
      </AnimatePresence>
      <Spark style={{ right: '8%', top: '10%' }} delay={0.4} />
      <Spark style={{ left: '12%', top: '22%', width: '9cqmin', height: '9cqmin' }} delay={0.7} />
      <div className="rx-in">
        <motion.p className="rx-k" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
          {vars.user}, tu año en música
        </motion.p>
        <Words text="Wrapped" delay={1.1} />
        <Words text={String(vars.year)} delay={1.3} />
      </div>
    </>
  );
}

function Minutes({ x, data }) {
  const covers = (data.top_tracks || []).map((t) => t.cover);
  return (
    <>
      <Mesh colors={['#ffb000', '#ff2e00', '#00d1b2', '#ff8a00']} />
      <Scatter covers={covers} seed={3} n={5} delay={0.2} size={[15, 7]} yr={[2, 20]} />
      <div className="rx-in" style={{ marginTop: '14cqmin' }}>
        <Words text="Este año escuchaste" className="rx-h2" delay={0.2} />
        <Ticker to={x.minutes} delay={0.9} />
        <Words text="minutos de música" delay={1.2} />
        <motion.div className="rx-chips" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8, ...spring }}>
          <div className="rx-chip"><b>{x.plays}</b>reproducciones</div>
          <div className="rx-chip"><b>{x.artists}</b>artistas</div>
          <div className="rx-chip"><b>{x.tracks}</b>canciones</div>
        </motion.div>
      </div>
    </>
  );
}

function Artists({ x, slide }) {
  const list = x.artists.slice(0, 5);
  const [k, setK] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setK((v) => Math.min(v + 1, list.length - 1)), Math.max(1200, (slide.dur - 2200) / list.length));
    return () => clearInterval(t);
  }, []);
  const a = list[k];
  return (
    <div className="rx-art">
      <Words text={`Tus ${list.length} artistas más escuchados`} className="rx-h2" />
      <div className="rx-band">
        <Rings fg="#f3eee2" bg="#151515" />
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div key={k} className="rx-face" initial={{ x: '130cqw', rotate: 14 }} animate={{ x: 0, rotate: 0 }}
            exit={{ x: '-130cqw', rotate: -14 }} transition={spring}>
            {a.cover && <img src={a.cover} alt="" />}
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={k} className="rx-name" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }} transition={{ duration: 0.35, ease }}>
          <b>{a.name}</b><small>{nf.format(a.plays)} reproducciones</small>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


// Carrera vertical: los artistas casi no se mueven entre sí; sube el conjunto y el fondo baja a toda velocidad.
// La posición mezcla el avance común del tiempo con lo cerca que va cada uno del líder, así van muy igualados.
const LANE = ['#ff5a1f', '#d8ff3d', '#ff8fc2', '#7a5cff', '#00d1b2'];
function useBox(ref) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return box;
}
// Coreografía: la carrera NO refleja el año real (si no, el favorito iría primero desde el principio).
// Todos salen igualados, se pasan unos a otros y, al final, queda el orden real (x.artists viene ordenado por reproducciones).
// Cada fase le toca a uno (el último es el ganador real) y se queda en cabeza lo bastante para oír su música.
const PH = [0, 0.2, 0.42, 0.64];                       // inicio de cada fase de liderazgo; la última, la del ganador, llega hasta el final
const seq = (n) => [...[2, 4, 1, 3].filter((r) => r < n).slice(0, 3), 0];
const sstep = (a, b, v) => { const k = Math.min(Math.max((v - a) / (b - a), 0), 1); return k * k * (3 - 2 * k); };
function scoreAt(r, n, t, sq) {
  const k = sq.indexOf(r), phs = sq.length;
  let bonus = 0;
  if (k >= 0) {
    const start = PH[k], end = k === phs - 1 ? 2 : PH[k + 1];
    bonus = (k === phs - 1 ? 0.03 : 0.07) * sstep(start - 0.04, start + 0.03, t) * (1 - sstep(end - 0.03, end + 0.04, t));
  }
  return t * (1 - 0.012 * r) + bonus;
}

function Race({ x, slide, paused, play }) {
  const present = useIsPresent();
  const box = useRef(null), bg = useRef(null), { w: W, h: H } = useBox(box);
  const els = useRef([]), clock = useRef({ t: 0, off: 0, done: false, lead: -1 });
  const pausedRef = useRef(false); pausedRef.current = !!paused;
  const [done, setDone] = useState(false), [lead, setLead] = useState(0);
  const N = x.artists.length;
  const order = N === 5 ? [1, 3, 0, 4, 2] : x.artists.map((_, i) => i);
  const A = Math.max(30, Math.min(W / N * 0.78, H * 0.2)), LAB = A * 0.62;
  const SQ = useMemo(() => seq(N), [N]);
  const D = Math.max(6000, slide.dur - 4200);
  const place = (tt, fin) => {
    const sc = x.artists.map((_, r) => scoreAt(r, N, tt, SQ)), best = Math.max(...sc), room = H - A - LAB;
    x.artists.forEach((a, r) => {
      const rel = sc[r] / best, win = r === 0;
      const y = 0.04 + 0.62 * tt + 0.26 * Math.pow(Math.max(rel, 0), 5) + (fin && win ? 0.05 : 0);
      const el = els.current[r];
      if (el) el.style.transform = `translate3d(0, ${-y * room}px, 0) scale(${fin && win ? 1.12 : 1})`;
    });
    return sc.indexOf(best);
  };
  const setLeader = (li) => {
    if (li === clock.current.lead) return;
    clock.current.lead = li; setLead(li);
    if (x.artists[li].clip) play?.(x.artists[li].clip);      // suena la música de quien va ganando
  };
  useEffect(() => {
    if (!W || !H) return;
    const c = clock.current;
    if (c.done) { place(1, true); return; }                  // ya terminó: se queda fija en el resultado final
    let raf, last = 0;
    const run = (now) => {
      if (!last) last = now;
      const dt = Math.min((now - last) / 1000, 0.1); last = now;
      if (!pausedRef.current) c.t += dt * 1000;
      const tt = Math.min(Math.max((c.t - 700) / D, 0), 1);
      const slow = 1 - 0.9 * Math.min(Math.max((tt - 0.86) / 0.14, 0), 1);
      if (!pausedRef.current) c.off += (tt > 0 ? 520 + 900 * Math.min(tt * 4, 1) : 120) * slow * dt;
      if (bg.current) bg.current.style.backgroundPosition = `0 ${c.off}px`;
      if (tt >= 1) { c.done = true; place(1, true); setLeader(0); setDone(true); return; }
      setLeader(place(tt, false));
      raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [W, H, A, present]);
  const shown = done ? 0 : lead;
  return (
    <div className="rx-race">
      <Words text="La carrera del año" className="rx-k" tag="p" />
      <div className="rx-field" ref={box}>
        <div className="rx-speed" ref={bg} aria-hidden="true" />
        {order.map((r, col) => {
          const a = x.artists[r], win = r === 0, c = LANE[r % LANE.length];
          return (
            <div key={r} className="rx-col" style={{ left: `${(col + 0.5) / N * 100}%`, width: `${100 / N}%`, '--lc': c }}>
              <div className="rx-racer" ref={(e) => (els.current[r] = e)} style={{ '--av': `${A}px`, bottom: 0 }}>
                <div className={`rx-runner${win && done ? ' win' : ''}`}>
                  {a.cover ? <img src={a.cover} alt="" /> : <span />}
                  {win && done && <i className="rx-crown" aria-hidden="true">★</i>}
                </div>
                <b>{a.name}</b>
                {done && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.75 }}>{nf.format(a.plays)}</motion.span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="rx-race-foot">
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div key="end" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...spring, delay: 0.3 }}>
              <Words text={`${x.winner_name} ganó el año`} className="rx-h2 left" delay={0.4} />
              <p className="rx-p">{x.winner_plays} reproducciones</p>
            </motion.div>
          ) : (
            <motion.p key={shown} className="rx-p" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}>{x.artists[shown].name} va en cabeza</motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Tracks({ x }) {
  return (
    <div className="rx-in">
      <Words text="Tus canciones del año" className="rx-h" />
      {x.tracks.map((t, i) => (
        <motion.div key={t.title + i} className="rx-row" initial={{ x: i % 2 ? '60cqw' : '-60cqw', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }} transition={{ ...spring, delay: 0.35 + i * 0.11 }}>
          <span className="r">{i + 1}</span>
          {t.cover ? <img src={t.cover} alt="" /> : <span />}
          <div><b>{t.title}</b><small>{t.artist}</small></div>
          <span className="n">{nf.format(t.plays)}</span>
        </motion.div>
      ))}
    </div>
  );
}

function One({ x, slide }) {
  return (
    <>
      <div className="rx-cv" style={{ backgroundImage: `url('${encodeURI(slide.cover || '')}/blur')` }} />
      <div className="rx-in">
        <Words text="Tu canción número uno" className="rx-k" tag="p" />
        <Cover src={slide.cover} className="rx-big-cover" initial={{ scale: 2.2, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ duration: 1.1, ease }} />
        <Words text={x.track_title} delay={0.6} className="rx-h" />
        <motion.p className="rx-p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
          {x.track_artist} · {x.track_plays} reproducciones
        </motion.p>
      </div>
    </>
  );
}

function Discoveries({ x, data }) {
  const covers = (data.discoveries?.top_new_tracks || []).map((t) => t.cover);
  return (
    <>
      <Mesh colors={['#ff4fd8', '#2b6bff', '#8a2bff', '#00e0ff']} />
      <Scatter covers={covers} seed={7} n={6} delay={0.3} size={[14, 7]} yr={[2, 20]} />
      <div className="rx-in" style={{ marginTop: '12cqmin' }}>
        <Words text="Este año descubriste" className="rx-h2" />
        <Ticker to={x.new_tracks} delay={0.8} />
        <Words text="canciones nuevas" delay={1.1} />
        <motion.p className="rx-p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}>
          de {x.new_artists} artistas que no habías escuchado antes.
        </motion.p>
      </div>
    </>
  );
}

function Night({ x }) {
  const stars = useMemo(() => { const r = rng(5); return Array.from({ length: 26 }, () => ({ x: r() * 100, y: r() * 100, s: 0.4 + r() * 1.1, d: r() * 3 })); }, []);
  return (
    <>
      {stars.map((s, i) => (
        <motion.i key={i} aria-hidden="true" style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}cqmin`, height: `${s.s}cqmin`, borderRadius: '50%', background: '#fff' }}
          animate={{ opacity: [0.15, 1, 0.15] }} transition={{ duration: 2.5, repeat: Infinity, delay: s.d }} />
      ))}
      <motion.div aria-hidden="true" style={{ position: 'absolute', right: '10%', top: '10%', width: '30cqmin', height: '30cqmin', borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #fff6cf, #ffd45e 60%, #e6a93a)', boxShadow: '0 0 12cqmin rgba(255,212,94,.45)' }}
        initial={{ y: '-30cqmin', scale: 0.6, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ duration: 1.4, ease }} />
      <div className="rx-in" style={{ marginTop: '24cqmin' }}>
        <Words text="De madrugada" className="rx-k" tag="p" />
        <Words text={`${x.night_plays} reproducciones tras la medianoche`} className="rx-h" delay={0.2} />
        <motion.p className="rx-p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
          Lo que más sonó: {x.night_top}. La última, a las {x.night_time}.
        </motion.p>
      </div>
    </>
  );
}

function Hour({ x }) {
  return (
    <div className="rx-in">
      <Words text="Tu hora favorita" className="rx-k" tag="p" />
      <svg className="rx-clock" viewBox="-50 -50 100 100" aria-hidden="true">
        {x.hist.map((b, i) => {
          const a = (i / 24) * Math.PI * 2 - Math.PI / 2, r0 = 24, r1 = 24 + Math.max(b.pct, 4) * 0.2;
          return (
            <motion.line key={i} className={b.peak ? 'pk' : ''} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1}
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease, delay: 0.3 + i * 0.035 }} />
          );
        })}
        <text x="0" y="6" textAnchor="middle" fontSize="16" fontWeight="800" fill="currentColor">{x.peak}:00</text>
      </svg>
      <Words text={`Y tu día fuerte: el ${x.peak_day}`} className="rx-h2" delay={1.2} />
    </div>
  );
}

function Months({ x }) {
  return (
    <div className="rx-in">
      <Words text="Tu mes con más música" className="rx-k" tag="p" />
      <Words text={x.peak_month_cap} className="rx-h" delay={0.15} />
      <div className="rx-cols">
        {x.bars.map((b, i) => (
          <div key={i} className={b.peak ? 'pk' : ''}>
            <motion.i style={{ height: `${Math.max(b.pct, 3)}%` }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ ...spring, delay: 0.4 + i * 0.05 }} />
            <span>{b.m}</span>
          </div>
        ))}
      </div>
      <motion.p className="rx-p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>{x.peak_plays} reproducciones ese mes.</motion.p>
    </div>
  );
}

function Age({ x }) {
  return (
    <div className="rx-in">
      <Words text="Según lo que escuchas, tienes" className="rx-k" tag="p" />
      <motion.div className="rx-agenum" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ ...spring, delay: 0.3 }}>{x.age}</motion.div>
      <Words text="años de oído" className="rx-h" delay={0.5} />
      <div className="rx-decs">
        {x.decades.map((d, i) => (
          <div key={i} className={d.peak ? 'pk' : ''}>
            <span>{d.label}</span>
            <motion.i style={{ width: `${Math.max(d.pct, 3)}%` }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ ...spring, delay: 0.8 + i * 0.07 }} />
          </div>
        ))}
      </div>
      <motion.p className="rx-p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
        Tu música gira en torno a {x.median_year}.
      </motion.p>
      <motion.p className="rx-fine" initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 1.9 }}>
        Estimación para pasar el rato: no es ciencia.
      </motion.p>
    </div>
  );
}

function Outro({ data, vars }) {
  const covers = [...(data.top_tracks || []), ...(data.top_artists || [])].map((t) => t.cover);
  return (
    <>
      <Scatter covers={covers} seed={11} n={9} delay={0.1} size={[15, 10]} yr={[2, 46]} />
      <div className="rx-in" style={{ background: 'linear-gradient(0deg, #151515 35%, transparent)', paddingTop: '30cqmin', marginTop: 'auto' }}>
        <Words text="Hasta el año que viene" delay={0.9} />
        <motion.p className="rx-p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>Nos vemos en {vars.next_year}.</motion.p>
      </div>
    </>
  );
}

const VIEWS = { intro: Intro, minutes: Minutes, 'top-artists': Artists, race: Race, 'top-tracks': Tracks, 'number-one': One,
  discoveries: Discoveries, night: Night, hour: Hour, months: Months, age: Age, outro: Outro };

// Cada tarjeta entra con un círculo que se abre desde abajo; la anterior queda debajo
const card = {
  enter: { clipPath: 'circle(0% at 50% 92%)' },
  center: { clipPath: 'circle(150% at 50% 92%)', transition: { duration: 0.85, ease } },
  exit: { zIndex: 1, transition: { duration: 0.85 } },
};

export default function Theme({ data, slides, index, vars, view, paused, play }) {
  VIEW = view;
  const slide = slides[index];
  const View = VIEWS[slide.type];
  return (
    <AnimatePresence initial={false}>
      <motion.div key={index} className={`rx rx-${slide.type}${slide.type === 'intro' ? ' rx-intro' : ''}`} data-card="active"
        variants={card} initial="enter" animate="center" exit="exit" style={{ zIndex: 2 }}>
        {View ? <View data={data} slide={slide} x={slide.x} vars={vars} paused={paused} play={play} /> : <div className="rx-in"><Words text={slide.type} /></div>}
      </motion.div>
    </AnimatePresence>
  );
}
