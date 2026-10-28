# Frecuencia

Tema para Navidrome Wrapped. Tu año como una señal.

- **Los colores salen de cada carátula.** `theme.js` extrae el color dominante y genera un fondo
  desenfocado por diapositiva; el acento, la barra de progreso y el espectro cambian con ella.
- **Respira con la música.** Un analizador de audio mueve el espectro inferior y las variables
  `--lvl` (volumen) y `--beat` (golpe de bombo) de la diapositiva activa. Sigue vivo aunque silencies.
- **Onda de transición.** Cada cambio lanza un anillo y un destello desde el borde inferior,
  mientras la diapositiva anterior se eleva y la nueva sube desde abajo.
- **Tipografía:** Archivo condensada negra para los números y títulos, Archivo normal para el texto
  (instancias estáticas de Archivo Variable, licencia OFL, ver `fonts/LICENSE-Archivo-OFL.txt`).

## Uso

Desde la web (con `ADMIN_KEY` en `.env`): botón **Importar tema (.zip)** → sube `frecuencia.zip` → «Usarlo ahora».

O por consola:

    python scripts/theme.py install frecuencia.zip
    # abrir:  /?user=TU_USUARIO&year=2026&theme=frecuencia

Para que sea el tema del año sin usar `?theme=`, renombra la carpeta a `themes/2026`
(o pon `WRAPPED_THEME=frecuencia` en `.env`).

## Dos vistas en ordenador

- **Vista ancha** (ventana ≥ 1000 px y apaisada; `"wide": true` + `wide.css`): la tarjeta ocupa toda la ventana.
  Texto a la izquierda y, a la derecha, el «objeto» de cada diapositiva (mosaico de portadas, listas, disco,
  reloj radial, luna…). El sintonizador de la intro cruza todo el ancho. Es automática: no hay botón.
- **Vista móvil** (ventana estrecha o móvil): marco 9:16. En escritorio estrecho aparecen los paneles laterales
  del motor (índice a la izquierda; sesión, opciones y atajos a la derecha), con un resplandor ambiente que late
  con los graves (`#ambient`). Los nombres del índice salen de `strings.nav_*`.

Todas las medidas usan `--u` (1 u = 1 % del marco; en vista ancha, 1 % de un fotograma 16:9). Los paneles están
fuera del marco, así que ahí se usa `rem`/`px`.

El **collage** final lo monta el motor (una miniatura de cada diapositiva); el tema solo pone el titular y los estilos.

## Diapositivas con datos del historial

- **La carrera del año** (`race`): los 5 artistas más escuchados compiten mes a mes con sus reproducciones
  acumuladas **reales** (no es una coreografía): las barras crecen, se adelantan unos a otros, y el mes avanza
  en una línea de 12 marcas. La música cambia al artista que va en cabeza (con un mínimo de 1,6 s entre cambios)
  y termina sonando el ganador del año. Se reinicia cada vez que entras; se detiene al mantener pulsado.
  Ritmo: cada mes pesa 1, el primero (la salida) 1,6 y los meses en que **cambia el líder** pesan 3,5, para que dé tiempo
  a ver el adelantamiento y a oír la canción del nuevo líder (`RACE_MS` = duración total, `RACE_EVENT` = peso extra).
  Necesita historial (no sale en el modo sin historial).
- **La edad musical** (`age`): estimación «para pasar el rato» (mediana del año de lanzamiento + 18) con las
  décadas como un ecualizador. Necesita año de lanzamiento en ≥ 10 reproducciones y ≥ 10 % del año.

Ninguna de las dos está en la secuencia por defecto del motor: se activan listándolas en `slides` (ya están).

La diapositiva «Los que más sonaron» (`top-artists`) **no está** en la secuencia: la carrera ya termina mostrando
el orden final, y verla antes sería un spoiler. Si algún día la quieres, añade `{ "type": "top-artists" }` a `slides`
(mejor después de la carrera). Ojo: sin historial no hay carrera y, entonces, el tema no enseña los artistas.

## Qué tocar

| Quiero… | Dónde |
|---|---|
| Cambiar textos (también inicio e índice) | `theme.json` → `strings` |
| Orden y duración de diapositivas | `theme.json` → `slides` |
| Color de acento si una carátula es gris | `theme.js` → `colors()` (ámbar por defecto) |
| Más o menos sensibilidad al ritmo | `theme.js` → `frame()` (`1.16` = umbral de golpe, `1.7` = curva de volumen) |
| Brillo del resplandor de escritorio | `theme.css` → `#ambient .amb` (`brightness`) |
| Transición entre diapositivas | `theme.json` → `swiper` |
| Maquetación de la vista ancha | `wide.css` |
| Duración y ritmo de la carrera | `theme.js` → `RACE_MS`, `RACE_EVENT` (y `duration` de `race` en `theme.json`, ≥ `RACE_MS` + 4 s) |
| Tamaño de un título | `theme.css` → `--fs` en `.hero`, `.mega`, `.title` (se reduce solo si no cabe) |

## Notas técnicas

- Pensado para que la imagen guardada (`html2canvas`) sea idéntica a la pantalla: las capas de fondo
  (`.bgblur`, `.veil`), las estrellas y la luna son elementos reales (sin sombras sobre elementos transparentes,
  sin sombras `inset`, sin SVG) y los parpadeos infinitos animan el color, no la opacidad. El desenfoque es propio (canvas), más oscuro que
  `--cover-blur` del servidor, que está pensado para temas claros; si el canvas falla se usa el del servidor.
- Las fuentes se declaran solo en `theme.json`: el motor las inyecta como `@font-face`.
- Los textos grandes se ajustan al ancho (`data-fit`). Se vuelven a medir cuando llega la fuente, al cambiar el tamaño del marco
  (rotar, plegar el móvil, emulador del navegador), al cambiar de vista y cada vez que se entra en una diapositiva.
- Dispositivos probados: iPhone SE (375×667), iPhone plegable «Duo» (466×626, 626×890 y 890×626), Pixel, escritorio.
  El Duo apaisado (890×626) solo entra en vista ancha si el motor baja el umbral de `min-width: 1000px` (ver `ui.js`).
- **Deslizar hacia abajo para volver al inicio** (solo táctil, como cerrar una historia de Instagram; `setupPull` en `theme.js`):
  la tarjeta sigue al dedo (se encoge y se redondea), detrás aparece un anillo que se llena y, al pasar el umbral
  (20 % de la altura, mínimo 110 px, o un gesto rápido), cambia de estado (vibra, borde ámbar, «Suelta para ir al inicio»).
  Si sueltas antes vuelve con un rebote; si sueltas después sale hacia abajo y pulsa el botón de inicio del motor.
  No toca el motor: cancela el «mantener = pausa» con un `pointercancel` sintético y bloquea el `pointerup` para que no cuente
  como toque. No se activa con gestos horizontales, hacia arriba, sobre botones, con zoom ni con dos dedos. Textos: `pull_hint`, `pull_release`.
- Mantener pulsado (o el zoom con pellizco) congela también las animaciones de la tarjeta y el reloj de la carrera.
- En táctil no se usan desenfoques ni mezclas a pantalla completa (el motor las quitó porque parpadeaban).
- No uses `.lead` para clases propias de componentes (ya es el estilo del texto de cabecera): el líder de la carrera es `.lane.first`.
- La carrera avisa al collage (`window.__slideAt`) para que no capture la diapositiva a medias.
- Respeta `prefers-reduced-motion`.
