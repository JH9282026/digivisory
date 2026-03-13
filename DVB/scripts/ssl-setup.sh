#!/usr/bin/env bash
# ============================================================
# DVB CMS - SSL/TLS Setup with Let's Encrypt
# ============================================================
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

if [ -f .env ]; then
    set -a; source .env; set +a
fi

DOMAIN="${1:-}"
EMAIL="${2:-${ADMIN_EMAIL:-}}"

if [ -z "$DOMAIN" ]; then
    echo "DVB CMS - SSL Setup"
    echo ""
    echo "Usage: ./scripts/ssl-setup.sh <domain> [email]"
    echo ""
    echo "Example: ./scripts/ssl-setup.sh example.com admin@example.com"
    exit 1
fi

if [ -z "$EMAIL" ]; then
    echo -n "Email for Let's Encrypt notifications: "
    read -r EMAIL
fi

echo "Setting up SSL for $DOMAIN..."

# Determine compose command
if docker compose version &>/dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Get initial certificate
echo "[1/3] Obtaining SSL certificate..."
$COMPOSE_CMD run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

# Update nginx config
echo "[2/3] Updating Nginx configuration..."
NGINX_CONF="./config/nginx/default.conf"
sed -i "s/YOUR_DOMAIN/$DOMAIN/g" "$NGINX_CONF"
sed -i 's/# listen 443/listen 443/' "$NGINX_CONF"
sed -i 's/# ssl_/ssl_/' "$NGINX_CONF"
sed -i 's/# add_header Strict/add_header Strict/' "$NGINX_CONF"

# Update .env
echo "[3/3] Updating configuration..."
sed -i "s|SITE_URL=.*|SITE_URL=https://$DOMAIN|" .env
sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://$DOMAIN|" .env

# Restart
$COMPOSE_CMD restart nginx

echo ""
echo "✓ SSL setup complete!"
echo "  Your site is now available at: https://$DOMAIN"
echo "  Certificates will auto-renew via certbot."
