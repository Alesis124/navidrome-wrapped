// Motor de plantillas mínimo para los temas (sin dependencias, sin eval).
//
//   {{ruta.al.dato}}            texto escapado
//   {{{ruta}}}                  HTML sin escapar (para textos del tema con <b>, <br>…)
//   {{ruta | num}}              con filtros: num, pad2, date, upper, lower, round
//   {{#if ruta}}…{{else}}…{{/if}}
//   {{#each lista limit=5}}…{{/each}}   dentro: campos del elemento, this, @index, @n
//
// Dentro de #each se pueden seguir usando los datos de fuera ({{year}}, {{s.x}}…).

const nf = new Intl.NumberFormat('es-ES');

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const fmt = (n) => nf.format(Math.round(+n || 0));
export const dayLabel = (iso) =>
  new Date(iso + 'T12:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

export const filters = {
  num: fmt,
  pad2: (v) => String(v).padStart(2, '0'),
  date: dayLabel,
  upper: (v) => String(v ?? '').toUpperCase(),
  lower: (v) => String(v ?? '').toLowerCase(),
  round: (v) => Math.round(+v || 0),
};

// "Tu {year}<br>en música" → sustituye {clave} por valores ya escapados
export function interpolate(str, vars, escape = true) {
  return String(str).replace(/\{(\w+)\}/g, (m, k) =>
    (k in vars && vars[k] != null) ? (escape ? esc(vars[k]) : String(vars[k])) : m);
}

function lookup(scope, path) {
  if (path === 'this') return scope.item;
  if (path === '@index') return scope.index;
  if (path === '@n') return scope.index + 1;
  const [head, ...rest] = path.split('.');
  let s = scope, v, found = false;
  while (s) {
    if (s.item !== null && typeof s.item === 'object' && head in s.item) { v = s.item[head]; found = true; break; }
    s = s.parent;
  }
  if (!found) return undefined;
  for (const k of rest) { if (v == null) return undefined; v = v[k]; }
  return v;
}

export function compile(src) {
  const root = [];
  const stack = [{ cur: root }];
  const top = () => stack[stack.length - 1];
  const re = /\{\{\{\s*([\s\S]+?)\s*\}\}\}|\{\{\s*([\s\S]+?)\s*\}\}/g;
  let last = 0, m;
  while ((m = re.exec(src))) {
    if (m.index > last) top().cur.push({ t: 'text', v: src.slice(last, m.index) });
    last = re.lastIndex;
    if (m[1] !== undefined) { top().cur.push({ t: 'var', e: m[1], raw: true }); continue; }
    const tag = m[2];
    if (tag.startsWith('#if ')) {
      const n = { t: 'if', e: tag.slice(4).trim(), yes: [], no: [] };
      n.cur = n.yes; top().cur.push(n); stack.push(n);
    } else if (tag.startsWith('#each ')) {
      const [e, ...attrs] = tag.slice(6).trim().split(/\s+/);
      const n = { t: 'each', e, attrs, yes: [] };
      n.cur = n.yes; top().cur.push(n); stack.push(n);
    } else if (tag === 'else') {
      const n = top();
      if (n.t !== 'if') throw new Error('{{else}} fuera de un {{#if}}');
      n.cur = n.no;
    } else if (tag === '/if' || tag === '/each') {
      if (stack.length < 2 || top().t !== tag.slice(1)) throw new Error(`{{${tag}}} no coincide con el bloque abierto`);
      stack.pop();
    } else {
      top().cur.push({ t: 'var', e: tag, raw: false });
    }
  }
  if (last < src.length) top().cur.push({ t: 'text', v: src.slice(last) });
  if (stack.length > 1) throw new Error(`bloque {{#${top().t}}} sin cerrar`);
  return root;
}

function evalExpr(expr, scope) {
  const [path, ...fs] = expr.split('|').map((x) => x.trim());
  let v = lookup(scope, path);
  for (const f of fs) {
    if (!filters[f]) throw new Error(`filtro desconocido: «${f}»`);
    v = filters[f](v);
  }
  return v;
}

const truthy = (v) => (Array.isArray(v) ? v.length > 0 : !!v);

function run(nodes, scope) {
  let out = '';
  for (const n of nodes) {
    if (n.t === 'text') out += n.v;
    else if (n.t === 'var') {
      const v = evalExpr(n.e, scope);
      out += v == null ? '' : n.raw ? String(v) : esc(v);
    } else if (n.t === 'if') {
      out += run(truthy(evalExpr(n.e, scope)) ? n.yes : n.no, scope);
    } else if (n.t === 'each') {
      let list = evalExpr(n.e, scope);
      if (!Array.isArray(list)) list = [];
      const lim = n.attrs.find((a) => a.startsWith('limit='));
      if (lim) {
        const raw = lim.slice(6);
        const num = Number.isFinite(+raw) ? +raw : +lookup(scope, raw);
        if (num > 0) list = list.slice(0, num);
      }
      list.forEach((item, index) => { out += run(n.yes, { item, index, parent: scope }); });
    }
  }
  return out;
}

export const render = (compiled, ctx) => run(compiled, { item: ctx, index: 0, parent: null });
