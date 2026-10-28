// Collage final: una miniatura de cada diapositiva en una sola tarjeta que se puede guardar como imagen.
// Las miniaturas no se sacan de las diapositivas «vivas» (Swiper las esconde y las anima): se copia cada
// una a un contenedor fantasma fuera de la pantalla, con el estado final de sus animaciones, y se captura.
import { captureCard } from './export.js';
import { fmt } from './tpl.js';

const $ = (s, r = document) => r.querySelector(s);

// Espera a que estén cargadas todas las imágenes (<img> y fondos) de una diapositiva, para que la captura no salga con huecos
function preload(root) {
  const urls = new Set();
  for (const el of [root, ...root.querySelectorAll('*')]) {
    for (const m of getComputedStyle(el).backgroundImage.matchAll(/url\(["']?(.*?)["']?\)/g)) urls.add(m[1]);
    if (el.tagName === 'IMG' && el.src) urls.add(el.src);
  }
  const one = (u) => new Promise((res) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = im.onerror = () => res();
    im.src = u;
  });
  return Promise.race([Promise.all([...urls].map(one)), new Promise((r) => setTimeout(r, 8000))]);
}

export function createCollage() {
  let gen = 0, state = 'idle', key = '', gap = 700;   // pausa entre capturas: no tira de la animación mientras se mira

  const target = () => $('.swiper-slide[data-type="collage"] .collage');

  // Reparte las miniaturas en filas para que ocupen lo máximo posible del hueco
  function layout() {
    const box = target(), imgs = box ? [...box.querySelectorAll('img, .ph')] : [];
    if (!imgs.length) return;
    const st = $('#stage'), a = st.clientWidth / st.clientHeight, n = +box.dataset.total || imgs.length;
    const g = Math.max(4, Math.round(box.clientWidth * 0.012));
    let best = 0, cols = n;
    for (let c = 1; c <= n; c++) {
      const w = (box.clientWidth - (c - 1) * g) / c, rows = Math.ceil(n / c);
      if (rows * (w / a) + (rows - 1) * g <= box.clientHeight && w > best) { best = w; cols = c; }
    }
    if (!best) best = (box.clientWidth - (cols - 1) * g) / cols;
    box.style.setProperty('--cw', `${(Math.floor(best * 10) / 10 - 0.5).toFixed(1)}px`);   // margen para que el redondeo no salte de fila
    box.style.setProperty('--cg', `${g}px`);
    box.style.setProperty('--ar', `${st.clientWidth} / ${st.clientHeight}`);
  }

  async function build(sections) {
    const box = target(), st = $('#stage');
    if (!box) return;
    const my = ++gen, W = st.clientWidth, H = st.clientHeight;
    state = 'running';
    key = `${W}x${H}`;
    box.innerHTML = '';
    box.dataset.state = 'loading';
    const list = sections.filter((s) => s.dataset.type !== 'collage');
    box.dataset.total = list.length;
    // Huecos reservados: si se llega antes de que estén listas, las miniaturas entran deslizándose en su sitio en vez de «saltar»
    box.append(...list.map(() => Object.assign(document.createElement('i'), { className: 'ph' })));
    layout();
    let slot = 0;

    const ghost = document.createElement('div');
    ghost.className = 'swiper ghost';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.cssText = `position:absolute;left:-${W * 2}px;top:0;width:${W}px;height:${H}px;pointer-events:none`;
    ghost.innerHTML = '<div class="swiper-wrapper" style="transform:none"></div>';
    st.append(ghost);
    const wrap = ghost.firstElementChild;
    const lite = matchMedia('(hover: none)').matches;   // móvil: miniaturas más pequeñas = menos memoria
    const scale = Math.min(0.9, (lite ? 400 : 560) / Math.min(W, H));   // lado corto a ~560 px como mucho; con scale 1 exacto html2canvas pinta mal los discos

    try {
      for (const sec of list) {
        if (my !== gen) return;
        if (gap) await new Promise((r) => setTimeout(r, gap));
        // No capturar mientras se anima una diapositiva ni con la pestaña oculta (en móvil provocaba parpadeos)
        while (gap && (document.hidden || performance.now() - (window.__slideAt || 0) < 1800)) {
          await new Promise((r) => setTimeout(r, 250));
          if (my !== gen) return;
        }
        if (my !== gen) return;
        const c = sec.cloneNode(true);
        c.classList.add('swiper-slide-active', 'played');
        // Swiper deja en cada diapositiva transform/opacity/anchos en línea: se descartan, salvo las variables (--c, --cover…)
        const vars = [...c.style].filter((k) => k.startsWith('--')).map((k) => `${k}:${c.style.getPropertyValue(k)}`);
        c.style.cssText = vars.join(';');
        c.querySelectorAll('[data-count]').forEach((el) => { el.textContent = fmt(+el.dataset.count); });
        wrap.replaceChildren(c);
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        await preload(c);
        const card = $('.card', c);
        const canvas = await captureCard(card, { scale, fixClone: (cl) => {
          const g = cl.closest('.ghost'); if (g) g.style.left = '0';
        } });
        if (my !== gen) return;
        if (!canvas) continue;
        const img = new Image();
        img.alt = '';
        img.className = 'in';
        img.src = canvas.toDataURL('image/jpeg', 0.86);
        const ph = box.querySelectorAll('.ph')[0];
        ph ? ph.replaceWith(img) : box.append(img);
        slot++;
        layout();
      }
      box.querySelectorAll('.ph').forEach((e) => e.remove());
      box.dataset.state = 'ready';
      state = 'done';
      layout();
    } catch (e) {
      console.warn('[collage] no se pudo montar', e);
      box.dataset.state = 'error';
      state = 'idle';
    } finally {
      ghost.remove();
    }
  }

  return {
    // Se llama al llegar a la penúltima diapositiva o a la del collage; no repite trabajo
    ensure(sections) {
      const st = $('#stage'), now = `${st.clientWidth}x${st.clientHeight}`;
      // En móvil la barra del navegador aparece/desaparece y cambia el alto unos píxeles: eso no es un cambio de vista
      // y no debe reiniciar el collage (se veía como un parpadeo al final)
      const [kw, kh] = key.split('x').map(Number);
      const same = key && Math.abs(st.clientWidth - kw) / kw < 0.04 && Math.abs(st.clientHeight - kh) / kh < 0.18;
      if (state === 'running' && same) return;
      if (state === 'done' && same) { layout(); return; }
      build(sections);
    },
    relayout: layout,
    hurry() { gap = 0; },                       // ya se está llegando al final: sin pausas
    whenReady() {
      return new Promise((res) => {
        const t0 = Date.now();
        const tick = () => (state === 'done' || Date.now() - t0 > 40000 ? res() : setTimeout(tick, 120));
        tick();
      });
    },
    invalidate() { gen++; state = 'idle'; gap = 0; },
  };
}
