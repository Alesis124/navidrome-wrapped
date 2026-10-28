// Genera app/static/vendor/react/*.js: React, ReactDOM y motion como módulos ES que comparten
// una sola copia de React (los temas los piden por import map y NO los incluyen en su bundle).
//   cd theme-kit && npm install && npm run vendor
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, rmSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'app', 'static', 'vendor', 'react');
const gen = join(here, '.gen');
const require = createRequire(import.meta.url);
rmSync(out, { recursive: true, force: true });
rmSync(gen, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
mkdirSync(gen, { recursive: true });

// React es CommonJS: hay que declarar sus nombres para poder hacer `import { useState } from 'react'`
const shim = (mod, file, def = true) => {
  const names = Object.keys(require(mod)).filter((k) => /^[A-Za-z_$][\w$]*$/.test(k) && k !== 'default');
  writeFileSync(join(gen, file),
    `import * as M from '${mod}';\n${names.map((n) => `export const ${n} = M.${n};`).join('\n')}\n` +
    (def ? 'export default M.default ?? M;\n' : ''));
};
shim('react', 'react.js');
shim('react/jsx-runtime', 'jsx-runtime.js', false);
shim('react-dom/client', 'react-dom-client.js');
writeFileSync(join(gen, 'motion-react.js'), "export * from 'motion/react';\n");

await build({
  entryPoints: ['react', 'jsx-runtime', 'react-dom-client', 'motion-react'].map((n) => join(gen, n + '.js')),
  outdir: out, bundle: true, format: 'esm', splitting: true, minify: true, target: 'es2020',
  nodePaths: [join(here, 'node_modules')],
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'none', logLevel: 'info',
});
for (const [pkg, f] of [['react', 'LICENSE-react.txt'], ['motion', 'LICENSE-motion.txt']]) {
  try { copyFileSync(join(here, 'node_modules', pkg, 'LICENSE.md'), join(out, f)); }
  catch { try { copyFileSync(join(here, 'node_modules', pkg, 'LICENSE'), join(out, f)); } catch { /* sin licencia */ } }
}
rmSync(gen, { recursive: true, force: true });
