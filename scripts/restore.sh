#!/usr/bin/env bash
# ============================================================
# DVB CMS - Restore Script
# Restores from a backup created by backup.sh
# ============================================================
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load environment
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

BACKUP_DIR="./backups"

# Check argument
if [ -z "${1:-}" ]; then
    echo "DVB CMS - Restore from Backup"
    echo ""
    echo "Usage: ./scripts/restore.sh <backup_file>"
    echo ""
    echo "Available backups:"
    ls -1t "$BACKUP_DIR"/dvbcms_backup_*.tar.gz 2>/dev/null | while read f; do
        SIZE=$(du -sh "$f" | cut -f1)
        BASENAME=$(basename "$f")
        echo "  $BASENAME  ($SIZE)"
    done
    if ! ls "$BACKUP_DIR"/dvbcms_backup_*.tar.gz &>/dev/null; then
        echo "  (no backups found)"
    fi
    exit 1
fi

BACKUP_FILE="$1"
if [ ! -f "$BACKUP_FILE" ]; then
    # Try looking in backups dir
    BACKUP_FILE="$BACKUP_DIR/$1"
fi
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $1${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠ WARNING: This will overwrite the current database and uploads!${NC}"
echo -n "Continue? (y/N): "
read -r CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    exit 0
fi

TMP_DIR=$(mktemp -d)
trap "rm -rf $TMP_DIR" EXIT

echo ""
echo "[1/3] Extracting backup..."
tar xzf "$BACKUP_FILE" -C "$TMP_DIR"
BACKUP_CONTENT=$(ls "$TMP_DIR" | head -1)
BACKUP_DATA="$TMP_DIR/$BACKUP_CONTENT"

# Restore database
if [ -f "$BACKUP_DATA/database.sql" ]; then
    echo "[2/3] Restoring database..."
    DATABASE_CONTAINER=$(docker ps --filter "label=com.dvbcms.service=db" --format "{{.Names}}" | head -1)
    if [ -z "$DATABASE_CONTAINER" ]; then
        DATABASE_CONTAINER="dvb-cms-db"
    fi
    docker exec -i "$DATABASE_CONTAINER" psql \
        -U "${POSTGRES_USER:-dvbcms}" \
        -d "${POSTGRES_DB:-dvbcms}" \
        < "$BACKUP_DATA/database.sql" 2>/dev/null
    echo "  ✓ Database restored"
else
    echo "[2/3] No database dump found, skipping"
fi

# Restore uploads
if [ -f "$BACKUP_DATA/uploads.tar.gz" ]; then
    echo "[3/3] Restoring uploads..."
    UPLOADS_VOLUME=$(docker volume ls --filter "name=uploads" --format "{{.Name}}" | head -1)
    if [ -n "$UPLOADS_VOLUME" ]; then
        docker run --rm -v "$UPLOADS_VOLUME":/dest -v "$BACKUP_DATA":/backup alpine \
            sh -c 'cd /dest && tar xzf /backup/uploads.tar.gz'
        echo "  ✓ Uploads restored"
    else
        echo "  ⚠ Uploads volume not found"
    fi
else
    echo "[3/3] No uploads archive found, skipping"
fi

# Restore env if requested
if [ -f "$BACKUP_DATA/env.backup" ]; then
    echo -n "Restore .env configuration? (y/N): "
    read -r RESTORE_ENV
    if [[ "$RESTORE_ENV" =~ ^[Yy]$ ]]; then
        cp "$BACKUP_DATA/env.backup" .env
        echo "  ✓ Configuration restored"
    fi
fi

echo ""
echo -e "${GREEN}✓ Restore complete!${NC}"
echo "  Restart the CMS: ./scripts/restart.sh"
