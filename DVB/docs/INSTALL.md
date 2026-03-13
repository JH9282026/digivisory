# DVB CMS — Installation Guide

This guide walks you through installing DVB CMS on your own server, step by step.

---

### Prerequisites

Before you begin, make sure your server has:

- **Docker** 20.10 or later
- **Docker Compose** v2 or later
- **2 GB RAM** minimum (4 GB recommended)
- **5 GB disk space** minimum
- A domain name (optional, for production)

#### Install Docker (if needed)

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in, then verify:
docker --version
```

#### Install Docker Compose (if needed)

Docker Compose v2 comes bundled with modern Docker installations. Verify:

```bash
docker compose version
```

---

### Method 1: Automated Installation (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/dvb-cms.git
cd dvb-cms

# Make scripts executable
chmod +x install.sh scripts/*.sh

# Run the installer
./install.sh
```

The installer will:
1. ✅ Check Docker and Docker Compose
2. ✅ Ask for your site configuration (name, URL, admin credentials)
3. ✅ Generate secure passwords and secrets automatically
4. ✅ Create the `.env` configuration file
5. ✅ Build the Docker images
6. ✅ Start all services (app, database, redis, nginx)
7. ✅ Run database migrations
8. ✅ Create the initial admin user

After installation, access:
- **Your site:** `http://your-server-ip` (or your domain)
- **Admin panel:** `http://your-server-ip/admin`

---

### Method 2: Manual Installation

#### Step 1: Clone and configure

```bash
git clone https://github.com/your-org/dvb-cms.git
cd dvb-cms

# Create configuration from template
cp .env.example .env
```

#### Step 2: Edit .env

Open `.env` in your editor and configure:

```bash
# Required: Set your site URL
SITE_URL=https://yourdomain.com

# Required: Generate a secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://yourdomain.com

# Required: Set a strong database password
POSTGRES_PASSWORD=your_secure_password_here

# Required: Admin credentials
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=your_admin_password

# First run: enable seeding
SEED_DATABASE=true

# Storage: 'local' or 's3'
STORAGE_PROVIDER=local
```

#### Step 3: Build and start

```bash
# Build the application
docker compose build

# Start all services
docker compose up -d

# Watch the logs to confirm startup
docker compose logs -f app
```

#### Step 4: Verify

```bash
# Check all services are running
docker compose ps

# Test the site
curl -I http://localhost
```

#### Step 5: Disable seeding

After the first successful start, update `.env`:
```
SEED_DATABASE=false
```

---

### Post-Installation

#### Change your admin password

1. Log in at `/admin` with the credentials you set during installation
2. Go to **Profile** in the admin sidebar
3. Update your password

#### Set up SSL (production)

```bash
# Point your domain DNS A record to your server IP first, then:
./scripts/ssl-setup.sh yourdomain.com admin@yourdomain.com
```

#### Configure backups

Set up automated daily backups with cron:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/dvb-cms/scripts/backup.sh >> /var/log/dvb-backup.log 2>&1
```

#### Configure site settings

1. Go to **Settings** in the admin panel
2. Set your site name, tagline, and SEO defaults
3. Configure social media links
4. Add custom CSS or tracking codes if needed

---

### Switching Storage Providers

#### From Local to S3

1. Edit `.env`:
   ```
   STORAGE_PROVIDER=s3
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_BUCKET_NAME=your-bucket
   ```
2. Restart: `./scripts/restart.sh`
3. Existing local files remain accessible; new uploads go to S3

#### From S3 to Local

1. Edit `.env`:
   ```
   STORAGE_PROVIDER=local
   ```
2. Restart: `./scripts/restart.sh`
3. New uploads stored locally; existing S3 URLs continue to work

---

### Uninstalling

```bash
# Stop and remove all containers, volumes, and networks
docker compose down -v

# Remove the project directory
cd .. && rm -rf dvb-cms
```

⚠️ This permanently deletes all data including database and uploaded files. Create a backup first!
