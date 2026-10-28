// Carga un tema desde /api/themes/<id>: tokens CSS, CSS, fuentes y (opcional) su script.
export async function loadTheme(id, year) {
  const qs = year ? `?year=${encodeURIComponent(year)}` : '';
  const r = await fetch(`/api/themes/${encodeURIComponent(id || 'default')}${qs}`);
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || r.statusText);
  const t = await r.json();

  const root = document.documentElement;
  root.dataset.theme = t.id;
  for (const [k, v] of Object.entries(t.tokens)) root.style.setProperty(k, v);

  await Promise.all([
    ...t.css.map((href) => new Promise((done) => {
      const l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = href; l.onload = done; l.onerror = done;
      document.head.appendChild(l);
    })),
    // @font-face en una hoja <style> (no con la API FontFace): así el export a PNG, que dibuja
    // un clon del DOM en un iframe, también ve las tipografías del tema y mide bien el texto.
    (async () => {
      if (!t.fonts.length) return;
      const q = (v) => String(v).replace(/["\\]/g, '');
      const st = document.createElement('style');
      st.dataset.themeFonts = t.id;
      st.textContent = t.fonts.map((f) => `@font-face{font-family:"${q(f.family)}";src:url("${q(f.url)}");`
        + `font-weight:${q(f.weight)};font-style:${q(f.style || 'normal')};font-display:block}`).join('\n');
      document.head.appendChild(st);
      await Promise.all(t.fonts.map((f) =>
        document.fonts.load(`${f.style || 'normal'} ${String(f.weight).split(' ').pop()} 16px "${q(f.family)}"`)
          .catch((e) => console.warn(`[tema ${t.id}] no se pudo cargar la fuente ${f.family}`, e))));
    })(),
  ]);

  t.hooks = {};
  if (t.script) {
    try { t.hooks = (await import(t.script)).default || {}; }
    catch (e) { console.warn(`[tema ${t.id}] error en el script del tema`, e); }
  }
  return t;
}
