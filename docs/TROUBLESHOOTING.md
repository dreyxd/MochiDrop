# Troubleshooting Guide

This guide helps you resolve common issues with MochiDrop. If you can't find a solution here, check our [FAQ](FAQ.md) or contact support.

## 🚨 Quick Diagnostics

### System Status Check

Before troubleshooting, verify system status:

1. **API Status**: Check [status.mochidrop.com](https://status.mochidrop.com)
2. **Solana Network**: Verify [status.solana.com](https://status.solana.com)
3. **Your Connection**: Test API connectivity

```bash
curl -H "X-API-Key: your-key" https://api.mochidrop.com/v1/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "2.0.0"
}
```

## 🔐 Authentication Issues

### API Key Problems

#### Issue: "Invalid API Key" Error

**Symptoms:**
- 401 Unauthorized responses
- "Invalid API key" error messages

**Solutions:**

1. **Verify API Key Format**
   ```bash
   # Correct format: mk_live_... or mk_test_...
   X-API-Key: mk_live_1234567890abcdef...
   ```

2. **Check Key Status**
   - Login to dashboard
   - Go to Settings → API Keys
   - Verify key is active and not expired

3. **Regenerate API Key**
   ```bash
   curl -X POST https://api.mochidrop.com/v1/developer/regenerate-api-key \
     -H "Authorization: Bearer your-jwt-token"
   ```

#### Issue: JWT Token Expired

**Symptoms:**
- "Token expired" errors
- Automatic logouts

**Solutions:**

1. **Refresh Token**
   ```javascript
   const response = await fetch('/auth/refresh', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ refresh_token: refreshToken })
   });
   ```

2. **Implement Auto-Refresh**
   ```javascript
   // Check token expiry before requests
   if (Date.now() >= tokenExpiry * 1000) {
     await refreshToken();
   }
   ```

### Rate Limiting Issues

#### Issue: "Rate Limit Exceeded" (429 Error)

**Symptoms:**
- 429 HTTP status codes
- "Too Many Requests" messages

**Solutions:**

1. **Check Rate Limit Headers**
   ```bash
   curl -I -H "X-API-Key: your-key" https://api.mochidrop.com/v1/projects
   # Look for: X-RateLimit-Remaining, X-RateLimit-Reset
   ```

2. **Implement Exponential Backoff**
   ```python
   import time
   import random
   
   def api_request_with_retry(url, max_retries=3):
       for attempt in range(max_retries):
           response = requests.get(url, headers=headers)
           if response.status_code != 429:
               return response
           
           # Exponential backoff with jitter
           delay = (2 ** attempt) + random.uniform(0, 1)
           time.sleep(delay)
       
       raise Exception("Max retries exceeded")
   ```

3. **Upgrade Your Tier**
   - Free: 100 requests/hour
   - Pro: 10,000 requests/hour
   - Enterprise: Custom limits

## 🤖 Bot Issues

### Telegram Bot Not Responding

#### Issue: Bot Commands Not Working

**Symptoms:**
- Bot doesn't respond to commands
- "Bot is not available" messages

**Solutions:**

1. **Check Bot Status**
   ```bash
   curl https://api.telegram.org/bot<BOT_TOKEN>/getMe
   ```

2. **Verify Webhook Configuration**
   ```bash
   curl https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo
   ```

3. **Test Bot Locally**
   ```python
   # Test bot connection
   import requests
   
   token = "your-bot-token"
   url = f"https://api.telegram.org/bot{token}/getMe"
   response = requests.get(url)
   print(response.json())
   ```

#### Issue: Users Can't Join Projects

**Symptoms:**
- "Project not found" errors
- Users can't access project features

**Solutions:**

1. **Verify Project Status**
   ```bash
   curl -H "X-API-Key: your-key" \
     https://api.mochidrop.com/v1/projects/PROJECT_ID
   ```

2. **Check Project Key**
   - Ensure project key is correct in bot configuration
   - Verify project is active (`is_active: true`)

3. **Database Connection Issues**
   ```python
   # Test database connectivity
   import psycopg2
   
   try:
       conn = psycopg2.connect(DATABASE_URL)
       print("Database connected successfully")
   except Exception as e:
       print(f"Database error: {e}")
   ```

### Bot Performance Issues

#### Issue: Slow Response Times

**Solutions:**

1. **Enable Redis Caching**
   ```python
   # Cache user sessions
   redis_client.setex(f"user:{user_id}", 3600, user_data)
   ```

2. **Optimize Database Queries**
   ```sql
   -- Add indexes for better performance
   CREATE INDEX idx_users_telegram_id ON users(telegram_id);
   CREATE INDEX idx_projects_key ON projects(project_key);
   ```

3. **Use Connection Pooling**
   ```python
   from psycopg2 import pool
   
   connection_pool = psycopg2.pool.ThreadedConnectionPool(
       minconn=1, maxconn=20, dsn=DATABASE_URL
   )
   ```

## 💰 Token Distribution Issues

### Airdrop Claims Failing

#### Issue: "Insufficient Funds" Error

**Symptoms:**
- Claims fail with insufficient balance
- Users can't receive tokens

**Solutions:**

1. **Check Project Wallet Balance**
   ```bash
   curl -H "X-API-Key: your-key" \
     https://api.mochidrop.com/v1/projects/PROJECT_ID/wallet
   ```

2. **Fund Project Wallet**
   ```bash
   # Send tokens to project wallet address
   solana transfer PROJECT_WALLET_ADDRESS AMOUNT --keypair your-keypair.json
   ```

3. **Verify Token Account**
   ```bash
   # Check if token account exists
   spl-token accounts --owner PROJECT_WALLET_ADDRESS
   ```

#### Issue: Transaction Failures

**Symptoms:**
- "Transaction failed" errors
- Tokens not received by users

**Solutions:**

1. **Check Solana Network Status**
   - Visit [status.solana.com](https://status.solana.com)
   - Check for network congestion

2. **Increase Transaction Priority**
   ```python
   # Add priority fee for faster processing
   transaction = Transaction()
   transaction.add(
       ComputeBudgetProgram.set_compute_unit_price(
           micro_lamports=1000  # Priority fee
       )
   )
   ```

3. **Retry Failed Transactions**
   ```python
   def retry_transaction(transaction, max_retries=3):
       for attempt in range(max_retries):
           try:
               signature = client.send_transaction(transaction)
               return signature
           except Exception as e:
               if attempt == max_retries - 1:
                   raise e
               time.sleep(2 ** attempt)
   ```

### Wallet Connection Issues

#### Issue: Invalid Wallet Addresses

**Symptoms:**
- "Invalid wallet address" errors
- Users can't set wallet addresses

**Solutions:**

1. **Validate Wallet Format**
   ```python
   from solana.publickey import PublicKey
   
   def validate_wallet(address):
       try:
           PublicKey(address)
           return True
       except ValueError:
           return False
   ```

2. **Check Address Length**
   ```python
   # Solana addresses should be 32-44 characters
   if len(address) < 32 or len(address) > 44:
       return False
   ```

## 🗄️ Database Issues

### Connection Problems

#### Issue: Database Connection Timeouts

**Symptoms:**
- "Connection timeout" errors
- Intermittent database failures

**Solutions:**

1. **Check Connection String**
   ```python
   # Verify DATABASE_URL format
   # postgresql://user:password@host:port/database
   ```

2. **Increase Connection Timeout**
   ```python
   import psycopg2
   
   conn = psycopg2.connect(
       DATABASE_URL,
       connect_timeout=30,
       options="-c statement_timeout=30000"
   )
   ```

3. **Use Connection Pooling**
   ```python
   from sqlalchemy import create_engine
   from sqlalchemy.pool import QueuePool
   
   engine = create_engine(
       DATABASE_URL,
       poolclass=QueuePool,
       pool_size=10,
       max_overflow=20,
       pool_timeout=30
   )
   ```

### Migration Issues

#### Issue: Database Schema Mismatch

**Symptoms:**
- "Table doesn't exist" errors
- Column not found errors

**Solutions:**

1. **Run Migrations**
   ```bash
   # Apply database migrations
   python manage.py migrate
   
   # Or manually run SQL
   psql -d DATABASE_URL -f database_multitenant.sql
   ```

2. **Check Schema Version**
   ```sql
   SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1;
   ```

3. **Backup Before Migration**
   ```bash
   pg_dump DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

## 🌐 API Integration Issues

### Request/Response Problems

#### Issue: Malformed JSON Responses

**Symptoms:**
- JSON parsing errors
- Unexpected response formats

**Solutions:**

1. **Check Content-Type Headers**
   ```bash
   curl -H "Content-Type: application/json" \
        -H "X-API-Key: your-key" \
        https://api.mochidrop.com/v1/projects
   ```

2. **Validate Request Body**
   ```python
   import json
   
   # Ensure valid JSON
   try:
       json.loads(request_body)
   except json.JSONDecodeError as e:
       print(f"Invalid JSON: {e}")
   ```

3. **Handle Response Errors**
   ```python
   response = requests.post(url, json=data, headers=headers)
   
   if response.status_code != 200:
       print(f"Error: {response.status_code}")
       print(f"Response: {response.text}")
   
   try:
       data = response.json()
   except json.JSONDecodeError:
       print("Invalid JSON response")
   ```

### Webhook Issues

#### Issue: Webhooks Not Receiving Events

**Symptoms:**
- Missing webhook notifications
- Events not triggering

**Solutions:**

1. **Verify Webhook URL**
   ```bash
   # Test webhook endpoint
   curl -X POST https://your-domain.com/webhook \
        -H "Content-Type: application/json" \
        -d '{"test": "data"}'
   ```

2. **Check Webhook Signature**
   ```python
   import hmac
   import hashlib
   
   def verify_webhook(payload, signature, secret):
       expected = hmac.new(
           secret.encode(),
           payload.encode(),
           hashlib.sha256
       ).hexdigest()
       return signature == f"sha256={expected}"
   ```

3. **Debug Webhook Delivery**
   ```python
   # Log webhook attempts
   @app.route('/webhook', methods=['POST'])
   def webhook():
       print(f"Headers: {request.headers}")
       print(f"Body: {request.data}")
       return "OK", 200
   ```

## 🔧 Self-Hosted Deployment Issues

### Docker Problems

#### Issue: Container Won't Start

**Symptoms:**
- Docker containers exit immediately
- "Container failed to start" errors

**Solutions:**

1. **Check Docker Logs**
   ```bash
   docker logs mochidrop-api
   docker logs mochidrop-bot
   ```

2. **Verify Environment Variables**
   ```bash
   # Check .env file exists and is properly formatted
   cat .env.public.example
   ```

3. **Test Database Connection**
   ```bash
   # Test PostgreSQL connection
   docker exec -it mochidrop-db psql -U postgres -d mochidrop
   ```

#### Issue: Port Conflicts

**Symptoms:**
- "Port already in use" errors
- Services can't bind to ports

**Solutions:**

1. **Check Port Usage**
   ```bash
   netstat -tulpn | grep :8000
   lsof -i :8000
   ```

2. **Change Port Configuration**
   ```yaml
   # docker-compose.yml
   services:
     api:
       ports:
         - "8001:8000"  # Change external port
   ```

### SSL/HTTPS Issues

#### Issue: SSL Certificate Problems

**Solutions:**

1. **Use Let's Encrypt**
   ```bash
   # Install certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Get certificate
   sudo certbot --nginx -d yourdomain.com
   ```

2. **Configure Nginx**
   ```nginx
   server {
       listen 443 ssl;
       server_name yourdomain.com;
       
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
   }
   ```

## 📊 Performance Issues

### High Memory Usage

#### Issue: Application Using Too Much Memory

**Solutions:**

1. **Monitor Memory Usage**
   ```bash
   # Check container memory
   docker stats mochidrop-api
   
   # System memory
   free -h
   htop
   ```

2. **Optimize Database Connections**
   ```python
   # Limit connection pool size
   engine = create_engine(
       DATABASE_URL,
       pool_size=5,
       max_overflow=10
   )
   ```

3. **Enable Garbage Collection**
   ```python
   import gc
   
   # Force garbage collection
   gc.collect()
   
   # Monitor memory usage
   import psutil
   process = psutil.Process()
   print(f"Memory usage: {process.memory_info().rss / 1024 / 1024:.2f} MB")
   ```

### Slow API Responses

#### Issue: API Endpoints Taking Too Long

**Solutions:**

1. **Add Database Indexes**
   ```sql
   CREATE INDEX CONCURRENTLY idx_users_project_id ON users(project_id);
   CREATE INDEX CONCURRENTLY idx_airdrops_active ON airdrops(is_active) WHERE is_active = true;
   ```

2. **Implement Caching**
   ```python
   from functools import lru_cache
   
   @lru_cache(maxsize=128)
   def get_project_stats(project_id):
       # Expensive calculation
       return calculate_stats(project_id)
   ```

3. **Use Async Operations**
   ```python
   import asyncio
   import aiohttp
   
   async def fetch_data(session, url):
       async with session.get(url) as response:
           return await response.json()
   ```

## 🆘 Getting Help

### When to Contact Support

Contact support if you experience:
- Data loss or corruption
- Security-related issues
- Persistent API failures
- Billing or account problems

### How to Report Issues

1. **Gather Information**
   - Error messages and stack traces
   - Steps to reproduce the issue
   - System information (OS, versions)
   - Relevant logs

2. **Create Support Ticket**
   - Email: support@mochidrop.com
   - Include: Project ID, timestamp, error details
   - Attach: Log files, screenshots

3. **Emergency Issues**
   - Security vulnerabilities: security@mochidrop.com
   - Critical system failures: Use priority support channel

### Log Collection

```bash
# Collect application logs
docker logs mochidrop-api > api-logs.txt
docker logs mochidrop-bot > bot-logs.txt

# System logs
journalctl -u docker > system-logs.txt

# Database logs
docker exec mochidrop-db pg_dump mochidrop > db-backup.sql
```

## 🔍 Diagnostic Tools

### Health Check Script

```python
#!/usr/bin/env python3
import requests
import psycopg2
import redis
import os

def check_api():
    try:
        response = requests.get("https://api.mochidrop.com/v1/health", timeout=10)
        return response.status_code == 200
    except:
        return False

def check_database():
    try:
        conn = psycopg2.connect(os.getenv('DATABASE_URL'))
        conn.close()
        return True
    except:
        return False

def check_redis():
    try:
        r = redis.from_url(os.getenv('REDIS_URL'))
        r.ping()
        return True
    except:
        return False

if __name__ == "__main__":
    print(f"API Health: {'✅' if check_api() else '❌'}")
    print(f"Database: {'✅' if check_database() else '❌'}")
    print(f"Redis: {'✅' if check_redis() else '❌'}")
```

### Performance Monitor

```python
import time
import psutil
import requests

def monitor_performance():
    while True:
        # CPU and Memory
        cpu_percent = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        
        # API Response Time
        start_time = time.time()
        try:
            requests.get("https://api.mochidrop.com/v1/health")
            api_response_time = time.time() - start_time
        except:
            api_response_time = None
        
        print(f"CPU: {cpu_percent}% | Memory: {memory.percent}% | API: {api_response_time:.2f}s")
        time.sleep(60)

if __name__ == "__main__":
    monitor_performance()
```

---

## 📞 Still Need Help?

If this guide doesn't solve your issue:

- 💬 **Discord**: [discord.gg/mochidrop](https://discord.gg/mochidrop)
- 📧 **Email**: support@mochidrop.com
- 🐛 **GitHub**: [Report Issues](https://github.com/dreyxd/MochiDrop/issues)
- 📚 **Docs**: [Full Documentation](https://dreyxd.github.io/MochiDrop/docs/)

Remember to include relevant error messages, logs, and steps to reproduce when asking for help!