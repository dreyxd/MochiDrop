#!/bin/bash

# MochiDrop Deployment Script
# This script sets up the MochiDrop bot on a VPS

set -e

echo "🍡 MochiDrop Deployment Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root"
    exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Python and pip
print_status "Installing Python and dependencies..."
sudo apt install -y python3 python3-pip python3-venv git curl

# Install Node.js and PM2 (optional)
print_status "Installing Node.js and PM2..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# Create project directory
PROJECT_DIR="$HOME/MochiDrop"
print_status "Setting up project directory at $PROJECT_DIR"

if [ -d "$PROJECT_DIR" ]; then
    print_warning "Directory already exists. Backing up..."
    mv "$PROJECT_DIR" "$PROJECT_DIR.backup.$(date +%Y%m%d_%H%M%S)"
fi

mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Copy files (assuming they're in current directory)
print_status "Copying project files..."
cp -r . "$PROJECT_DIR/" 2>/dev/null || true

# Create virtual environment
print_status "Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Setup environment file
print_status "Setting up environment configuration..."
if [ ! -f .env ]; then
    cp .env.example .env
    print_warning "Please edit .env file with your configuration:"
    print_warning "nano $PROJECT_DIR/.env"
fi

# Create systemd service
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/mochidrop.service > /dev/null <<EOF
[Unit]
Description=MochiDrop Telegram Bot
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR
Environment=PATH=$PROJECT_DIR/venv/bin
ExecStart=$PROJECT_DIR/venv/bin/python $PROJECT_DIR/bot.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable mochidrop

# Setup firewall (optional)
print_status "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Create management scripts
print_status "Creating management scripts..."

# Start script
cat > start.sh << 'EOF'
#!/bin/bash
echo "🍡 Starting MochiDrop bot..."
sudo systemctl start mochidrop
sudo systemctl status mochidrop
EOF

# Stop script
cat > stop.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping MochiDrop bot..."
sudo systemctl stop mochidrop
EOF

# Restart script
cat > restart.sh << 'EOF'
#!/bin/bash
echo "🔄 Restarting MochiDrop bot..."
sudo systemctl restart mochidrop
sudo systemctl status mochidrop
EOF

# Status script
cat > status.sh << 'EOF'
#!/bin/bash
echo "📊 MochiDrop bot status:"
sudo systemctl status mochidrop
echo ""
echo "📋 Recent logs:"
sudo journalctl -u mochidrop -n 20 --no-pager
EOF

# Logs script
cat > logs.sh << 'EOF'
#!/bin/bash
echo "📋 MochiDrop bot logs:"
sudo journalctl -u mochidrop -f
EOF

# Update script
cat > update.sh << 'EOF'
#!/bin/bash
echo "🔄 Updating MochiDrop bot..."

# Stop the service
sudo systemctl stop mochidrop

# Backup database
if [ -f "mochidrop.db" ]; then
    cp mochidrop.db "mochidrop.db.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Database backed up"
fi

# Activate virtual environment
source venv/bin/activate

# Update dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Restart service
sudo systemctl start mochidrop
sudo systemctl status mochidrop

echo "✅ Update complete!"
EOF

# Make scripts executable
chmod +x *.sh

# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="$HOME/mochidrop_backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "💾 Creating backup..."
tar -czf "$BACKUP_DIR/mochidrop_backup_$TIMESTAMP.tar.gz" \
    --exclude='venv' \
    --exclude='*.log' \
    --exclude='__pycache__' \
    .

echo "✅ Backup created: $BACKUP_DIR/mochidrop_backup_$TIMESTAMP.tar.gz"

# Keep only last 5 backups
cd "$BACKUP_DIR"
ls -t mochidrop_backup_*.tar.gz | tail -n +6 | xargs -r rm

echo "🧹 Old backups cleaned up"
EOF

chmod +x backup.sh

print_success "Deployment completed successfully!"
print_status "Next steps:"
echo "1. Edit configuration: nano $PROJECT_DIR/.env"
echo "2. Start the bot: ./start.sh"
echo "3. Check status: ./status.sh"
echo "4. View logs: ./logs.sh"
echo ""
print_status "Management commands:"
echo "• Start: ./start.sh"
echo "• Stop: ./stop.sh"
echo "• Restart: ./restart.sh"
echo "• Status: ./status.sh"
echo "• Logs: ./logs.sh"
echo "• Update: ./update.sh"
echo "• Backup: ./backup.sh"
echo ""
print_warning "Don't forget to:"
echo "1. Configure your .env file with bot token and wallet details"
echo "2. Fund your airdrop wallet with tokens and SOL"
echo "3. Test the bot before announcing to users"
echo ""
print_success "🍡 MochiDrop is ready to deliver tokens! ✨"