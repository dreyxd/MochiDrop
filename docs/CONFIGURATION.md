# Configuration Guide

This guide covers all configuration options for MochiDrop, including environment variables, system settings, and deployment configurations.

## 🔧 Environment Configuration

### Environment Files

MochiDrop uses environment files for configuration management:

- `.env.public.example` - Template for public deployment
- `.env.local` - Local development settings
- `.env.production` - Production environment settings
- `.env.test` - Testing environment settings

### Core Environment Variables

#### Database Configuration

```bash
# PostgreSQL Database
DATABASE_URL=postgresql://username:password@localhost:5432/mochidrop
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mochidrop
DB_USER=mochidrop_user
DB_PASSWORD=secure_password
DB_SSL_MODE=require

# Connection Pool Settings
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=3600

# Read Replica (Optional)
DATABASE_REPLICA_URL=postgresql://username:password@replica-host:5432/mochidrop
```

#### Redis Configuration

```bash
# Redis Cache
REDIS_URL=redis://localhost:6379/0
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password
REDIS_DB=0

# Redis Connection Pool
REDIS_POOL_SIZE=10
REDIS_SOCKET_TIMEOUT=5
REDIS_SOCKET_CONNECT_TIMEOUT=5

# Session Storage
REDIS_SESSION_DB=1
REDIS_CACHE_DB=2
```

#### Application Settings

```bash
# Application
APP_NAME=MochiDrop
APP_VERSION=2.0.0
APP_ENV=production
DEBUG=false
LOG_LEVEL=INFO

# Server Configuration
HOST=0.0.0.0
PORT=8000
WORKERS=4
WORKER_CLASS=uvicorn.workers.UvicornWorker
WORKER_CONNECTIONS=1000
MAX_REQUESTS=1000
MAX_REQUESTS_JITTER=100

# Base URLs
API_BASE_URL=https://api.mochidrop.com
WEB_BASE_URL=https://mochidrop.com
DOCS_BASE_URL=https://docs.mochidrop.com
```

#### Security Configuration

```bash
# JWT Settings
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# API Security
API_KEY_PREFIX=mk_
ENCRYPTION_KEY=your-encryption-key-for-sensitive-data
HASH_SALT=your-hash-salt-for-passwords

# CORS Settings
CORS_ORIGINS=["https://mochidrop.com", "https://app.mochidrop.com"]
CORS_ALLOW_CREDENTIALS=true
CORS_ALLOW_METHODS=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
CORS_ALLOW_HEADERS=["*"]

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_STORAGE_URL=redis://localhost:6379/3
```

#### Telegram Bot Configuration

```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_WEBHOOK_URL=https://api.mochidrop.com/webhook/telegram
TELEGRAM_WEBHOOK_SECRET=your-webhook-secret

# Bot Settings
BOT_USERNAME=MochiDropBot
BOT_ADMIN_IDS=[123456789, 987654321]
BOT_MAX_USERS_PER_PROJECT=10000
BOT_COMMAND_TIMEOUT=30

# Telegram API Settings
TELEGRAM_API_TIMEOUT=30
TELEGRAM_API_RETRIES=3
TELEGRAM_API_RETRY_DELAY=1
```

#### Solana Configuration

```bash
# Solana Network
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_WS_URL=wss://api.mainnet-beta.solana.com

# Alternative RPC Endpoints
SOLANA_RPC_URLS=["https://api.mainnet-beta.solana.com", "https://solana-api.projectserum.com"]

# Transaction Settings
SOLANA_COMMITMENT=confirmed
SOLANA_TIMEOUT=30
SOLANA_MAX_RETRIES=3
SOLANA_RETRY_DELAY=2

# Fee Settings
SOLANA_PRIORITY_FEE=1000
SOLANA_MAX_FEE=10000
SOLANA_COMPUTE_UNIT_LIMIT=200000

# Supported Tokens
SUPPORTED_TOKENS=["SOL", "USDC", "BONK", "WIF"]
```

#### Email Configuration

```bash
# Email Service (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@mochidrop.com
FROM_NAME=MochiDrop

# SMTP Alternative
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_TLS=true

# Email Templates
EMAIL_TEMPLATE_DIR=templates/emails
EMAIL_VERIFICATION_TEMPLATE=verify_email.html
EMAIL_WELCOME_TEMPLATE=welcome.html
```

#### File Upload Configuration

```bash
# File Upload
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=["jpg", "jpeg", "png", "gif", "pdf"]
UPLOAD_DIR=uploads
TEMP_DIR=temp

# Cloud Storage (AWS S3)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=mochidrop-uploads
AWS_S3_PUBLIC_URL=https://mochidrop-uploads.s3.amazonaws.com
```

#### Monitoring & Logging

```bash
# Logging
LOG_FORMAT=json
LOG_FILE=logs/mochidrop.log
LOG_MAX_SIZE=100MB
LOG_BACKUP_COUNT=5
LOG_ROTATION=daily

# Sentry Error Tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1

# Metrics
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
METRICS_ENDPOINT=/metrics

# Health Checks
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_ENDPOINT=/health
HEALTH_CHECK_TIMEOUT=30
```

#### Webhook Configuration

```bash
# Webhooks
WEBHOOK_TIMEOUT=30
WEBHOOK_RETRY_COUNT=3
WEBHOOK_RETRY_DELAY=5
WEBHOOK_MAX_PAYLOAD_SIZE=1048576  # 1MB

# Webhook Security
WEBHOOK_SECRET_KEY=your-webhook-secret-key
WEBHOOK_SIGNATURE_HEADER=X-MochiDrop-Signature
```

#### Feature Flags

```bash
# Feature Flags
FEATURE_MULTI_TENANT=true
FEATURE_ANALYTICS=true
FEATURE_WEBHOOKS=true
FEATURE_EMAIL_NOTIFICATIONS=true
FEATURE_RATE_LIMITING=true
FEATURE_CACHING=true
FEATURE_FILE_UPLOAD=true

# Experimental Features
FEATURE_ADVANCED_ANALYTICS=false
FEATURE_AI_RECOMMENDATIONS=false
FEATURE_MOBILE_APP_API=true
```

#### Backup Configuration

```bash
# Database Backup
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *  # Daily at 2 AM
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=mochidrop-backups
BACKUP_ENCRYPTION_KEY=your-backup-encryption-key

# Backup Notifications
BACKUP_NOTIFICATION_EMAIL=admin@mochidrop.com
BACKUP_WEBHOOK_URL=https://your-monitoring-service.com/webhook
```

## ⚙️ Configuration Management

### Environment-Specific Configurations

#### Development Environment

```bash
# .env.local
APP_ENV=development
DEBUG=true
LOG_LEVEL=DEBUG

# Use local services
DATABASE_URL=postgresql://postgres:password@localhost:5432/mochidrop_dev
REDIS_URL=redis://localhost:6379/0

# Disable external services
SENTRY_DSN=
SENDGRID_API_KEY=

# Use test tokens
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
```

#### Testing Environment

```bash
# .env.test
APP_ENV=test
DEBUG=false
LOG_LEVEL=WARNING

# Test database
DATABASE_URL=postgresql://postgres:password@localhost:5432/mochidrop_test
REDIS_URL=redis://localhost:6379/15

# Mock external services
TELEGRAM_BOT_TOKEN=test-token
SOLANA_NETWORK=devnet
```

#### Production Environment

```bash
# .env.production
APP_ENV=production
DEBUG=false
LOG_LEVEL=INFO

# Production services
DATABASE_URL=postgresql://user:pass@prod-db:5432/mochidrop
REDIS_URL=redis://prod-redis:6379/0

# Real API keys
TELEGRAM_BOT_TOKEN=real-bot-token
SENDGRID_API_KEY=real-sendgrid-key
SENTRY_DSN=real-sentry-dsn
```

### Configuration Validation

Create a configuration validator:

```python
# config/validator.py
import os
from typing import Dict, Any, List
from pydantic import BaseSettings, validator

class Settings(BaseSettings):
    # Database
    database_url: str
    db_pool_size: int = 10
    
    # Redis
    redis_url: str
    
    # Application
    app_env: str = "development"
    debug: bool = False
    
    # Security
    jwt_secret_key: str
    encryption_key: str
    
    # Telegram
    telegram_bot_token: str
    
    # Solana
    solana_network: str = "mainnet-beta"
    solana_rpc_url: str
    
    @validator('app_env')
    def validate_app_env(cls, v):
        allowed = ['development', 'test', 'production']
        if v not in allowed:
            raise ValueError(f'app_env must be one of {allowed}')
        return v
    
    @validator('solana_network')
    def validate_solana_network(cls, v):
        allowed = ['mainnet-beta', 'testnet', 'devnet']
        if v not in allowed:
            raise ValueError(f'solana_network must be one of {allowed}')
        return v
    
    @validator('jwt_secret_key')
    def validate_jwt_secret(cls, v):
        if len(v) < 32:
            raise ValueError('jwt_secret_key must be at least 32 characters')
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Usage
settings = Settings()
```

### Configuration Loading

```python
# config/loader.py
import os
from pathlib import Path
from typing import Dict, Any

class ConfigLoader:
    def __init__(self, env: str = None):
        self.env = env or os.getenv('APP_ENV', 'development')
        self.config = {}
        self.load_config()
    
    def load_config(self):
        """Load configuration from multiple sources"""
        # 1. Load base configuration
        self.load_env_file('.env')
        
        # 2. Load environment-specific configuration
        env_file = f'.env.{self.env}'
        if Path(env_file).exists():
            self.load_env_file(env_file)
        
        # 3. Override with environment variables
        self.load_environment_variables()
        
        # 4. Load secrets from files (Docker secrets)
        self.load_secrets()
    
    def load_env_file(self, filename: str):
        """Load variables from .env file"""
        if not Path(filename).exists():
            return
        
        with open(filename) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    self.config[key] = value
    
    def load_environment_variables(self):
        """Override with environment variables"""
        for key, value in os.environ.items():
            self.config[key] = value
    
    def load_secrets(self):
        """Load secrets from files (Docker secrets)"""
        secrets_dir = Path('/run/secrets')
        if secrets_dir.exists():
            for secret_file in secrets_dir.iterdir():
                if secret_file.is_file():
                    key = secret_file.name.upper()
                    value = secret_file.read_text().strip()
                    self.config[key] = value
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value"""
        return self.config.get(key, default)
    
    def get_bool(self, key: str, default: bool = False) -> bool:
        """Get boolean configuration value"""
        value = self.get(key, default)
        if isinstance(value, str):
            return value.lower() in ('true', '1', 'yes', 'on')
        return bool(value)
    
    def get_int(self, key: str, default: int = 0) -> int:
        """Get integer configuration value"""
        value = self.get(key, default)
        return int(value) if value is not None else default
    
    def get_list(self, key: str, default: List = None) -> List:
        """Get list configuration value"""
        value = self.get(key, default or [])
        if isinstance(value, str):
            return [item.strip() for item in value.split(',')]
        return value

# Usage
config = ConfigLoader()
database_url = config.get('DATABASE_URL')
debug = config.get_bool('DEBUG')
```

## 🐳 Docker Configuration

### Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - APP_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/mochidrop
      - REDIS_URL=redis://redis:6379/0
    env_file:
      - .env.production
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  bot:
    build: .
    command: python bot/main.py
    environment:
      - APP_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/mochidrop
      - REDIS_URL=redis://redis:6379/0
    env_file:
      - .env.production
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=mochidrop
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database_multitenant.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:8000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;

    server {
        listen 80;
        server_name api.mochidrop.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name api.mochidrop.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # API endpoints
        location /v1/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Authentication endpoints
        location /auth/ {
            limit_req zone=auth burst=10 nodelay;
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            proxy_pass http://api;
            access_log off;
        }

        # Static files
        location /static/ {
            alias /app/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

## 🔐 Security Configuration

### SSL/TLS Configuration

```bash
# Generate SSL certificate with Let's Encrypt
certbot certonly --webroot -w /var/www/html -d api.mochidrop.com

# Or use DNS challenge
certbot certonly --dns-cloudflare --dns-cloudflare-credentials ~/.secrets/cloudflare.ini -d api.mochidrop.com
```

### Firewall Configuration

```bash
# UFW (Ubuntu)
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# Fail2ban configuration
# /etc/fail2ban/jail.local
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
```

## 📊 Monitoring Configuration

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'mochidrop-api'
    static_configs:
      - targets: ['api:9090']
    metrics_path: /metrics
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']
```

### Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "title": "MochiDrop Metrics",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends",
            "legendFormat": "Active connections"
          }
        ]
      }
    ]
  }
}
```

## 🔄 Configuration Updates

### Hot Reloading Configuration

```python
# config/hot_reload.py
import os
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class ConfigReloadHandler(FileSystemEventHandler):
    def __init__(self, config_loader):
        self.config_loader = config_loader
    
    def on_modified(self, event):
        if event.src_path.endswith('.env'):
            print(f"Configuration file {event.src_path} modified, reloading...")
            self.config_loader.load_config()

# Usage
observer = Observer()
observer.schedule(ConfigReloadHandler(config), path='.', recursive=False)
observer.start()
```

### Configuration Deployment

```bash
#!/bin/bash
# deploy-config.sh

# Backup current configuration
cp .env.production .env.production.backup.$(date +%Y%m%d_%H%M%S)

# Deploy new configuration
cp .env.production.new .env.production

# Validate configuration
python -c "from config.validator import Settings; Settings()"

if [ $? -eq 0 ]; then
    echo "Configuration validated successfully"
    # Restart services
    docker-compose restart api bot
else
    echo "Configuration validation failed, rolling back"
    cp .env.production.backup.* .env.production
    exit 1
fi
```

## 🧪 Testing Configuration

### Configuration Testing

```python
# tests/test_config.py
import pytest
from config.loader import ConfigLoader
from config.validator import Settings

def test_config_loading():
    config = ConfigLoader('test')
    assert config.get('APP_ENV') == 'test'
    assert config.get_bool('DEBUG') == False

def test_config_validation():
    # Test valid configuration
    settings = Settings(
        database_url="postgresql://user:pass@localhost/test",
        redis_url="redis://localhost:6379/0",
        jwt_secret_key="a" * 32,
        encryption_key="b" * 32,
        telegram_bot_token="test-token"
    )
    assert settings.app_env == "development"

def test_invalid_config():
    # Test invalid configuration
    with pytest.raises(ValueError):
        Settings(
            database_url="postgresql://user:pass@localhost/test",
            redis_url="redis://localhost:6379/0",
            jwt_secret_key="short",  # Too short
            encryption_key="b" * 32,
            telegram_bot_token="test-token"
        )
```

---

## 📞 Support

For configuration help:
- 📧 **Technical Support**: tech@mochidrop.com
- 📚 **Documentation**: [Configuration Docs](https://dreyxd.github.io/MochiDrop/docs/configuration/)
- 🐛 **Report Issues**: [GitHub Issues](https://github.com/dreyxd/MochiDrop/issues)

This configuration guide ensures your MochiDrop deployment is secure, scalable, and maintainable.