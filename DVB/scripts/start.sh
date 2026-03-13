#!/usr/bin/env bash
# DVB CMS - Start all services
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "Starting DVB CMS..."

if docker compose version &>/dev/null; then
    docker compose up -d
else
    docker-compose up -d
fi

echo "✓ DVB CMS is starting. Check status with: docker compose ps"
