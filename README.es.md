[English 🇬🇧](README.md) | [Deutsch 🇩🇪](README.de.md) | [Español 🇪🇸](README.es.md) | [Português 🇵🇹](README.pt.md) | [Français 🇫🇷](README.fr.md) | [Italiano 🇮🇹](README.it.md) | [Nederlands 🇳🇱](README.nl.md) | [Русский 🇷🇺](README.ru.md) | [中文 🇨🇳](README.zh.md) | [日本語 🇯🇵](README.ja.md) | [한국어 🇰🇷](README.ko.md) | [العربية 🇸🇦](README.ar.md)

> **Aviso de traducción:** Las traducciones de este proyecto se hicieron con IA y pueden contener errores.

# Navidrome Wrapped

En modo SQLite local, un resumen anual estilo "Wrapped" para Navidrome: artistas y canciones favoritas,
minutos escuchados, descubrimientos, datos curiosos y un reproductor de historias con exportación PNG.
El modo API ofrece en su lugar un resumen limitado de la biblioteca actual.

- **Backend:** FastAPI con SQLite local de solo lectura (modo existente) o un modo API limitado de Navidrome compatible con Subsonic.
- **Frontend:** HTML/CSS/JS + Swiper, sin build y sin CDN (todo va en `app/static/vendor`).
- **Temas:** el aspecto (barra de progreso, transiciones, fondo, tipografía, textos, orden de diapositivas) es
  un tema intercambiable que se importa como carpeta o zip. Ver [THEMES.md](THEMES.md).
- **Bajo demanda:** no hay procesos en segundo plano; las estadísticas locales se calculan al abrir la página.
- **Accesibilidad:** pausa con teclado, foco visible y avisos de diapositiva para lectores de pantalla. No se ha realizado una auditoría formal ni se garantiza la conformidad con WCAG.

## Vista previa

Así se reproduce el Wrapped y se ven sus primeras diapositivas:

![Demostración del Wrapped](res/tuto.gif)

La pantalla de inicio de sesión es opcional; se activa con `AUTH_USER` y `AUTH_PASSWORD`:

![Pantalla de inicio de sesión](res/login.png)

## Despliegue

La aplicación se ejecuta en un contenedor Linux. En Windows 64 bits se puede desplegar con Docker Desktop y el backend WSL 2, siguiendo estos pasos desde WSL 2; no hay un ejecutable nativo para Windows ni soporte para Windows de 32 bits (x86). x86-64, también llamado x64 o amd64, significa 64 bits.

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
- **Controles accesibles:** enfoca la historia y usa ←/→ para navegar, o el botón Pausar/Reanudar / `P`; los cambios de diapositiva se anuncian a lectores de pantalla. Se respeta la preferencia de movimiento reducido.
- **Ordenador** (ventana de 1000 px o más y apaisada): con cualquiera de los temas incluidos la tarjeta ocupa **toda la
  ventana** con una maquetación apaisada propia (texto a la izquierda, discos, gráficas y carátulas a la
  derecha). Atajos: ← → o espacio para moverte, `H` vuelve al inicio, `M` silencio (pasa el ratón por el altavoz para bajar el volumen), `S` guarda la tarjeta como imagen (en un ordenador pregunta si la quieres apaisada o vertical)
  (en la vista ancha sale apaisada). La vista es automática: en un ordenador sale la ancha y en un
  móvil (o una ventana estrecha) el marco 9:16. También se salta a una diapositiva pulsando su tramo de la barra de progreso. Classic y Neón también
  tienen vista ancha; un tema sin maquetación apaisada usa siempre el marco 9:16.
- **Modo local:** al abrir la página cada persona escribe su usuario de Navidrome (no distingue mayúsculas; la
  página recuerda el último) y elige entre los años en que tiene reproducciones. No se lista a los demás
  usuarios. Un enlace directo sigue valiendo: `/?user=Alesis&year=2026`. **Modo API:** cada visitante introduce
  sus credenciales de Navidrome; no hay selector ni resumen anual.
- **Importar temas:** botón «Importar tema (.zip)» en la pantalla de inicio. Pide la clave `ADMIN_KEY`;
  `./deploy.sh` la crea sola en `.env` la primera vez y la muestra por pantalla.

### Qué hay que ajustar en `.env`

| Variable | Qué poner |
|---|---|
| `DATA_SOURCE` | `local` (modo SQLite predeterminado) o `api` (API compatible con Subsonic de Navidrome) |
| `NAVIDROME_URL` | URL base HTTPS pública opcional. Si queda vacía en modo API, cada visitante escribe una. Debe resolver solo a IP públicas; se bloquean localhost, redes privadas y direcciones de enlace local |
| `FORWARDED_ALLOW_IPS` | IP/CIDR del proxy inverso de confianza para Uvicorn. Configúrala si HTTPS termina en el proxy, para que la aplicación reconozca el esquema HTTPS reenviado. No uses `*` si el puerto de la aplicación es accesible directamente |
| `NAVIDROME_NETWORK` | Solo modo local: red Docker de Navidrome: `docker inspect navidrome --format '{{json .NetworkSettings.Networks}}'` |
| `NAVIDROME_DATA_DIR` | Solo modo local: carpeta del host con `navidrome.db` (la que Navidrome monta en `/data`) |
| `MUSIC_DIR_HOST` | Solo modo local: carpeta del host con la música (la misma que Navidrome monta en `/music`) |
| `WRAPPED_LANGUAGE` | Idioma: `en` (inglés, predeterminado), `de` (alemán), `es` (español), `pt` (portugués), `fr` (francés), `it` (italiano), `nl` (neerlandés), `ru` (ruso), `zh` (chino), `ja` (japonés), `ko` (coreano) o `ar` (árabe) |
| `NAVIDROME_USER` | Solo modo local: usuario predeterminado opcional para las solicitudes JSON |
| `ADMIN_KEY` | Clave para importar temas `.zip` desde la web. Si está vacía, `./deploy.sh` genera una; vacía a mano = importar desactivado |
| `PUID` / `PGID` | Usuario que puede leer esas carpetas (`ls -ln /opt/navidrome/data`) |

Si Navidrome guarda los datos en un **volumen con nombre** en lugar de una carpeta, cambia en
`docker-compose.yml` la línea `${NAVIDROME_DATA_DIR}:/data:ro` por `navidrome_data:/data:ro` y declara
el volumen como `external: true` al final del fichero.

Pon el código de idioma que quieras en `WRAPPED_LANGUAGE` dentro de `.env` y ejecuta `./deploy.sh`.
La interfaz, el login, los temas incluidos, las fechas y los números usarán ese idioma. Los temas personalizados mantienen sus textos originales salvo que incluyan traducciones para el idioma elegido.
Cada visitante puede elegir el idioma en la pantalla inicial, antes de abrir el Wrapped; la elección se recuerda en ese navegador y no cambia el idioma predeterminado del servidor.

### Despliegue solo con API (sin montar SQLite ni la música)

El `docker-compose.yml` y `./deploy.sh` existentes conservan el modo SQLite local y sus montajes de base de datos y música. Para ejecutar la aplicación sin esos montajes, configura `DATA_SOURCE=api` (o déjalo vacío) y usa este Compose:

```bash
docker compose -f docker-compose.api.yml pull
docker compose -f docker-compose.api.yml up -d --no-build
```

Si no tienes el Compose en el directorio, puedes leerlo desde GitHub con `curl` y pasarlo directamente a Docker: así se descarga la imagen publicada, no el código fuente.

```bash
curl -fsSL https://raw.githubusercontent.com/Alesis124/navidrome-wrapped/main/docker-compose.api.yml | docker compose -f - pull
curl -fsSL https://raw.githubusercontent.com/Alesis124/navidrome-wrapped/main/docker-compose.api.yml | docker compose -f - up -d --no-build
```

Define `NAVIDROME_URL` para usar un servidor público fijo; si está vacía, cada visitante escribe una URL pública en la pantalla de configuración. Cada persona se conecta con su usuario y contraseña de Navidrome o con un token y salt de Subsonic. Las credenciales se envían en el cuerpo de la solicitud a este servidor Wrapped, se mantienen solo en la memoria del proceso durante la sesión y se usan para llamar directamente a la API Subsonic de Navidrome. El navegador recibe únicamente una cookie de sesión opaca y `HttpOnly`: las credenciales no aparecen en el almacenamiento del navegador, en la URL de la página ni en el JavaScript de los temas. Las sesiones caducan tras ocho horas y se pierden al reiniciar el servidor. No ejecutes varios procesos worker o réplicas: las sesiones solo existen en la memoria del proceso.

El Compose de API monta `./themes` y pasa `ADMIN_KEY`, por lo que están disponibles el selector y la importación de temas ZIP. Para importar, la carpeta `themes` del host debe permitir escritura al usuario configurado en `PUID`/`PGID`. En este modo, los temas solo pueden cambiar colores, fuentes y CSS; el código JavaScript y React nunca se sirve como contenido ejecutable.

El modo API solo muestra metadatos actuales de las carpetas de música y una lista breve de álbumes recientes. No son datos de un año concreto: la [API compatible con Subsonic](https://www.navidrome.org/docs/developers/subsonic-api/) no ofrece historial por reproducción, por lo que este modo no crea gráficas anuales ni estadísticas inventadas. Las carátulas pasan por el servidor y no se guardan en la caché de la aplicación. El modo API no monta ni escribe una caché persistente.

Las URLs configuradas o introducidas deben usar HTTPS y resolver exclusivamente a IP públicas. La propia web Wrapped también debe abrirse con HTTPS para enviar las credenciales; el modo API rechaza los envíos por HTTP sin cifrar. Si HTTPS termina en un proxy inverso, configura `FORWARDED_ALLOW_IPS` con la IP o red del proxy tal como se ve desde este contenedor, y asegúrate de que envía `X-Forwarded-Proto: https`. Uvicorn solo confía en cabeceras reenviadas desde esas direcciones. No uses `*` si el puerto de la aplicación es accesible directamente. Se rechazan localhost, IP privadas, direcciones de enlace local y resultados DNS que mezclen IP públicas y privadas. El backend se conecta directamente a la IP validada, no usa proxies definidos por el entorno y no sigue redirecciones. Este modo está pensado para URLs públicas de Internet; no permite conectar a Navidrome en una dirección privada o de la red local.

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
sin capabilities y con `no-new-privileges`. En modo local, cualquiera que alcance el puerto puede pedir el
Wrapped de cualquier usuario, salvo que actives `AUTH_USER`/`AUTH_PASSWORD` o un proxy inverso con login.
En modo API, cada visitante debe introducir sus propias credenciales de Navidrome.

La aplicación no envía datos a quienes mantienen el proyecto. Las solicitudes y cookies sí pasan por el navegador y por el servidor donde despliegas la aplicación. El modo local conserva el comportamiento existente de preferencias/nombre de usuario en el navegador y caché en disco. En modo API, las credenciales o el token de Navidrome se guardan solo en la memoria del proceso, pero el navegador conserva una cookie opaca de sesión y mantiene temporalmente los datos del formulario/solicitud en memoria; las preferencias de idioma pueden permanecer en el almacenamiento del navegador. Las respuestas API y carátulas usan `no-store`, y el modo API no escribe una caché de la aplicación en disco. Usa HTTPS y controles de acceso si expones el Wrapped a Internet.

La importación de temas está desactivada salvo que definas `ADMIN_KEY`. Los zips se validan (rutas,
enlaces simbólicos, tamaño, extensiones) y no pueden sustituir a los temas incluidos. En modo API,
los temas importados solo pueden cambiar colores, fuentes y CSS; su código JavaScript/React no se
envía ni ejecuta en el navegador.

## API

| Ruta | Descripción |
|---|---|
| `GET /api/health` | Estado, modo de origen de datos y tipo de acceso a la base local cuando corresponda |
| `POST /api/source/session` · `GET /api/source/summary` · `POST /api/source/logout` | Sesión de visitante y resumen limitado de biblioteca en modo API |
| `GET /api/source/covers/{cover_id}` | Proxy de carátulas en modo API (requiere cookie de sesión; sin caché) |
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
  navidrome_api.py  sesiones Subsonic seguras y solo en memoria
  db.py        conexión a la BD (directa o snapshot)
  queries.py   SQL
  stats.py     métricas y datos curiosos
  audio.py     clips y carátulas con ffmpeg
  themes.py    carga, herencia y validación de temas
  themes/      temas incluidos (frecuencia, remix)
  static/      index.html, css/base.css, js/ (motor), vendor/ (Swiper, html2canvas)
themes/        tus temas (montado en /themes)
scripts/       make_demo.py (datos de prueba) · theme.py (new/validate/pack/install)
Dockerfile · docker-compose.yml · docker-compose.api.yml · .env.example · THEMES.md
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
