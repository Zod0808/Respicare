#!/bin/bash
# RespiCare — Pruebas de humo post-despliegue
# Uso: ./scripts/smoke-test-vm.sh [base_url]
#   base_url por defecto: http://localhost (ejecutar en la propia VM, detrás de nginx)
#
# Verifica: contenedores healthy, endpoints críticos accesibles vía nginx,
# y un flujo funcional mínimo (auth + AI service) sin requerir credenciales reales.
# Referenciado en Documentation/PLAN_DE_DESPLIEGUE.md, sección 7 (Fase 5. Verificación)
# y Anexo A (lista go/no-go).
set -uo pipefail

BASE_URL="${1:-http://localhost}"
FAILURES=0

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; FAILURES=$((FAILURES + 1)); }

echo "=== RespiCare — Smoke tests contra $BASE_URL ==="
echo ""

# ── 1. Contenedores healthy ───────────────────────
echo "-- Contenedores Docker --"
for name in respicare-mongodb respicare-redis respicare-backend respicare-ai respicare-nginx; do
  status="$(docker inspect --format='{{.State.Health.Status}}' "$name" 2>/dev/null || echo 'missing')"
  case "$status" in
    healthy) ok "$name: healthy" ;;
    missing) warn "$name: contenedor no encontrado o sin healthcheck" ;;
    *) fail "$name: $status" ;;
  esac
done

# ── 2. Endpoints de salud vía nginx ────────────────
echo ""
echo "-- Endpoints de salud (vía nginx) --"

check_http() {
  local label="$1" url="$2" expected="$3"
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$url" || echo '000')"
  if [ "$code" = "$expected" ]; then
    ok "$label → $code"
  else
    fail "$label → $code (esperado $expected) — $url"
  fi
}

check_http "nginx-health"       "$BASE_URL/nginx-health"        "200"
check_http "backend /health"    "$BASE_URL/health"              "200"
check_http "ai-services health" "$BASE_URL/ai/api/v1/health"    "200"
check_http "ai-services openapi (FastAPI app booteada)" "$BASE_URL/ai/openapi.json" "200"

# ── 3. Flujo funcional mínimo (sin credenciales reales) ──
echo ""
echo "-- Flujo funcional --"

# Login con credenciales inválidas: confirma que el endpoint, la validación
# y la conexión a MongoDB están vivos (esperamos 400/401/422, no 404/502/000).
login_code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 \
  -X POST "$BASE_URL/api/v1/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"smoke-test@example.com","password":"invalid"}' \
  || echo '000')"

case "$login_code" in
  400|401|422) ok "auth/login responde y valida credenciales ($login_code)" ;;
  000) fail "auth/login sin respuesta (timeout/conexión rechazada)" ;;
  404) fail "auth/login → 404 (ruta no montada / nginx mal configurado)" ;;
  502|503|504) fail "auth/login → $login_code (backend no disponible detrás de nginx)" ;;
  *) warn "auth/login → $login_code (código inesperado, revisar manualmente)" ;;
esac

# ── Resumen ────────────────────────────────────────
echo ""
echo "=== Resumen ==="
if [ "$FAILURES" -eq 0 ]; then
  ok "Todas las verificaciones pasaron — GO"
  exit 0
else
  fail "$FAILURES verificación(es) fallaron — NO-GO, revisar antes de habilitar producción"
  exit 1
fi
