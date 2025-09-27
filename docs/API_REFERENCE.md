# MochiDrop API Reference

Complete API documentation for the MochiDrop public platform.

## 🔗 Base URL

```
https://api.mochidrop.com/v1
```

## 🔐 Authentication

MochiDrop API uses API key authentication. Include your API key in the request headers:

```bash
curl -H "X-API-Key: your-api-key" \
     -H "Content-Type: application/json" \
     https://api.mochidrop.com/v1/projects
```

### Getting Your API Key

1. Register at [Developer Dashboard](https://dreyxd.github.io/MochiDrop/dashboard/)
2. Login to your account
3. Go to Settings → API Keys
4. Generate or copy your API key

## 📊 Rate Limits

| Tier | Requests/Hour | Requests/Day |
|------|---------------|--------------|
| Free | 100 | 1,000 |
| Pro | 10,000 | 100,000 |
| Enterprise | Custom | Custom |

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔧 Authentication Endpoints

### Register Developer Account

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "developer@example.com",
  "password": "secure_password",
  "first_name": "John",
  "last_name": "Doe",
  "company_name": "My Company"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "developer_id": 123,
  "email_verification_required": true
}
```

### Login

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "developer@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Refresh Token

```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Logout

```http
POST /auth/logout
```

**Headers:**
```
Authorization: Bearer your-jwt-token
```

## 👤 Developer Profile

### Get Profile

```http
GET /developer/profile
```

**Response:**
```json
{
  "id": 123,
  "email": "developer@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "company_name": "My Company",
  "api_key": "mk_live_...",
  "tier": "free",
  "created_at": "2024-01-01T00:00:00Z",
  "email_verified": true
}
```

### Update Profile

```http
PUT /developer/profile
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "company_name": "Updated Company"
}
```

### Regenerate API Key

```http
POST /developer/regenerate-api-key
```

**Response:**
```json
{
  "api_key": "mk_live_new_key_here",
  "message": "API key regenerated successfully"
}
```

## 🎯 Project Management

### List Projects

```http
GET /projects
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 10, max: 100)
- `search` (string): Search projects by name

**Response:**
```json
{
  "projects": [
    {
      "id": 1,
      "name": "My Awesome Project",
      "description": "A revolutionary DeFi project",
      "project_key": "ABC123",
      "website_url": "https://myproject.com",
      "twitter_handle": "myproject",
      "discord_url": "https://discord.gg/myproject",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "participants_count": 150,
      "airdrops_count": 3
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "pages": 1
}
```

### Create Project

```http
POST /projects
```

**Request Body:**
```json
{
  "name": "My New Project",
  "description": "Project description",
  "website_url": "https://mynewproject.com",
  "twitter_handle": "mynewproject",
  "discord_url": "https://discord.gg/mynewproject"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "My New Project",
  "project_key": "XYZ789",
  "message": "Project created successfully"
}
```

### Get Project Details

```http
GET /projects/{project_id}
```

**Response:**
```json
{
  "id": 1,
  "name": "My Awesome Project",
  "description": "A revolutionary DeFi project",
  "project_key": "ABC123",
  "website_url": "https://myproject.com",
  "twitter_handle": "myproject",
  "discord_url": "https://discord.gg/myproject",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "participants_count": 150,
  "airdrops_count": 3,
  "total_distributed": "1000000",
  "settings": {
    "auto_approve_claims": false,
    "require_wallet_verification": true,
    "max_participants": null
  }
}
```

### Update Project

```http
PUT /projects/{project_id}
```

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "website_url": "https://updated-url.com",
  "is_active": true
}
```

### Delete Project

```http
DELETE /projects/{project_id}
```

**Response:**
```json
{
  "message": "Project deleted successfully"
}
```

## 🎁 Airdrop Management

### List Project Airdrops

```http
GET /projects/{project_id}/airdrops
```

**Query Parameters:**
- `status` (string): Filter by status (`active`, `completed`, `draft`)
- `page` (integer): Page number
- `limit` (integer): Items per page

**Response:**
```json
{
  "airdrops": [
    {
      "id": 1,
      "name": "Launch Airdrop",
      "description": "Celebrating our token launch",
      "total_amount": "1000000",
      "token_symbol": "TOKEN",
      "start_date": "2024-01-01T00:00:00Z",
      "end_date": "2024-01-31T23:59:59Z",
      "max_participants": 1000,
      "participants_count": 150,
      "claims_count": 75,
      "is_active": true,
      "requirements": [
        "follow_twitter",
        "join_discord",
        "hold_nft"
      ]
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### Create Airdrop

```http
POST /airdrops
```

**Request Body:**
```json
{
  "project_id": 1,
  "name": "New Year Airdrop",
  "description": "Special New Year celebration",
  "total_amount": "500000",
  "token_symbol": "TOKEN",
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-01-31T23:59:59Z",
  "max_participants": 500,
  "requirements": [
    "follow_twitter",
    "join_discord"
  ],
  "distribution_rules": {
    "type": "equal",
    "amount_per_user": "1000"
  }
}
```

**Response:**
```json
{
  "id": 2,
  "name": "New Year Airdrop",
  "message": "Airdrop created successfully"
}
```

### Get Airdrop Details

```http
GET /airdrops/{airdrop_id}
```

**Response:**
```json
{
  "id": 1,
  "project_id": 1,
  "name": "Launch Airdrop",
  "description": "Celebrating our token launch",
  "total_amount": "1000000",
  "token_symbol": "TOKEN",
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-01-31T23:59:59Z",
  "max_participants": 1000,
  "participants_count": 150,
  "claims_count": 75,
  "is_active": true,
  "requirements": [
    "follow_twitter",
    "join_discord",
    "hold_nft"
  ],
  "distribution_rules": {
    "type": "equal",
    "amount_per_user": "1000"
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Update Airdrop

```http
PUT /airdrops/{airdrop_id}
```

**Request Body:**
```json
{
  "name": "Updated Airdrop Name",
  "description": "Updated description",
  "end_date": "2024-02-28T23:59:59Z",
  "is_active": true
}
```

## 📊 Analytics & Statistics

### Project Statistics

```http
GET /projects/{project_id}/stats
```

**Query Parameters:**
- `period` (string): Time period (`7d`, `30d`, `90d`, `1y`)

**Response:**
```json
{
  "project_id": 1,
  "period": "30d",
  "participants": {
    "total": 150,
    "new": 25,
    "growth_rate": 20.0
  },
  "airdrops": {
    "total": 3,
    "active": 1,
    "completed": 2
  },
  "claims": {
    "total": 75,
    "successful": 70,
    "pending": 5,
    "success_rate": 93.3
  },
  "tokens_distributed": "750000",
  "engagement": {
    "daily_active_users": 45,
    "retention_rate": 85.0
  }
}
```

### API Usage Statistics

```http
GET /developer/usage
```

**Response:**
```json
{
  "current_period": {
    "requests_made": 450,
    "requests_limit": 1000,
    "requests_remaining": 550,
    "reset_date": "2024-02-01T00:00:00Z"
  },
  "usage_by_endpoint": [
    {
      "endpoint": "/projects",
      "requests": 200,
      "percentage": 44.4
    },
    {
      "endpoint": "/airdrops",
      "requests": 150,
      "percentage": 33.3
    }
  ]
}
```

## 👥 User Management

### List Project Users

```http
GET /projects/{project_id}/users
```

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Items per page
- `search` (string): Search by username or wallet

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "telegram_id": 123456789,
      "username": "user123",
      "first_name": "John",
      "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      "joined_at": "2024-01-01T00:00:00Z",
      "last_activity": "2024-01-15T12:00:00Z",
      "claims_count": 2,
      "total_claimed": "2000"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10
}
```

### Get User Details

```http
GET /projects/{project_id}/users/{user_id}
```

**Response:**
```json
{
  "id": 1,
  "telegram_id": 123456789,
  "username": "user123",
  "first_name": "John",
  "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "joined_at": "2024-01-01T00:00:00Z",
  "last_activity": "2024-01-15T12:00:00Z",
  "claims": [
    {
      "airdrop_id": 1,
      "airdrop_name": "Launch Airdrop",
      "amount": "1000",
      "claimed_at": "2024-01-05T10:00:00Z",
      "transaction_hash": "5j7k8l9m..."
    }
  ]
}
```

## 🔔 Webhooks

### Configure Webhook

```http
POST /webhooks
```

**Request Body:**
```json
{
  "url": "https://yourapp.com/webhook",
  "events": [
    "user.joined",
    "airdrop.claimed",
    "project.updated"
  ],
  "secret": "your_webhook_secret"
}
```

### Webhook Events

MochiDrop sends POST requests to your webhook URL for these events:

#### User Joined Project
```json
{
  "event": "user.joined",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "project_id": 1,
    "user_id": 123,
    "telegram_id": 123456789,
    "username": "user123"
  }
}
```

#### Airdrop Claimed
```json
{
  "event": "airdrop.claimed",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "project_id": 1,
    "airdrop_id": 1,
    "user_id": 123,
    "amount": "1000",
    "transaction_hash": "5j7k8l9m..."
  }
}
```

## 🚨 Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "request_id": "req_123456789"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_API_KEY` | 401 | API key is invalid or missing |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource not found |
| `INSUFFICIENT_PERMISSIONS` | 403 | Access denied |
| `INTERNAL_ERROR` | 500 | Server error |

## 📝 Code Examples

### Python

```python
import requests

class MochiDropAPI:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.mochidrop.com/v1"
        self.headers = {
            "X-API-Key": api_key,
            "Content-Type": "application/json"
        }
    
    def create_project(self, name, description):
        data = {
            "name": name,
            "description": description
        }
        response = requests.post(
            f"{self.base_url}/projects",
            json=data,
            headers=self.headers
        )
        return response.json()
    
    def create_airdrop(self, project_id, name, total_amount):
        data = {
            "project_id": project_id,
            "name": name,
            "total_amount": total_amount,
            "token_symbol": "TOKEN"
        }
        response = requests.post(
            f"{self.base_url}/airdrops",
            json=data,
            headers=self.headers
        )
        return response.json()

# Usage
api = MochiDropAPI("your-api-key")
project = api.create_project("My Project", "Description")
airdrop = api.create_airdrop(project["id"], "Launch Airdrop", "1000000")
```

### JavaScript/Node.js

```javascript
class MochiDropAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.mochidrop.com/v1';
    }
    
    async request(method, endpoint, data = null) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers: {
                'X-API-Key': this.apiKey,
                'Content-Type': 'application/json'
            },
            body: data ? JSON.stringify(data) : null
        });
        
        return response.json();
    }
    
    async createProject(name, description) {
        return this.request('POST', '/projects', {
            name,
            description
        });
    }
    
    async getProjects() {
        return this.request('GET', '/projects');
    }
}

// Usage
const api = new MochiDropAPI('your-api-key');
const project = await api.createProject('My Project', 'Description');
console.log(project);
```

### cURL Examples

```bash
# Create project
curl -X POST https://api.mochidrop.com/v1/projects \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "description": "Project description"
  }'

# Get projects
curl -X GET https://api.mochidrop.com/v1/projects \
  -H "X-API-Key: your-api-key"

# Create airdrop
curl -X POST https://api.mochidrop.com/v1/airdrops \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 1,
    "name": "Launch Airdrop",
    "total_amount": "1000000",
    "token_symbol": "TOKEN"
  }'
```

## 🔍 Testing

### Sandbox Environment

Use the sandbox environment for testing:

```
Base URL: https://sandbox-api.mochidrop.com/v1
```

Sandbox features:
- Separate database
- No real token transfers
- Higher rate limits
- Test data reset daily

### Postman Collection

Import our Postman collection:
```
https://api.mochidrop.com/postman/collection.json
```

## 📚 SDKs

Official SDKs are available for:

- **Python:** `pip install mochidrop-python`
- **JavaScript:** `npm install mochidrop-js`
- **PHP:** `composer require mochidrop/php-sdk`

## 🆘 Support

- **Documentation:** https://docs.mochidrop.com
- **API Status:** https://status.mochidrop.com
- **Discord:** https://discord.gg/mochidrop
- **Email:** api-support@mochidrop.com

---

*Happy building! 🚀*