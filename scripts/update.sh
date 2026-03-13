#!/usr/bin/env bash
# DVB CMS - Update to the latest version
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}DVB CMS Update${NC}\n"

# Determine compose command
if docker compose version &>/dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Backup first
echo -e "${YELLOW}Step 1: Creating backup before update...${NC}"
./scripts/backup.sh
echo ""

# Pull latest code
echo -e "${BLUE}Step 2: Pulling latest changes...${NC}"
if [ -d .git ]; then
    git stash 2>/dev/null || true
    git pull origin main
    git stash pop 2>/dev/null || true
else
    echo "  Not a git repository. Please manually update files."
fi
echo ""

# Rebuild
echo -e "${BLUE}Step 3: Rebuilding application...${NC}"
$COMPOSE_CMD build --no-cache app

# Restart
echo -e "${BLUE}Step 4: Restarting services...${NC}"
$COMPOSE_CMD up -d

echo ""
echo -e "${GREEN}✓ DVB CMS updated successfully!${NC}"
echo "  Check logs: ./scripts/logs.sh app"
