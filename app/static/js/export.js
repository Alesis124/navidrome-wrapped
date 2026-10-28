// Exporta una tarjeta a PNG con html2canvas (vendor/, sin CDN).
//
// Antes de capturar se termina todo lo que esté animándose (transiciones y animaciones CSS
// finitas) para que la imagen muestre el estado final: números ya contados, barras llenas…
// html2canvas renderiza un clon del DOM en el que las animaciones empezarían de cero, así que
// además copiamos al clon el opacity/transform/filter ya calculados del original y
// desactivamos las animaciones. Funciona con cualquier tema.
//
// Limitaciones de html2canvas (diseña los temas con esto en mente): no pinta `filter`,
// `backdrop-filter`, `mix-blend-mode`, `clip-path`, `mask`, `conic-gradient`,
// `repeating-*-gradient` ni `background-clip:text`, y no aplica `font-variation-settings`
// (el eje de peso sí funciona). Para fondos desenfocados usa var(--cover-blur), que ya llega
// desenfocada desde el servidor.
const COPY = ['opacity', 'transform', 'filter', 'clip-path', 'visibility'];

export async function saveCard(el, filename = 'wrapped.png') {
  const canvas = await captureCard(el);
  if (!canvas) return;
  canvas.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  });
}

// Devuelve el canvas de una tarjeta. `scale` = resolución; `fixClone(clon)` deja retocar el clon (lo usa el collage)
export async function captureCard(el, { scale = 2, fixClone } = {}) {
  if (!el || !window.html2canvas) return null;
  for (const a of el.getAnimations?.({ subtree: true }) ?? []) {
    try { a.finish(); } catch { /* animación infinita: se queda como está */ }
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  // Emparejamos original y clon por marca (el clon puede traer nodos de más o de menos)
  const live = [el, ...el.querySelectorAll('*')];
  live.forEach((n, i) => n.setAttribute('data-xid', i));
  const canvas = await window.html2canvas(el, {
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0b0b12',
    scale,
    useCORS: true,
    onclone: async (doc, cloned) => {
      // El clon vive en un iframe: sus tipografías cargan aparte y, si no, el texto se mide con la de repuesto
      const faces = [...document.fonts].filter((f) => f.status === 'loaded');
      await Promise.all(faces.map((f) => doc.fonts.load(`${f.style} ${f.weight.split(' ').pop()} 16px ${f.family}`).catch(() => {})));
      await doc.fonts.ready;
      fixClone?.(cloned);
      const copies = [cloned, ...cloned.querySelectorAll('[data-xid]')];
      copies.forEach((c) => {
        const src = live[+c.getAttribute('data-xid')];
        if (!src) return;
        const cs = getComputedStyle(src);
        for (const p of COPY) c.style.setProperty(p, cs.getPropertyValue(p), 'important');
        c.style.setProperty('animation', 'none', 'important');
        c.style.setProperty('transition', 'none', 'important');
      });
    },
  });
  live.forEach((n) => n.removeAttribute('data-xid'));
  return canvas;
}
