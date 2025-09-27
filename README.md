# 🍡 MochiDrop - Advanced Solana Airdrop Bot

[![Documentation](https://img.shields.io/badge/docs-live-brightgreen)](https://yourusername.github.io/mochidrop-docs)
[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://python.org)
[![Telegram](https://img.shields.io/badge/telegram-bot-blue.svg)](https://core.telegram.org/bots)
[![Solana](https://img.shields.io/badge/solana-blockchain-purple.svg)](https://solana.com)

MochiDrop is a sophisticated Telegram bot designed for managing Solana token airdrops with advanced role-based access control, automated distribution, and comprehensive tracking capabilities.

## ✨ Features

### 🎯 For Users
- **Easy Registration**: Simple wallet connection process
- **Airdrop Discovery**: Browse available airdrops with detailed information
- **One-Click Claims**: Automated token distribution to your wallet
- **Claim History**: Track all your airdrop participations
- **Real-time Updates**: Get notified about new airdrops

### 👑 For Administrators
- **Secure Admin Panel**: Role-based access control
- **Airdrop Creation**: Multi-step guided airdrop setup
- **User Management**: View and manage registered users
- **Analytics Dashboard**: Comprehensive statistics and insights
- **Transaction Monitoring**: Real-time transaction tracking

### 🔧 Technical Features
- **PostgreSQL Database**: Robust data storage and management
- **Async Architecture**: High-performance async/await patterns
- **Conversation States**: Advanced multi-step interaction flows
- **Error Handling**: Comprehensive error management and logging
- **Security**: Encrypted wallet management and secure transactions

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- PostgreSQL database
- Telegram Bot Token
- Solana RPC endpoint

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mochidrop.git
   cd mochidrop
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   python setup_database.py
   ```

5. **Run the bot**
   ```bash
   python bot.py
   ```

## 📚 Documentation

Visit our comprehensive documentation at: **[docs.mochidrop.com](https://yourusername.github.io/mochidrop-docs)**

The documentation includes:
- 📖 **Get Started Guide**: Quick setup and configuration
- 👤 **User Guide**: How to use the bot as an end user
- 👑 **Admin Guide**: Administrative features and management
- 🔧 **Technical Guide**: API reference and advanced configuration
- 📋 **Resources**: FAQ, troubleshooting, and support

## 🏗️ Architecture

```
MochiDrop/
├── bot.py                 # Main bot application
├── user_handlers.py       # User interaction handlers
├── admin_handlers.py      # Admin panel handlers
├── database.py           # Database operations
├── solana_utils.py       # Solana blockchain utilities
├── middleware.py         # Authentication middleware
├── requirements.txt      # Python dependencies
├── docs/                 # Documentation website
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── .github/
    └── workflows/
        └── deploy-docs.yml
```

## 🔐 Environment Variables

Create a `.env` file with the following variables:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
ADMIN_USER_IDS=123456789,987654321

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost/mochidrop

# Solana Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_PRIVATE_KEY=your_private_key_here

# Security
ENCRYPTION_KEY=your_32_byte_encryption_key
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 **Documentation**: [docs.mochidrop.com](https://yourusername.github.io/mochidrop-docs)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/mochidrop/issues)
- 💬 **Community**: [Telegram Group](https://t.me/mochidrop_community)
- 📧 **Email**: support@mochidrop.com

## 🙏 Acknowledgments

- [python-telegram-bot](https://github.com/python-telegram-bot/python-telegram-bot) - Telegram Bot API wrapper
- [Solana Python SDK](https://github.com/michaelhly/solana-py) - Solana blockchain integration
- [PostgreSQL](https://postgresql.org) - Database management system

---

<div align="center">
  <strong>Built with ❤️ for the Solana community</strong>
  <br>
  <sub>MochiDrop - Making airdrops sweet and simple! 🍡</sub>
</div>



## 🛠️ Admin Commands

### Task Management
- `/set_task "name" "description" type` - Add new task
- `/list_tasks` - View all active tasks

### Airdrop Control
- `/pause_airdrop` - Pause distribution
- `/resume_airdrop` - Resume distribution
- `/set_tokens <amount>` - Set tokens per user

### Monitoring
- `/admin_stats` - View statistics
- `/check_balance` - Check wallet balances
- `/export_users` - Export user data

### Communication
- `/broadcast <message>` - Message all users

## 👥 User Commands

- `/start` - Begin airdrop process
- `/help` - Show help guide
- `/status` - Check airdrop status

## 🔧 VPS Deployment

### Option 1: Using systemd (Recommended)

1. **Create service file:**
```bash
sudo nano /etc/systemd/system/mochidrop.service
```

2. **Add service configuration:**
```ini
[Unit]
Description=MochiDrop Telegram Bot
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/MochiDrop
ExecStart=/usr/bin/python3 /path/to/MochiDrop/bot.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

3. **Enable and start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable mochidrop
sudo systemctl start mochidrop
```

### Option 2: Using PM2

```bash
# Install PM2
npm install -g pm2

# Start bot
pm2 start bot.py --name mochidrop --interpreter python3

# Save PM2 configuration
pm2 save
pm2 startup
```

### Option 3: Using Screen

```bash
# Start screen session
screen -S mochidrop

# Run bot
python3 bot.py

# Detach: Ctrl+A, then D
# Reattach: screen -r mochidrop
```

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` file to version control
   - Use strong, unique private keys
   - Limit admin access

2. **Server Security**
   - Use firewall (UFW recommended)
   - Regular system updates
   - SSH key authentication only

3. **Wallet Security**
   - Use dedicated airdrop wallet
   - Monitor balances regularly
   - Keep minimal SOL for fees

## 📊 Database Schema

The bot uses SQLite with the following tables:

- `users` - User registration and wallet data
- `tasks` - Configurable task definitions
- `user_tasks` - Task completion tracking
- `transactions` - Token distribution records
- `settings` - Admin configuration

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid private key format"**
   - Ensure private key is in base58 format
   - Check for extra spaces or characters

2. **"Insufficient token balance"**
   - Check SPL token balance in wallet
   - Verify token mint address

3. **"Transaction failed"**
   - Ensure sufficient SOL for fees
   - Check RPC endpoint status

4. **Bot not responding**
   - Verify bot token is correct
   - Check internet connection
   - Review logs for errors

### Logs and Monitoring

```bash
# View systemd logs
sudo journalctl -u mochidrop -f

# View PM2 logs
pm2 logs mochidrop

# Check bot status
sudo systemctl status mochidrop
```

## 📈 Scaling and Performance

### For High Volume Airdrops

1. **Use Custom RPC**
   - Consider paid RPC services (QuickNode, Alchemy)
   - Better rate limits and reliability

2. **Batch Processing**
   - Implement batch token transfers
   - Reduce transaction costs

3. **Database Optimization**
   - Consider PostgreSQL for large datasets
   - Add database indexes

4. **Load Balancing**
   - Multiple bot instances
   - Queue-based processing

## 🎨 Customization

### Mascot and Theme
- Edit message templates in `bot.py`
- Add custom stickers/GIFs
- Modify color scheme and emojis

### Task Types
- Social media verification
- Quiz questions
- Referral systems
- Custom integrations

### Gamification
- Badge systems
- Leaderboards
- Seasonal events
- Mini-games

## 📄 License

This project is provided as-is for educational and development purposes.

## 🤝 Support

For technical support or questions:
- Check troubleshooting section
- Review logs for error details
- Ensure all dependencies are installed

## 🔄 Updates and Maintenance

### Regular Tasks
- Monitor token balances
- Review user activity
- Update dependencies
- Backup database

### Version Updates
```bash
# Backup database
cp mochidrop.db mochidrop.db.backup

# Update code
git pull origin main

# Install new dependencies
pip install -r requirements.txt

# Restart bot
sudo systemctl restart mochidrop
```

---

🍡 **Happy Airdropping with MochiDrop!** ✨