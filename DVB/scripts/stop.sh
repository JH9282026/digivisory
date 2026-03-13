#!/usr/bin/env bash
# DVB CMS - Stop all services
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "Stopping DVB CMS..."

if docker compose version &>/dev/null; then
    docker compose down
else
    docker-compose down
fi

echo "✓ DVB CMS stopped."
