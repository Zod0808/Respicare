#!/bin/bash
# RespiCare — Respaldo pre-despliegue (MongoDB + Redis + configuración)
# Uso: ./scripts/backup-vm.sh
#
# Genera, bajo backups/<timestamp>/:
#   - mongodb.archive.gz  (mongodump lógico, vía docker exec)
#   - redis.rdb           (snapshot RDB tras BGSAVE)
#   - .env / .env.vm      (copia de la configuración vigente)
#
# Referenciado en Documentation/PLAN_DE_DESPLIEGUE.md, sección 7 (Fase 2. Salvaguarda).
set -euo pipefail

ENV_FILE=".env"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="$REPO_DIR/backups/$TIMESTAMP"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

cd "$REPO_DIR"

# ── Colores ───────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

command -v docker >/dev/null 2>&1 || err "Docker no está instalado"

[ -f "$ENV_FILE" ] || err "No se encontró $ENV_FILE — no se puede leer MONGO_PASSWORD/REDIS_PASSWORD"

MONGO_USERNAME="$(grep '^MONGO_USERNAME=' "$ENV_FILE" | cut -d'=' -f2- || echo 'admin')"
MONGO_USERNAME="${MONGO_USERNAME:-admin}"
MONGO_PASSWORD="$(grep '^MONGO_PASSWORD=' "$ENV_FILE" | cut -d'=' -f2-)"
MONGO_DB="$(grep '^MONGO_DB=' "$ENV_FILE" | cut -d'=' -f2- || echo 'respicare')"
MONGO_DB="${MONGO_DB:-respicare}"
REDIS_PASSWORD="$(grep '^REDIS_PASSWORD=' "$ENV_FILE" | cut -d'=' -f2-)"

[ -n "$MONGO_PASSWORD" ] || err "MONGO_PASSWORD vacío en $ENV_FILE"
[ -n "$REDIS_PASSWORD" ] || err "REDIS_PASSWORD vacío en $ENV_FILE"

for name in respicare-mongodb respicare-redis; do
  docker inspect "$name" >/dev/null 2>&1 || err "El contenedor $name no está corriendo — levanta el stack antes de respaldar"
done

mkdir -p "$BACKUP_DIR"
ok "Directorio de respaldo: $BACKUP_DIR"

# ── MongoDB (mongodump lógico) ────────────────────
echo ""
echo "Respaldando MongoDB ($MONGO_DB)..."
docker exec respicare-mongodb mongodump \
  --username "$MONGO_USERNAME" \
  --password "$MONGO_PASSWORD" \
  --authenticationDatabase admin \
  --db "$MONGO_DB" \
  --archive --gzip \
  > "$BACKUP_DIR/mongodb.archive.gz" \
  || err "mongodump falló — revisa credenciales/estado del contenedor"
[ -s "$BACKUP_DIR/mongodb.archive.gz" ] || err "mongodb.archive.gz quedó vacío — respaldo no confiable"
ok "MongoDB respaldado ($(du -h "$BACKUP_DIR/mongodb.archive.gz" | cut -f1))"

# ── Redis (snapshot RDB) ──────────────────────────
echo ""
echo "Respaldando Redis..."
BEFORE_SAVE="$(docker exec respicare-redis redis-cli -a "$REDIS_PASSWORD" --no-auth-warning LASTSAVE 2>/dev/null)"
docker exec respicare-redis redis-cli -a "$REDIS_PASSWORD" --no-auth-warning BGSAVE >/dev/null 2>&1 \
  || err "BGSAVE falló"

i=0
while [ "$i" -lt 30 ]; do
  AFTER_SAVE="$(docker exec respicare-redis redis-cli -a "$REDIS_PASSWORD" --no-auth-warning LASTSAVE 2>/dev/null)"
  if [ "$AFTER_SAVE" != "$BEFORE_SAVE" ]; then
    break
  fi
  sleep 1
  i=$((i + 1))
done
[ "$i" -lt 30 ] || warn "BGSAVE no confirmó en 30s — el .rdb copiado podría ser el snapshot anterior"

docker cp respicare-redis:/data/dump.rdb "$BACKUP_DIR/redis.rdb" \
  || err "No se pudo copiar dump.rdb desde el contenedor"
ok "Redis respaldado ($(du -h "$BACKUP_DIR/redis.rdb" | cut -f1))"

# ── Configuración ──────────────────────────────────
echo ""
echo "Respaldando configuración..."
cp "$ENV_FILE" "$BACKUP_DIR/.env" 2>/dev/null && ok "  ✓ .env"
[ -f ".env.vm" ] && cp .env.vm "$BACKUP_DIR/.env.vm" && ok "  ✓ .env.vm"
GIT_COMMIT="$(git -C "$REPO_DIR" rev-parse HEAD 2>/dev/null || echo 'desconocido')"
echo "$GIT_COMMIT" > "$BACKUP_DIR/git-commit.txt"
ok "  ✓ git-commit.txt ($GIT_COMMIT)"

# ── Retención ───────────────────────────────────────
echo ""
echo "Aplicando retención de $RETENTION_DAYS días..."
find "$REPO_DIR/backups" -mindepth 1 -maxdepth 1 -type d -mtime "+$RETENTION_DAYS" -print -exec rm -rf {} \; \
  | while read -r old; do warn "  Eliminado respaldo antiguo: $(basename "$old")"; done

echo ""
ok "Respaldo completo en $BACKUP_DIR"
echo ""
echo "Restauración manual (si hace falta):"
echo "  MongoDB: docker exec -i respicare-mongodb mongorestore --username $MONGO_USERNAME --password <pass> --authenticationDatabase admin --archive --gzip --drop < $BACKUP_DIR/mongodb.archive.gz"
echo "  Redis:   docker cp $BACKUP_DIR/redis.rdb respicare-redis:/data/dump.rdb && docker restart respicare-redis"
