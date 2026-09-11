#!/usr/bin/env bash
# Valida que ./.env tenga las variables necesarias para levantar el stack con
# docker compose. Corre desde la raíz del repo:  bash scripts/validate-env.sh
#
# Salida:
#   0 → todo OK (puede tener WARN sobre opcionales)
#   1 → falta al menos una variable REQUIRED o tiene valor placeholder

set -u

ENV_FILE="${ENV_FILE:-./.env}"

RED=$'\033[0;31m'
YEL=$'\033[0;33m'
GRN=$'\033[0;32m'
DIM=$'\033[2m'
RST=$'\033[0m'

fail=0
warn=0

REQUIRED=(
  NODE_ENV
  PORT
  MONGO_USERNAME
  MONGO_PASSWORD
  MONGO_DB
  MONGODB_URI
  REDIS_URL
  JWT_SECRET
  JWT_EXPIRE
  BCRYPT_ROUNDS
  AI_SERVICE_URL
  FIELD_ENCRYPTION_KEY
)

RECOMMENDED=(
  OPENAI_API_KEY
  SMTP_HOST
  SMTP_USER
  SMTP_PASSWORD
  EMAIL_FROM
  REACT_APP_API_URL
  REACT_APP_WS_URL
  CORS_ORIGINS
)

PLACEHOLDER_PATTERNS='change_me|changeme|your_|yourpassword|placeholder|xxxx|TODO|CHANGE-ME'

if [ ! -f "$ENV_FILE" ]; then
  printf "%s✗%s No existe %s\n" "$RED" "$RST" "$ENV_FILE"
  printf "   Copiá backend/.env.example a ./.env y rellená los valores.\n"
  exit 1
fi

# Carga sin exportar al shell padre: parseamos línea por línea.
get_val() {
  # $1 = key name; imprime valor (sin comillas) o vacío
  awk -F= -v k="$1" '
    /^[[:space:]]*#/ { next }
    /^[[:space:]]*$/ { next }
    {
      key=$1
      sub(/^[[:space:]]+/, "", key); sub(/[[:space:]]+$/, "", key)
      if (key == k) {
        val=$0
        sub(/^[^=]*=/, "", val)
        gsub(/^["'\'']|["'\'']$/, "", val)
        print val
        exit
      }
    }' "$ENV_FILE"
}

check_var() {
  local key="$1" level="$2" val
  val="$(get_val "$key")"

  if [ -z "$val" ]; then
    if [ "$level" = "required" ]; then
      printf "%s✗%s %-28s (FALTA o vacía)\n" "$RED" "$RST" "$key"
      fail=$((fail+1))
    else
      printf "%s!%s %-28s %s(recomendada, sin valor)%s\n" "$YEL" "$RST" "$key" "$DIM" "$RST"
      warn=$((warn+1))
    fi
    return
  fi

  if printf '%s' "$val" | grep -qE "$PLACEHOLDER_PATTERNS"; then
    if [ "$level" = "required" ]; then
      printf "%s✗%s %-28s (valor placeholder: %s)\n" "$RED" "$RST" "$key" "$val"
      fail=$((fail+1))
    else
      printf "%s!%s %-28s %s(valor placeholder: %s)%s\n" "$YEL" "$RST" "$key" "$DIM" "$val" "$RST"
      warn=$((warn+1))
    fi
    return
  fi

  printf "%s✓%s %-28s %sok%s\n" "$GRN" "$RST" "$key" "$DIM" "$RST"
}

check_strength() {
  # JWT_SECRET / FIELD_ENCRYPTION_KEY deberían ser >= 32 chars
  local key="$1" min="$2" val
  val="$(get_val "$key")"
  [ -z "$val" ] && return
  local len=${#val}
  if [ "$len" -lt "$min" ]; then
    printf "%s!%s %-28s %s(débil: %s chars, mínimo %s)%s\n" \
      "$YEL" "$RST" "$key" "$DIM" "$len" "$min" "$RST"
    warn=$((warn+1))
  fi
}

printf "\n%sValidando %s%s\n\n" "$DIM" "$ENV_FILE" "$RST"

printf "── requeridas ──\n"
for k in "${REQUIRED[@]}"; do check_var "$k" required; done

printf "\n── recomendadas ──\n"
for k in "${RECOMMENDED[@]}"; do check_var "$k" recommended; done

printf "\n── fuerza de secretos ──\n"
check_strength JWT_SECRET 32
check_strength JWT_REFRESH_SECRET 32
check_strength FIELD_ENCRYPTION_KEY 32

printf "\n"
if [ "$fail" -gt 0 ]; then
  printf "%s✗ %s error(es) crítico(s), %s advertencia(s)%s\n" "$RED" "$fail" "$warn" "$RST"
  printf "  Corregí las variables marcadas antes de correr docker compose.\n"
  printf "  Para generar secretos fuertes:  openssl rand -base64 48\n\n"
  exit 1
fi

if [ "$warn" -gt 0 ]; then
  printf "%s✓ Sin errores críticos%s (%s advertencia(s) — revisá si vas a usar esas features)\n\n" \
    "$GRN" "$RST" "$warn"
else
  printf "%s✓ Todo listo para docker compose up%s\n\n" "$GRN" "$RST"
fi
exit 0
