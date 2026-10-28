// Compila un tema React: <carpeta>/src/index.jsx  →  <carpeta>/dist/theme.js (ESM, un solo fichero).
// react, react-dom/client y motion/react quedan EXTERNOS: los sirve la página (import map).
//   node build-theme.mjs ../app/themes/motion          (una vez)
//   node build-theme.mjs ../app/themes/motion --watch  (reconstruye al guardar)
import { build, context } from 'esbuild';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const [dirArg, ...flags] = process.argv.slice(2);
if (!dirArg) { console.error('Uso: node build-theme.mjs <carpeta-del-tema> [--watch]'); process.exit(1); }
const dir = resolve(dirArg);
const entry = ['src/index.jsx', 'src/index.tsx', 'src/index.js'].map((f) => join(dir, f)).find(existsSync);
if (!entry) { console.error(`No encuentro src/index.jsx en ${dir}`); process.exit(1); }

const opts = {
  entryPoints: [entry], outfile: join(dir, 'dist', 'theme.js'),
  bundle: true, format: 'esm', target: 'es2020', jsx: 'automatic', minify: true, sourcemap: false,
  external: ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client', 'motion/react'],
  loader: { '.svg': 'dataurl', '.png': 'dataurl', '.jpg': 'dataurl', '.woff2': 'dataurl' },
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'none', logLevel: 'info',
};
if (flags.includes('--watch')) { await (await context(opts)).watch(); console.log('Vigilando', dir); }
else await build(opts);
