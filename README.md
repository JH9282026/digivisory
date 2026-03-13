# DVB CMS — DigiVisory Blog Content Management System

A modern, SEO-optimized, self-hosted blog CMS built with **Next.js 14**, **PostgreSQL**, and **Prisma**. Think of it as a streamlined WordPress alternative designed for the AI era — with built-in support for **SEO**, **AEO** (Answer Engine Optimization), and **GEO** (Generative Engine Optimization).

---

### Quick Start (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/dvb-cms.git
cd dvb-cms

# 2. Run the installer
./install.sh

# 3. Follow the prompts, then visit your site!
```

That's it. The installer handles Docker setup, database initialization, and configuration.

---

### Features

| Category | Features |
|----------|----------|
| **Content** | WYSIWYG editor (TipTap), Markdown, HTML, drag-and-drop blocks |
| **SEO** | Meta tags, Open Graph, Twitter Cards, JSON-LD structured data, XML sitemaps, robots.txt |
| **AEO/GEO** | `llms.txt` for AI crawlers, optimized structured data |
| **Media** | Media library with S3 or local storage support |
| **Admin** | Full dashboard, categories, tags, menus, redirects, 404 monitoring |
| **Import/Export** | JSON and WordPress XML format support |
| **Authors** | E-E-A-T profile fields (expertise, credentials, bio) |
| **API** | Complete REST API for all content types |
| **Deployment** | Docker-based with Nginx, PostgreSQL, Redis |

---

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **RAM** | 1 GB | 2+ GB |
| **CPU** | 1 core | 2+ cores |
| **Disk** | 5 GB | 20+ GB |
| **Docker** | 20.10+ | Latest |
| **Docker Compose** | 2.0+ | Latest |
| **OS** | Any Linux, macOS, Windows (WSL2) | Ubuntu 22.04+ |

---

### Project Structure

```
dvb-cms/
├── nextjs_space/          # Next.js application source
│   ├── app/               # App Router pages and API routes
│   ├── components/        # Shared UI components
│   ├── lib/               # Utilities (auth, prisma, s3, seo)
│   ├── prisma/            # Database schema and migrations
│   └── scripts/           # Seed scripts
├── docker/                # Docker configuration
│   ├── Dockerfile         # Production multi-stage build
│   ├── Dockerfile.dev     # Development with hot reload
│   └── entrypoint.sh      # Container startup script
├── config/
│   └── nginx/             # Nginx reverse proxy config
├── scripts/               # Management scripts
│   ├── start.sh           # Start the CMS
│   ├── stop.sh            # Stop the CMS
│   ├── restart.sh         # Restart the CMS
│   ├── logs.sh            # View logs
│   ├── backup.sh          # Backup database & uploads
│   ├── restore.sh         # Restore from backup
│   ├── update.sh          # Update to latest version
│   ├── ssl-setup.sh       # Set up Let's Encrypt SSL
│   └── reset-password.sh  # Reset admin password
├── docs/                  # Documentation
│   ├── INSTALL.md         # Step-by-step installation
│   ├── DEPLOYMENT.md      # Production deployment guide
│   └── API.md             # REST API reference
├── docker-compose.yml     # Production orchestration
├── docker-compose.dev.yml # Development orchestration
├── .env.example           # Environment variable template
├── install.sh             # One-command installer
├── VERSION                # Current version
├── LICENSE                # MIT License
└── CHANGELOG.md           # Release notes
```

---

### Configuration

All configuration is done via the `.env` file. See [.env.example](.env.example) for all options.

#### Key Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `SITE_URL` | Public URL of your site | `http://localhost` |
| `SITE_NAME` | Display name | `My Blog` |
| `POSTGRES_PASSWORD` | Database password | (generated) |
| `NEXTAUTH_SECRET` | JWT signing secret | (generated) |
| `STORAGE_PROVIDER` | `local` or `s3` | `local` |
| `ADMIN_EMAIL` | Initial admin email | `admin@example.com` |

#### Storage Options

**Local storage** (default): Files stored on the server in a Docker volume. No external dependencies.

**S3 storage**: Set `STORAGE_PROVIDER=s3` and provide AWS credentials. Compatible with any S3-compatible service (AWS, MinIO, DigitalOcean Spaces, etc.)

---

### Management Commands

```bash
./scripts/start.sh              # Start all services
./scripts/stop.sh               # Stop all services
./scripts/restart.sh            # Restart all services
./scripts/logs.sh               # View all logs
./scripts/logs.sh app           # View app logs only
./scripts/backup.sh             # Create a backup
./scripts/restore.sh <file>     # Restore from backup
./scripts/update.sh             # Update to latest version
./scripts/ssl-setup.sh domain   # Set up HTTPS
./scripts/reset-password.sh     # Reset admin password
```

---

### Backup & Restore

**Create a backup:**
```bash
./scripts/backup.sh
# Output: backups/dvbcms_backup_20260312_143000.tar.gz
```

**Restore from backup:**
```bash
./scripts/restore.sh backups/dvbcms_backup_20260312_143000.tar.gz
./scripts/restart.sh
```

Backups include: database dump, uploaded media, and `.env` configuration. The last 10 backups are kept automatically.

---

### SSL/HTTPS Setup

```bash
# Ensure your domain DNS points to the server, then:
./scripts/ssl-setup.sh yourdomain.com admin@yourdomain.com
```

This uses Let's Encrypt for free SSL certificates with automatic renewal.

---

### Upgrading

```bash
./scripts/update.sh
```

This will: create a backup → pull latest code → rebuild containers → restart services.

---

### Troubleshooting

| Problem | Solution |
|---------|----------|
| App won't start | Check logs: `./scripts/logs.sh app` |
| Database connection error | Ensure DB is running: `docker compose ps` |
| Port 80 in use | Change `HTTP_PORT` in `.env` |
| Build fails | Ensure Docker has 2GB+ memory allocated |
| Permission denied | Run: `chmod +x install.sh scripts/*.sh` |
| Forgot admin password | Run: `./scripts/reset-password.sh` |

---

### Development

```bash
# Start dev environment with hot-reloading
docker compose -f docker-compose.dev.yml up

# Access at http://localhost:3000
```

---

### API

Full REST API documentation is available in [docs/API.md](docs/API.md).

Quick examples:
```bash
# List published posts
curl http://localhost/api/posts?status=published

# Get a single post
curl http://localhost/api/posts/<id>

# Search posts
curl http://localhost/api/posts?search=keyword
```

---

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

### License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
