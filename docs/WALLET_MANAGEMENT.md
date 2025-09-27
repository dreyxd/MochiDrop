# Wallet Management Guide

This guide covers comprehensive wallet management for MochiDrop's Solana integration, including wallet creation, security best practices, token operations, and troubleshooting.

## 🔐 Wallet Security Overview

MochiDrop implements enterprise-grade wallet security with multiple layers of protection:

- **Encrypted Private Keys**: All private keys are encrypted using AES-256
- **Hardware Security Module (HSM)** support for production
- **Multi-signature wallets** for high-value operations
- **Hierarchical Deterministic (HD)** wallet support
- **Cold storage** integration for long-term holdings

## 🏗️ Wallet Architecture

### Wallet Types

MochiDrop supports multiple wallet types:

1. **Project Wallets**: Main distribution wallets for each project
2. **User Wallets**: Individual user wallets for receiving tokens
3. **Treasury Wallets**: Multi-sig wallets for project funds
4. **Hot Wallets**: For automated distributions
5. **Cold Wallets**: For secure long-term storage

### Wallet Hierarchy

```
Master Wallet (Cold Storage)
├── Treasury Wallet (Multi-sig)
│   ├── Project Wallet A (Hot)
│   ├── Project Wallet B (Hot)
│   └── Project Wallet C (Hot)
└── Operational Wallet (Hot)
    ├── Fee Payment Wallet
    └── Emergency Wallet
```

## 🔑 Wallet Creation and Management

### Creating Project Wallets

#### Automatic Wallet Creation

```python
# api/wallet/manager.py
import os
from solana.keypair import Keypair
from solana.publickey import PublicKey
from cryptography.fernet import Fernet
import base64

class WalletManager:
    def __init__(self):
        self.encryption_key = os.getenv('ENCRYPTION_KEY').encode()
        self.fernet = Fernet(base64.urlsafe_b64encode(self.encryption_key[:32]))
    
    def create_project_wallet(self, project_id: str) -> dict:
        """Create a new wallet for a project"""
        # Generate new keypair
        keypair = Keypair()
        
        # Encrypt private key
        private_key_bytes = keypair.secret_key
        encrypted_private_key = self.fernet.encrypt(private_key_bytes)
        
        # Store in database
        wallet_data = {
            'project_id': project_id,
            'public_key': str(keypair.public_key),
            'encrypted_private_key': encrypted_private_key.decode(),
            'wallet_type': 'project',
            'is_active': True,
            'created_at': datetime.utcnow()
        }
        
        # Save to database
        self.save_wallet(wallet_data)
        
        return {
            'public_key': str(keypair.public_key),
            'wallet_id': wallet_data['id']
        }
    
    def decrypt_private_key(self, encrypted_key: str) -> bytes:
        """Decrypt private key for transactions"""
        return self.fernet.decrypt(encrypted_key.encode())
    
    def create_multisig_wallet(self, signers: list, threshold: int) -> dict:
        """Create multi-signature wallet"""
        from solana.transaction import Transaction
        from spl.token.instructions import create_multisig
        
        # Create multisig account
        multisig_keypair = Keypair()
        
        # Build multisig creation transaction
        transaction = Transaction()
        transaction.add(
            create_multisig(
                multisig=multisig_keypair.public_key,
                signers=signers,
                m=threshold
            )
        )
        
        return {
            'multisig_address': str(multisig_keypair.public_key),
            'signers': [str(signer) for signer in signers],
            'threshold': threshold
        }
```

#### Manual Wallet Import

```python
def import_wallet(self, private_key: str, project_id: str) -> dict:
    """Import existing wallet"""
    try:
        # Validate private key
        keypair = Keypair.from_secret_key(base64.b64decode(private_key))
        
        # Encrypt and store
        encrypted_key = self.fernet.encrypt(base64.b64decode(private_key))
        
        wallet_data = {
            'project_id': project_id,
            'public_key': str(keypair.public_key),
            'encrypted_private_key': encrypted_key.decode(),
            'wallet_type': 'imported',
            'is_active': True
        }
        
        self.save_wallet(wallet_data)
        return {'success': True, 'public_key': str(keypair.public_key)}
        
    except Exception as e:
        raise ValueError(f"Invalid private key: {e}")
```

### Wallet Configuration

#### Environment Configuration

```bash
# .env configuration for wallet management
WALLET_ENCRYPTION_KEY=your-32-byte-encryption-key-here
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Wallet Security Settings
WALLET_AUTO_BACKUP=true
WALLET_BACKUP_INTERVAL=3600  # 1 hour
WALLET_MAX_TRANSACTION_AMOUNT=1000000  # 1M tokens
WALLET_REQUIRE_2FA=true

# Multi-sig Settings
MULTISIG_THRESHOLD=2
MULTISIG_MAX_SIGNERS=10
MULTISIG_TIMEOUT=3600  # 1 hour

# Hardware Security Module (HSM)
HSM_ENABLED=false
HSM_PROVIDER=aws-cloudhsm
HSM_KEY_ID=your-hsm-key-id
```

#### Database Schema for Wallets

```sql
-- Wallets table
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Wallet Identity
    public_key VARCHAR(44) UNIQUE NOT NULL,
    encrypted_private_key TEXT,
    wallet_type VARCHAR(20) DEFAULT 'project' CHECK (
        wallet_type IN ('project', 'treasury', 'hot', 'cold', 'multisig', 'user')
    ),
    
    -- Security
    encryption_version INTEGER DEFAULT 1,
    requires_2fa BOOLEAN DEFAULT false,
    last_key_rotation TIMESTAMP WITH TIME ZONE,
    
    -- Multi-signature
    is_multisig BOOLEAN DEFAULT false,
    multisig_threshold INTEGER,
    multisig_signers JSONB DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_frozen BOOLEAN DEFAULT false,
    freeze_reason TEXT,
    
    -- Balances (cached)
    sol_balance BIGINT DEFAULT 0,
    token_balances JSONB DEFAULT '{}',
    last_balance_update TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallet transactions
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    
    -- Transaction Details
    signature VARCHAR(128) UNIQUE NOT NULL,
    transaction_type VARCHAR(50) NOT NULL CHECK (
        transaction_type IN ('send', 'receive', 'airdrop', 'fee', 'stake', 'unstake')
    ),
    
    -- Amounts
    amount BIGINT NOT NULL,
    token_address VARCHAR(44),
    fee_paid BIGINT DEFAULT 0,
    
    -- Addresses
    from_address VARCHAR(44),
    to_address VARCHAR(44),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'confirmed', 'failed', 'cancelled')
    ),
    block_height BIGINT,
    confirmation_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_wallets_project_id ON wallets(project_id);
CREATE INDEX idx_wallets_public_key ON wallets(public_key);
CREATE INDEX idx_wallets_type ON wallets(wallet_type);
CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_signature ON wallet_transactions(signature);
CREATE INDEX idx_wallet_transactions_status ON wallet_transactions(status);
```

## 💰 Token Operations

### Token Account Management

```python
# wallet/token_manager.py
from spl.token.client import Token
from spl.token.constants import TOKEN_PROGRAM_ID
from solana.rpc.api import Client

class TokenManager:
    def __init__(self, rpc_url: str):
        self.client = Client(rpc_url)
    
    def create_token_account(self, wallet_keypair: Keypair, mint_address: str) -> str:
        """Create associated token account"""
        from spl.token.instructions import get_associated_token_address, create_associated_token_account
        
        mint_pubkey = PublicKey(mint_address)
        owner_pubkey = wallet_keypair.public_key
        
        # Get associated token account address
        ata_address = get_associated_token_address(owner_pubkey, mint_pubkey)
        
        # Check if account already exists
        account_info = self.client.get_account_info(ata_address)
        if account_info['result']['value'] is not None:
            return str(ata_address)
        
        # Create associated token account
        transaction = Transaction()
        transaction.add(
            create_associated_token_account(
                payer=wallet_keypair.public_key,
                owner=owner_pubkey,
                mint=mint_pubkey
            )
        )
        
        # Send transaction
        response = self.client.send_transaction(transaction, wallet_keypair)
        return str(ata_address)
    
    def get_token_balance(self, wallet_address: str, token_address: str) -> int:
        """Get token balance for wallet"""
        try:
            from spl.token.instructions import get_associated_token_address
            
            wallet_pubkey = PublicKey(wallet_address)
            mint_pubkey = PublicKey(token_address)
            
            ata_address = get_associated_token_address(wallet_pubkey, mint_pubkey)
            
            response = self.client.get_token_account_balance(ata_address)
            if response['result']['value']:
                return int(response['result']['value']['amount'])
            return 0
            
        except Exception as e:
            print(f"Error getting token balance: {e}")
            return 0
    
    def transfer_tokens(self, from_keypair: Keypair, to_address: str, 
                       token_address: str, amount: int) -> str:
        """Transfer tokens between wallets"""
        from spl.token.instructions import transfer_checked, get_associated_token_address
        
        mint_pubkey = PublicKey(token_address)
        to_pubkey = PublicKey(to_address)
        
        # Get token accounts
        from_ata = get_associated_token_address(from_keypair.public_key, mint_pubkey)
        to_ata = get_associated_token_address(to_pubkey, mint_pubkey)
        
        # Ensure destination token account exists
        self.create_token_account_if_needed(to_pubkey, token_address)
        
        # Get token decimals
        mint_info = self.client.get_account_info(mint_pubkey)
        decimals = 9  # Default for most Solana tokens
        
        # Create transfer instruction
        transaction = Transaction()
        transaction.add(
            transfer_checked(
                source=from_ata,
                mint=mint_pubkey,
                dest=to_ata,
                owner=from_keypair.public_key,
                amount=amount,
                decimals=decimals
            )
        )
        
        # Send transaction
        response = self.client.send_transaction(transaction, from_keypair)
        return response['result']
```

### Batch Token Distribution

```python
def batch_distribute_tokens(self, from_keypair: Keypair, recipients: list, 
                          token_address: str, amount_per_recipient: int) -> list:
    """Distribute tokens to multiple recipients in batches"""
    from solana.transaction import Transaction
    from spl.token.instructions import transfer_checked, get_associated_token_address
    
    results = []
    batch_size = 10  # Process 10 transfers per transaction
    
    for i in range(0, len(recipients), batch_size):
        batch = recipients[i:i + batch_size]
        transaction = Transaction()
        
        mint_pubkey = PublicKey(token_address)
        from_ata = get_associated_token_address(from_keypair.public_key, mint_pubkey)
        
        for recipient in batch:
            to_pubkey = PublicKey(recipient)
            to_ata = get_associated_token_address(to_pubkey, mint_pubkey)
            
            # Ensure destination account exists
            self.create_token_account_if_needed(to_pubkey, token_address)
            
            # Add transfer instruction
            transaction.add(
                transfer_checked(
                    source=from_ata,
                    mint=mint_pubkey,
                    dest=to_ata,
                    owner=from_keypair.public_key,
                    amount=amount_per_recipient,
                    decimals=9
                )
            )
        
        try:
            # Send batch transaction
            response = self.client.send_transaction(transaction, from_keypair)
            results.append({
                'batch': i // batch_size + 1,
                'recipients': batch,
                'signature': response['result'],
                'status': 'success'
            })
        except Exception as e:
            results.append({
                'batch': i // batch_size + 1,
                'recipients': batch,
                'error': str(e),
                'status': 'failed'
            })
    
    return results
```

## 🔒 Security Best Practices

### Private Key Management

#### Key Encryption

```python
# security/encryption.py
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os

class KeyEncryption:
    def __init__(self, password: str = None):
        self.password = password or os.getenv('MASTER_PASSWORD')
        self.salt = os.getenv('ENCRYPTION_SALT', 'default_salt').encode()
        self.key = self._derive_key()
        self.fernet = Fernet(self.key)
    
    def _derive_key(self) -> bytes:
        """Derive encryption key from password"""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=self.salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(self.password.encode()))
        return key
    
    def encrypt_private_key(self, private_key: bytes) -> str:
        """Encrypt private key"""
        encrypted = self.fernet.encrypt(private_key)
        return base64.b64encode(encrypted).decode()
    
    def decrypt_private_key(self, encrypted_key: str) -> bytes:
        """Decrypt private key"""
        encrypted_bytes = base64.b64decode(encrypted_key.encode())
        return self.fernet.decrypt(encrypted_bytes)
    
    def rotate_encryption_key(self, old_password: str, new_password: str):
        """Rotate encryption key"""
        # This would re-encrypt all stored private keys with new key
        pass
```

#### Hardware Security Module (HSM) Integration

```python
# security/hsm.py
import boto3
from typing import Optional

class HSMManager:
    def __init__(self):
        self.hsm_client = boto3.client('cloudhsmv2')
        self.kms_client = boto3.client('kms')
    
    def create_key(self, key_spec: str = 'ECC_NIST_P256') -> str:
        """Create key in HSM"""
        response = self.kms_client.create_key(
            KeyUsage='SIGN_VERIFY',
            KeySpec=key_spec,
            Origin='AWS_CLOUDHSM'
        )
        return response['KeyMetadata']['KeyId']
    
    def sign_transaction(self, key_id: str, message: bytes) -> bytes:
        """Sign transaction using HSM key"""
        response = self.kms_client.sign(
            KeyId=key_id,
            Message=message,
            MessageType='RAW',
            SigningAlgorithm='ECDSA_SHA_256'
        )
        return response['Signature']
    
    def get_public_key(self, key_id: str) -> bytes:
        """Get public key from HSM"""
        response = self.kms_client.get_public_key(KeyId=key_id)
        return response['PublicKey']
```

### Access Control

#### Role-Based Access Control (RBAC)

```python
# security/rbac.py
from enum import Enum
from typing import List, Dict

class WalletPermission(Enum):
    VIEW_BALANCE = "view_balance"
    SEND_TOKENS = "send_tokens"
    MANAGE_WALLET = "manage_wallet"
    CREATE_WALLET = "create_wallet"
    DELETE_WALLET = "delete_wallet"
    SIGN_TRANSACTION = "sign_transaction"

class WalletRole(Enum):
    VIEWER = "viewer"
    OPERATOR = "operator"
    ADMIN = "admin"
    OWNER = "owner"

ROLE_PERMISSIONS = {
    WalletRole.VIEWER: [
        WalletPermission.VIEW_BALANCE
    ],
    WalletRole.OPERATOR: [
        WalletPermission.VIEW_BALANCE,
        WalletPermission.SEND_TOKENS,
        WalletPermission.SIGN_TRANSACTION
    ],
    WalletRole.ADMIN: [
        WalletPermission.VIEW_BALANCE,
        WalletPermission.SEND_TOKENS,
        WalletPermission.MANAGE_WALLET,
        WalletPermission.CREATE_WALLET,
        WalletPermission.SIGN_TRANSACTION
    ],
    WalletRole.OWNER: list(WalletPermission)  # All permissions
}

class WalletAccessControl:
    def __init__(self):
        self.user_roles: Dict[str, List[WalletRole]] = {}
    
    def assign_role(self, user_id: str, wallet_id: str, role: WalletRole):
        """Assign role to user for specific wallet"""
        key = f"{user_id}:{wallet_id}"
        if key not in self.user_roles:
            self.user_roles[key] = []
        self.user_roles[key].append(role)
    
    def check_permission(self, user_id: str, wallet_id: str, 
                        permission: WalletPermission) -> bool:
        """Check if user has permission for wallet operation"""
        key = f"{user_id}:{wallet_id}"
        user_roles = self.user_roles.get(key, [])
        
        for role in user_roles:
            if permission in ROLE_PERMISSIONS.get(role, []):
                return True
        return False
    
    def require_permission(self, user_id: str, wallet_id: str, 
                          permission: WalletPermission):
        """Decorator to require permission"""
        def decorator(func):
            def wrapper(*args, **kwargs):
                if not self.check_permission(user_id, wallet_id, permission):
                    raise PermissionError(f"User {user_id} lacks {permission.value} permission for wallet {wallet_id}")
                return func(*args, **kwargs)
            return wrapper
        return decorator
```

### Audit Logging

```python
# security/audit.py
import json
from datetime import datetime
from typing import Dict, Any

class WalletAuditLogger:
    def __init__(self, log_file: str = "wallet_audit.log"):
        self.log_file = log_file
    
    def log_wallet_action(self, user_id: str, wallet_id: str, action: str, 
                         details: Dict[str, Any] = None):
        """Log wallet-related actions"""
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'user_id': user_id,
            'wallet_id': wallet_id,
            'action': action,
            'details': details or {},
            'ip_address': self._get_client_ip(),
            'user_agent': self._get_user_agent()
        }
        
        with open(self.log_file, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
    
    def log_transaction(self, wallet_id: str, transaction_signature: str, 
                       transaction_type: str, amount: int, token_address: str):
        """Log transaction details"""
        self.log_wallet_action(
            user_id="system",
            wallet_id=wallet_id,
            action="transaction",
            details={
                'signature': transaction_signature,
                'type': transaction_type,
                'amount': amount,
                'token_address': token_address
            }
        )
    
    def log_security_event(self, event_type: str, details: Dict[str, Any]):
        """Log security-related events"""
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': 'security',
            'security_event': event_type,
            'details': details,
            'severity': self._determine_severity(event_type)
        }
        
        with open(self.log_file, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
    
    def _determine_severity(self, event_type: str) -> str:
        """Determine severity level of security event"""
        high_severity = ['unauthorized_access', 'key_compromise', 'large_transfer']
        medium_severity = ['failed_login', 'permission_denied', 'unusual_activity']
        
        if event_type in high_severity:
            return 'HIGH'
        elif event_type in medium_severity:
            return 'MEDIUM'
        return 'LOW'
```

## 📊 Wallet Monitoring and Analytics

### Balance Monitoring

```python
# monitoring/balance_monitor.py
import asyncio
from typing import Dict, List
from datetime import datetime, timedelta

class BalanceMonitor:
    def __init__(self, token_manager: TokenManager):
        self.token_manager = token_manager
        self.alert_thresholds = {}
        self.monitoring_active = False
    
    def set_alert_threshold(self, wallet_id: str, token_address: str, 
                           min_balance: int, max_balance: int = None):
        """Set balance alert thresholds"""
        key = f"{wallet_id}:{token_address}"
        self.alert_thresholds[key] = {
            'min_balance': min_balance,
            'max_balance': max_balance,
            'wallet_id': wallet_id,
            'token_address': token_address
        }
    
    async def monitor_balances(self):
        """Continuously monitor wallet balances"""
        self.monitoring_active = True
        
        while self.monitoring_active:
            for key, threshold in self.alert_thresholds.items():
                wallet_id = threshold['wallet_id']
                token_address = threshold['token_address']
                
                # Get current balance
                wallet = self.get_wallet(wallet_id)
                current_balance = self.token_manager.get_token_balance(
                    wallet['public_key'], token_address
                )
                
                # Check thresholds
                if current_balance < threshold['min_balance']:
                    await self.send_low_balance_alert(wallet_id, token_address, current_balance)
                
                if threshold['max_balance'] and current_balance > threshold['max_balance']:
                    await self.send_high_balance_alert(wallet_id, token_address, current_balance)
            
            # Wait before next check
            await asyncio.sleep(300)  # Check every 5 minutes
    
    async def send_low_balance_alert(self, wallet_id: str, token_address: str, balance: int):
        """Send low balance alert"""
        alert_data = {
            'type': 'low_balance',
            'wallet_id': wallet_id,
            'token_address': token_address,
            'current_balance': balance,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Send to monitoring system
        await self.send_alert(alert_data)
    
    async def send_high_balance_alert(self, wallet_id: str, token_address: str, balance: int):
        """Send high balance alert"""
        alert_data = {
            'type': 'high_balance',
            'wallet_id': wallet_id,
            'token_address': token_address,
            'current_balance': balance,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        await self.send_alert(alert_data)
```

### Transaction Analytics

```python
# analytics/wallet_analytics.py
from datetime import datetime, timedelta
from typing import Dict, List, Optional

class WalletAnalytics:
    def __init__(self, db_connection):
        self.db = db_connection
    
    def get_wallet_statistics(self, wallet_id: str, days: int = 30) -> Dict:
        """Get wallet statistics for specified period"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        query = """
        SELECT 
            COUNT(*) as total_transactions,
            COUNT(CASE WHEN transaction_type = 'send' THEN 1 END) as outgoing_count,
            COUNT(CASE WHEN transaction_type = 'receive' THEN 1 END) as incoming_count,
            SUM(CASE WHEN transaction_type = 'send' THEN amount ELSE 0 END) as total_sent,
            SUM(CASE WHEN transaction_type = 'receive' THEN amount ELSE 0 END) as total_received,
            SUM(fee_paid) as total_fees,
            AVG(amount) as average_amount,
            MAX(amount) as largest_transaction,
            MIN(amount) as smallest_transaction
        FROM wallet_transactions 
        WHERE wallet_id = %s AND created_at BETWEEN %s AND %s
        """
        
        result = self.db.execute(query, (wallet_id, start_date, end_date)).fetchone()
        
        return {
            'period_days': days,
            'total_transactions': result[0] or 0,
            'outgoing_transactions': result[1] or 0,
            'incoming_transactions': result[2] or 0,
            'total_sent': result[3] or 0,
            'total_received': result[4] or 0,
            'total_fees_paid': result[5] or 0,
            'average_transaction_amount': float(result[6] or 0),
            'largest_transaction': result[7] or 0,
            'smallest_transaction': result[8] or 0,
            'net_flow': (result[4] or 0) - (result[3] or 0)
        }
    
    def get_daily_transaction_volume(self, wallet_id: str, days: int = 30) -> List[Dict]:
        """Get daily transaction volume"""
        query = """
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as transaction_count,
            SUM(amount) as total_volume,
            SUM(fee_paid) as total_fees
        FROM wallet_transactions 
        WHERE wallet_id = %s 
        AND created_at >= %s
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        """
        
        start_date = datetime.utcnow() - timedelta(days=days)
        results = self.db.execute(query, (wallet_id, start_date)).fetchall()
        
        return [
            {
                'date': str(row[0]),
                'transaction_count': row[1],
                'total_volume': row[2],
                'total_fees': row[3]
            }
            for row in results
        ]
    
    def detect_unusual_activity(self, wallet_id: str) -> List[Dict]:
        """Detect unusual wallet activity"""
        alerts = []
        
        # Get recent statistics
        recent_stats = self.get_wallet_statistics(wallet_id, 7)
        historical_stats = self.get_wallet_statistics(wallet_id, 30)
        
        # Check for unusual volume
        if recent_stats['total_sent'] > historical_stats['average_transaction_amount'] * 10:
            alerts.append({
                'type': 'high_volume',
                'message': 'Unusually high transaction volume detected',
                'severity': 'medium'
            })
        
        # Check for unusual frequency
        if recent_stats['total_transactions'] > historical_stats['total_transactions'] * 0.5:
            alerts.append({
                'type': 'high_frequency',
                'message': 'Unusually high transaction frequency detected',
                'severity': 'low'
            })
        
        # Check for large single transactions
        if recent_stats['largest_transaction'] > historical_stats['average_transaction_amount'] * 20:
            alerts.append({
                'type': 'large_transaction',
                'message': 'Unusually large single transaction detected',
                'severity': 'high'
            })
        
        return alerts
```

## 🔧 Wallet Maintenance

### Automated Maintenance Tasks

```python
# maintenance/wallet_maintenance.py
import asyncio
from datetime import datetime, timedelta

class WalletMaintenance:
    def __init__(self, wallet_manager: WalletManager):
        self.wallet_manager = wallet_manager
    
    async def run_daily_maintenance(self):
        """Run daily maintenance tasks"""
        print(f"Starting daily wallet maintenance at {datetime.utcnow()}")
        
        # Update all wallet balances
        await self.update_all_balances()
        
        # Clean up old transactions
        await self.cleanup_old_transactions()
        
        # Rotate encryption keys if needed
        await self.check_key_rotation()
        
        # Generate maintenance report
        await self.generate_maintenance_report()
        
        print("Daily wallet maintenance completed")
    
    async def update_all_balances(self):
        """Update cached balances for all wallets"""
        wallets = self.wallet_manager.get_all_active_wallets()
        
        for wallet in wallets:
            try:
                # Update SOL balance
                sol_balance = self.wallet_manager.get_sol_balance(wallet['public_key'])
                
                # Update token balances
                token_balances = {}
                for token_address in wallet.get('tracked_tokens', []):
                    balance = self.wallet_manager.get_token_balance(
                        wallet['public_key'], token_address
                    )
                    token_balances[token_address] = balance
                
                # Update database
                self.wallet_manager.update_wallet_balances(
                    wallet['id'], sol_balance, token_balances
                )
                
            except Exception as e:
                print(f"Error updating balance for wallet {wallet['id']}: {e}")
    
    async def cleanup_old_transactions(self):
        """Clean up old transaction records"""
        cutoff_date = datetime.utcnow() - timedelta(days=90)
        
        # Archive old transactions
        archived_count = self.wallet_manager.archive_old_transactions(cutoff_date)
        print(f"Archived {archived_count} old transactions")
    
    async def check_key_rotation(self):
        """Check if encryption keys need rotation"""
        wallets_needing_rotation = self.wallet_manager.get_wallets_needing_key_rotation()
        
        for wallet in wallets_needing_rotation:
            try:
                self.wallet_manager.rotate_wallet_encryption(wallet['id'])
                print(f"Rotated encryption for wallet {wallet['id']}")
            except Exception as e:
                print(f"Error rotating encryption for wallet {wallet['id']}: {e}")
    
    async def generate_maintenance_report(self):
        """Generate daily maintenance report"""
        report = {
            'date': datetime.utcnow().date().isoformat(),
            'total_wallets': self.wallet_manager.get_wallet_count(),
            'active_wallets': self.wallet_manager.get_active_wallet_count(),
            'total_transactions_24h': self.wallet_manager.get_transaction_count_24h(),
            'total_volume_24h': self.wallet_manager.get_transaction_volume_24h(),
            'errors': self.wallet_manager.get_recent_errors()
        }
        
        # Save report
        self.wallet_manager.save_maintenance_report(report)
```

### Backup and Recovery

```python
# backup/wallet_backup.py
import json
import boto3
from datetime import datetime
from cryptography.fernet import Fernet

class WalletBackup:
    def __init__(self, s3_bucket: str, encryption_key: str):
        self.s3_client = boto3.client('s3')
        self.bucket = s3_bucket
        self.fernet = Fernet(encryption_key.encode())
    
    def backup_wallet_data(self, wallet_id: str) -> str:
        """Create encrypted backup of wallet data"""
        # Get wallet data
        wallet_data = self.wallet_manager.get_wallet_full_data(wallet_id)
        
        # Encrypt sensitive data
        encrypted_data = self.fernet.encrypt(
            json.dumps(wallet_data).encode()
        )
        
        # Create backup filename
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        backup_key = f"wallet_backups/{wallet_id}/{timestamp}.backup"
        
        # Upload to S3
        self.s3_client.put_object(
            Bucket=self.bucket,
            Key=backup_key,
            Body=encrypted_data,
            ServerSideEncryption='AES256'
        )
        
        return backup_key
    
    def restore_wallet_data(self, backup_key: str) -> dict:
        """Restore wallet data from backup"""
        # Download from S3
        response = self.s3_client.get_object(
            Bucket=self.bucket,
            Key=backup_key
        )
        
        encrypted_data = response['Body'].read()
        
        # Decrypt data
        decrypted_data = self.fernet.decrypt(encrypted_data)
        wallet_data = json.loads(decrypted_data.decode())
        
        return wallet_data
    
    def list_wallet_backups(self, wallet_id: str) -> list:
        """List available backups for wallet"""
        prefix = f"wallet_backups/{wallet_id}/"
        
        response = self.s3_client.list_objects_v2(
            Bucket=self.bucket,
            Prefix=prefix
        )
        
        backups = []
        for obj in response.get('Contents', []):
            backups.append({
                'key': obj['Key'],
                'size': obj['Size'],
                'last_modified': obj['LastModified'],
                'filename': obj['Key'].split('/')[-1]
            })
        
        return sorted(backups, key=lambda x: x['last_modified'], reverse=True)
```

## 🚨 Troubleshooting

### Common Wallet Issues

#### Issue: Transaction Failures

**Symptoms:**
- Transactions fail with "insufficient funds"
- "Account not found" errors
- Transaction timeouts

**Solutions:**

1. **Check Account Balance**:
```python
def diagnose_transaction_failure(wallet_address: str, token_address: str, amount: int):
    # Check SOL balance for fees
    sol_balance = get_sol_balance(wallet_address)
    if sol_balance < 5000:  # 0.000005 SOL minimum
        return "Insufficient SOL for transaction fees"
    
    # Check token balance
    token_balance = get_token_balance(wallet_address, token_address)
    if token_balance < amount:
        return f"Insufficient token balance. Have: {token_balance}, Need: {amount}"
    
    # Check if token account exists
    if not token_account_exists(wallet_address, token_address):
        return "Token account does not exist"
    
    return "Balance and accounts OK"
```

2. **Retry with Higher Priority Fee**:
```python
def retry_transaction_with_priority_fee(transaction, keypair, priority_fee=1000):
    from solana.transaction import Transaction
    from solana.system_program import transfer
    
    # Add priority fee instruction
    transaction.add(
        ComputeBudgetProgram.set_compute_unit_price(priority_fee)
    )
    
    return client.send_transaction(transaction, keypair)
```

#### Issue: Private Key Decryption Errors

**Symptoms:**
- "Invalid token" errors when decrypting
- "Fernet token expired" messages

**Solutions:**

1. **Check Encryption Key**:
```python
def verify_encryption_key():
    try:
        test_data = b"test_encryption"
        encrypted = fernet.encrypt(test_data)
        decrypted = fernet.decrypt(encrypted)
        return decrypted == test_data
    except Exception as e:
        return False
```

2. **Key Rotation Recovery**:
```python
def recover_with_old_key(encrypted_data: str, old_key: str):
    old_fernet = Fernet(old_key.encode())
    try:
        decrypted = old_fernet.decrypt(encrypted_data.encode())
        # Re-encrypt with new key
        new_encrypted = current_fernet.encrypt(decrypted)
        return new_encrypted.decode()
    except Exception as e:
        raise ValueError(f"Cannot decrypt with old key: {e}")
```

### Performance Issues

#### Issue: Slow Balance Updates

**Solutions:**

1. **Implement Caching**:
```python
import redis
from datetime import timedelta

class CachedBalanceManager:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.cache_ttl = 300  # 5 minutes
    
    def get_cached_balance(self, wallet_address: str, token_address: str) -> Optional[int]:
        cache_key = f"balance:{wallet_address}:{token_address}"
        cached_value = self.redis.get(cache_key)
        return int(cached_value) if cached_value else None
    
    def cache_balance(self, wallet_address: str, token_address: str, balance: int):
        cache_key = f"balance:{wallet_address}:{token_address}"
        self.redis.setex(cache_key, self.cache_ttl, balance)
```

2. **Batch Balance Queries**:
```python
def get_multiple_balances(wallet_addresses: list, token_address: str) -> dict:
    balances = {}
    
    # Use getMultipleAccounts for efficiency
    from spl.token.instructions import get_associated_token_address
    
    token_accounts = []
    for wallet_address in wallet_addresses:
        ata = get_associated_token_address(
            PublicKey(wallet_address), 
            PublicKey(token_address)
        )
        token_accounts.append(ata)
    
    # Batch request
    response = client.get_multiple_accounts(token_accounts)
    
    for i, account_info in enumerate(response['result']['value']):
        wallet_address = wallet_addresses[i]
        if account_info:
            # Parse token account data
            balance = parse_token_account_balance(account_info['data'])
            balances[wallet_address] = balance
        else:
            balances[wallet_address] = 0
    
    return balances
```

## 📞 Support and Resources

### Getting Help

For wallet-related issues:

- 📧 **Technical Support**: wallet-support@mochidrop.com
- 🔒 **Security Issues**: security@mochidrop.com
- 📚 **Documentation**: [Wallet Docs](https://dreyxd.github.io/MochiDrop/docs/wallet/)
- 🐛 **Report Bugs**: [GitHub Issues](https://github.com/dreyxd/MochiDrop/issues)

### Emergency Procedures

#### Suspected Key Compromise

1. **Immediate Actions**:
   - Freeze affected wallets
   - Transfer funds to secure wallets
   - Rotate all encryption keys
   - Notify security team

2. **Investigation**:
   - Review audit logs
   - Check for unauthorized transactions
   - Analyze access patterns

3. **Recovery**:
   - Generate new keypairs
   - Update all systems
   - Restore from secure backups

#### System Recovery

```bash
# Emergency wallet recovery script
#!/bin/bash

echo "Starting emergency wallet recovery..."

# Stop all wallet services
systemctl stop mochidrop-api mochidrop-bot

# Backup current state
pg_dump mochidrop > emergency_backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from last known good backup
psql mochidrop < last_good_backup.sql

# Verify wallet integrity
python scripts/verify_wallet_integrity.py

# Restart services
systemctl start mochidrop-api mochidrop-bot

echo "Emergency recovery completed"
```

---

This comprehensive wallet management guide ensures secure, efficient, and scalable handling of Solana wallets within the MochiDrop ecosystem. Regular monitoring, proper security practices, and automated maintenance are key to successful wallet operations.