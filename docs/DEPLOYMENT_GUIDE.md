# MochiDrop Public Platform Deployment Guide

This guide covers deploying the MochiDrop public platform for production use.

## 🏗️ Architecture Overview

The MochiDrop public platform consists of:

- **Public Telegram Bot** - Single bot serving all projects
- **Developer API** - REST API for project management
- **Web Dashboard** - Frontend interface for developers
- **PostgreSQL Database** - Multi-tenant data storage
- **Redis Cache** - Session and rate limiting
- **Nginx** - Reverse proxy and static file serving

## 🚀 Quick Deployment with Docker

### Prerequisites

- Docker & Docker Compose
- Domain name with SSL certificate
- Telegram Bot Token
- Server with at least 2GB RAM

### 1. Clone Repository

```bash
git clone https://github.com/dreyxd/MochiDrop.git
cd MochiDrop
```

### 2. Configure Environment

```bash
cp .env.public.example .env
```

Edit `.env` with your configuration:

```bash
# Required Configuration
TELEGRAM_BOT_TOKEN=your_bot_token
DATABASE_URL=postgresql://mochidrop:secure_password@postgres:5432/mochidrop_public
POSTGRES_PASSWORD=secure_password
REDIS_PASSWORD=secure_redis_password
JWT_SECRET=your_32_character_jwt_secret_key
WEBAPP_URL=https://yourdomain.com/dashboard/
```

### 3. Deploy Services

```bash
docker-compose -f docker-compose.public.yml up -d
```

### 4. Initialize Database

```bash
# Run database migrations
docker exec mochidrop_api python -c "
import asyncio
from database_setup import setup_database
asyncio.run(setup_database())
"
```

### 5. Configure Nginx

Create SSL certificates and update nginx configuration:

```bash
# Generate SSL certificates (Let's Encrypt recommended)
certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Update nginx.conf with your domain
```

## 🔧 Manual Deployment

### System Requirements

- Ubuntu 20.04+ or CentOS 8+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Nginx 1.18+

### 1. Install Dependencies

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3.11-venv postgresql redis-server nginx

# CentOS/RHEL
sudo dnf install python3.11 postgresql-server redis nginx
```

### 2. Setup Database

```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE mochidrop_public;
CREATE USER mochidrop WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE mochidrop_public TO mochidrop;
\q

# Import schema
psql -U mochidrop -d mochidrop_public -f database_multitenant.sql
```

### 3. Setup Application

```bash
# Create application directory
sudo mkdir -p /opt/mochidrop
cd /opt/mochidrop

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements_public.txt

# Copy application files
cp *.py /opt/mochidrop/
cp -r dashboard /opt/mochidrop/
```

### 4. Configure Services

Create systemd service files:

**API Service** (`/etc/systemd/system/mochidrop-api.service`):
```ini
[Unit]
Description=MochiDrop API Service
After=network.target postgresql.service redis.service

[Service]
Type=exec
User=mochidrop
Group=mochidrop
WorkingDirectory=/opt/mochidrop
Environment=PATH=/opt/mochidrop/venv/bin
EnvironmentFile=/opt/mochidrop/.env
ExecStart=/opt/mochidrop/venv/bin/uvicorn developer_api:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Bot Service** (`/etc/systemd/system/mochidrop-bot.service`):
```ini
[Unit]
Description=MochiDrop Telegram Bot
After=network.target postgresql.service redis.service

[Service]
Type=exec
User=mochidrop
Group=mochidrop
WorkingDirectory=/opt/mochidrop
Environment=PATH=/opt/mochidrop/venv/bin
EnvironmentFile=/opt/mochidrop/.env
ExecStart=/opt/mochidrop/venv/bin/python public_bot.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 5. Start Services

```bash
sudo systemctl daemon-reload
sudo systemctl enable mochidrop-api mochidrop-bot
sudo systemctl start mochidrop-api mochidrop-bot
```

## 🌐 Nginx Configuration

Create `/etc/nginx/sites-available/mochidrop`:

```nginx
# API Server
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Dashboard
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    root /opt/mochidrop/dashboard;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/mochidrop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Monitoring & Logging

### 1. Setup Logging

Configure structured logging in your environment:

```bash
# Add to .env
LOG_LEVEL=INFO
SENTRY_DSN=your_sentry_dsn
```

### 2. Health Checks

The API includes health check endpoints:

- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system status

### 3. Monitoring with Prometheus

Add monitoring configuration:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'mochidrop-api'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
```

## 🔒 Security Configuration

### 1. Firewall Setup

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Firewalld (CentOS)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 2. Database Security

```sql
-- Create read-only user for monitoring
CREATE USER monitoring WITH PASSWORD 'monitoring_password';
GRANT CONNECT ON DATABASE mochidrop_public TO monitoring;
GRANT USAGE ON SCHEMA public TO monitoring;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO monitoring;
```

### 3. Redis Security

```bash
# Edit /etc/redis/redis.conf
requirepass your_secure_redis_password
bind 127.0.0.1
```

## 📦 Backup Strategy

### 1. Database Backups

Create backup script (`/opt/mochidrop/scripts/backup.sh`):

```bash
#!/bin/bash
BACKUP_DIR="/opt/mochidrop/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="mochidrop_public"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U mochidrop -h localhost $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Redis backup
cp /var/lib/redis/dump.rdb $BACKUP_DIR/redis_backup_$DATE.rdb

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### 2. Automated Backups

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /opt/mochidrop/scripts/backup.sh
```

## 🔄 Updates & Maintenance

### 1. Application Updates

```bash
# Pull latest code
cd /opt/mochidrop
git pull origin main

# Update dependencies
source venv/bin/activate
pip install -r requirements_public.txt

# Restart services
sudo systemctl restart mochidrop-api mochidrop-bot
```

### 2. Database Migrations

```bash
# Run migrations
python database_migrations.py
```

### 3. Zero-Downtime Deployment

Use blue-green deployment:

```bash
# Deploy to staging
docker-compose -f docker-compose.staging.yml up -d

# Test staging environment
curl https://staging.yourdomain.com/health

# Switch traffic
# Update nginx configuration to point to new version
sudo systemctl reload nginx
```

## 🚨 Troubleshooting

### Common Issues

**Bot not responding:**
```bash
# Check bot service
sudo systemctl status mochidrop-bot
sudo journalctl -u mochidrop-bot -f

# Check bot token
curl https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe
```

**API errors:**
```bash
# Check API service
sudo systemctl status mochidrop-api
curl http://localhost:8000/health

# Check database connection
psql -U mochidrop -d mochidrop_public -c "SELECT 1;"
```

**High memory usage:**
```bash
# Monitor resources
htop
docker stats

# Check Redis memory
redis-cli info memory
```

### Performance Tuning

**PostgreSQL:**
```sql
-- Optimize for production
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
SELECT pg_reload_conf();
```

**Redis:**
```bash
# Edit /etc/redis/redis.conf
maxmemory 512mb
maxmemory-policy allkeys-lru
```

## 📞 Support

For deployment issues:

- **Documentation:** https://docs.mochidrop.com
- **GitHub Issues:** https://github.com/dreyxd/MochiDrop/issues
- **Discord:** https://discord.gg/mochidrop
- **Email:** support@mochidrop.com

---

*Successfully deployed? Share your experience and help improve this guide!* 🚀