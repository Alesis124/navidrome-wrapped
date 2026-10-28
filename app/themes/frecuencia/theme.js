// Frecuencia · hooks del tema
//
// Qué hace (todo opcional: si algo falla, el Wrapped sigue funcionando):
//  1. PREPARA las diapositivas en cuanto existen, mientras se ve la pantalla de inicio:
//     trocea los títulos para animarlos, ajusta el tamaño de los textos largos,
//     rellena datos derivados (porcentaje del año, marcas de «disco rayado»…) y
//     saca de cada carátula su color y un fondo desenfocado (sin `filter`, así
//     también sale bien al exportar la tarjeta a PNG).
//  2. REACCIONA a la música: un analizador de audio mueve el espectro inferior y
//     las variables --lvl (volumen) y --beat (golpe de bombo) de la diapositiva activa.
//  3. LANZA una onda desde el borde inferior en cada cambio de diapositiva.
//  4. En ESCRITORIO tiñe el fondo de la página con la carátula activa (#ambient).

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const stage = $('#stage');
const app = $('#app') || stage;      // --glow vive en #app para que lo hereden también los paneles laterales
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const nf = new Intl.NumberFormat('es-ES');
const FALLBACK_HUES = [330, 210, 270, 165, 20, 235];

// ---------------------------------------------------------------- utilidades
function seeded(seed) {
  let s = (seed >>> 0) || 1;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
}

/** Trocea el texto de `el` en palabras (modo «words») o letras («chars»), respetando <br> y <b>. */
function split(el, mode) {
  el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  let k = 0;
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
          const inner = document.createElement('span'); inner.className = 'wi';
          if (mode === 'chars') {
            [...part].forEach((ch) => {
              const c = document.createElement('span'); c.className = 'c'; c.textContent = ch;
              c.style.setProperty('--k', k++); inner.append(c);
            });
            inner.classList.remove('wi');
          } else {
            inner.textContent = part; inner.style.setProperty('--k', k++);
          }
          w.append(inner); frag.append(w);
        });
        node.replaceChild(frag, n);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(el);
}

/** Reduce --fit hasta que el texto cabe (una línea: ancho; varias: ancho y nº de líneas). */
function fit(el) {
  const lines = +el.dataset.fit || 1;
  const counter = el.matches('[data-count]') ? el : $('[data-count]', el);
  const keep = counter?.textContent;
  if (counter) counter.textContent = nf.format(+counter.dataset.count || 0);   // medir con el valor final
  const ok = () => {
    if (el.scrollWidth > el.clientWidth + 1) return false;
    if (lines > 1) {
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 0;
      if (lh && el.offsetHeight > lh * lines * 1.1 + 2) return false;
    }
    return true;
  };
  el.style.setProperty('--fit', 1);
  if (!ok()) {
    let lo = 0.2, hi = 1;
    for (let n = 0; n < 9; n++) {
      const mid = (lo + hi) / 2;
      el.style.setProperty('--fit', mid);
      ok() ? (lo = mid) : (hi = mid);
    }
    el.style.setProperty('--fit', lo.toFixed(3));
  }
  if (counter) counter.textContent = keep;
}

const plural = (n, one, many) => `${nf.format(n)} ${n === 1 ? one : many}`;
function humanSpan(min) {
  if (min >= 2880) {
    const d = Math.floor(min / 1440), h = Math.round((min % 1440) / 60);
    return h ? `${plural(d, 'día', 'días')} y ${plural(h, 'hora', 'horas')}` : plural(d, 'día', 'días');
  }
  if (min >= 120) return plural(Math.round(min / 60), 'hora', 'horas');
  return plural(Math.round(min), 'minuto', 'minutos');
}

// ---------------------------------------------------------------- datos derivados
function hydrate(slide) {
  // Artistas: la barra de cada uno es proporcional a sus escuchas
  const rows = $$('.artists li[data-v]', slide);
  if (rows.length) {
    const max = Math.max(...rows.map((r) => +r.dataset.v)) || 1;
    rows.forEach((r) => r.style.setProperty('--p', Math.max(6, Math.round((100 * +r.dataset.v) / max))));
  }

  // Minutos: % del año escuchando y equivalencia en días/horas
  const mEl = $('[data-min]', slide);
  if (mEl) {
    const min = +mEl.dataset.min, year = +mEl.dataset.year, now = new Date();
    const elapsed = year === now.getFullYear()
      ? Math.max(1, Math.ceil((now - new Date(year, 0, 1)) / 864e5)) : ((year % 4 === 0 && year % 100) || year % 400 === 0 ? 366 : 365);
    const pct = Math.min(100, (100 * min) / (elapsed * 1440));
    $$('[data-fx="pct"]', slide).forEach((e) => { e.textContent = pct.toLocaleString('es-ES', { maximumFractionDigits: pct < 10 ? 1 : 0 }) + ' %'; });
    $$('[data-fx="span"]', slide).forEach((e) => { e.textContent = humanSpan(min); });
    $('.meter', slide)?.style.setProperty('--s', (pct / 100).toFixed(4));
  }

  // Reloj radial: resalta la hora pico
  const dial = $('.dial24', slide);
  if (dial) $$('i[data-h]', dial).forEach((i) => i.classList.toggle('pk', +i.dataset.h === +dial.dataset.peak));

  // Madrugada: los dos puntos del reloj parpadean
  $$('[data-clock]', slide).forEach((e) => { e.innerHTML = e.textContent.replace(':', '<span class="colon">:</span>'); });

  // Bucle: líneas de texto que se repiten sin fin
  $$('[data-marquee]', slide).forEach((e, idx) => {
    const t = e.dataset.marquee.replace(/[<>&]/g, '');
    const reps = Math.max(3, Math.ceil(110 / (t.length * 6.5 + 8)));
    const half = Array(reps).fill(`<span>${t}</span>`).join('');
    e.innerHTML = half + half;
    e.style.marginLeft = `calc(var(--u) * ${-idx * 9})`;
  });

  setupRace(slide);

  // Madrugada: estrellas (elementos reales y en %, para que valgan en cualquier vista y se exporten bien)
  $$('[data-stars]', slide).forEach((sky) => {
    const rnd = seeded(7919), n = +sky.dataset.stars || 50;
    for (let k = 0; k < n; k++) {
      const st = document.createElement('i');
      st.style.cssText = `left:${(rnd() * 98 + 1).toFixed(1)}%;top:${(rnd() * 96 + 1).toFixed(1)}%;--s:${(0.28 + rnd() * 0.45).toFixed(2)};--d:${(rnd() * 5).toFixed(1)};--o:${(0.35 + rnd() * 0.6).toFixed(2)}`;
      sky.append(st);
    }
  });

  // Disco rayado: marcas de recuento de cinco en cinco
  const tally = $('.tally', slide);
  if (tally) {
    const n = Math.min(40, +tally.dataset.n || 0);
    let t = 0;
    for (let left = n; left > 0; left -= 5) {
      const g = document.createElement('div'); g.className = 'grp';
      for (let k = 0; k < Math.min(4, left); k++) { const i = document.createElement('i'); i.style.setProperty('--t', t++); g.append(i); }
      if (left >= 5) { const u = document.createElement('u'); u.style.setProperty('--t', t++); g.append(u); }
      tally.append(g);
    }
  }
}

// ---------------------------------------------------------------- color y fondo desde la carátula
const covers = new Map();
function loadImage(url) {
  if (!covers.has(url)) {
    covers.set(url, new Promise((res) => {
      const img = new Image(); img.onload = () => res(img); img.onerror = () => res(null); img.src = url;
    }));
  }
  return covers.get(url);
}

function analyse(img) {
  const S = 24, c = document.createElement('canvas'); c.width = c.height = S;
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, S, S);
  const d = x.getImageData(0, 0, S, S).data;
  let sx = 0, sy = 0, W = 0, SS = 0;
  for (let p = 0; p < d.length; p += 4) {
    const r = d[p] / 255, g = d[p + 1] / 255, b = d[p + 2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), v = max, s = max ? (max - min) / max : 0;
    if (s < 0.12 || v < 0.15) continue;
    let h = max === r ? ((g - b) / (max - min)) % 6 : max === g ? (b - r) / (max - min) + 2 : (r - g) / (max - min) + 4;
    h *= Math.PI / 3;
    const w = s * s * v;
    sx += Math.cos(h) * w; sy += Math.sin(h) * w; W += w; SS += s * w;
  }
  if (W < 0.4) return null;                                   // carátula casi gris: usamos el ámbar
  return { h: (Math.atan2(sy, sx) * 180 / Math.PI + 360) % 360, s: SS / W };
}

/** Fondo desenfocado sin usar `filter`: reducir mucho y reescalar con suavizado en varios pasos. */
function blurred(img) {
  const steps = [[12, 21], [24, 43], [48, 85], [90, 160]];
  let src = img;
  for (const [w, h] of steps) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    x.drawImage(src, 0, 0, w, h); src = c;
  }
  return src.toDataURL('image/jpeg', 0.82);
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function colors(h, s, hasHue) {
  const glowH = hasHue ? h : 36, glowS = hasHue ? clamp(s * 100 * 1.15, 62, 96) : 92;
  return {
    '--k-dark': `hsl(${h | 0}, ${clamp(s * 55, 10, 48) | 0}%, 7%)`,
    '--k-mid': `hsl(${h | 0}, ${clamp(s * 90, 14, 78) | 0}%, 24%)`,
    '--glow': `hsl(${glowH | 0}, ${glowS | 0}%, 66%)`,
    '--glow-soft': `hsla(${glowH | 0}, ${glowS | 0}%, 56%, .38)`,
  };
}

async function paint(slide, i) {
  const m = /url\(['"]?([^'")]+)/.exec(slide.style.getPropertyValue('--cover') || '');
  const img = m ? await loadImage(m[1]) : null;
  const a = img && analyse(img);
  const hue = a ? a.h : FALLBACK_HUES[i % FALLBACK_HUES.length];
  const vars = colors(hue, a ? a.s : 0.5, !!a);
  for (const [k, v] of Object.entries(vars)) slide.style.setProperty(k, v);
  // Fondo desenfocado propio (más oscuro y saturado que el del servidor, que está pensado para temas claros).
  // Si el canvas no se puede leer, usamos el del servidor (--cover-blur) como respaldo.
  if (img) {
    try { slide.style.setProperty('--blur', `url(${blurred(img)})`); }
    catch { const sb = slide.style.getPropertyValue('--cover-blur'); if (sb) slide.style.setProperty('--blur', sb); }
  }
}

// ---------------------------------------------------------------- la carrera del año
// Barras con las reproducciones acumuladas mes a mes de los 5 artistas (datos reales: x.artists[].cumulative).
// La animación es un reloj propio (se detiene al mantener pulsado). El estado base es el FINAL, para que la
// exportación y el collage lo capturen terminado; al entrar en la diapositiva se reinicia desde enero.
const RACE_MS = 13000, RACE_LEAD_IN = 900;
const RACE_EVENT = 2.5;     // un mes en el que cambia el líder dura 1 + 2,5 veces lo normal: da tiempo a ver el adelantamiento y a oír su canción
const races = new WeakMap();
const isPaused = () => $('#progress')?.classList.contains('paused');
const valueAt = (cum, p) => { const m = Math.min(11, Math.floor(p)), f = Math.min(1, p - m), a = m ? cum[m - 1] : 0; return a + (cum[m] - a) * f; };

function setupRace(slide) {
  const box = $('.race', slide);
  if (!box) return;
  const lanes = $$('.lane', box).map((el) => ({
    el, cum: el.dataset.cum.split(',').map(Number), clip: el.dataset.clip,
    fill: $('.fill', el), ct: $('.ct', el), final: $('.ct', el).textContent,
  }));
  if (!lanes.length) return;
  const tl = $('.tl', slide);
  if (tl && !tl.children.length) for (let k = 0; k < 12; k++) tl.append(document.createElement('i'));
  box.style.setProperty('--n', lanes.length);
  // Ritmo: cada mes pesa 1; el primero (la salida) y los meses en que cambia quien va en cabeza pesan más
  const leaderAt = (m) => lanes.reduce((best, l, i) => (l.cum[m] > lanes[best].cum[m] ? i : best), 0);
  const w = Array.from({ length: 12 }, (_, m) => (m === 0 ? 1.6 : 1 + (leaderAt(m) !== leaderAt(m - 1) ? RACE_EVENT : 0)));
  const st = { slide, box, lanes, months: (box.dataset.months || '').split(','), max: +box.dataset.max || 1,
    mo: $('.mo', slide), ticks: tl ? [...tl.children] : [], win: $('.win', slide), w, wsum: w.reduce((a, b) => a + b, 0), clock: 0, prev: 0, lead: -1, leadAt: 0, month: -1, done: true };
  races.set(slide, st);
  raceFrame(st, 12);                       // estado final
}

/** Pinta el instante p (0–12 meses). Devuelve el líder (o -1 si aún no hay reproducciones). */
function raceFrame(st, p) {
  const vals = st.lanes.map((l) => valueAt(l.cum, p));
  const order = vals.map((v, i) => i).sort((a, b) => vals[b] - vals[a] || a - b);
  order.forEach((i, rank) => st.lanes[i].el.style.setProperty('--r', rank));
  st.lanes.forEach((l, i) => {
    l.fill.style.setProperty('--ff', (vals[i] / st.max).toFixed(4));
    l.ct.textContent = nf.format(Math.round(vals[i]));
    l.el.classList.toggle('first', i === order[0] && vals[i] > 0);   // OJO: no llamarla «lead», que ya es el estilo del texto de cabecera
  });
  const mi = Math.min(11, Math.floor(p));
  if (mi !== st.month) {
    st.month = mi;
    if (st.mo) { st.mo.textContent = st.months[mi] || ''; st.mo.classList.remove('bump'); void st.mo.offsetWidth; st.mo.classList.add('bump'); }
    st.ticks.forEach((t, k) => { t.classList.toggle('on', k === mi); t.classList.toggle('next', k > mi); });
  }
  return vals[order[0]] > 0 ? order[0] : -1;
}

/** La música cambia al artista que va en cabeza (con un mínimo de 1,3 s entre cambios para que no se atropelle). */
function raceMusic(st, idx, now, force) {
  if (idx < 0 || idx === st.lead) return;
  if (!force && st.lead >= 0 && now - st.leadAt < 1300) return;
  st.lead = idx; st.leadAt = now;
  if (st.lanes[idx].clip) fx.bgm?.play(st.lanes[idx].clip, 0.7);
}

function raceStart(st) {
  st.clock = 0; st.prev = 0; st.lead = -1; st.month = -1; st.done = false;
  st.win?.classList.remove('on');
  raceFrame(st, 0);
  st.lanes.forEach((l) => { l.ct.textContent = '0'; });
  if (reduce) { raceEnd(st, performance.now()); return; }
  fx.race = st;
  window.__slideAt = performance.now() + RACE_LEAD_IN + RACE_MS + 800;    // el collage espera a que termine antes de capturar esta diapositiva
}

function raceEnd(st, now) {
  st.done = true; fx.race = null;
  raceFrame(st, 12); st.month = 11;
  st.win?.classList.add('on');
  raceMusic(st, 0, now, true);             // gana el que más escuchaste: suena su canción
}

function raceStop(st) {
  if (!st.done) { st.done = true; raceFrame(st, 12); st.win?.classList.add('on'); }
  if (fx.race === st) fx.race = null;
  window.__slideAt = performance.now();
}

/** Tiempo (0–1) → posición en meses (0–12), con más tiempo en los meses decisivos. */
function racePos(st, k) {
  let t = k * st.wsum;
  for (let m = 0; m < 12; m++) {
    if (t <= st.w[m] || m === 11) return m + Math.min(1, t / st.w[m]);
    t -= st.w[m];
  }
  return 12;
}

function raceTick(st, t) {
  const dt = st.prev ? Math.min(t - st.prev, 1000) : 0;      // tiempo real (si el equipo va lento no se alarga); la pausa del motor cubre pestañas ocultas
  st.prev = t;
  if (!isPaused()) st.clock += dt;
  const k = clamp((st.clock - RACE_LEAD_IN) / RACE_MS, 0, 1);
  const lead = raceFrame(st, racePos(st, k));
  if (k > 0) raceMusic(st, lead, t, false);
  if (k >= 1) raceEnd(st, t);
}

// ---------------------------------------------------------------- preparación temprana
function refit(root = $('#slides')) {
  $$('[data-fit]', root).forEach((e) => { try { fit(e); } catch { /* seguir */ } });
}
// El ajuste depende de la fuente real y del tamaño del marco, y ambos pueden cambiar DESPUÉS de medir
// (fuente que tarda en llegar, rotar o plegar el móvil, cambio de vista, emulador del navegador…).
// Por eso se recalcula en todos esos casos y, además, cada vez que se entra en una diapositiva.
let refitTimer = 0;
const refitSoon = () => { clearTimeout(refitTimer); refitTimer = setTimeout(() => { refit(); refitTimer = setTimeout(refit, 500); }, 120); };
addEventListener('wrapped:view', () => { requestAnimationFrame(() => requestAnimationFrame(refit)); refitSoon(); });
addEventListener('resize', refitSoon);
addEventListener('orientationchange', refitSoon);
document.fonts?.addEventListener?.('loadingdone', refitSoon);
try { new ResizeObserver(refitSoon).observe(stage); } catch { /* navegador antiguo */ }

let prepared = false;
async function prepare(host) {
  if (prepared) return; prepared = true;
  const slides = [...host.children];
  slides.forEach((s) => {
    try {
      // capas de fondo reales (no pseudo-elementos): así también se exportan bien a PNG
      const card = $('.card', s);
      if (card && !$('.bgblur', card)) {
        const blur = document.createElement('div'); blur.className = 'decor bgblur';
        const veil = document.createElement('div'); veil.className = 'decor veil';
        card.prepend(veil); card.prepend(blur);
      }
      $$('[data-split]', s).forEach((e) => split(e, e.dataset.split));
      hydrate(s);
    } catch (e) { console.warn('[frecuencia] hydrate', e); }
  });
  try {
    // Se piden las fuentes del tema explícitamente: `fonts.ready` puede resolverse antes de que empiecen a descargarse
    await Promise.all(['900 64px "Frecuencia Display"', '800 32px "Frecuencia Display"', '500 16px "Frecuencia Text"', '700 16px "Frecuencia Text"'].map((f) => document.fonts.load(f)));
    await document.fonts.ready;
  } catch { /* sin Font Loading API */ }
  refit();
  await Promise.all(slides.map((s, i) => paint(s, i).catch(() => {})));
}
{
  const host = $('#slides');
  const go = () => host.children.length && prepare(host);
  new MutationObserver(go).observe(host, { childList: true });
  go();
}

// ---------------------------------------------------------------- música → visuales
const fx = { bgm: null, race: null, active: null, an: null, freq: null, lvl: 0, beat: 0, avg: 0, peak: 0.06, last: 0, glow: '#ffb02e', ctx: null, canvas: null };

function mount() {
  const mk = (tag, id) => { const e = document.createElement(tag); e.id = id; stage.append(e); return e; };
  fx.canvas = mk('canvas', 'fx-spec');
  fx.flash = mk('div', 'fx-flash');
  fx.wave = mk('div', 'fx-wave');
  mk('div', 'fx-grain');
  fx.ctx = fx.canvas.getContext('2d');
  // Resplandor de la página (solo se ve en escritorio): dos capas que se funden entre carátulas
  fx.amb = document.createElement('div'); fx.amb.id = 'ambient'; fx.amb.setAttribute('aria-hidden', 'true');
  fx.layers = [0, 1].map(() => { const l = document.createElement('div'); l.className = 'amb'; fx.amb.append(l); return l; });
  fx.ai = 0;
  document.body.prepend(fx.amb);
}

function listen(bgm) {
  try {
    const ac = bgm.ctx, an = ac.createAnalyser();
    an.fftSize = 512; an.smoothingTimeConstant = 0.78;
    // Se escucha ANTES del volumen general: con el sonido silenciado el espectro sigue vivo
    bgm.ch.forEach((c) => c.g.connect(an));
    const sink = ac.createGain(); sink.gain.value = 0; an.connect(sink).connect(ac.destination);
    fx.an = an; fx.freq = new Uint8Array(an.frequencyBinCount);
  } catch (e) { console.warn('[frecuencia] sin analizador de audio', e); }
}

function draw(t) {
  const { canvas: cv, ctx: g, freq } = fx;
  const dpr = Math.min(devicePixelRatio || 1, 2), W = cv.clientWidth, H = cv.clientHeight;
  if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
  const wide = document.documentElement.dataset.view === 'wide';
  const N = wide ? 56 : 30, step = W / 2 / N, bw = step * (wide ? 0.5 : 0.56);
  const grad = g.createLinearGradient(0, H, 0, 0);
  grad.addColorStop(0, fx.glow); grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad; g.globalAlpha = 0.9;
  for (let k = 0; k < N; k++) {
    let v;
    if (freq && fx.live) v = Math.pow(freq[Math.floor(1 + Math.pow(k / (N - 1), 1.6) * 120)] / 255, 1.35);
    else v = 0.08 + 0.06 * Math.sin(t / 700 + k * 0.5);        // sin audio: respiración suave
    const h = Math.max(2, (0.05 + v * 0.95) * H);
    for (const sign of [1, -1]) {
      const x = W / 2 + sign * (k + 0.5) * step - bw / 2;
      g.beginPath(); g.roundRect ? g.roundRect(x, H - h, bw, h, bw / 2) : g.rect(x, H - h, bw, h); g.fill();
    }
  }
  g.globalAlpha = 1;
}

function frame(t) {
  requestAnimationFrame(frame);
  if (fx.an) {
    fx.an.getByteFrequencyData(fx.freq);
    let bass = 0, all = 0, i = 1;
    for (; i <= 5; i++) bass += fx.freq[i];
    for (i = 1; i < 120; i++) all += fx.freq[i];
    bass /= 5 * 255; all /= 119 * 255;
    fx.live = all > 0.004;
    fx.peak = Math.max(fx.peak * 0.9985, all, 0.06);               // autoganancia: se adapta a música alta o baja
    const target = Math.pow(clamp(all / fx.peak, 0, 1), 1.7);
    fx.lvl += (target - fx.lvl) * (target > fx.lvl ? 0.35 : 0.08);
    fx.avg = fx.avg * 0.94 + bass * 0.06;
    if (bass > fx.avg * 1.16 + 0.04 && t - fx.last > 190) { fx.beat = 1; fx.last = t; }
    fx.beat *= 0.9;
  }
  if (fx.active && !reduce) {
    fx.active.style.setProperty('--lvl', fx.lvl.toFixed(3));
    fx.active.style.setProperty('--beat', fx.beat.toFixed(3));
    fx.amb?.style.setProperty('--beat', fx.beat.toFixed(3));
  }
  if (fx.race) raceTick(fx.race, t);
  draw(t);
}

function ambient(el) {
  if (!fx.amb) return;
  const url = el.style.getPropertyValue('--blur') || el.style.getPropertyValue('--cover-blur');
  fx.ai ^= 1;
  const next = fx.layers[fx.ai], prev = fx.layers[fx.ai ^ 1];
  next.style.backgroundImage = url || 'none';
  next.style.backgroundColor = url ? '' : getComputedStyle(el).getPropertyValue('--k-mid');
  next.classList.add('on'); prev.classList.remove('on');
}

function restart(el) { el.classList.remove('go'); void el.offsetWidth; el.classList.add('go'); }

// ---------------------------------------------------------------- deslizar hacia abajo = volver al inicio (táctil)
// Como cerrar una historia de Instagram: la tarjeta sigue al dedo (se encoge y se redondea), detrás aparece el aviso
// y un anillo que se va llenando; al pasar el umbral cambia de estado (vibra, borde ámbar, «Suelta para ir al inicio»).
// Si sueltas antes, vuelve a su sitio con un rebote; si sueltas después (o haces un gesto rápido), sale hacia abajo y
// va al inicio (pulsa el botón #home del motor). No toca el motor: se engancha en la fase de captura de #stage.
function setupPull(theme) {
  if (!(matchMedia('(hover: none)').matches || navigator.maxTouchPoints > 0)) return;
  const S = (theme && theme.strings) || {};
  const T1 = S.pull_hint || 'Desliza para volver al inicio', T2 = S.pull_release || 'Suelta para ir al inicio';
  const pull = document.createElement('div');
  pull.id = 'pull'; pull.setAttribute('aria-hidden', 'true');
  pull.innerHTML = '<div class="pull-ring"><i class="fa fa-house"></i></div><p></p>';
  const label = $('p', pull); label.textContent = T1;
  document.body.prepend(pull);

  const playing = () => document.body.dataset.state === 'playing';
  const zoomedNow = () => { const z = $('.swiper'); return !!(z && z.style.transform && z.style.transform !== 'none'); };
  const interactive = (t) => t.closest('button, select, input, label, a');
  let g = null;                                   // gesto en curso

  const setReady = (r) => {
    if (r === g.ready) return;
    g.ready = r;
    pull.classList.toggle('ready', r); stage.classList.toggle('ready', r);
    label.textContent = r ? T2 : T1;
    try { navigator.vibrate?.(r ? 12 : 4); } catch { /* sin vibración */ }
  };
  const claim = () => {
    g.claimed = true;
    // El motor ya habrá armado «mantener = pausa» y quizá suspendido la música: se cancela como si el dedo se hubiera levantado...
    stage.dispatchEvent(new PointerEvent('pointercancel', { pointerId: g.id, pointerType: 'touch', isPrimary: true, bubbles: true }));
    // ...y la historia se congela mientras se arrastra
    $('#progress')?.classList.add('paused');
    stage.classList.add('pulling'); stage.classList.remove('settle', 'leaving');
    pull.classList.add('on');
  };
  const speed = () => {                           // px/ms hacia abajo, sobre los últimos ~150 ms
    const a = g.s[0], b = g.s[g.s.length - 1];
    return a && b && b[0] > a[0] ? (b[1] - a[1]) / (b[0] - a[0]) : 0;
  };
  const update = (dx, dy) => {
    const H = stage.clientHeight, thr = Math.max(110, H * 0.2);
    const sc = 1 - Math.min(dy / (H * 1.4), 0.2);
    stage.style.transform = `translate3d(${(dx * 0.35).toFixed(1)}px, ${(dy * 0.9).toFixed(1)}px, 0) scale(${sc.toFixed(4)})`;
    stage.style.borderRadius = `${Math.min(34, dy / 5).toFixed(1)}px`;
    pull.style.setProperty('--pp', Math.min(1, dy / thr).toFixed(3));
    setReady(dy >= thr || (speed() > 0.6 && dy > 50));
  };
  const finish = (back) => {
    const wasReady = g?.ready; g = null;
    pull.classList.remove('on', 'ready'); stage.classList.remove('ready');
    if (!back && wasReady) {                      // sale hacia abajo y al inicio
      stage.classList.add('leaving');
      stage.style.transform = `translate3d(0, ${innerHeight}px, 0) scale(.78)`; stage.style.opacity = '0';
      fx.bgm?.suspend?.();
      setTimeout(() => $('#home')?.click(), 330);
      return;
    }
    stage.classList.add('settle');                // vuelve a su sitio con rebote
    stage.style.transform = ''; stage.style.borderRadius = '';
    $('#progress')?.classList.remove('paused');
    setTimeout(() => stage.classList.remove('pulling', 'settle'), 520);
  };

  stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    if (g) { if (g.claimed) finish(true); else g = null; return; }               // segundo dedo: es un pellizco
    if (!playing() || interactive(e.target) || zoomedNow()) return;
    g = { id: e.pointerId, x0: e.clientX, y0: e.clientY, claimed: false, ready: false, s: [[performance.now(), e.clientY]] };
  }, true);
  stage.addEventListener('pointermove', (e) => {
    if (!g || e.pointerId !== g.id || !e.isTrusted) return;
    const dx = e.clientX - g.x0, dy = e.clientY - g.y0, now = performance.now();
    if (!g.claimed) {
      if (Math.abs(dx) > 14 && Math.abs(dx) > Math.abs(dy)) { g = null; return; }  // gesto horizontal: no es nuestro
      if (dy < -14) { g = null; return; }
      if (!(dy > 12 && dy > Math.abs(dx) * 1.2)) return;
      claim();
    }
    g.s.push([now, e.clientY]);
    while (g.s.length > 8 || (g.s.length > 2 && now - g.s[0][0] > 150)) g.s.shift();
    update(dx, Math.max(0, dy));
  }, true);
  stage.addEventListener('pointerup', (e) => {
    if (!g || e.pointerId !== g.id) return;
    if (!g.claimed) { g = null; return; }         // un toque normal: lo gestiona el motor
    e.stopImmediatePropagation(); e.stopPropagation();   // no es un toque: que no avance de diapositiva
    if (!g.ready) {                               // un gesto rápido puede acabar antes de que llegue otro movimiento
      g.s.push([performance.now(), e.clientY]);
      if (speed() > 0.6 && e.clientY - g.y0 > 50) g.ready = true;
    }
    finish(false);
  }, true);
  stage.addEventListener('pointercancel', (e) => {
    if (!e.isTrusted || !g || e.pointerId !== g.id) return;
    if (g.claimed) finish(true); else g = null;
  }, true);
}

// ---------------------------------------------------------------- hooks del motor
export default {
  init({ bgm, theme }) {
    try {
      setupPull(theme);
      mount();
      fx.bgm = bgm || null;
      if (bgm) listen(bgm);
      requestAnimationFrame(frame);
    } catch (e) { console.warn('[frecuencia] init', e); }
  },

  enter(el) {
    const rs = races.get(el);
    refit(el);                       // medir con el tamaño y la fuente de ESTE momento
    if (rs) raceStart(rs);
    stage.dataset.type = el.dataset.type;
    const g = getComputedStyle(el).getPropertyValue('--glow').trim();
    if (g) { fx.glow = g; app.style.setProperty('--glow', g); }
    fx.active = el;
    ambient(el);
    if (!reduce && fx.wave) { restart(fx.wave); restart(fx.flash); }
  },

  leave(el) {
    const rs = races.get(el);
    if (rs) raceStop(rs);
    el.style.setProperty('--lvl', 0);
    el.style.setProperty('--beat', 0);
  },
};
