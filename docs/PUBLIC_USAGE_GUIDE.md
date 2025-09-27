# MochiDrop Public Usage Guide

## 🎉 Welcome to MochiDrop Public Platform!

MochiDrop has been transformed into a **public SaaS platform** that allows developers to create and manage airdrop projects without hosting their own bot infrastructure. Users can participate in multiple projects through a single public bot.

## 🏗️ Architecture Overview

### For Developers
- **No hosting required** - Use our public infrastructure
- **Multi-tenant platform** - Isolated project spaces
- **Web dashboard** - Manage projects and airdrops
- **REST API** - Programmatic access to your data
- **API key authentication** - Secure access control

### For Users
- **Single bot** - Access all projects through one interface
- **Project codes** - Join projects using simple codes
- **Web interface** - Advanced features via web app
- **Multi-project support** - Participate in multiple airdrops

## 🚀 Quick Start for Developers

### 1. Register Your Account
Visit the [Developer Dashboard](https://dreyxd.github.io/MochiDrop/dashboard/) and create your account:

```
1. Click "Register" 
2. Fill in your details
3. Verify your email
4. Login to your dashboard
```

### 2. Create Your First Project
```
1. Go to "Projects" section
2. Click "Create New Project"
3. Fill in project details:
   - Name: Your project name
   - Description: Brief description
   - Website: Your project website
   - Social links: Twitter, Discord, etc.
4. Save and get your PROJECT CODE
```

### 3. Share Your Project Code
Your users can join using:
```
/join YOUR_PROJECT_CODE
```

### 4. Create Airdrops
```
1. Select your project
2. Go to "Airdrops" section
3. Click "Create Airdrop"
4. Configure:
   - Token details
   - Requirements
   - Dates and limits
   - Distribution rules
```

## 📱 Quick Start for Users

### 1. Start the Bot
Find our public bot: [@MochiDropBot](https://t.me/MochiDropBot)

Send `/start` to begin!

### 2. Join Projects
Use project codes shared by developers:
```
/join ABC123
```

### 3. Connect Wallet
```
/wallet
```
Follow the instructions to connect your Solana wallet.

### 4. Participate in Airdrops
- Browse available airdrops
- Complete requirements
- Claim your rewards

## 🔧 Developer Features

### Web Dashboard
Access full project management at: https://dreyxd.github.io/MochiDrop/dashboard/

**Features:**
- Project creation and management
- Airdrop configuration
- User analytics
- API key management
- Real-time statistics

### REST API
Base URL: `https://api.mochidrop.com/v1`

**Authentication:**
```bash
curl -H "X-API-Key: your-api-key" \
     -H "Content-Type: application/json" \
     https://api.mochidrop.com/v1/projects
```

**Key Endpoints:**
- `GET /projects` - List your projects
- `POST /projects` - Create new project
- `GET /projects/{id}/airdrops` - Get project airdrops
- `POST /airdrops` - Create new airdrop
- `GET /projects/{id}/stats` - Get project statistics

### Project Isolation
Each project has:
- **Isolated data** - Your data is separate from other projects
- **API rate limits** - Fair usage policies
- **Access controls** - Only you can manage your projects
- **Secure storage** - Encrypted sensitive data

## 🎯 User Features

### Multi-Project Support
- Join unlimited projects
- Switch between projects easily
- Track participation across all projects

### Telegram Bot Commands
```
/start          - Welcome and main menu
/projects       - View your joined projects  
/join <code>    - Join a project
/wallet         - Manage your Solana wallet
/dashboard      - Open web interface
/help           - Get help
```

### Web Interface
Access advanced features at: https://dreyxd.github.io/MochiDrop/dashboard/

**User Features:**
- Detailed airdrop information
- Participation history
- Wallet management
- Notification settings

## 🔐 Security & Privacy

### For Developers
- **API Keys** - Secure authentication for API access
- **Data Isolation** - Your project data is isolated
- **Rate Limiting** - Protection against abuse
- **Audit Logs** - Track all API activities

### For Users
- **Wallet Security** - We never store private keys
- **Data Privacy** - Minimal data collection
- **Secure Communication** - All data encrypted in transit
- **User Control** - Delete your data anytime

## 💰 Pricing

### Free Tier
- Up to 3 projects
- 1,000 API calls/month
- Basic support
- Standard features

### Pro Tier ($29/month)
- Unlimited projects
- 100,000 API calls/month
- Priority support
- Advanced analytics
- Custom branding

### Enterprise (Custom)
- Custom limits
- Dedicated support
- SLA guarantees
- Custom integrations

## 🛠️ Migration from Self-Hosted

If you're currently running a self-hosted MochiDrop bot:

### 1. Export Your Data
```bash
# Export your current database
pg_dump your_database > mochidrop_backup.sql
```

### 2. Create Account
Register on our public platform and create your projects.

### 3. Import Data
Contact our support team to help migrate your existing:
- User data
- Airdrop history
- Wallet connections

### 4. Update Bot Token
Replace your bot with our public bot: [@MochiDropBot](https://t.me/MochiDropBot)

### 5. Share New Project Code
Inform your users about the new project code to join.

## 📊 Analytics & Monitoring

### Developer Analytics
- **User Growth** - Track project participants
- **Engagement** - Monitor user activity
- **Airdrop Performance** - Success rates and claims
- **API Usage** - Monitor your API consumption

### Real-time Monitoring
- Live user activity
- Airdrop claim tracking
- System health status
- Performance metrics

## 🔗 Integration Examples

### Webhook Integration
Receive real-time notifications:

```javascript
// Webhook endpoint example
app.post('/mochidrop-webhook', (req, res) => {
  const { event, data } = req.body;
  
  switch(event) {
    case 'user_joined':
      console.log(`New user joined: ${data.user_id}`);
      break;
    case 'airdrop_claimed':
      console.log(`Airdrop claimed: ${data.claim_id}`);
      break;
  }
  
  res.status(200).send('OK');
});
```

### API Integration
Automate project management:

```python
import requests

# Create new airdrop
response = requests.post(
    'https://api.mochidrop.com/v1/airdrops',
    headers={
        'X-API-Key': 'your-api-key',
        'Content-Type': 'application/json'
    },
    json={
        'project_id': 123,
        'name': 'Token Launch Airdrop',
        'total_amount': 1000000,
        'token_symbol': 'TOKEN',
        'requirements': ['follow_twitter', 'join_discord']
    }
)

print(f"Airdrop created: {response.json()}")
```

## 🆘 Support & Help

### Documentation
- [API Reference](https://docs.mochidrop.com/api)
- [Developer Guide](https://docs.mochidrop.com/developers)
- [User Guide](https://docs.mochidrop.com/users)

### Community
- [Telegram Support](https://t.me/mochidrop_support)
- [Discord Community](https://discord.gg/mochidrop)
- [GitHub Issues](https://github.com/dreyxd/MochiDrop/issues)

### Contact
- **Email:** support@mochidrop.com
- **Twitter:** [@MochiDrop](https://twitter.com/mochidrop)
- **Website:** https://mochidrop.com

## 🎉 Benefits of Public Platform

### For Developers
✅ **No Infrastructure Costs** - We handle hosting and scaling  
✅ **Faster Time to Market** - Launch airdrops in minutes  
✅ **Built-in User Base** - Access to existing MochiDrop users  
✅ **Professional Features** - Analytics, APIs, and more  
✅ **Reliable Service** - 99.9% uptime guarantee  

### For Users
✅ **Single Interface** - One bot for all projects  
✅ **Better Experience** - Consistent, polished interface  
✅ **More Projects** - Discover new airdrops easily  
✅ **Enhanced Security** - Professional security measures  
✅ **Always Updated** - Latest features automatically  

## 🚀 Get Started Today!

Ready to transform your airdrop strategy?

**Developers:** [Create Account](https://dreyxd.github.io/MochiDrop/dashboard/) → Create Project → Share Code

**Users:** [Start Bot](https://t.me/MochiDropBot) → Join Projects → Earn Rewards

---

*MochiDrop Public Platform - Making airdrops accessible for everyone! 🎁*