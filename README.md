# Navidrome Wrapped

Resumen anual estilo "Wrapped" para tu Navidrome: top artistas y canciones, minutos escuchados,
descubrimientos, datos curiosos (madrugadas, modo bucle, hora favorita…) y un reproductor de
historias con música de fondo (clips de 30 s de tus canciones top) y exportación de cada tarjeta a PNG.

- **Backend:** FastAPI + SQLite (solo lectura) + ffmpeg para los clips.
- **Frontend:** HTML/CSS/JS + Swiper, sin build y sin CDN (todo va en `app/static/vendor`).
- **Temas:** el aspecto (barra de progreso, transiciones, fondo, tipografía, textos, orden de diapositivas) es
  un tema intercambiable que se importa como carpeta o zip. Ver [THEMES.md](THEMES.md).
- **Bajo demanda:** no hay procesos en segundo plano; calcula al abrir la página.

## Despliegue

```bash
cp .env.example .env      # y edítalo (ver abajo)
./deploy.sh               # primera vez y cada vez que cambies el código
# → http://IP-DEL-SERVIDOR:8100/
```

`deploy.sh` ejecuta, en este orden, lo de siempre:

```bash
sudo chmod -R 755 app/
docker compose down
docker compose up -d --build
```

y además deja `./themes` con el dueño `PUID:PGID` para que la web pueda instalar temas importados.

### Cómo se usa

- **Móvil:** el Wrapped ocupa toda la pantalla. Se toca a la derecha para avanzar, a la izquierda para
  retroceder y se mantiene pulsado para pausar.
- **Ordenador** (ventana de 1000 px o más y apaisada): con cualquiera de los temas incluidos la tarjeta ocupa **toda la
  ventana** con una maquetación apaisada propia (texto a la izquierda, discos, gráficas y carátulas a la
  derecha). Atajos: ← → o espacio para moverte, `H` vuelve al inicio, `M` silencio (pasa el ratón por el altavoz para bajar el volumen), `S` guarda la tarjeta como imagen (en un ordenador pregunta si la quieres apaisada o vertical)
  (en la vista ancha sale apaisada). La vista es automática: en un ordenador sale la ancha y en un
  móvil (o una ventana estrecha) el marco 9:16. También se salta a una diapositiva pulsando su tramo de la barra de progreso. Classic y Neón también
  tienen vista ancha; un tema sin maquetación apaisada usa siempre el marco 9:16.
- **Al abrir la página** cada persona escribe su usuario de Navidrome (no distingue mayúsculas; la
  página recuerda el último) y elige entre los años en que tiene reproducciones. No se lista a los demás
  usuarios. Un enlace directo sigue valiendo: `/?user=Alesis&year=2026`.
- **Importar temas:** botón «Importar tema (.zip)» en la pantalla de inicio. Pide la clave `ADMIN_KEY`;
  `./deploy.sh` la crea sola en `.env` la primera vez y la muestra por pantalla.

### Qué hay que ajustar en `.env`

| Variable | Qué poner |
|---|---|
| `NAVIDROME_NETWORK` | Red Docker de Navidrome: `docker inspect navidrome --format '{{json .NetworkSettings.Networks}}'` |
| `NAVIDROME_DATA_DIR` | Carpeta del host con `navidrome.db` (la que Navidrome monta en `/data`) |
| `MUSIC_DIR_HOST` | Carpeta del host con la música (la misma que Navidrome monta en `/music`) |
| `NAVIDROME_USER` | Opcional: usuario por defecto solo para la API; la página lo pide al entrar |
| `ADMIN_KEY` | Clave para importar temas `.zip` desde la web. Si está vacía, `./deploy.sh` genera una; vacía a mano = importar desactivado |
| `PUID` / `PGID` | Usuario que puede leer esas carpetas (`ls -ln /opt/navidrome/data`) |

Si Navidrome guarda los datos en un **volumen con nombre** en lugar de una carpeta, cambia en
`docker-compose.yml` la línea `${NAVIDROME_DATA_DIR}:/data:ro` por `navidrome_data:/data:ro` y declara
el volumen como `external: true` al final del fichero.

### Dos detalles importantes

**1. La música debe montarse en la misma ruta que usa Navidrome.** La tabla `media_file` guarda rutas
absolutas tal y como las ve el contenedor de Navidrome (normalmente `/music/...`). Aquí también se
monta en `/music`. Si tu Navidrome usa otra ruta (`ND_MUSICFOLDER`), monta tu carpeta en esa misma ruta
dentro de este contenedor.

**2. Base de datos `:ro` con SQLite en modo WAL.** Navidrome usa WAL, y abrir una BD WAL en un volumen
montado como solo lectura puede fallar (`unable to open database file`). Por eso `app/db.py` prueba
primero la apertura directa (`mode=ro`) y, si falla, copia `navidrome.db` y `navidrome.db-wal` a
`/cache/snapshot` y consulta la copia. La copia se renueva cuando cambia la BD (máximo cada
`SNAPSHOT_TTL` segundos, 60 por defecto). Lo que usa se ve en `/api/health` → `db_access`.
Puedes forzarlo con `DB_ACCESS=direct` o `DB_ACCESS=snapshot`.

### Seguridad

El contenedor corre sin root, con el sistema de ficheros en solo lectura (excepto `/cache` y `/tmp`),
sin capabilities y con `no-new-privileges`. No hay autenticación propia: cualquiera que alcance el
puerto puede pedir el Wrapped de cualquier usuario. Si lo expones fuera de casa, ponlo detrás de tu
proxy inverso con login o quita el `ports:` y accede solo por la red de Navidrome.

La importación de temas está desactivada salvo que definas `ADMIN_KEY`, porque un tema puede ejecutar
JavaScript en el navegador de quien lo abra. Los zips se validan (rutas, enlaces simbólicos, tamaño,
extensiones) y no pueden sustituir a los temas incluidos.

## API

| Ruta | Descripción |
|---|---|
| `GET /api/health` | Estado, modo (`scrobbles` / `annotation`) y tipo de acceso a la BD |
| `GET /api/users` | Usuarios de Navidrome |
| `GET /api/years?user=` | Años con reproducciones de un usuario (y su nombre exacto) |
| `GET /api/config` | Año por defecto y si la importación de temas está activa |
| `POST /api/themes/import` | Instala un tema desde un `.zip` (cuerpo `application/zip`, cabecera `X-Admin-Key`; `?force=true` sustituye) |
| `GET /api/wrapped?user=&year=` | Todas las métricas en JSON |
| `GET /api/themes` · `GET /api/themes/{id}` | Temas instalados / un tema resuelto (con herencia) |
| `GET /themes/{id}/{fichero}` | Ficheros de un tema (CSS, fuentes, imágenes) |
| `GET /api/clip/{track_id}?seconds=30` | Clip MP3 (cacheado en `/cache/clips`) |
| `GET /api/cover/{track_id}` | Carátula (cacheada en `/cache/covers`) |
| `GET /api/cover/{track_id}/blur` | Malla de color desenfocada de la carátula (cacheada en `/cache/blur`) |

Sin la tabla `scrobbles` (Navidrome antiguo) cae a `annotation`: top canciones y minutos aproximados,
sin horas ni bucles.

## Temas (un diseño distinto cada año)

```bash
python scripts/theme.py new 2027 --extends frecuencia   # crea themes/2027/ (hereda de un tema incluido)
python scripts/theme.py install tema.zip          # importa un tema de otra persona o de otra máquina
python scripts/theme.py pack themes/2027          # lo empaqueta para guardarlo o compartirlo
```

`./themes` está montado en el contenedor, así que **no hay que reconstruir ni reiniciar**: recarga la página.
El tema se elige con `?theme=2027`, con `WRAPPED_THEME` o, si existe un tema con el nombre del año pedido
(`themes/2027` para `year=2027`), se usa solo. Incluidos: `frecuencia` (por defecto) y `remix` (React + motion). Todo el detalle
(manifiesto, plantillas, CSS, hooks, transiciones) está en [THEMES.md](THEMES.md).

## Probar sin tu servidor

```bash
pip install -r requirements.txt
python scripts/make_demo.py --out demo          # BD + música de mentira (necesita ffmpeg)
DB_PATH=demo/navidrome.db MUSIC_DIR=demo/music CACHE_DIR=demo/cache \
NAVIDROME_USER=demo WRAPPED_YEAR=2026 uvicorn app.main:app --reload
# → http://localhost:8000
```

## Estructura

```
app/
  main.py      rutas FastAPI
  config.py    variables de entorno
  db.py        conexión a la BD (directa o snapshot)
  queries.py   SQL
  stats.py     métricas y datos curiosos
  audio.py     clips y carátulas con ffmpeg
  themes.py    carga, herencia y validación de temas
  themes/      temas incluidos (frecuencia, remix)
  static/      index.html, css/base.css, js/ (motor), vendor/ (Swiper, html2canvas)
themes/        tus temas (montado en /themes)
scripts/       make_demo.py (datos de prueba) · theme.py (new/validate/pack/install)
Dockerfile · docker-compose.yml · .env.example · THEMES.md
```

## Problemas habituales

- **`fichero no accesible` en `/api/clip`:** la música no está montada en la misma ruta que ve Navidrome.
- **`unable to open database file`:** pon `DB_ACCESS=snapshot`, o comprueba que `PUID`/`PGID` pueden leer la carpeta de datos.
- **Un tema no carga:** `python scripts/theme.py validate themes/<id>` o mira `/api/themes` (cada tema inválido muestra su error).
- **Sin sonido al abrir:** el navegador exige un toque; por eso hay pantalla de inicio con el botón "Empezar".
- **«No se puede escribir en /themes» al importar un tema:** `sudo chown -R PUID:PGID themes` (lo hace `deploy.sh`).
- **"Sin reproducciones de X en 2026":** comprueba `?user=` (distingue mayúsculas) y `?year=`.

## Temas con React + motion (opcional)

Los temas pueden elegir motor en `theme.json`: `"engine": "html"` (por defecto, plantillas + CSS) o
`"engine": "react"` (un componente de React con la librería `motion`, todo código abierto).
El tema React «Remix» viene incluido: ábrelo con `/?theme=remix`. Guía completa en `THEMES.md` (sección «Motores») y herramientas de
compilación en `theme-kit/`. Para desplegar no necesitas Node.


## Login opcional

Para que la web pida usuario y contraseña, pon en `.env`:

    AUTH_USER=alesis
    AUTH_PASSWORD=una-contraseña-larga

y ejecuta `./deploy.sh`. Con los dos vacíos (o sin esas líneas) no hay login. Si defines solo uno, el servidor no arranca
y te lo dice. La sesión dura 30 días (cookie firmada y solo HTTP); al cambiar el usuario o la contraseña se cierran todas.
Tras 5 intentos fallidos desde una misma IP hay que esperar 5 minutos. En la pantalla de inicio aparece «Cerrar sesión».
Protege toda la web (también la API, las carátulas y los clips). Si la expones a internet, ponla detrás de HTTPS; y si la
contraseña lleva `$`, escríbela como `$$` en el `.env` (lo exige Docker Compose).


## Actualizar y versiones

La versión está en `app/version.py` (se ve en `/api/health`). Cada `push` a `main` publica en GHCR la imagen
`ghcr.io/alesis124/navidrome-wrapped` con las etiquetas `latest` y la versión (por ejemplo `1.1.0`). Para publicar una nueva,
sube el número en `app/version.py` y anótalo en `CHANGELOG.md`.

    docker compose pull && docker compose up -d      # actualizar a la última imagen publicada
    ./deploy.sh                                      # o construirla en el servidor desde el código

Para que otras personas puedan hacer `pull`, el paquete tiene que ser público (GitHub → tu perfil → Packages →
navidrome-wrapped → Package settings → Change visibility).
