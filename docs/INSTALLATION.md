# Installation Guide

This guide covers multiple installation methods for MochiDrop, from quick Docker deployment to manual installation and cloud deployment.

## 🚀 Quick Start (Recommended)

### Prerequisites

- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Git** for cloning the repository
- **Domain name** (for production deployment)
- **SSL certificate** (Let's Encrypt recommended)

### 1-Minute Docker Deployment

```bash
# Clone the repository
git clone https://github.com/dreyxd/MochiDrop.git
cd MochiDrop

# Copy environment configuration
cp .env.public.example .env.production

# Edit configuration (see Configuration Guide)
nano .env.production

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

Your MochiDrop instance will be available at:
- **API**: `http://localhost:8000`
- **Dashboard**: `http://localhost:8000/dashboard`
- **Documentation**: `http://localhost:8000/docs`

## 🐳 Docker Installation (Detailed)

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4GB | 8GB+ |
| Storage | 20GB | 100GB+ SSD |
| Network | 100 Mbps | 1 Gbps |

### Step 1: Install Docker

#### Ubuntu/Debian
```bash
# Update package index
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### CentOS/RHEL
```bash
# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Windows
1. Download [Docker Desktop for Windows](https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe)
2. Run the installer and follow the setup wizard
3. Restart your computer when prompted
4. Open Docker Desktop and complete the initial setup

#### macOS
1. Download [Docker Desktop for Mac](https://desktop.docker.com/mac/main/amd64/Docker.dmg)
2. Drag Docker to Applications folder
3. Launch Docker Desktop
4. Complete the initial setup

### Step 2: Clone and Configure

```bash
# Clone repository
git clone https://github.com/dreyxd/MochiDrop.git
cd MochiDrop

# Create environment file
cp .env.public.example .env.production

# Generate secure secrets
openssl rand -hex 32  # For JWT_SECRET_KEY
openssl rand -hex 32  # For ENCRYPTION_KEY
```

### Step 3: Configure Environment

Edit `.env.production` with your settings:

```bash
# Essential Configuration
APP_ENV=production
DEBUG=false

# Database (will be created automatically)
DATABASE_URL=postgresql://postgres:secure_password@db:5432/mochidrop

# Redis (will be created automatically)
REDIS_URL=redis://redis:6379/0

# Security (use generated secrets)
JWT_SECRET_KEY=your-generated-jwt-secret-here
ENCRYPTION_KEY=your-generated-encryption-key-here

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here

# Solana Network
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Domain Configuration
API_BASE_URL=https://api.yourdomain.com
WEB_BASE_URL=https://yourdomain.com

# Email (Optional)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
```

### Step 4: Deploy with Docker Compose

```bash
# Start all services
docker-compose -f docker-compose.yml up -d

# Check logs
docker-compose logs -f

# Verify all services are running
docker-compose ps
```

Expected output:
```
NAME                COMMAND                  SERVICE             STATUS              PORTS
mochidrop-api-1     "uvicorn main:app --…"   api                 running             0.0.0.0:8000->8000/tcp
mochidrop-bot-1     "python bot/main.py"     bot                 running             
mochidrop-db-1      "docker-entrypoint.s…"   db                  running             0.0.0.0:5432->5432/tcp
mochidrop-redis-1   "docker-entrypoint.s…"   redis               running             0.0.0.0:6379->6379/tcp
mochidrop-nginx-1   "/docker-entrypoint.…"   nginx               running             0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### Step 5: Initialize Database

```bash
# Run database migrations
docker-compose exec api python -m alembic upgrade head

# Create initial admin user (optional)
docker-compose exec api python scripts/create_admin.py
```

### Step 6: Set Up SSL (Production)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## 🔧 Manual Installation

### System Requirements

- **Python** 3.9+
- **Node.js** 16+ (for dashboard)
- **PostgreSQL** 12+
- **Redis** 6+
- **Nginx** (for production)

### Step 1: Install System Dependencies

#### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install -y python3 python3-pip python3-venv python3-dev

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install system dependencies
sudo apt install -y build-essential libpq-dev libssl-dev libffi-dev
```

#### CentOS/RHEL
```bash
# Install EPEL repository
sudo yum install -y epel-release

# Install Python
sudo yum install -y python3 python3-pip python3-devel

# Install PostgreSQL
sudo yum install -y postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install Redis
sudo yum install -y redis
sudo systemctl start redis
sudo systemctl enable redis

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Nginx
sudo yum install -y nginx
```

### Step 2: Set Up Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE mochidrop;
CREATE USER mochidrop_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE mochidrop TO mochidrop_user;
ALTER USER mochidrop_user CREATEDB;
\q
```

### Step 3: Clone and Set Up Application

```bash
# Clone repository
git clone https://github.com/dreyxd/MochiDrop.git
cd MochiDrop

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies (for dashboard)
cd dashboard
npm install
npm run build
cd ..
```

### Step 4: Configure Environment

```bash
# Create environment file
cp .env.public.example .env.production

# Edit configuration
nano .env.production
```

Update with your local settings:
```bash
DATABASE_URL=postgresql://mochidrop_user:secure_password@localhost:5432/mochidrop
REDIS_URL=redis://localhost:6379/0
# ... other settings
```

### Step 5: Initialize Database

```bash
# Run migrations
python -m alembic upgrade head

# Create initial data
python scripts/init_db.py
```

### Step 6: Set Up Services

#### Create Systemd Services

**API Service** (`/etc/systemd/system/mochidrop-api.service`):
```ini
[Unit]
Description=MochiDrop API
After=network.target postgresql.service redis.service

[Service]
Type=exec
User=mochidrop
Group=mochidrop
WorkingDirectory=/opt/mochidrop
Environment=PATH=/opt/mochidrop/venv/bin
ExecStart=/opt/mochidrop/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

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
ExecStart=/opt/mochidrop/venv/bin/python bot/main.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

#### Start Services

```bash
# Create user
sudo useradd -r -s /bin/false mochidrop

# Move application
sudo mv MochiDrop /opt/mochidrop
sudo chown -R mochidrop:mochidrop /opt/mochidrop

# Enable and start services
sudo systemctl daemon-reload
sudo systemctl enable mochidrop-api mochidrop-bot
sudo systemctl start mochidrop-api mochidrop-bot

# Check status
sudo systemctl status mochidrop-api mochidrop-bot
```

### Step 7: Configure Nginx

Create Nginx configuration (`/etc/nginx/sites-available/mochidrop`):

```nginx
server {
    listen 80;
    server_name yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    root /opt/mochidrop/dashboard/dist;
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
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/mochidrop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## ☁️ Cloud Deployment

### AWS Deployment

#### Using AWS ECS with Fargate

1. **Create ECS Cluster**:
```bash
aws ecs create-cluster --cluster-name mochidrop-cluster
```

2. **Create Task Definition**:
```json
{
  "family": "mochidrop-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "mochidrop-api",
      "image": "your-account.dkr.ecr.region.amazonaws.com/mochidrop:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql://user:pass@rds-endpoint:5432/mochidrop"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/mochidrop-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

3. **Create Service**:
```bash
aws ecs create-service \
  --cluster mochidrop-cluster \
  --service-name mochidrop-api-service \
  --task-definition mochidrop-api:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

#### Using AWS RDS and ElastiCache

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier mochidrop-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username mochidrop \
  --master-user-password SecurePassword123 \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-12345

# Create ElastiCache cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id mochidrop-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

### Google Cloud Platform

#### Using Cloud Run

1. **Build and Push Image**:
```bash
# Build image
docker build -t gcr.io/your-project/mochidrop .

# Push to Container Registry
docker push gcr.io/your-project/mochidrop
```

2. **Deploy to Cloud Run**:
```bash
gcloud run deploy mochidrop-api \
  --image gcr.io/your-project/mochidrop \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="postgresql://user:pass@host/db" \
  --set-env-vars REDIS_URL="redis://host:6379/0"
```

#### Using Cloud SQL and Memorystore

```bash
# Create Cloud SQL instance
gcloud sql instances create mochidrop-db \
  --database-version POSTGRES_13 \
  --tier db-f1-micro \
  --region us-central1

# Create database
gcloud sql databases create mochidrop --instance mochidrop-db

# Create Memorystore instance
gcloud redis instances create mochidrop-redis \
  --size 1 \
  --region us-central1
```

### DigitalOcean

#### Using App Platform

Create `app.yaml`:
```yaml
name: mochidrop
services:
- name: api
  source_dir: /
  github:
    repo: your-username/MochiDrop
    branch: main
  run_command: uvicorn main:app --host 0.0.0.0 --port 8080
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: REDIS_URL
    value: ${redis.DATABASE_URL}
  http_port: 8080

- name: bot
  source_dir: /
  github:
    repo: your-username/MochiDrop
    branch: main
  run_command: python bot/main.py
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: REDIS_URL
    value: ${redis.DATABASE_URL}

databases:
- name: db
  engine: PG
  version: "13"
  size: db-s-dev-database

- name: redis
  engine: REDIS
  version: "6"
  size: db-s-dev-database
```

Deploy:
```bash
doctl apps create --spec app.yaml
```

## 🔍 Verification and Testing

### Health Checks

```bash
# Check API health
curl http://localhost:8000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "2.0.0",
  "database": "connected",
  "redis": "connected"
}
```

### Database Connection Test

```bash
# Test database connection
docker-compose exec api python -c "
import psycopg2
import os
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
print('Database connected successfully')
conn.close()
"
```

### Bot Test

```bash
# Test bot connection
docker-compose exec bot python -c "
import asyncio
from telegram import Bot
import os

async def test_bot():
    bot = Bot(token=os.getenv('TELEGRAM_BOT_TOKEN'))
    me = await bot.get_me()
    print(f'Bot connected: @{me.username}')

asyncio.run(test_bot())
"
```

### Load Testing

```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test API performance
ab -n 1000 -c 10 http://localhost:8000/health

# Test with authentication
ab -n 100 -c 5 -H "X-API-Key: your-api-key" http://localhost:8000/v1/projects
```

## 🔄 Updates and Maintenance

### Update Process

```bash
# Backup database
docker-compose exec db pg_dump -U postgres mochidrop > backup_$(date +%Y%m%d).sql

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d

# Run migrations
docker-compose exec api python -m alembic upgrade head
```

### Monitoring Setup

```bash
# Add monitoring stack
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d

# Access monitoring
# Grafana: http://localhost:3000 (admin/admin)
# Prometheus: http://localhost:9090
```

### Backup Strategy

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Database backup
docker-compose exec -T db pg_dump -U postgres mochidrop | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Redis backup
docker-compose exec -T redis redis-cli BGSAVE
docker cp mochidrop-redis-1:/data/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# Application files backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz uploads/ logs/

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/ s3://your-backup-bucket/mochidrop/ --recursive

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +30 -delete
```

## 🆘 Troubleshooting Installation

### Common Issues

#### Docker Issues

**Issue**: "Cannot connect to the Docker daemon"
```bash
# Solution: Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

**Issue**: "Port already in use"
```bash
# Solution: Check what's using the port
sudo lsof -i :8000
# Kill the process or change port in docker-compose.yml
```

#### Database Issues

**Issue**: "Connection refused" to PostgreSQL
```bash
# Solution: Check if PostgreSQL is running
docker-compose logs db

# Reset database
docker-compose down -v
docker-compose up -d db
```

#### Permission Issues

**Issue**: Permission denied errors
```bash
# Solution: Fix ownership
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh
```

### Getting Help

If you encounter issues:

1. **Check logs**:
   ```bash
   docker-compose logs -f api
   docker-compose logs -f bot
   ```

2. **Verify configuration**:
   ```bash
   docker-compose config
   ```

3. **Contact support**:
   - 📧 Email: support@mochidrop.com
   - 💬 Discord: [discord.gg/mochidrop](https://discord.gg/mochidrop)
   - 🐛 GitHub: [Report Issues](https://github.com/dreyxd/MochiDrop/issues)

---

## 🎉 Next Steps

After successful installation:

1. **Configure your first project** using the [Dashboard](http://localhost:8000/dashboard)
2. **Set up your Telegram bot** following the [Bot Setup Guide](BOT_SETUP.md)
3. **Integrate with your application** using the [API Reference](API_REFERENCE.md)
4. **Monitor your deployment** with the built-in analytics

Welcome to MochiDrop! 🚀