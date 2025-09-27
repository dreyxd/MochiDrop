# Frequently Asked Questions (FAQ)

## 🤔 General Questions

### What is MochiDrop?

MochiDrop is a comprehensive Solana-based airdrop management platform that allows developers to create, manage, and distribute token airdrops through Telegram bots. It provides both a public SaaS platform and self-hosted options.

### How does MochiDrop work?

1. **For Developers**: Create projects, set up airdrops, and manage participants through our web dashboard or API
2. **For Users**: Join projects via Telegram, complete requirements, and claim airdrops directly to their Solana wallets
3. **For Communities**: Engage members through gamified airdrop campaigns with social media integration

### Is MochiDrop free to use?

We offer multiple tiers:
- **Free Tier**: Up to 100 API requests/hour, 1,000/day, basic features
- **Pro Tier**: 10,000 requests/hour, 100,000/day, advanced analytics
- **Enterprise**: Custom limits, dedicated support, white-label options

### What blockchain networks does MochiDrop support?

Currently, MochiDrop supports **Solana** blockchain. We're planning to add support for Ethereum, Polygon, and other EVM-compatible chains in future releases.

## 🚀 Getting Started

### How do I create my first project?

1. Register at our [Developer Dashboard](https://dreyxd.github.io/MochiDrop/dashboard/)
2. Verify your email address
3. Click "Create New Project" and fill in your project details
4. Get your project key and API key from the dashboard
5. Start creating airdrops!

### Do I need technical knowledge to use MochiDrop?

**For basic usage**: No! Our web dashboard is user-friendly and requires no coding.

**For advanced integration**: Some technical knowledge helps for API integration, webhook setup, and custom implementations.

### How do I integrate MochiDrop with my existing application?

Check our [Integration Examples](INTEGRATION_EXAMPLES.md) and [API Reference](API_REFERENCE.md) for detailed guides on integrating with React, Vue.js, Discord bots, and more.

## 🎁 Airdrops & Projects

### What types of airdrops can I create?

- **Social Media Airdrops**: Require Twitter follows, Discord joins, etc.
- **NFT Holder Airdrops**: Target specific NFT collections
- **Token Holder Airdrops**: Reward existing token holders
- **Engagement Airdrops**: Based on community participation
- **Time-Limited Campaigns**: Flash airdrops with deadlines
- **Referral Airdrops**: Reward users for bringing friends

### How many participants can join my airdrop?

This depends on your tier:
- **Free**: Up to 1,000 participants per project
- **Pro**: Up to 50,000 participants per project
- **Enterprise**: Unlimited participants

### Can I customize the bot messages and interface?

**Public Platform**: Limited customization through project settings

**Self-Hosted**: Full customization of bot messages, commands, and interface

### How do I verify airdrop requirements?

MochiDrop automatically verifies:
- Twitter follows and retweets
- Discord server membership
- Solana wallet ownership
- NFT holdings
- Token balances

Manual verification options are also available for custom requirements.

## 💰 Payments & Tokens

### How do token distributions work?

1. You fund your project wallet with tokens
2. Users complete airdrop requirements
3. Claims are processed automatically or manually (your choice)
4. Tokens are sent directly to users' Solana wallets

### What tokens can I distribute?

- **SPL Tokens**: Any Solana Program Library token
- **Native SOL**: Solana's native cryptocurrency
- **NFTs**: Solana-based NFT collections
- **Custom Tokens**: Your own project tokens

### Are there any fees?

- **Platform Fee**: 2% of distributed tokens (Pro tier: 1%, Enterprise: negotiable)
- **Solana Network Fees**: Standard blockchain transaction fees (~0.00025 SOL per transaction)
- **No Hidden Fees**: What you see is what you pay

### How do I fund my project wallet?

1. Go to your project dashboard
2. Navigate to "Wallet Management"
3. Send tokens to your project's wallet address
4. Tokens will be available for distribution immediately

## 🔐 Security & Privacy

### How secure is MochiDrop?

- **API Keys**: Encrypted and hashed storage
- **Wallet Security**: Private keys are encrypted with AES-256
- **Data Protection**: GDPR compliant, minimal data collection
- **Rate Limiting**: Protection against abuse and spam
- **Regular Audits**: Security reviews and updates

### What data do you collect?

We collect minimal data required for functionality:
- Telegram user ID and username
- Solana wallet addresses
- Project participation data
- API usage statistics

We **never** collect:
- Private keys or seed phrases
- Personal messages
- Unnecessary personal information

### Can I delete my data?

Yes! You can:
- Delete your developer account and all associated data
- Remove specific projects and their data
- Request data export (GDPR compliance)
- Contact support for complete data removal

### How are private keys managed?

- **Public Platform**: We manage encrypted wallets for you
- **Self-Hosted**: You have full control over private keys
- **Enterprise**: Options for both managed and self-custody solutions

## 🛠️ Technical Questions

### What are the API rate limits?

| Tier | Requests/Hour | Requests/Day | Burst Limit |
|------|---------------|--------------|-------------|
| Free | 100 | 1,000 | 10/minute |
| Pro | 10,000 | 100,000 | 100/minute |
| Enterprise | Custom | Custom | Custom |

### How do webhooks work?

Webhooks send real-time notifications to your application when events occur:
- User joins project
- Airdrop claimed
- Project updated
- Payment processed

See our [API Reference](API_REFERENCE.md) for webhook setup details.

### Can I use MochiDrop with multiple programming languages?

Yes! We provide:
- **Official SDKs**: Python, JavaScript/Node.js, PHP
- **REST API**: Works with any language that can make HTTP requests
- **Code Examples**: Available in multiple languages

### What's the difference between public and self-hosted versions?

| Feature | Public Platform | Self-Hosted |
|---------|----------------|-------------|
| **Setup** | Instant, no installation | Requires server setup |
| **Maintenance** | Managed by us | You maintain |
| **Customization** | Limited | Full control |
| **Scaling** | Automatic | Manual |
| **Cost** | Subscription + fees | Server costs only |
| **Support** | Included | Community |

## 🎯 Use Cases

### What are common use cases for MochiDrop?

1. **Token Launches**: Distribute tokens to early supporters
2. **Community Building**: Reward active community members
3. **Marketing Campaigns**: Increase social media engagement
4. **NFT Projects**: Reward holders with token airdrops
5. **DeFi Protocols**: Distribute governance tokens
6. **Gaming**: Reward players with in-game tokens
7. **Events**: Conference or meetup token distributions

### Can I run multiple airdrops simultaneously?

Yes! You can:
- Run multiple airdrops per project
- Target different audiences
- Set different requirements for each airdrop
- Schedule airdrops for future dates

### How do I handle large-scale airdrops?

For large airdrops (10,000+ participants):
1. Use **Pro or Enterprise** tier for higher limits
2. Enable **batch processing** for efficient distribution
3. Set up **webhooks** for real-time monitoring
4. Consider **phased rollouts** to manage load

## 📊 Analytics & Reporting

### What analytics are available?

- **Participant Growth**: Track user acquisition over time
- **Engagement Metrics**: Monitor community activity
- **Distribution Analytics**: Track token claim rates
- **Geographic Data**: See where your users are located
- **Referral Tracking**: Monitor viral growth
- **ROI Analysis**: Measure campaign effectiveness

### Can I export my data?

Yes! Export options include:
- **CSV Files**: Participant lists, claim data
- **JSON API**: Programmatic data access
- **Dashboard Reports**: Visual analytics exports
- **Raw Data**: Complete database exports (Enterprise)

### How often is data updated?

- **Real-time**: User actions, claims, joins
- **Hourly**: Analytics aggregations
- **Daily**: Comprehensive reports
- **On-demand**: Manual refresh available

## 🆘 Support & Community

### How do I get help?

1. **Documentation**: Check our comprehensive guides
2. **Discord Community**: Join our [Discord server](https://discord.gg/mochidrop)
3. **Email Support**: Contact api-support@mochidrop.com
4. **GitHub Issues**: Report bugs or request features
5. **Live Chat**: Available for Pro and Enterprise users

### What support is included with each tier?

| Tier | Support Level |
|------|---------------|
| **Free** | Community support, documentation |
| **Pro** | Email support, priority responses |
| **Enterprise** | Dedicated support, phone/video calls |

### How do I report a bug?

1. Check if it's a known issue in our [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Search existing [GitHub issues](https://github.com/dreyxd/MochiDrop/issues)
3. Create a new issue with:
   - Detailed description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Can I contribute to MochiDrop?

Absolutely! We welcome:
- **Code Contributions**: Bug fixes, new features
- **Documentation**: Improvements and translations
- **Community Support**: Help other users
- **Feedback**: Suggestions and feature requests

## 🔄 Migration & Updates

### How do I migrate from self-hosted to public platform?

1. **Export Data**: Use our migration tools to export your data
2. **Create Account**: Register on the public platform
3. **Import Projects**: Use our import wizard
4. **Update Integrations**: Switch API endpoints
5. **Test Everything**: Verify all functionality works

### How often do you release updates?

- **Security Updates**: Immediate as needed
- **Bug Fixes**: Weekly releases
- **Feature Updates**: Monthly releases
- **Major Versions**: Quarterly releases

### Will my API integrations break with updates?

We maintain **backward compatibility** for:
- All API endpoints for at least 12 months
- Webhook formats and structures
- Authentication methods

**Breaking changes** are:
- Announced 3 months in advance
- Documented with migration guides
- Supported with transition periods

## 💡 Best Practices

### How do I maximize airdrop engagement?

1. **Clear Requirements**: Make participation steps obvious
2. **Fair Distribution**: Ensure equitable token allocation
3. **Community Building**: Use airdrops to grow your community
4. **Regular Updates**: Keep participants informed
5. **Gamification**: Add elements of fun and competition

### What are common mistakes to avoid?

- **Insufficient Funding**: Always fund wallets before launching
- **Unclear Requirements**: Confusing instructions reduce participation
- **No Communication**: Keep your community updated
- **Ignoring Analytics**: Use data to improve future campaigns
- **Security Oversights**: Always verify wallet addresses

### How do I scale my airdrop program?

1. **Start Small**: Test with limited participants
2. **Analyze Results**: Use analytics to optimize
3. **Automate Processes**: Reduce manual work
4. **Build Community**: Focus on long-term engagement
5. **Upgrade Tiers**: Scale infrastructure as you grow

---

## 📞 Still Have Questions?

If you can't find the answer you're looking for:

- 💬 **Join our Discord**: [discord.gg/mochidrop](https://discord.gg/mochidrop)
- 📧 **Email us**: support@mochidrop.com
- 📚 **Check our docs**: [docs.mochidrop.com](https://dreyxd.github.io/MochiDrop/docs/)
- 🐛 **Report issues**: [GitHub Issues](https://github.com/dreyxd/MochiDrop/issues)

We're here to help you succeed with your airdrop campaigns! 🚀