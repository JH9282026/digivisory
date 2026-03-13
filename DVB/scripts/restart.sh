#!/usr/bin/env bash
# DVB CMS - Restart all services
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "Restarting DVB CMS..."

if docker compose version &>/dev/null; then
    docker compose restart
else
    docker-compose restart
fi

echo "✓ DVB CMS restarted."
