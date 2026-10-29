# Cambios

## 1.1.0

- Login opcional con `AUTH_USER` y `AUTH_PASSWORD` en el `.env` (vacíos = sin login): pantalla de inicio de sesión,
  sesión de 30 días, bloqueo tras 5 intentos fallidos y botón «Cerrar sesión».
- La versión de la app se ve en `/api/health` y `/api/config`.
- La imagen se publica en GHCR con dos etiquetas: `latest` y la versión (p. ej. `1.1.0`).
- `docker-compose.yml` usa la imagen publicada (`docker compose pull`) y sigue pudiendo construirse en local (`--build`).

## 1.0.0

- Primera versión: Wrapped bajo demanda sobre la BD de Navidrome, temas html y React, tema «frecuencia» por defecto y «remix».
