// Motor del Story Player. Todo lo visual y los textos vienen del tema activo
// (?theme=<id>; sin él: WRAPPED_THEME > tema con el nombre del año > frecuencia).
// La pantalla de inicio (usuario, año, opciones) y los paneles de escritorio están en ui.js.
import { Bgm } from './audio.js';
import { createCollage } from './collage.js';
import { saveCard } from './export.js';
import { compile, esc, fmt, interpolate, render } from './tpl.js';
import { DEFAULT_SEQUENCE, SLIDES } from './slides.js';
import { mountReactTheme } from './react-host.js';
import { loadTheme } from './theme.js';
import { $, initChrome, setState } from './ui.js';

async function fetchWrapped(q) {
  const wp = new URLSearchParams();
  for (const k of ['user', 'year']) if (q.get(k)) wp.set(k, q.get(k));
  const r = await fetch('/api/wrapped?' + wp);
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || r.statusText);
  return r.json();
}

// Carátulas: se piden todas al abrir (de 3 en 3, con reintentos) y se guardan las imágenes cargadas. Así el servidor
// (que las genera la primera vez) no se satura y un fallo puntual no deja un hueco vacío en la tarjeta.
const held = [];
function preloadCovers(data) {
  const urls = new Set();
  (function walk(v) {
    if (typeof v === 'string') { if (v.startsWith('/api/cover/')) { urls.add(v); urls.add(v + '/blur'); } }
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  })(data);
  const queue = [...urls];
  const load = (u, tries = 3) => new Promise((done) => {
    const im = new Image();
    im.onload = () => { held.push(im); done(); };
    im.onerror = () => (tries > 1 ? setTimeout(() => load(u, tries - 1).then(done), 900) : done());
    im.src = u;
  });
  const worker = async () => { for (let u; (u = queue.shift());) await load(u); };
  return Promise.all([worker(), worker(), worker()]);
}

async function main() {
  const q = new URLSearchParams(location.search);

  let theme;
  try { theme = await loadTheme(q.get('theme'), q.get('year')); }
  catch (e) {
    console.error(e);
    $('#splash-title').innerHTML = '<i class="fa fa-face-frown" aria-hidden="true"></i>';
    $('#who').hidden = true;
    $('#splash-msg').textContent = e.message;
    $('#splash').dataset.ready = '1';
    return;
  }
  const config = await fetch('/api/config').then((r) => r.json())
    .catch(() => ({ import_enabled: false, default_year: new Date().getFullYear() }));
  const chrome = initChrome({ q, theme, config });

  // Sin ?user= → pantalla donde se escribe el usuario y se elige el año
  let data = null, err = null;
  if (q.get('user')) {
    try { data = await fetchWrapped(q); } catch (e) { err = e; }
  }
  if (!data) { chrome.gate({ user: q.get('user') || '', message: err?.message || '' }); return; }

  play(data, theme, chrome, q);
}

function play(data, theme, chrome, q) {
  const isReact = theme.engine === 'react';   // «html»: plantillas + Swiper · «react»: componente propio (react-host.js)
  // ---------- Diapositivas ----------
  const compiled = {};
  const tpl = (name) => (compiled[name] ??= compile(theme.templates[name]));
  const entries = theme.slides ?? DEFAULT_SEQUENCE.map((type) => ({ type }));
  const next_year = data.year + 1;
  const slides = [];

  for (const e of entries) {
    const def = SLIDES[e.type];
    if (!def) { console.warn(`[tema ${theme.id}] tipo de diapositiva desconocido: ${e.type}`); continue; }
    const b = def.build(data);
    if (!b) continue; // no aplica a este usuario/año
    const name = e.template || e.type;
    if (!isReact && theme.templates[name] == null) {
      if (e.type !== 'collage') console.warn(`[tema ${theme.id}] falta la plantilla «${name}»`);
      continue;
    }

    const vars = { year: data.year, user: data.user, next_year };
    for (const [k, v] of Object.entries(b.x)) if (typeof v === 'string' || typeof v === 'number') vars[k] = v;
    const s = Object.fromEntries(Object.entries(theme.strings).map(([k, v]) => [k, interpolate(v, vars)]));
    try {
      if (isReact) {
        if (e.type === 'collage') continue;   // el collage lo monta el motor html; un tema React hace el suyo
        slides.push({ type: e.type, dur: e.duration || def.dur, clip: b.clip, cover: b.cover, x: b.x, s, opts: e.opts || {} });
        continue;
      }
      slides.push({
        type: e.type, dur: e.duration || def.dur, clip: b.clip, cover: b.cover,
        html: render(tpl(name), { ...data, next_year, x: b.x, s, opts: e.opts || {} }),
      });
    } catch (err) { console.warn(`[tema ${theme.id}] error en la plantilla «${name}»: ${err.message}`); }
  }
  if (!slides.length) { chrome.fail(`El tema «${theme.id}» no ha generado ninguna diapositiva`); return; }

  const palette = theme.palette?.length ? theme.palette
    : ['#3b1d6e', '#6e1d4a', '#0f4c5c', '#5c3b0f', '#1d3b6e', '#4a1d6e'];
  if (!isReact) $('#slides').innerHTML = slides.map((s, i) =>
    `<section class="swiper-slide" data-type="${esc(s.type)}" style="--c:${palette[i % palette.length]};` +
    `${s.cover ? `--cover:url('${encodeURI(s.cover)}');--cover-blur:url('${encodeURI(s.cover)}/blur');` : ''}"><div class="card">${s.html}</div></section>`).join('');
  $('#progress').innerHTML = slides.map(() => '<i></i>').join('');
  if (!isReact) document.querySelectorAll('.card').forEach((c) =>
    [...c.children].forEach((el, i) => el.style.setProperty('--i', i)));

  // ---------- Inicio ----------
  preloadCovers(data);
  chrome.ready({ data, vars: { year: data.year, user: data.user, next_year } });
  chrome.toc(slides, (i) => swiper?.slideTo(i));

  // ---------- Reproductor ----------
  let swiper, bgm, prev = -1;
  const collage = createCollage(), collageAt = isReact ? -1 : slides.findIndex((s) => s.type === 'collage');
  // En un móvil el collage se empieza a montar más tarde: las capturas durante el reproductor lo hacían parpadear
  const touch = matchMedia('(hover: none)').matches;
  const collageStart = touch ? Math.max(2, collageAt - 3) : 2;
  const hooks = theme.hooks || {};
  const audioOn = theme.audio.enabled !== false;
  if (!audioOn) $('#mute').hidden = true;

  function countUp(slide) {
    slide.querySelectorAll('[data-count]').forEach((el) => {
      const end = +el.dataset.count, t0 = performance.now();
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / 1200);
        el.textContent = fmt(end * (1 - (1 - k) ** 3));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  let settleT;
  function onSlide(sw) {
    window.__resetZoom?.(false);
    const i = sw.activeIndex, bars = [...$('#progress').children];
    bars.forEach((b, k) => { b.className = k < i ? 'done' : k === i ? 'on' : ''; });
    bars[i].style.setProperty('--dur', slides[i].dur + 'ms');
    if (audioOn) bgm.play(slides[i].clip, theme.audio.fade ?? 0.8);
    if (sw.slides[i]) countUp(sw.slides[i]);
    chrome.tocActive(i);
    if (!isReact) try {
      if (prev >= 0) hooks.leave?.(sw.slides[prev], prev, slides[prev]);
      hooks.enter?.(sw.slides[i], i, slides[i]);
    } catch (e) { console.warn(`[tema ${theme.id}] error en el script del tema`, e); }
    prev = i;
    clearTimeout(settleT);
    settleT = setTimeout(settle, 2600);   // por si el navegador dejó alguna animación a medias
    // El collage se va montando en segundo plano desde la tercera diapositiva (con pausas); al acercarse al final, sin pausas
    window.__slideAt = performance.now();   // el collage espera a que acaben las animaciones antes de capturar
    // Móvil: el collage se monta al llegar a él (las miniaturas entran solas en sus huecos) (las capturas hacían parpadear las demás tarjetas).
    // Ordenador: se va montando en segundo plano desde el principio.
    if (collageAt >= 0) {
      if (touch) {
        if (i === collageAt) {
          collage.hurry();
          collage.ensure([...sw.slides]);
        }
      } else {
        if (i >= collageStart) collage.ensure([...sw.slides]);
        if (i >= collageAt - 2) collage.hurry();
      }
    }
  }

  $('#who').addEventListener('submit', async (e) => {
    e.preventDefault();
    if ($('#who').dataset.mode !== 'ready' || swiper) return;
    $('#go').disabled = true;
    document.body.classList.add('busy');   // círculo de carga hasta que se vea la primera tarjeta
    bgm = new Bgm();
    bgm.setVolume(vol);
    await bgm.start();
    $('#splash').remove();
    setState('playing');
    if (isReact) {
      try {
        swiper = await mountReactTheme({ theme, data, slides, vars: { year: data.year, user: data.user, next_year },
          stage: $('#stage'), onError: (err) => console.error(`[tema ${theme.id}]`, err),
          play: (src) => { if (audioOn) bgm.play(src, theme.audio.fade ?? 0.8); } });
      } catch (err) { console.error(err); document.body.classList.remove('busy'); chrome.fail(`No se pudo cargar el tema React «${theme.id}»: ${err.message}`); return; }
      swiper.on('slideChange', onSlide);
    } else {
      swiper = new Swiper('.swiper', { speed: 550, ...theme.swiper, allowTouchMove: false });
      swiper.on('slideChange', onSlide);
      try { hooks.init?.({ root: $('#stage'), data, theme, swiper, bgm, slides }); }
      catch (err) { console.warn(`[tema ${theme.id}] error en el script del tema`, err); }
    }
    onSlide(swiper);
    requestAnimationFrame(() => document.body.classList.remove('busy'));
  });

  // Clic en un tramo de la barra = ir a esa diapositiva
  $('#progress').addEventListener('click', (e) => {
    const i = [...$('#progress').children].indexOf(e.target.closest('i'));
    if (swiper && i >= 0) swiper.slideTo(i);
  });

  // La barra activa al terminar avanza la historia
  $('#progress').addEventListener('animationend', () => { if (swiper && !swiper.isEnd) swiper.slideNext(); });

  // Toque izq. = anterior, resto = siguiente, mantener = pausa
  const stage = $('#stage');
  let hold, held = false;
  // ---- Zoom con pellizco (solo táctil). Mientras hay zoom la historia queda en pausa; un toque lo quita ----
  const zs = { s: 1, x: 0, y: 0, skip: false, moved: false, sup: false };
  const pts = new Map();
  let pinch = null, pan = null;
  const zoomed = () => zs.s > 1.02;
  const zoomEl = () => (isReact ? $('#react-root') : $('.swiper'));
  const pauseOn = () => { $('#progress').classList.add('paused'); swiper?.setPaused?.(true); };
  const pauseOff = () => { $('#progress').classList.remove('paused'); swiper?.setPaused?.(false); };
  const applyZoom = (anim) => {
    const el = zoomEl(); if (!el) return;
    el.style.transformOrigin = '0 0';
    el.style.transition = anim ? 'transform .25s ease' : 'none';
    el.style.transform = zs.s > 1.001 ? `translate(${zs.x}px, ${zs.y}px) scale(${zs.s})` : '';
  };
  const clampZoom = () => {
    zs.s = Math.min(4, Math.max(1, zs.s));
    zs.x = Math.min(0, Math.max(stage.clientWidth * (1 - zs.s), zs.x));
    zs.y = Math.min(0, Math.max(stage.clientHeight * (1 - zs.s), zs.y));
  };
  const resetZoom = (anim = true) => {
    if (!zoomed() && zs.s === 1) return;
    zs.s = 1; zs.x = zs.y = 0; applyZoom(anim); pauseOff();
  };
  window.__resetZoom = resetZoom;
  const pos = (e) => { const r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  if (touch) {
    stage.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch' || ignore(e.target)) return;
      pts.set(e.pointerId, pos(e));
      if (pts.size === 2) {
        clearTimeout(hold); held = true; zs.skip = true; pan = null;
        const [a, b] = [...pts.values()];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, s: zs.s, x: zs.x, y: zs.y, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
        pauseOn();
      } else if (pts.size === 1 && zoomed()) pan = { ...pos(e), x0: zs.x, y0: zs.y, px: pos(e).x, py: pos(e).y };
    }, true);
    stage.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, pos(e));
      if (pinch && pts.size >= 2) {
        const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const s = Math.min(4, Math.max(1, pinch.s * d / pinch.d));
        const cx = (pinch.mx - pinch.x) / pinch.s, cy = (pinch.my - pinch.y) / pinch.s;   // punto del contenido bajo los dedos
        zs.s = s; zs.x = mx - cx * s; zs.y = my - cy * s; clampZoom(); applyZoom(false);
      } else if (pan && pts.size === 1) {
        const p = pos(e);
        if (Math.hypot(p.x - pan.px, p.y - pan.py) > 8) zs.moved = true;
        if (zs.moved) { zs.x = pan.x0 + p.x - pan.px; zs.y = pan.y0 + p.y - pan.py; clampZoom(); applyZoom(false); }
      }
    });
    const lift = (e) => {
      if (!pts.delete(e.pointerId)) return;
      zs.sup = zs.skip || zs.moved;
      if (pts.size < 2) pinch = null;
      if (pts.size === 0) {
        if (zs.s < 1.08) { zs.s = 1; zs.x = zs.y = 0; applyZoom(true); if (!held) pauseOff(); }
        zs.skip = zs.moved = false; pan = null;
      }
    };
    stage.addEventListener('pointerup', lift, true);
    stage.addEventListener('pointercancel', lift, true);
  }
  const release = () => { clearTimeout(hold); if (zoomed() || pinch) return; pauseOff(); };
  const ignore = (t) => t.closest('button, select, input, label, a');
  stage.addEventListener('pointerdown', (e) => {
    if (ignore(e.target) || !swiper || pts.size > 1) return;
    held = false;
    if (zoomed()) return;
    hold = setTimeout(() => { held = true; pauseOn(); bgm?.suspend(); }, 220);
  });
  stage.addEventListener('pointerup', (e) => {
    if (ignore(e.target) || !swiper) return;
    const sup = zs.sup; zs.sup = false;
    const wasHeld = held;
    clearTimeout(hold);
    if (wasHeld && !zoomed()) bgm?.resume();
    if (sup) return;                                   // acaba de ser un pellizco o un arrastre con zoom
    if (zoomed()) { resetZoom(); return; }             // un toque con zoom lo quita y sigue la historia
    release();
    if (wasHeld) return;
    const x = e.clientX - stage.getBoundingClientRect().left;
    x < stage.clientWidth * 0.3 ? swiper.slidePrev() : swiper.slideNext();
  });
  stage.addEventListener('pointercancel', () => { clearTimeout(hold); if (held && !zoomed()) bgm?.resume(); release(); });

  // Volumen: se recuerda; el control aparece al pasar el ratón por el altavoz (solo con ratón)
  const slider = $('#volume');
  let vol = Number(localStorage.getItem('wrapped.vol'));
  vol = Number.isFinite(vol) && localStorage.getItem('wrapped.vol') !== null ? Math.min(1, Math.max(0, vol)) : 1;
  slider.value = vol;
  const icon = () => {
    const off = !bgm ? vol === 0 : bgm.muted || bgm.vol === 0;
    const cls = off ? 'fa-volume-xmark' : (bgm?.vol ?? vol) < 0.5 ? 'fa-volume-low' : 'fa-volume-high';
    $('#mute').innerHTML = `<i class="fa ${cls}" aria-hidden="true"></i>`;
    $('#mute').dataset.muted = off ? '1' : '0';   // los temas pueden dibujar su propio icono
    slider.value = bgm?.muted ? 0 : (bgm?.vol ?? vol);
  };
  const setVol = (v) => {
    vol = Math.min(1, Math.max(0, v));
    try { localStorage.setItem('wrapped.vol', String(vol)); } catch { /* sin almacenamiento */ }
    bgm?.setVolume(vol);
    icon();
  };
  const mute = () => { if (!bgm) return; bgm.toggleMute(); icon(); };
  slider.addEventListener('input', () => setVol(+slider.value));
  slider.addEventListener('change', () => slider.blur());   // que las flechas y M sigan funcionando
  $('.vol').addEventListener('wheel', (e) => { e.preventDefault(); setVol((bgm?.vol ?? vol) + (e.deltaY < 0 ? 0.05 : -0.05)); }, { passive: false });
  const goHome = () => { location.href = location.pathname + (q.get('theme') ? `?theme=${encodeURIComponent(q.get('theme'))}` : ''); };
  // Descargar: en un ordenador pregunta si la quieres apaisada o vertical; en un móvil descarga directamente
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const choose = () => new Promise((res) => {
    const dlg = $('#savechoice');
    $('#progress').classList.add('paused');
    dlg.addEventListener('close', () => { $('#progress').classList.remove('paused'); res(dlg.returnValue); }, { once: true });
    dlg.returnValue = 'cancel';
    dlg.showModal();
  });
  const cardEl = () => swiper.cardEl?.() || $('.swiper-slide-active .card');
  let saving = false;
  async function save() {
    if (!swiper || saving) return;
    window.__resetZoom?.(false);
    saving = true;
    try {
      const idx = swiper.activeIndex, base = `wrapped-${data.year}-${idx + 1}`;
      const now = document.documentElement.dataset.view;
      if (!chrome.canWide()) { await saveCard(cardEl(), `${base}.png`); return; }
      const pick = await choose();
      if (pick !== 'wide' && pick !== 'phone') return;
      const name = `${base}-${pick === 'wide' ? 'ordenador' : 'movil'}.png`;
      if (pick === now) { await saveCard(cardEl(), name); return; }
      // Otro formato: se tapa la pantalla, se cambia de vista un momento, se captura y se vuelve
      const veil = $('#shotwait');
      veil.hidden = false;
      chrome.forceView(pick);
      await sleep(300);
      swiper.update(); swiper.slideTo(idx, 0);
      await sleep(700);
      if (slides[idx].type === 'collage') { collage.invalidate(); collage.ensure([...swiper.slides]); await collage.whenReady(); }
      await saveCard(cardEl(), name);
      chrome.autoView();
      await sleep(300);
      swiper.update(); swiper.slideTo(idx, 0);
      veil.hidden = true;
    } finally { $('#shotwait').hidden = true; saving = false; }
  }

  addEventListener('keydown', (e) => {
    if (!swiper || e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('input, select, textarea, dialog')) return;
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); swiper.slideNext(); }
    else if (e.key === 'ArrowLeft') swiper.slidePrev();
    else if (e.key === 'm' || e.key === 'M') mute();
    else if (e.key === 's' || e.key === 'S') save();
    else if (e.key === 'h' || e.key === 'H') goHome();
  });

  // Al cambiar de vista Swiper tiene que recalcular tamaños
  addEventListener('wrapped:view', () => requestAnimationFrame(() => {
    swiper?.update();
    if (swiper && collageAt >= 0 && swiper.activeIndex >= collageAt - 1) setTimeout(() => collage.ensure([...swiper.slides]), 500);
  }));
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => collage.relayout(), 250); });

  // Pestaña oculta / navegador minimizado: música y barra se paran; al volver, siguen
  // Al volver de otra app el móvil puede dejar animaciones a medias (carátulas o títulos que no aparecen):
  // las de la tarjeta activa se llevan a su estado final
  const settle = () => {
    const el = isReact ? $('#react-root') : $('.swiper-slide-active');
    if (!el?.getAnimations) return;
    for (const a of el.getAnimations({ subtree: true })) {
      try { if (a.effect?.getComputedTiming().iterations !== Infinity) a.finish(); } catch { /* ya terminada */ }
    }
  };
  const onVis = () => {
    const hidden = document.hidden;
    if (hidden) { bgm?.suspend(); $('#progress').classList.add('paused'); }
    else {
      bgm?.resume(); if (!held) $('#progress').classList.remove('paused');
      settle();
    }
  };
  document.addEventListener('visibilitychange', onVis);
  addEventListener('pagehide', () => bgm?.suspend());
  addEventListener('pageshow', () => { if (!document.hidden) bgm?.resume(); });

  icon();
  $('#home').onclick = goHome;
  $('#mute').onclick = mute;
  $('#save').onclick = save;
}

main();
