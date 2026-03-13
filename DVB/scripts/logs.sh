#!/usr/bin/env bash
# DVB CMS - View application logs
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

SERVICE="${1:-}"
LINES="${2:-100}"

if docker compose version &>/dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

if [ -n "$SERVICE" ]; then
    echo "Showing last $LINES lines for '$SERVICE'..."
    $COMPOSE_CMD logs --tail="$LINES" -f "$SERVICE"
else
    echo "Showing last $LINES lines for all services..."
    echo "Tip: ./scripts/logs.sh app    - View only app logs"
    echo "     ./scripts/logs.sh db     - View only database logs"
    echo "     ./scripts/logs.sh nginx  - View only Nginx logs"
    echo ""
    $COMPOSE_CMD logs --tail="$LINES" -f
fi
