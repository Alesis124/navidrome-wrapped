// Parte «de la página» (no del tema): pantalla de inicio con usuario y año, paneles de escritorio,
// opciones (tema, importar .zip) e índice de diapositivas. El tema solo la viste con CSS y strings.
import { esc, interpolate } from './tpl.js';

export const $ = (s, r = document) => r.querySelector(s);
const store = {
  get(k, area = 'localStorage') { try { return window[area].getItem(k); } catch { return null; } },
  set(k, v, area = 'localStorage') { try { window[area].setItem(k, v); } catch { /* sin almacenamiento */ } },
};

export const setState = (s) => { document.body.dataset.state = s; };

// Nombre de cada diapositiva en el índice de escritorio (el tema puede cambiarlo con strings.nav_<tipo>)
const NAV = {
  intro: 'Inicio', minutes: 'Minutos', 'top-artists': 'Artistas', 'top-tracks': 'Canciones',
  'number-one': 'Tu nº 1', discoveries: 'Descubrimientos', months: 'Meses', age: 'Tu edad', hour: 'Hora favorita',
  night: 'Madrugada', loop: 'Bucle', repeat: 'En repetición', recap: 'Resumen', outro: 'Final',
};

export function initChrome({ q, theme, config }) {
  const s = theme.strings || {};
  const who = $('#who'), userIn = $('#user'), yearSel = $('#year'), go = $('#go');
  const msg = $('#splash-msg'), title = $('#splash-title');
  const desktop = matchMedia('(min-width: 1000px)');
  const landscape = matchMedia('(min-width: 1000px) and (min-aspect-ratio: 5/4)');
  const root = document.documentElement;
  let resolved = null, timer = 0, seq = 0;

  // ---- Vista: «wide» (pantalla completa, solo si el tema trae maquetación apaisada) o «phone» (marco 9:16)
  const canWide = () => !!theme.wide && landscape.matches;
  // La vista es automática: ancha en un ordenador (si el tema la trae), móvil en un móvil o en una ventana estrecha
  function applyView() {
    const v = canWide() ? 'wide' : 'phone';
    const changed = root.dataset.view !== v;
    root.dataset.view = v;
    place();
    if (changed) dispatchEvent(new Event('wrapped:view'));
  }

  const say = (text, error = false) => { msg.textContent = text || ''; msg.classList.toggle('err', !!error); };

  // ---- Opciones: en el panel derecho (escritorio) o dentro de la pantalla de inicio (móvil)
  const options = $('#options');
  function place() {
    // Con los paneles laterales visibles (escritorio en vista móvil) las opciones van a la derecha
    const dest = desktop.matches && root.dataset.view !== 'wide' ? $('#options-slot') : $('#splash');
    if (dest && options.parentElement !== dest) dest.append(options);
  }
  applyView();
  desktop.addEventListener('change', applyView);
  landscape.addEventListener('change', applyView);

  fetch('/api/themes').then((r) => r.json()).then(({ themes }) => {
    const sel = $('#theme-pick'), list = themes.filter((t) => !t.error);
    sel.innerHTML = list.map((t) =>
      `<option value="${esc(t.id)}"${t.id === theme.id ? ' selected' : ''}>${esc(t.name)}</option>`).join('');
    sel.closest('.opt-sel').hidden = list.length < 2;
    sel.onchange = () => { const u = new URL(location.href); u.searchParams.set('theme', sel.value); location.href = u; };
  }).catch(() => { $('#theme-pick').closest('.opt-sel').hidden = true; });

  // ---- Cerrar sesión (solo si el servidor tiene login)
  const out = $('#logout');
  out.hidden = !config.auth_enabled;
  out.onclick = async () => { await fetch('/api/logout', { method: 'POST' }).catch(() => { }); location.href = '/login'; };

  // ---- Importar tema
  const dlg = $('#importer');
  const imp = $('#import-open');
  imp.hidden = typeof dlg.showModal !== 'function';
  const impMsg = (t, error = false) => { const m = $('#imp-msg'); m.classList.toggle('err', error); m.replaceChildren(t); };
  imp.onclick = () => {
    $('#imp-key').value = store.get('wrapped.key', 'sessionStorage') || '';
    for (const el of $('#imp-form').elements) if (el.id !== 'imp-close') el.disabled = !config.import_enabled;
    impMsg(config.import_enabled ? '' : 'La importación está desactivada. Ejecuta ./deploy.sh en el servidor: crea la clave (ADMIN_KEY) en el .env si no existe, y vuelve a abrir esta página.', !config.import_enabled);
    dlg.showModal();
  };
  $('#imp-close').onclick = () => dlg.close();
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  $('#imp-form').onsubmit = async (e) => {
    e.preventDefault();
    const file = $('#imp-file').files[0], key = $('#imp-key').value;
    if (!file) return;
    const btn = $('#imp-go');
    btn.disabled = true;
    impMsg('Subiendo…');
    try {
      const r = await fetch(`/api/themes/import?force=${$('#imp-force').checked}`, {
        method: 'POST', body: file, headers: { 'Content-Type': 'application/zip', 'X-Admin-Key': key },
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(typeof j.detail === 'string' ? j.detail : r.statusText);
      store.set('wrapped.key', key, 'sessionStorage');
      const u = new URL(location.href);
      u.searchParams.set('theme', j.id);
      const a = document.createElement('a');
      a.href = u; a.textContent = 'Usarlo ahora';
      const span = document.createElement('span');
      span.textContent = `Tema «${j.id}» instalado. ` + (j.warnings?.length ? `(${j.warnings.join('; ')}) ` : '');
      $('#imp-msg').classList.remove('err');
      $('#imp-msg').replaceChildren(span, a);
      $('#imp-form').reset();
    } catch (err) { impMsg(err.message, true); }
    btn.disabled = false;
  };

  // ---- Pantalla de inicio: modo «gate» (escribir usuario y elegir año)
  async function check() {
    const name = userIn.value.trim();
    const my = ++seq;
    resolved = null;
    go.disabled = true;
    if (!name) { yearSel.innerHTML = ''; yearSel.disabled = true; say(s.gate_hint ?? 'Escribe tu usuario de Navidrome y elige el año.'); return; }
    try {
      const r = await fetch('/api/years?user=' + encodeURIComponent(name));
      const j = await r.json().catch(() => ({}));
      if (my !== seq) return;
      if (!r.ok) throw new Error(typeof j.detail === 'string' ? j.detail : r.statusText);
      const want = +(q.get('year') || config.default_year);
      const pick = j.years.includes(want) ? want : j.years[0];
      yearSel.innerHTML = j.years.map((y) => `<option value="${y}"${y === pick ? ' selected' : ''}>${y}</option>`).join('');
      yearSel.disabled = false;
      resolved = j.user;
      go.disabled = false;
      say(`Hola, ${j.user}.`);
    } catch (e) {
      if (my !== seq) return;
      yearSel.innerHTML = ''; yearSel.disabled = true;
      say(e.message, true);
    }
  }
  userIn.addEventListener('input', () => { clearTimeout(timer); go.disabled = true; timer = setTimeout(check, 350); });

  function remembered() { return store.get('wrapped.user') || ''; }
  function remember(name) { store.set('wrapped.user', name); }

  function gate({ user = '', message = '' } = {}) {
    setState('gate');
    who.dataset.mode = 'gate';
    title.innerHTML = s.gate_title ?? '¿Quién <br>escucha?';
    go.textContent = s.gate_button ?? 'Ver mi Wrapped';
    userIn.value = user || remembered();
    $('#splash').dataset.ready = '1';
    $('#who-sum').textContent = '';
    if (message) say(message, true); else say(s.gate_hint ?? 'Escribe tu usuario de Navidrome y elige el año.');
    if (userIn.value.trim()) {
      const keep = message;
      check().then(() => { if (keep && !resolved) say(keep, true); });
    } else { go.disabled = true; }
    if (desktop.matches || !matchMedia('(pointer: coarse)').matches) userIn.focus();
  }

  who.addEventListener('submit', (e) => {
    if (who.dataset.mode !== 'gate') return;   // en «ready» lo gestiona story.js (empezar)
    e.preventDefault();
    e.stopImmediatePropagation();
    if (!resolved) return;
    remember(resolved);
    const u = new URL(location.href);
    u.searchParams.set('user', resolved);
    u.searchParams.set('year', yearSel.value);
    document.body.classList.add('busy');
    location.href = u;
  }, true);

  // ---- Modo «ready»: ya hay datos, solo falta empezar
  function ready({ data, vars }) {
    setState('ready');
    who.dataset.mode = 'ready';
    go.disabled = false;
    remember(data.user);
    title.innerHTML = interpolate(s.splash_title ?? 'Tu Wrapped', vars);
    go.textContent = interpolate(s.splash_button ?? 'Empezar', vars, false);
    say('');
    $('#splash').dataset.ready = '1';
    $('#who-sum').innerHTML = `<b>${esc(data.user)}</b><span>${data.year}</span>`;
    $('#change').onclick = () => gate({ user: data.user });
  }

  function fail(text) {
    setState('error');
    title.innerHTML = '<i class="fa fa-face-frown" aria-hidden="true"></i>';
    who.hidden = true;
    say(text, true);
    $('#splash').dataset.ready = '1';
  }

  // ---- Índice de escritorio
  function toc(slides, onPick) {
    const nav = $('#toc');
    nav.innerHTML = slides.map((sl, i) => {
      const label = s['nav_' + sl.type.replace(/-/g, '_')] ?? NAV[sl.type] ?? sl.type;
      return `<button type="button" data-i="${i}"><span class="n">${String(i + 1).padStart(2, '0')}</span>${esc(label)}</button>`;
    }).join('');
    nav.onclick = (e) => {
      const b = e.target.closest('button');
      if (b && document.body.dataset.state === 'playing') onPick(+b.dataset.i);
    };
  }
  const tocActive = (i) => [...$('#toc').children].forEach((b, k) => {
    b.classList.toggle('on', k === i);
    b.classList.toggle('done', k < i);
    if (k === i) b.scrollIntoView?.({ block: 'nearest' });
  });

  // Para sacar una imagen en el otro formato: se fuerza una vista un momento y se vuelve a la automática
  function forceView(v) { root.dataset.view = v; place(); dispatchEvent(new Event('wrapped:view')); }
  return { gate, ready, fail, toc, tocActive, canWide, forceView, autoView: applyView };
}
