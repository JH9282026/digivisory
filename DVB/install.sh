#!/usr/bin/env bash
# ============================================================
# DVB CMS - Installation Script
# One-command setup for self-hosted deployment
# ============================================================
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ─── Banner ──────────────────────────────────────────────────
echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║                                                      ║"
echo "║     ██████╗ ██╗   ██╗██████╗      ██████╗███╗   ███╗║"
echo "║     ██╔══██╗██║   ██║██╔══██╗    ██╔════╝████╗ ████║║"
echo "║     ██║  ██║██║   ██║██████╔╝    ██║     ██╔████╔██║║"
echo "║     ██║  ██║╚██╗ ██╔╝██╔══██╗    ██║     ██║╚██╔╝██║║"
echo "║     ██████╔╝ ╚████╔╝ ██████╔╝    ╚██████╗██║ ╚═╝ ██║║"
echo "║     ╚═════╝   ╚═══╝  ╚═════╝      ╚═════╝╚═╝     ╚═╝║"
echo "║                                                      ║"
echo "║           DigiVisory Blog CMS Installer              ║"
echo "║                   Version 1.0.0                      ║"
echo "║                                                      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ─── Helper functions ────────────────────────────────────────
log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[!]${NC} $1"; }
log_error()   { echo -e "${RED}[✗]${NC} $1"; }
prompt()      { echo -en "${BOLD}$1${NC}"; }

# ─── Pre-flight checks ──────────────────────────────────────
echo -e "\n${BOLD}Step 1: Checking prerequisites...${NC}\n"

# Check Docker
if ! command -v docker &>/dev/null; then
    log_error "Docker is not installed."
    echo ""
    echo "  Install Docker:"
    echo "    curl -fsSL https://get.docker.com | sh"
    echo "    sudo usermod -aG docker \$USER"
    echo ""
    exit 1
fi
log_success "Docker found: $(docker --version | head -1)"

# Check Docker Compose
if docker compose version &>/dev/null; then
    COMPOSE_CMD="docker compose"
    log_success "Docker Compose found: $(docker compose version | head -1)"
elif command -v docker-compose &>/dev/null; then
    COMPOSE_CMD="docker-compose"
    log_success "Docker Compose found: $(docker-compose --version | head -1)"
else
    log_error "Docker Compose is not installed."
    echo "  Install it from: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check Docker daemon
if ! docker info &>/dev/null; then
    log_error "Docker daemon is not running. Please start Docker first."
    exit 1
fi
log_success "Docker daemon is running"

# Check if .env already exists
if [ -f .env ]; then
    echo ""
    log_warn "An existing .env configuration was found."
    prompt "Overwrite existing configuration? (y/N): "
    read -r OVERWRITE
    if [[ ! "$OVERWRITE" =~ ^[Yy]$ ]]; then
        log_info "Keeping existing configuration."
        SKIP_CONFIG=true
    else
        SKIP_CONFIG=false
    fi
else
    SKIP_CONFIG=false
fi

# ─── Configuration wizard ────────────────────────────────────
if [ "$SKIP_CONFIG" = false ]; then
    echo ""
    echo -e "${BOLD}Step 2: Configure your CMS${NC}\n"

    # Site name
    prompt "Site name [My Blog]: "
    read -r SITE_NAME
    SITE_NAME="${SITE_NAME:-My Blog}"

    # Site URL
    prompt "Site URL (e.g., https://example.com) [http://localhost]: "
    read -r SITE_URL
    SITE_URL="${SITE_URL:-http://localhost}"
    # Remove trailing slash
    SITE_URL="${SITE_URL%/}"

    # Admin email
    prompt "Admin email [admin@example.com]: "
    read -r ADMIN_EMAIL
    ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"

    # Admin password
    while true; do
        prompt "Admin password (min 8 chars): "
        read -rs ADMIN_PASSWORD
        echo ""
        if [ ${#ADMIN_PASSWORD} -ge 8 ]; then
            break
        elif [ -z "$ADMIN_PASSWORD" ]; then
            ADMIN_PASSWORD="admin12345"
            log_warn "Using default password: admin12345 (change after login!)"
            break
        fi
        log_warn "Password must be at least 8 characters."
    done

    # Admin name
    prompt "Admin display name [Admin]: "
    read -r ADMIN_NAME
    ADMIN_NAME="${ADMIN_NAME:-Admin}"

    # Database password
    DB_PASSWORD=$(openssl rand -hex 16 2>/dev/null || head -c 32 /dev/urandom | xxd -p | head -c 32)
    log_info "Generated secure database password"

    # NextAuth secret
    NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 48 /dev/urandom | base64 | head -c 44)
    log_info "Generated NextAuth secret"

    # Storage provider
    echo ""
    echo -e "${BOLD}Storage Configuration:${NC}"
    echo "  1) Local storage (files stored on server)"
    echo "  2) AWS S3 (cloud storage)"
    prompt "Choose storage [1]: "
    read -r STORAGE_CHOICE
    STORAGE_CHOICE="${STORAGE_CHOICE:-1}"

    STORAGE_PROVIDER="local"
    AWS_REGION=""
    AWS_ACCESS_KEY_ID=""
    AWS_SECRET_ACCESS_KEY=""
    AWS_BUCKET_NAME=""
    AWS_FOLDER_PREFIX=""

    if [ "$STORAGE_CHOICE" = "2" ]; then
        STORAGE_PROVIDER="s3"
        prompt "AWS Region [us-east-1]: "
        read -r AWS_REGION
        AWS_REGION="${AWS_REGION:-us-east-1}"
        prompt "AWS Access Key ID: "
        read -r AWS_ACCESS_KEY_ID
        prompt "AWS Secret Access Key: "
        read -rs AWS_SECRET_ACCESS_KEY
        echo ""
        prompt "S3 Bucket Name: "
        read -r AWS_BUCKET_NAME
        prompt "S3 Folder Prefix (optional): "
        read -r AWS_FOLDER_PREFIX
    fi

    # HTTP port
    prompt "HTTP port [80]: "
    read -r HTTP_PORT
    HTTP_PORT="${HTTP_PORT:-80}"

    # ─── Generate .env file ──────────────────────────────────
    echo ""
    log_info "Generating configuration file..."

    cat > .env << ENVEOF
# DVB CMS Configuration
# Generated by install.sh on $(date -Iseconds)

# Site
SITE_URL=${SITE_URL}
SITE_NAME=${SITE_NAME}

# Database
POSTGRES_USER=dvbcms
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=dvbcms
DB_EXTERNAL_PORT=5433

# Auth
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=${SITE_URL}

# Admin
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
ADMIN_NAME=${ADMIN_NAME}

# First run
SEED_DATABASE=true

# Storage
STORAGE_PROVIDER=${STORAGE_PROVIDER}
AWS_REGION=${AWS_REGION}
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_BUCKET_NAME=${AWS_BUCKET_NAME}
AWS_FOLDER_PREFIX=${AWS_FOLDER_PREFIX}

# Ports
HTTP_PORT=${HTTP_PORT}
HTTPS_PORT=443

# Performance
NEXT_TELEMETRY_DISABLED=1
ENVEOF

    log_success "Configuration saved to .env"
fi

# ─── Build & Start ───────────────────────────────────────────
echo ""
echo -e "${BOLD}Step 3: Building and starting DVB CMS...${NC}\n"

log_info "Pulling base images..."
$COMPOSE_CMD pull db redis nginx 2>/dev/null || true

log_info "Building application (this may take 3-5 minutes on first run)..."
$COMPOSE_CMD build --no-cache app

log_info "Starting services..."
$COMPOSE_CMD up -d

# Wait for app to be ready
echo ""
log_info "Waiting for application to start..."
MAX_WAIT=120
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
    if curl -sf http://localhost:${HTTP_PORT:-80}/ > /dev/null 2>&1; then
        break
    fi
    sleep 3
    WAITED=$((WAITED + 3))
    echo -ne "\r  Waiting... ${WAITED}s / ${MAX_WAIT}s"
done
echo ""

if [ $WAITED -ge $MAX_WAIT ]; then
    log_warn "Application is taking longer than expected to start."
    log_info "Check logs with: ./scripts/logs.sh"
else
    log_success "Application is running!"
fi

# Disable seeding after first run
if grep -q "SEED_DATABASE=true" .env 2>/dev/null; then
    sed -i 's/SEED_DATABASE=true/SEED_DATABASE=false/' .env
fi

# ─── Summary ─────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Installation Complete! 🎉                  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}Your CMS is ready:${NC}"
echo -e "    🌐 Site:   ${CYAN}${SITE_URL:-$(grep SITE_URL .env 2>/dev/null | cut -d= -f2 || echo "http://localhost")}${NC}"
echo -e "    🔐 Admin:  ${CYAN}${SITE_URL:-$(grep SITE_URL .env 2>/dev/null | cut -d= -f2 || echo "http://localhost")}/admin${NC}"
echo -e "    📧 Login:  ${CYAN}${ADMIN_EMAIL:-$(grep ADMIN_EMAIL .env 2>/dev/null | cut -d= -f2 || echo "admin@example.com")}${NC}"
echo ""
echo -e "  ${BOLD}Useful commands:${NC}"
echo "    ./scripts/start.sh    - Start the CMS"
echo "    ./scripts/stop.sh     - Stop the CMS"
echo "    ./scripts/restart.sh  - Restart the CMS"
echo "    ./scripts/logs.sh     - View logs"
echo "    ./scripts/backup.sh   - Backup data"
echo "    ./scripts/update.sh   - Update to latest version"
echo ""
echo -e "  ${YELLOW}⚠ Remember to change your admin password after first login!${NC}"
echo ""
