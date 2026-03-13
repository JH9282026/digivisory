#!/usr/bin/env bash
# ============================================================
# DVB CMS - Backup Script
# Creates timestamped backups of database and uploaded media
# ============================================================
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Load environment
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"

mkdir -p "$BACKUP_PATH"

echo "╔═══════════════════════════════════════╗"
echo "║       DVB CMS Backup - $TIMESTAMP    ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# 1. Database backup
echo "[1/3] Backing up database..."
DATABASE_CONTAINER=$(docker ps --filter "label=com.dvbcms.service=db" --format "{{.Names}}" | head -1)
if [ -z "$DATABASE_CONTAINER" ]; then
    DATABASE_CONTAINER="dvb-cms-db"
fi

docker exec "$DATABASE_CONTAINER" pg_dump \
    -U "${POSTGRES_USER:-dvbcms}" \
    -d "${POSTGRES_DB:-dvbcms}" \
    --clean --if-exists \
    > "$BACKUP_PATH/database.sql" 2>/dev/null

echo "  ✓ Database backed up ($(du -sh "$BACKUP_PATH/database.sql" | cut -f1))"

# 2. Media / uploads backup
echo "[2/3] Backing up uploaded media..."
UPLOADS_VOLUME=$(docker volume ls --filter "name=uploads" --format "{{.Name}}" | head -1)
if [ -n "$UPLOADS_VOLUME" ]; then
    docker run --rm -v "$UPLOADS_VOLUME":/source -v "$(pwd)/$BACKUP_PATH":/backup alpine \
        tar czf /backup/uploads.tar.gz -C /source . 2>/dev/null || true
    echo "  ✓ Uploads backed up"
else
    echo "  ⚠ No uploads volume found, skipping"
fi

# 3. Configuration backup
echo "[3/3] Backing up configuration..."
cp .env "$BACKUP_PATH/env.backup" 2>/dev/null || true
echo "  ✓ Configuration backed up"

# Compress
echo ""
echo "Compressing backup..."
tar czf "$BACKUP_DIR/dvbcms_backup_$TIMESTAMP.tar.gz" -C "$BACKUP_DIR" "backup_$TIMESTAMP"
rm -rf "$BACKUP_PATH"

SIZE=$(du -sh "$BACKUP_DIR/dvbcms_backup_$TIMESTAMP.tar.gz" | cut -f1)
echo ""
echo "✓ Backup complete!"
echo "  File: $BACKUP_DIR/dvbcms_backup_$TIMESTAMP.tar.gz ($SIZE)"

# Cleanup old backups (keep last 10)
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/dvbcms_backup_*.tar.gz 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 10 ]; then
    ls -1t "$BACKUP_DIR"/dvbcms_backup_*.tar.gz | tail -n +11 | xargs rm -f
    echo "  ℹ Cleaned up old backups (keeping last 10)"
fi
