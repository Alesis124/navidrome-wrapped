# Temas (plantillas)

Un **tema** es una carpeta que cambia todo el aspecto del Wrapped sin tocar código: barra de progreso,
transiciones, fondo, tipografía, textos, orden y número de diapositivas. Haces uno por año, lo importas
(carpeta o zip) y lo abres con `?theme=<id>`.

Incluidos: `frecuencia` (tema por defecto) y `remix` (React + motion); `aurora`, `classic` y `neon` se retiraron. Los temas nuevos pueden
hacer `"extends": "frecuencia"` y cambiar solo lo que quieran.

## Tu tema de este año en 3 pasos

```bash
python scripts/theme.py new 2027 --extends frecuencia      # crea themes/2027/ heredando de frecuencia
# edita themes/2027/theme.json y theme.css
python scripts/theme.py validate themes/2027
```

Ábrelo en `http://servidor:8100/?user=Alesis&year=2027&theme=2027`. No hay que reiniciar ni reconstruir
nada: `./themes` está montado en el contenedor y los cambios se ven al recargar.

**Qué tema se usa:** `?theme=` en la URL → variable `WRAPPED_THEME` → un tema cuyo id sea el año pedido
(si creas `themes/2027`, el Wrapped de 2027 lo usa solo) → `frecuencia`. En la pantalla de inicio hay un
selector para cambiar entre los temas instalados.

## Importar, compartir

```bash
python scripts/theme.py pack themes/2027            # → 2027.zip
python scripts/theme.py install 2027.zip [--force]  # valida y copia a themes/2027
python scripts/theme.py list
```

`install` rechaza zips con rutas peligrosas (`../`), enlaces simbólicos, ficheros de tipos no permitidos
(p. ej. `.py`), más de 500 ficheros o más de 30 MB. Aun así, **un tema puede incluir JavaScript**
(`theme.js`) y HTML en las plantillas, y se ejecuta en tu navegador con acceso a la API de tu Wrapped:
instala solo temas de gente de confianza.

## Estructura

```
themes/2027/
├── theme.json          manifiesto (obligatorio)
├── theme.css           estilos
├── theme.js            hooks opcionales
├── slides/             una plantilla HTML por tipo de diapositiva (intro.html, night.html…)
├── fonts/              .woff2 / .woff / .ttf / .otf
└── assets/             imágenes, vídeo de fondo… (png jpg webp avif gif svg mp4 webm mp3 ogg)
```

Los ids de tema usan `a-z 0-9 - _` (por eso `2027` vale). Un tema tuyo con el id de uno incluido
(`classic`, `neon`) lo sustituye.

## `theme.json`

```jsonc
{
  "name": "Edición 2027", "author": "Alesis", "version": "1.0.0", "description": "…",
  "extends": "neon",                      // opcional: hereda de otro tema

  "tokens": { "--accent": "#ffd400", "--font": "'Mi Fuente', sans-serif" },   // variables CSS en :root
  "palette": ["#2a0a4a", "#0a3a4a"],      // colores que rotan como var(--c) en cada diapositiva
  "fonts": [{ "family": "Mi Fuente", "src": "fonts/mi.woff2", "weight": "400 800", "style": "normal" }],
  "css": ["theme.css"],
  "script": "theme.js",

  "swiper": { "effect": "creative", "speed": 600, "creativeEffect": { … } },    // transición
  "audio":  { "enabled": true, "fade": 0.8 },                                   // música de fondo
  "slides": [ "intro", { "type": "top-tracks", "template": "top-tracks-big", "duration": 8000, "opts": { "limit": 3 } }, "outro" ],
  "strings": { "intro_title": "Mi {year}", "night_kicker": "Modo vampiro" }
}
```

| Clave | Qué hace |
|---|---|
| `tokens` | Variables CSS (`--nombre`). Las del motor: `--bg`, `--fg`, `--accent`, `--font`. Puedes definir las tuyas. |
| `palette` | Hasta 12 colores (`#hex`, `rgb()`, `hsl()`). Cada diapositiva recibe uno como `--c`. |
| `fonts` | Se cargan con la API de fuentes del navegador; úsalas luego en `tokens` (`--font`) o en tu CSS. |
| `css` | Hojas de estilo, en orden. Se cargan después de `base.css`. |
| `swiper` | Transición. `effect`: `slide`, `fade`, `cube`, `coverflow`, `flip`, `creative`, `cards`; `speed` (100–3000 ms); `direction`; `spaceBetween` y los objetos `creativeEffect`, `cubeEffect`, `coverflowEffect`, `flipEffect`, `cardsEffect`, `fadeEffect` (ver la [documentación de Swiper](https://swiperjs.com/swiper-api#effects)). |
| `slides` | Orden y duración (ms) de las diapositivas. Una entrada es `"tipo"` o `{type, template, duration, opts}`. Se omiten solas las que no apliquen (p. ej. «madrugada» si no hay datos). Puedes repetir un tipo con otra `template`. |
| `strings` | Textos. Se usan en las plantillas como `{{{s.clave}}}`. |
| `audio` | `enabled: false` quita la música y oculta el botón de silencio. |

**Herencia:** un tema hereda de otro (`"extends"`, hasta 4 niveles) y solo declara lo que cambia.
`tokens`, `strings`, `swiper` y `audio` se mezclan clave a clave; `fonts` y `css` se acumulan (primero el
padre); `slides` y `palette` se sustituyen enteros; las plantillas se sustituyen una a una por nombre.

## Tipos de diapositiva

| `type` | Aparece si… | Variables extra (`x.…` y `{…}` en strings) |
|---|---|---|
| `intro` | siempre | — |
| `minutes` | siempre | `minutes` `plays` `artists` `tracks` `hours` `days` `albums` `per_day` `days_active` `covers` |
| `top-artists` | hay artistas | `first` `rest` `artists` (con `pct`) `artist` `artist_plays` `artist_minutes` |
| `race` | hay ≥ 2 artistas con historial (no sale en modo sin historial) | `artists` (ordenados por reproducciones, cada uno con `cover`, `clip`, `plays`) `winner` `winner_name` `winner_plays`. No está en la secuencia por defecto: añádela a `slides`; solo el tema React «Remix» la dibuja. La carrera es una coreografía (lidera uno y luego otro) que termina en el orden real; la música la cambia el tema con `play(url)` según quién va en cabeza |
| `age` | hay año de lanzamiento en ≥ 10 reproducciones y ≥ 10 % del año | `age` (estimada) `median_year` `decade` `decade_share` `coverage` `decades` (`label`, `pct`, `share`, `peak`) `oldest_*` `newest_*`. Estimación «para pasar el rato»: mediana del año de lanzamiento + 18. Ojo: no uses `rx-age` como clase en temas React, la tarjeta ya se llama así |
| `top-tracks` | hay canciones | `tracks` (top 5 con `pct`) `first` |
| `number-one` | hay canciones | `track` (objeto) `track_title` `track_artist` `track_plays` |
| `discoveries` | hay descubrimientos | `new_tracks` `new_artists` |
| `night` | hay reproducciones de 0 a 6 h | `night_plays` `night_share` `night_time` `night_track` `night_top` |
| `loop` | alguna canción ≥ 3 veces en un día | `loop_plays` `loop_day` `loop_track` `track` `reps` |
| `repeat` | alguna canción ≥ 3 seguidas | `repeat_times` `repeat_track` `track` `reps` |
| `hour` | hay historial (tabla `scrobbles`) | `peak` `hist` (lista `{h, plays, pct, peak}`) `week` (`{d, plays, pct, peak}`) `peak_day` `busiest_day` `busiest_plays` `busiest_minutes` `streak` |
| `months` | hay historial | `bars` (12 meses `{m, plays, pct, peak}`) `peak_month` `peak_month_cap` `peak_plays` |
| `recap` | hay canciones | `minutes` `plays` `artists` `tracks` `peak` `top_artist` `artists_line` `tracks_line` `covers` (carátulas únicas de todo lo mostrado, en múltiplos que completan filas de 4) `n_covers` — tarjeta-resumen para compartir |
| `outro` | siempre | — |

En los textos de `strings` también valen `{year}`, `{user}` y `{next_year}`. La música de fondo de cada
diapositiva es un clip de la canción más representativa de esa diapositiva.

## Plantillas (`slides/<tipo>.html`)

HTML con un motor de plantillas mínimo (sin `eval`). Si el tema no trae la plantilla de un tipo, usa la
del tema del que hereda.

```html
<p class="kicker">{{{s.night_kicker}}}</p>
<div class="big" data-count="{{fun.night.plays}}">0</div>          <!-- data-count: cuenta animada -->
<ol class="rank">{{#each top_tracks limit=5}}
  <li><span>{{@n}}</span><div>{{title}}<small>{{artist}}</small></div><em>{{plays | num}}</em></li>
{{/each}}</ol>
{{#if x.track.cover}}<img src="{{x.track.cover}}" alt="">{{/if}}
```

| Sintaxis | Significado |
|---|---|
| `{{ruta}}` | Texto escapado. Rutas con puntos: `totals.minutes`, `fun.night.latest.time`. |
| `{{{ruta}}}` | Sin escapar. **Úsalo para `{{{s.clave}}}`**: los textos del tema pueden llevar `<b>` o `<br>`; los valores que se interpolan dentro (`{user}`…) ya van escapados. |
| `{{ruta \| filtro}}` | Filtros: `num` (1.234), `pad2` (07), `date` (17 de mayo), `upper`, `lower`, `round`. |
| `{{#if ruta}}…{{else}}…{{/if}}` | Condicional (`0`, vacío, lista vacía = falso). |
| `{{#each lista limit=N}}…{{/each}}` | Bucle. Dentro: campos del elemento, `{{this}}`, `{{@index}}` (desde 0), `{{@n}}` (desde 1). `limit` admite un número o una ruta (`limit=opts.limit`). |

**Datos disponibles** (todo lo que devuelve `/api/wrapped`): `user`, `year`, `next_year`, `totals`,
`top_artists`, `top_tracks`, `discoveries`, `fun`, además de `x` (extras del tipo, tabla anterior),
`s` (tus textos) y `opts` (lo que pongas en `opts` de la entrada de `slides`). Mira
`/api/wrapped?user=…&year=…` en el navegador para ver el JSON completo.

## CSS: lo que el motor te da

El motor (`css/base.css`) solo pone estructura y un diseño mínimo; tú lo rediseñas.

| Elemento | Detalle |
|---|---|
| `#stage` | Marco 9:16. `#stage[data-type]` lo puede rellenar `theme.js`. |
| `#progress > i` | Una pieza por diapositiva con `.done` (vista) y `.on` (activa). La activa se llena con `animation: fill var(--dur) linear forwards`; al terminar el motor avanza solo. Mantener pulsado añade `#progress.paused`. Redibújala como quieras: barras, puntos, línea fina, abajo… (ver `neon`). |
| `.hud` / `#mute` / `#save` | Botones de silencio y descarga. `#mute[data-muted="1"]` indica silencio (para cambiar el icono). |
| `.swiper-slide` | Lleva `data-type`, `--c` (color de la paleta), `--cover` (carátula: `background: var(--cover) center/cover`) y `--cover-blur` (la carátula ya reducida y desenfocada en el servidor, `/api/cover/{id}/blur`: un fondo «malla» que **sí se exporta a PNG**). |
| `.swiper-slide-active .card > *` | Los hijos directos de `.card` llevan `--i` (0, 1, 2…): úsalo para **animaciones de entrada escalonadas** (`animation-delay: calc(var(--i) * 90ms)`). |
| `#splash`, `#go`, `#theme-pick` | Pantalla de inicio (su texto sale de `strings.splash_title` / `splash_button`). |

Las rutas relativas dentro de tu CSS (`url('assets/bg.png')`, `url('fonts/x.woff2')`) se resuelven
respecto al propio `theme.css`.

## `theme.js` (opcional)

```js
export default {
  init({ root, data, theme, swiper, bgm, slides }) {},   // al pulsar «Empezar»
  enter(el, i, slide) { document.getElementById('stage').dataset.type = el.dataset.type; },
  leave(el, i, slide) {},
};
```

Sirve para efectos que el CSS no alcanza (partículas, cambiar el título, etc.). Si falla, el Wrapped
sigue funcionando y el error sale por la consola del navegador.

## Exportar tarjeta a PNG

El botón de descarga (icono de flecha) captura la tarjeta tal y como se ve (se congela el estado final de las animaciones, así que
funciona con cualquier tema). Limitaciones de la librería (html2canvas), a tener en cuenta al diseñar:

- No pinta `filter`, `backdrop-filter`, `mix-blend-mode`, `clip-path`, `mask`, `conic-gradient`, `repeating-*-gradient`, `background-clip:text` ni `color-mix()`, y tampoco `font-variation-settings` (el eje `wght` sí). Para fondos desenfocados usa `var(--cover-blur)`.
- Evita `z-index` negativos: se pintarían debajo del fondo de la tarjeta.
- Las animaciones de pseudo-elementos no se copian; usa elementos reales.
- Las tipografías se declaran en `fonts` del manifiesto (el motor las inyecta como `@font-face`, lo que permite que el export mida bien el texto).

## Tema por defecto: Aurora

`aurora` es el tema que se usa si no eliges otro. Una sola tinta (negro) sobre el color de la carátula de
cada diapositiva (`--cover-blur`), tipografía condensada (Big Shoulders Display + Hanken Grotesk, licencia
OFL, incluidas en `themes/frecuencia/fonts`), vinilos que laten con los graves, odómetro, reloj de 24 h,
gráfica de meses y tarjeta-resumen. Es un buen punto de partida:
`python scripts/theme.py new 2027 --extends frecuencia`.

## Pantalla de inicio y paneles de escritorio

La pantalla de inicio (usuario, año, opciones) y los paneles de escritorio son del motor; el tema solo
los viste. En `#splash`, `#who[data-mode="gate"|"ready"]` es el formulario (`#user`, `#year`, `#go`),
`#splash-msg.err` un error y `#options` los botones (`#change`, `#theme-pick`, `#import-open`);
`body[data-state]` vale `gate`, `ready`, `playing` o `error`. En ventanas de 1000 px o más hay además
`#rail-l` (índice `#toc`) y `#rail-r`. Textos opcionales en `strings`: `gate_title`, `gate_hint`,
`gate_button` y `nav_<tipo>` (nombre en el índice, con `-` como `_`: `nav_top_artists`).

## Vista ancha (pantalla completa en ordenador)

Un tema puede traer maquetación apaisada con `"wide": true` en `theme.json`. Si la ventana mide al menos
1000 px de ancho y es apaisada, el motor pone `html[data-view="wide"]` y la tarjeta ocupa toda la ventana
(los temas sin `wide` siguen en el marco 9:16, `data-view="phone"`). La pantalla de inicio en vista ancha la maqueta `base.css` (dos columnas, tamaños fijos): los temas solo le ponen colores. La vista es automática (no hay botón
para cambiarla). El motor lanza `wrapped:view` en `window` al cambiar. Cómo lo hace Aurora
(`themes/frecuencia/wide.css`, útil de plantilla):

- `--u` pasa a medir 1 % del ancho de un fotograma de 100 × 56,25 u (`min(1vw, 1.7778dvh)`); si la ventana
  es más ancha o más alta que 16:9, el fondo se extiende y el contenido queda centrado (`--pad`, `--padv`).
- Texto en la columna izquierda; el «objeto» de cada diapositiva (`.sleeves`, `.chart`, `.clock`, `.mosaic`…)
  en absoluto, a la derecha y centrado en vertical. Cuidado con la especificidad al darle altura.
- Los titulares `.fit` se escalan con un factor menor en esta vista (ver `fit()` en `theme.js`).
- La tarjeta exportada con `S` es apaisada: lo que se ve es lo que se guarda.

## Importar un tema desde la web

Con `ADMIN_KEY` definido, el botón «Importar tema (.zip)» sube un zip (`python scripts/theme.py pack
themes/2027` lo genera) con `theme.json` en la raíz o dentro de una carpeta; el id es el nombre de esa
carpeta. Se valida igual que con `scripts/theme.py install` y no puede sustituir a un tema incluido.

## Si algo no sale

- **El tema no aparece / error al abrirlo:** `python scripts/theme.py validate themes/<id>` o abre
  `/api/themes`: cada tema inválido muestra su error.
- **Una diapositiva falta:** no aplica a ese usuario/año, o a tu tema le falta su plantilla (aviso en la
  consola del navegador).
- **No cambian los estilos:** recarga forzada (Ctrl+F5); el navegador puede tener cacheado tu CSS.


## Collage final (`collage`)

Si el tema trae la plantilla `slides/collage.html` (y `collage` en `slides`), el motor monta al final una tarjeta
con una miniatura de cada diapositiva. Solo tienes que dejar un contenedor `<div class="collage" data-wait="{{s.collage_wait}}"></div>`:
el motor lo rellena con `<img>` y fija dos variables CSS en él, `--cw` (ancho de cada miniatura) y `--cg` (hueco).
Estílalo como un `display:flex; flex-wrap:wrap; justify-content:center; gap:var(--cg)` con `img { width:var(--cw) }`
(mira `frecuencia/theme.css`). El botón de descarga guarda esa tarjeta entera. Los temas sin la plantilla simplemente no lo muestran.

## Iconos

Los botones usan Font Awesome Free (en `static/vendor/fa`, sin CDN): clases `fa fa-house`, `fa-expand`, `fa-mobile-screen`,
`fa-volume-high`, `fa-volume-xmark`, `fa-download`. No uses emojis en los textos del tema.

## Motores: `html` (por defecto) y `react`

Cada tema elige su tecnología con `"engine"` en `theme.json`. Si no lo pones, es `"html"` y todo lo
anterior de esta guía funciona igual. Un tema solo puede heredar (`extends`) de otro del **mismo** motor.

|                    | `html`                                   | `react` (+ motion)                              |
|--------------------|------------------------------------------|-------------------------------------------------|
| Diapositivas       | `slides/*.html` (plantillas) + Swiper    | un componente de React que las dibuja           |
| Código del tema    | `theme.js` (ganchos init/enter/leave)    | `entry`: bundle ESM ya compilado                |
| Transiciones       | `swiper` en el manifiesto                | las haces tú con `motion` (`AnimatePresence`…)  |
| Collage final      | sí, con la plantilla `collage`           | no (el tema puede hacer el suyo)                |
| Solo se usa        | `slides/`, `script`, `swiper`            | `entry`, `src/` (opcional, solo como fuente)    |

En los dos motores sirven igual `tokens`, `palette`, `css`, `fonts`, `strings`, `audio`, `slides`
(orden, `duration`, `opts`) y `wide`. El motor sigue poniendo la pantalla de inicio, la barra de progreso,
la música, el volumen, el teclado, los toques, el índice y la descarga a PNG; el tema solo dibuja las tarjetas.

### Estructura de un tema React

```
themes/mi-tema/
├── theme.json          "engine": "react", "entry": "dist/theme.js"
├── theme.css           opcional (se carga como en cualquier tema)
├── fonts/ assets/      igual que en html
├── src/index.jsx       tu código (opcional dentro del zip; se compila con theme-kit)
└── dist/theme.js       lo que se ejecuta: UN fichero ESM (o con trozos .js junto a él)
```

`react`, `react/jsx-runtime`, `react-dom/client` y `motion/react` **no se incluyen** en tu bundle: la página
los sirve (import map → `/vendor/react/`) y todos los temas comparten una sola copia. Cualquier otra
librería se compila dentro del bundle.

### Contrato del componente

`dist/theme.js` exporta por defecto un componente. Se vuelve a pintar con estas props cada vez que cambia la tarjeta:

| prop | qué es |
|------|--------|
| `data` | el JSON de `/api/wrapped` tal cual |
| `slides` | `[{ type, dur, clip, cover, x, s, opts }]`: lo mismo que reciben las plantillas html (`x.minutes`, `x.artists`…, ver «Tipos de diapositiva») |
| `index`, `direction` | tarjeta activa y sentido (`1` adelante, `-1` atrás) |
| `count`, `paused` | nº de tarjetas; `true` mientras se mantiene pulsado |
| `next()`, `prev()`, `goTo(i)` | navegación |
| `view` | `'wide'` o `'phone'` |
| `vars`, `strings` | `{year, user, next_year}` y los textos del tema |
| `theme` | `{ id, name, tokens, palette }` |
| `asset(ruta)` | URL de un fichero del tema (`asset('assets/fondo.jpg')`) |

Marca la tarjeta visible con `data-card="active"` (o `class="card"`): la descarga a PNG captura ese elemento.
Para que la exportación salga bien usa fondos con `background-image` y fuentes por `fonts` del manifiesto
(las mismas limitaciones de html2canvas que en los temas html: sin `filter`, `backdrop-filter`, `mix-blend-mode`, `clip-path`).
Para la carátula desenfocada usa `` `${slide.cover}/blur` `` en vez de `filter: blur`.

### Crear y compilar

```bash
python scripts/theme.py new mi-tema --engine react      # esqueleto en ./themes/mi-tema
cd theme-kit && npm install
npm run build -- ../themes/mi-tema                      # src/index.jsx → dist/theme.js
npm run build -- ../themes/mi-tema --watch              # recompila al guardar
python scripts/theme.py pack themes/mi-tema             # zip listo para importar (sin node_modules)
```

El tema incluido **Remix (React)** (`app/themes/remix/src/index.jsx`) es un ejemplo completo con
anillos concéntricos, fondos fluidos, texto que sube por palabras, carátulas que saltan, números que entran de lado y transición circular.
`npm run vendor` (en theme-kit) regenera `app/static/vendor/react/` si actualizas React o motion; en
producción no hace falta Node: el servidor solo sirve ficheros ya compilados.

### Validación e importación (cada motor, por separado)

- Ficheros permitidos: comunes (css, js, json, fuentes, imágenes, audio/vídeo) + `.html` solo en `html`
  y `.mjs .jsx .tsx .ts .map` solo en `react`. Una plantilla `.html` dentro de un tema React se rechaza.
- `react`: `entry` obligatorio, `.js`/`.mjs`, ≤ 3 MB, dentro de la carpeta; se revisan sus `import`:
  se rechazan URLs externas y rutas absolutas, y se avisa de paquetes sin compilar dentro del bundle.
  `script`, `swiper` y `slides/` se ignoran con un aviso.
- `html`: igual que siempre; `entry` se ignora con un aviso.
- Común: sin `..`, rutas absolutas ni enlaces simbólicos, máx. 500 ficheros y 30 MB, `node_modules` descartado,
  no se pisan los temas incluidos, clave `ADMIN_KEY`.
- Importante: un tema React es código que se ejecuta en el navegador de quien lo abre. Las comprobaciones
  evitan errores y fugas típicas, **no** convierten en seguro un tema hostil: importa solo temas de confianza.
