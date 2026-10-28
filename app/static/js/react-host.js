// Anfitrión de los temas con "engine": "react".
//
// Contrato del tema: su bundle (entry) exporta por defecto un componente de React.
// Recibe estas props y se vuelve a pintar en cada cambio de tarjeta:
//   data       JSON de /api/wrapped tal cual
//   slides     [{ type, dur, clip, cover, x, s, opts }]  (mismos datos que usan las plantillas html)
//   index      tarjeta activa;  direction  1 | -1 (sentido del último cambio)
//   count      nº de tarjetas;  paused  true mientras se mantiene pulsado
//   next() prev() goTo(i)
//   view       'wide' | 'phone';  vars {year,user,next_year};  strings (textos del tema, ya interpolados con vars)
//   play(url)  cambia la música de fondo (el motor hace el fundido); para temas que la cambian dentro de una tarjeta
//   theme      { id, name, tokens, palette };  asset(ruta) → URL de un fichero del tema
// La barra de progreso, el audio, el volumen, el teclado, los toques, el índice y la descarga
// (S) los sigue poniendo el motor; el tema solo dibuja. Marca la tarjeta visible con
// data-card="active" (o class="card") para que la descarga a PNG sepa qué capturar.

export async function mountReactTheme({ theme, data, slides, vars, stage, onError, play }) {
  const [React, { createRoot }, mod] = await Promise.all([
    import('react'), import('react-dom/client'), import(theme.entry),
  ]);
  const Theme = mod.default;
  if (!Theme) throw new Error(`El bundle de «${theme.id}» no exporta un componente por defecto`);

  const host = document.createElement('div');
  host.id = 'react-root';
  host.dataset.engine = 'react';
  const swiperEl = stage.querySelector('.swiper');
  swiperEl.hidden = true;
  swiperEl.after(host);

  class Boundary extends React.Component {
    state = { err: null };
    static getDerivedStateFromError(err) { return { err }; }
    componentDidCatch(err) { onError?.(err); }
    render() {
      return this.state.err
        ? React.createElement('div', { style: { padding: '2rem', color: '#fff' } }, 'Error en el tema: ' + this.state.err.message)
        : this.props.children;
    }
  }

  const root = createRoot(host);
  const palette = theme.palette?.length ? theme.palette : [];
  const info = { id: theme.id, name: theme.name, tokens: theme.tokens, palette };
  const asset = (p) => `/themes/${theme.id}/${String(p).replace(/^\/+/, '')}`;
  const view = () => document.documentElement.dataset.view || 'phone';
  const listeners = [];
  const state = { i: 0, dir: 1, paused: false };
  const strings = theme.strings || {};

  const nav = {
    activeIndex: 0,
    slides: slides.map(() => null),
    get isEnd() { return this.activeIndex >= slides.length - 1; },
    on(ev, fn) { if (ev === 'slideChange') listeners.push(fn); },
    update() { render(); },
    slideTo(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      if (i === state.i) return;
      state.dir = i > state.i ? 1 : -1;
      state.i = this.activeIndex = i;
      render();
      listeners.forEach((fn) => fn(this));
    },
    slideNext() { this.slideTo(state.i + 1); },
    slidePrev() { this.slideTo(state.i - 1); },
    setPaused(p) { state.paused = p; render(); },
    cardEl() {
      return host.querySelector('[data-card="active"]') || [...host.querySelectorAll('.card')].pop() || host;
    },
    destroy() { root.unmount(); host.remove(); swiperEl.hidden = false; },
  };

  function render() {
    root.render(React.createElement(Boundary, null, React.createElement(Theme, {
      data, slides, index: state.i, direction: state.dir, count: slides.length, paused: state.paused,
      next: () => nav.slideNext(), prev: () => nav.slidePrev(), goTo: (i) => nav.slideTo(i),
      view: view(), vars, strings, theme: info, asset, play,
    })));
  }
  addEventListener('wrapped:view', render);
  render();
  return nav;
}
