# DVB CMS — Production Deployment Guide

Best practices for deploying DVB CMS in a production environment.

---

### Server Preparation

#### Recommended Stack
- **OS:** Ubuntu 22.04 LTS or Debian 12
- **RAM:** 2 GB minimum, 4 GB recommended
- **CPU:** 2+ cores
- **Disk:** SSD, 20 GB+ (more for media-heavy sites)

#### Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install useful tools
sudo apt install -y curl git htop ufw

# Configure firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

### Security Checklist

- [ ] **Strong passwords:** Use generated passwords for database and admin
- [ ] **HTTPS enabled:** Set up SSL with Let's Encrypt
- [ ] **Firewall configured:** Only expose ports 22, 80, 443
- [ ] **SSH hardened:** Use key-based auth, disable root login
- [ ] **Regular backups:** Automated daily backups with off-site storage
- [ ] **Updates:** Keep Docker and OS packages updated
- [ ] **Change default admin password** immediately after installation
- [ ] **Set `SEED_DATABASE=false`** after initial setup

---

### SSL/TLS Configuration

#### Automated (Let's Encrypt)

```bash
# Ensure DNS points to your server, then:
./scripts/ssl-setup.sh yourdomain.com admin@yourdomain.com
```

#### Manual SSL Certificate

If you have your own SSL certificate:

1. Place files in `/etc/letsencrypt/live/yourdomain.com/`:
   - `fullchain.pem` — Certificate chain
   - `privkey.pem` — Private key

2. Edit `config/nginx/default.conf` — uncomment the SSL block and update the domain

3. Restart: `./scripts/restart.sh`

---

### Performance Optimization

#### Nginx Caching

The default Nginx configuration includes:
- Static asset caching (365 days for `/_next/static/`)
- Upload caching (30 days for `/uploads/`)
- Gzip compression for text-based content

#### Database Tuning

For high-traffic sites, tune PostgreSQL. Create `config/postgres/postgresql.conf`:

```conf
# Memory (adjust based on your server)
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB

# Connections
max_connections = 100

# Write performance
wal_buffers = 16MB
checkpoint_completion_target = 0.9
```

Mount it in `docker-compose.yml`:
```yaml
db:
  volumes:
    - ./config/postgres/postgresql.conf:/etc/postgresql/postgresql.conf
  command: postgres -c config_file=/etc/postgresql/postgresql.conf
```

#### Redis Caching

Redis is included for session/cache storage. Default config:
- 128 MB max memory
- LRU eviction policy (least recently used keys evicted first)

---

### Monitoring

#### Health Checks

The app container includes a built-in health check. Monitor with:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' dvb-cms-app

# Quick status
docker compose ps
```

#### Log Management

```bash
# View real-time logs
./scripts/logs.sh

# Configure Docker log rotation (recommended)
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
sudo systemctl restart docker
```

---

### Scaling

#### Horizontal Scaling

For high-traffic sites, run multiple app instances behind the Nginx load balancer:

```yaml
# In docker-compose.yml
app:
  deploy:
    replicas: 3
```

Update `config/nginx/default.conf`:
```nginx
upstream nextjs {
    least_conn;
    server app:3000;
}
```

#### External Database

For larger deployments, use a managed PostgreSQL service:

1. Set up your managed database (AWS RDS, DigitalOcean, etc.)
2. Update `.env`:
   ```
   DATABASE_URL=postgresql://user:pass@your-db-host:5432/dvbcms
   ```
3. Remove the `db` service from `docker-compose.yml`

---

### Backup Strategy

#### Automated Backups

```bash
# Add to crontab
crontab -e

# Daily at 2 AM
0 2 * * * /opt/dvb-cms/scripts/backup.sh >> /var/log/dvb-backup.log 2>&1
```

#### Off-site Backup

Copy backups to a remote server or cloud storage:

```bash
# After backup, sync to S3
aws s3 sync ./backups/ s3://your-backup-bucket/dvb-cms/

# Or rsync to another server
rsync -avz ./backups/ user@backup-server:/backups/dvb-cms/
```

---

### Upgrading in Production

```bash
# 1. Create a backup
./scripts/backup.sh

# 2. Pull latest changes
git pull origin main

# 3. Rebuild and restart (zero-downtime)
docker compose build app
docker compose up -d app

# 4. Verify
curl -I https://yourdomain.com
./scripts/logs.sh app
```

---

### Rollback

If an update causes issues:

```bash
# 1. Stop the app
./scripts/stop.sh

# 2. Restore from backup
./scripts/restore.sh backups/dvbcms_backup_YYYYMMDD_HHMMSS.tar.gz

# 3. Revert code
git checkout <previous-tag-or-commit>

# 4. Rebuild and start
docker compose build app
./scripts/start.sh
```

---

### CDN Integration

For serving static assets and media through a CDN:

1. Set up a CDN (Cloudflare, CloudFront, etc.)
2. Point the CDN to your server
3. Configure caching rules:
   - `/_next/static/*` — Cache forever (immutable)
   - `/uploads/*` — Cache for 30 days
   - `/api/*` — Do not cache
   - Everything else — Cache for 5 minutes (or use stale-while-revalidate)

#### Cloudflare (Recommended)

1. Add your domain to Cloudflare
2. Update DNS to Cloudflare nameservers
3. Enable "Full (Strict)" SSL mode
4. Set up page rules for caching

---

### Docker Resource Limits

For shared servers, limit container resources:

```yaml
# In docker-compose.yml
app:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 1G
      reservations:
        cpus: '0.5'
        memory: 512M
```
