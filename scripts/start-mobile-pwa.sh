#!/usr/bin/env bash
# Arranca la app mobile de RespiCare como PWA en el navegador (http://localhost:8083).
# Requiere que setup-demo.sh ya haya levantado backend y AI.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$ROOT/mobile/medical-app"

step() { printf "\n==> %s\n" "$1"; }
ok()   { printf "    OK  %s\n" "$1"; }
err()  { printf "    XX  %s\n" "$1" >&2; }

step "Verificando Node.js"
if ! command -v node >/dev/null 2>&1; then
  err "Node.js no esta instalado o no esta en PATH."
  exit 1
fi
ok "$(node --version)"

step "Verificando dependencias de mobile/medical-app"
if [ ! -d "$APP_DIR/node_modules" ]; then
  echo "    Instalando (puede tardar 2-4 min)..."
  (cd "$APP_DIR" && npm install --no-audit --no-fund)
fi
ok "node_modules listo"

step "Verificando .env.demo"
if [ ! -f "$APP_DIR/.env.demo" ]; then
  err "Falta $APP_DIR/.env.demo. Recrealo desde .env.example apuntando a localhost."
  exit 1
fi
ok ".env.demo presente"

cat <<EOF

============================================================
 Mobile PWA arrancando en http://localhost:8083
 (Ctrl+C para detener. Backend/AI deben estar en localhost)
============================================================

EOF

cd "$APP_DIR"
exec npm run demo
