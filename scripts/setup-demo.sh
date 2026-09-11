#!/usr/bin/env bash
# ------------------------------------------------------------
# Bootstrap one-command RespiCare demo (Linux / macOS / WSL).
#
# Uso:
#   bash scripts/setup-demo.sh              # setup normal
#   bash scripts/setup-demo.sh --skip-seed  # sin poblar la BD
#   bash scripts/setup-demo.sh --reset      # baja el stack antes
# ------------------------------------------------------------
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
ROOT="$(cd -- "${SCRIPT_DIR}/.." &> /dev/null && pwd)"
ENV_FILE="${ROOT}/.env"
COMPOSE_FILE="${ROOT}/docker-compose.dev.yml"

SKIP_SEED=0
RESET=0
for arg in "$@"; do
  case "$arg" in
    --skip-seed) SKIP_SEED=1 ;;
    --reset)     RESET=1     ;;
  esac
done

C_CYAN=$'\033[0;36m'; C_GRN=$'\033[0;32m'; C_YEL=$'\033[0;33m'; C_RED=$'\033[0;31m'; C_RST=$'\033[0m'
step() { printf '\n%s==> %s%s\n' "$C_CYAN" "$1" "$C_RST"; }
ok()   { printf '    %sOK%s  %s\n' "$C_GRN" "$C_RST" "$1"; }
warn() { printf '    %s!!%s  %s\n' "$C_YEL" "$C_RST" "$1"; }
err()  { printf '    %sXX%s  %s\n' "$C_RED" "$C_RST" "$1"; }

new_secret() {
  # openssl rand -base64 rounds up to whole base64 groups; pass raw bytes.
  openssl rand -base64 "$1" | tr -d '\n'
}

# ── 1. Docker check ─────────────────────────────────────────────────────
step "Verificando Docker"
if ! docker info --format '{{.ServerVersion}}' >/dev/null 2>&1; then
  err "Docker no responde. Arrancalo y volve a ejecutar."
  exit 1
fi
ok "Docker responde"

# ── 2. Ensure .env ──────────────────────────────────────────────────────
step "Verificando .env"

# Declara defaults como pares "clave|valor_o_marcador".
# Los marcadores especiales:  __SECRET48__, __SECRET32__, __SECRET24__
DEFAULTS=(
  "NODE_ENV|development"
  "PORT|3001"
  "MONGO_USERNAME|admin"
  "MONGO_PASSWORD|__SECRET24__"
  "MONGO_DB|respicare_dev"
  "MONGO_HOST|mongodb"
  "MONGO_PORT|27017"
  "REDIS_URL|redis://redis:6379"
  "JWT_SECRET|__SECRET48__"
  "JWT_REFRESH_SECRET|__SECRET48__"
  "JWT_EXPIRE|7d"
  "JWT_REFRESH_EXPIRE|30d"
  "BCRYPT_ROUNDS|12"
  "FIELD_ENCRYPTION_KEY|__SECRET32__"
  "AI_SERVICE_URL|http://ai-services:8000"
  "PUSH_PROVIDER|none"
  "SMTP_HOST|mailhog"
  "SMTP_PORT|1025"
  "SMTP_USER|dev@respicare.local"
  "SMTP_PASSWORD|dev"
  "EMAIL_FROM|noreply@respicare.local"
  "REACT_APP_API_URL|http://localhost:3001/api"
  "REACT_APP_WS_URL|ws://localhost:3001"
  "CORS_ORIGINS|http://localhost:3000,http://localhost:8083,capacitor://localhost,https://localhost"
)

PLACEHOLDER_RE='change_me|changeme|your_|yourpassword|placeholder|xxxx|TODO|CHANGE-ME|change-this|change_this'

# Lee valores actuales
declare -A CURRENT=()
if [ -f "$ENV_FILE" ]; then
  while IFS='=' read -r key val; do
    [[ "$key" =~ ^[[:space:]]*# ]] && continue
    [[ -z "${key// /}" ]] && continue
    key="${key// /}"
    CURRENT["$key"]="$val"
  done < "$ENV_FILE"
fi

CHANGED=0
declare -a MISSING=()
for entry in "${DEFAULTS[@]}"; do
  IFS='|' read -r k dflt <<< "$entry"
  cur="${CURRENT[$k]:-}"
  if [ -z "$cur" ] || echo "$cur" | grep -qE "$PLACEHOLDER_RE"; then
    case "$dflt" in
      __SECRET48__) CURRENT[$k]=$(new_secret 48) ;;
      __SECRET32__) CURRENT[$k]=$(new_secret 32) ;;
      __SECRET24__) CURRENT[$k]=$(new_secret 24) ;;
      *)            CURRENT[$k]="$dflt" ;;
    esac
    MISSING+=("$k")
    CHANGED=1
  fi
done

# Rebuild MONGODB_URI si falta o si sus componentes se regeneraron
NEEDS_URI=0
[ -z "${CURRENT[MONGODB_URI]:-}" ] && NEEDS_URI=1
for k in MONGO_USERNAME MONGO_PASSWORD MONGO_DB; do
  for m in "${MISSING[@]}"; do
    [ "$m" = "$k" ] && NEEDS_URI=1
  done
done
if [ "$NEEDS_URI" -eq 1 ]; then
  CURRENT[MONGODB_URI]="mongodb://${CURRENT[MONGO_USERNAME]}:${CURRENT[MONGO_PASSWORD]}@mongodb:27017/${CURRENT[MONGO_DB]}?authSource=admin"
  MISSING+=("MONGODB_URI")
  CHANGED=1
fi

if [ "$CHANGED" -eq 1 ]; then
  warn "Rellenando/regenerando: ${MISSING[*]}"
  {
    echo "# RespiCare .env — generado por scripts/setup-demo.sh el $(date '+%Y-%m-%d %H:%M')"
    echo
    for k in $(echo "${!CURRENT[@]}" | tr ' ' '\n' | sort); do
      echo "${k}=${CURRENT[$k]}"
    done
  } > "$ENV_FILE"
  ok ".env actualizado (${#MISSING[@]} claves)"
else
  ok ".env ya tenia todas las variables requeridas"
fi

# ── 3. Compose up ───────────────────────────────────────────────────────
if [ "$RESET" -eq 1 ]; then
  step "Reset: docker compose down -v"
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down -v || true
fi

step "docker compose up -d --build (3-5 min la primera vez)"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build

# ── 4. Wait for healthy ─────────────────────────────────────────────────
step "Esperando servicios (max 180s)"
TARGETS=(
  "backend|http://localhost:3001/health"
  "ai-services|http://localhost:8000/api/v1/health"
  "web|http://localhost:3000"
)
declare -A READY=()
DEADLINE=$(( $(date +%s) + 180 ))
while [ $(date +%s) -lt $DEADLINE ] && [ ${#READY[@]} -lt ${#TARGETS[@]} ]; do
  for t in "${TARGETS[@]}"; do
    IFS='|' read -r name url <<< "$t"
    [ -n "${READY[$name]:-}" ] && continue
    if curl -sSf --max-time 3 -o /dev/null "$url" 2>/dev/null; then
      READY[$name]=1
      ok "$name responde ($url)"
    fi
  done
  [ ${#READY[@]} -lt ${#TARGETS[@]} ] && sleep 4
done

if [ ${#READY[@]} -lt ${#TARGETS[@]} ]; then
  PENDING=""
  for t in "${TARGETS[@]}"; do
    IFS='|' read -r name _ <<< "$t"
    [ -z "${READY[$name]:-}" ] && PENDING+=" $name"
  done
  warn "No respondieron a tiempo:$PENDING — puede seguir compilando en background."
fi

# ── 5. Seed demo data ───────────────────────────────────────────────────
if [ "$SKIP_SEED" -eq 0 ]; then
  step "Ejecutando seed:demo en el backend"
  if ! docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T backend npm run seed:demo; then
    warn "Seed fallo. Reintenta despues con:"
    echo "  docker compose -f docker-compose.dev.yml exec backend npm run seed:demo"
  else
    ok "Seed demo completado"
  fi
fi

# ── 6. Summary ──────────────────────────────────────────────────────────
cat <<EOF

============================================================
 RespiCare DEMO listo
============================================================

 URLs:
  Web frontend       : http://localhost:3000
  Backend API        : http://localhost:3001/api/v1
  Backend health     : http://localhost:3001/health
  AI services        : http://localhost:8000/api/v1/health
  Mongo Express      : http://localhost:8081  (admin / demo1234)
  Redis Commander    : http://localhost:8082
  MailHog (SMTP UI)  : http://localhost:8025

 Credenciales (todas usan la contrasena: demo1234):
  Admin    : admin.demo@respicare.com
  Doctor   : doctor.demo1@respicare.com
  Paciente : paciente.demo1@respicare.com

 Utiles:
  Ver logs           : docker compose -f docker-compose.dev.yml logs -f [service]
  Detener            : docker compose -f docker-compose.dev.yml down
  Reset completo     : bash scripts/setup-demo.sh --reset

EOF
