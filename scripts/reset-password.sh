#!/usr/bin/env bash
# DVB CMS - Reset admin password
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

if [ -f .env ]; then set -a; source .env; set +a; fi

EMAIL="${1:-}"
if [ -z "$EMAIL" ]; then
    echo -n "Enter admin email: "
    read -r EMAIL
fi

echo -n "Enter new password (min 8 chars): "
read -rs NEW_PASSWORD
echo ""

if [ ${#NEW_PASSWORD} -lt 8 ]; then
    echo "Error: Password must be at least 8 characters."
    exit 1
fi

APP_CONTAINER=$(docker ps --filter "label=com.dvbcms.service=app" --format "{{.Names}}" | head -1)
if [ -z "$APP_CONTAINER" ]; then
    APP_CONTAINER="dvb-cms-app"
fi

docker exec "$APP_CONTAINER" node -e "
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const hash = await bcrypt.hash('$NEW_PASSWORD', 12);
  await prisma.user.update({ where: { email: '$EMAIL' }, data: { password: hash } });
  console.log('Password updated successfully for $EMAIL');
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
"

echo "✓ Password reset complete."
