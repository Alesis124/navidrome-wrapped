#!/usr/bin/env bash
# Actualiza Navidrome Wrapped en la Raspberry tras copiar el código nuevo:
#   ./deploy.sh      (o:  bash deploy.sh)
set -euo pipefail
cd "$(dirname "$0")"

sudo chmod -R 755 app/

# ./themes lo escribe el contenedor al importar temas desde la web: que sea de PUID:PGID (.env)
env_get() { [ -f .env ] && grep -E "^$1=" .env | tail -n1 | cut -d= -f2- | tr -d "\"' " || true; }
PUID_V="$(env_get PUID)"; PGID_V="$(env_get PGID)"
mkdir -p themes
sudo chown -R "${PUID_V:-1000}:${PGID_V:-1000}" themes

# Clave para importar temas desde la web: si no hay en .env, se crea una al azar
if [ -z "$(env_get ADMIN_KEY)" ]; then
  KEY="$(head -c 24 /dev/urandom | base64 | tr -d '/+=\n' | head -c 24)"
  touch .env
  if grep -qE '^ADMIN_KEY=' .env; then sed -i "s|^ADMIN_KEY=.*|ADMIN_KEY=${KEY}|" .env; else printf '\nADMIN_KEY=%s\n' "$KEY" >> .env; fi
  echo "→ Clave para importar temas (guardada en .env como ADMIN_KEY): ${KEY}"
fi

docker compose down
docker compose up -d --build
docker compose ps
