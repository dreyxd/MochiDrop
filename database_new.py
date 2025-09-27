import asyncpg
import os
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from cryptography.fernet import Fernet
import logging

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.pool = None
        self.encryption_key = os.getenv('ENCRYPTION_KEY', Fernet.generate_key())
        self.fernet = Fernet(self.encryption_key)
    
    async def initialize(self):
        """Initialize database connection pool"""
        try:
            database_url = os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost/mochidrop')
            self.pool = await asyncpg.create_pool(database_url, min_size=1, max_size=10)
            logger.info("Database connection pool initialized")
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise
    
    async def close(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
    
    # User Management
    async def create_user(self, telegram_id: int, username: str = None, 
                         first_name: str = None, last_name: str = None, 
                         role: str = 'receiver') -> bool:
        """Create a new user with specified role"""
        try:
            async with self.pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO users (telegram_id, username, first_name, last_name, role)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (telegram_id) DO UPDATE SET
                        username = EXCLUDED.username,
                        first_name = EXCLUDED.first_name,
                        last_name = EXCLUDED.last_name,
                        updated_at = CURRENT_TIMESTAMP
                """, telegram_id, username, first_name, last_name, role)
                return True
        except Exception as e:
            logger.error(f"Error creating user {telegram_id}: {e}")
            return False
    
    async def get_user(self, telegram_id: int) -> Optional[Dict[str, Any]]:
        """Get user by telegram ID"""
        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow("""
                    SELECT * FROM users WHERE telegram_id = $1
                """, telegram_id)
                return dict(row) if row else None
        except Exception as e:
            logger.error(f"Error getting user {telegram_id}: {e}")
            return None
    
    async def update_user_wallet(self, telegram_id: int, wallet_address: str) -> bool:
        """Update user's wallet address"""
        try:
            async with self.pool.acquire() as conn:
                await conn.execute("""
                    UPDATE users SET wallet_address = $1, updated_at = CURRENT_TIMESTAMP
                    WHERE telegram_id = $2
                """, wallet_address, telegram_id)
                return True
        except Exception as e:
            logger.error(f"Error updating wallet for user {telegram_id}: {e}")
            return False
    
    async def is_admin(self, telegram_id: int) -> bool:
        """Check if user is admin"""
        user = await self.get_user(telegram_id)
        return user and user['role'] == 'admin'
    
    # Admin Session Management
    async def create_admin_session(self, telegram_id: int, duration_hours: int = 24) -> str:
        """Create admin session token"""
        try:
            session_token = secrets.token_urlsafe(32)
            expires_at = datetime.utcnow() + timedelta(hours=duration_hours)
            
            async with self.pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO admin_sessions (telegram_id, session_token, expires_at)
                    VALUES ($1, $2, $3)
                """, telegram_id, session_token, expires_at)
                return session_token
        except Exception as e:
            logger.error(f"Error creating admin session for {telegram_id}: {e}")
            return None
    
    async def validate_admin_session(self, telegram_id: int, session_token: str) -> bool:
        """Validate admin session token"""
        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow("""
                    SELECT expires_at FROM admin_sessions 
                    WHERE telegram_id = $1 AND session_token = $2
                """, telegram_id, session_token)
                
                if row and row['expires_at'] > datetime.utcnow():
                    return True
                return False
        except Exception as e:
            logger.error(f"Error validating admin session: {e}")
            return False
    
    # Airdrop Management
    async def create_airdrop(self, name: str, description: str, token_mint: str,
                           token_symbol: str, token_decimals: int, total_amount: int,
                           amount_per_claim: int, max_claims: int, admin_wallet: str,
                           created_by: int, start_date: datetime = None,
                           end_date: datetime = None) -> Optional[int]:
        """Create new airdrop campaign"""
        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow("""
                    INSERT INTO airdrops (name, description, token_mint, token_symbol,
                                        token_decimals, total_amount, amount_per_claim,
                                        max_claims, admin_wallet, created_by, start_date, end_date)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    RETURNING id
                """, name, description, token_mint, token_symbol, token_decimals,
                total_amount, amount_per_claim, max_claims, admin_wallet, created_by,
                start_date, end_date)
                return row['id'] if row else None
        except Exception as e:
            logger.error(f"Error creating airdrop: {e}")
            return None
    
    async def get_airdrop(self, airdrop_id: int) -> Optional[Dict[str, Any]]:
        """Get airdrop by ID"""
        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow("""
                    SELECT * FROM airdrops WHERE id = $1
                """, airdrop_id)
                return dict(row) if row else None
        except Exception as e:
            logger.error(f"Error getting airdrop {airdrop_id}: {e}")
            return None
    
    async def get_active_airdrops(self) -> List[Dict[str, Any]]:
        """Get all active airdrops"""
        try:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT * FROM airdrops 
                    WHERE status = 'active' 
                    AND (start_date IS NULL OR start_date <= CURRENT_TIMESTAMP)
                    AND (end_date IS NULL OR end_date >= CURRENT_TIMESTAMP)
                    ORDER BY created_at DESC
                """)
                return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"Error getting active airdrops: {e}")
            return []
    
    async def update_airdrop_status(self, airdrop_id: int, status: str) -> bool:
        """Update airdrop status"""
        try:
            async with self.pool.acquire() as conn:
                await conn.execute("""
                    UPDATE airdrops SET status = $1, updated_at = CURRENT_TIMESTAMP
                    WHERE id = $2
                """, status, airdrop_id)
                return True
        except Exception as e:
            logger.error(f"Error updating airdrop status: {e}")
            return False
    
    # Claims Management
    async def create_claim(self, airdrop_id: int, user_id: int, amount: int) -> Optional[int]:
        """Create new claim"""
        try:
            async with self.pool.acquire() as conn:
                # Check if user already claimed this airdrop
                existing = await conn.fetchrow("""
                    SELECT id FROM claims WHERE airdrop_id = $1 AND user_id = $2
                """, airdrop_id, user_id)
                
                if existing:
                    return None  # Already claimed
                
                # Create new claim
                row = await conn.fetchrow("""
                    INSERT INTO claims (airdrop_id, user_id, amount)
                    VALUES ($1, $2, $3)
                    RETURNING id
                """, airdrop_id, user_id, amount)
                
                # Update airdrop claim count
                await conn.execute("""
                    UPDATE airdrops SET current_claims = current_claims + 1
                    WHERE id = $1
                """, airdrop_id)
                
                return row['id'] if row else None
        except Exception as e:
            logger.error(f"Error creating claim: {e}")
            return None
    
    async def update_claim_status(self, claim_id: int, status: str, 
                                transaction_signature: str = None) -> bool:
        """Update claim status and transaction signature"""
        try:
            async with self.pool.acquire() as conn:
                if transaction_signature:
                    await conn.execute("""
                        UPDATE claims SET status = $1, transaction_signature = $2,
                                        processed_at = CURRENT_TIMESTAMP
                        WHERE id = $3
                    """, status, transaction_signature, claim_id)
                else:
                    await conn.execute("""
                        UPDATE claims SET status = $1, processed_at = CURRENT_TIMESTAMP
                        WHERE id = $2
                    """, status, claim_id)
                return True
        except Exception as e:
            logger.error(f"Error updating claim status: {e}")
            return False
    
    async def get_user_claims(self, telegram_id: int) -> List[Dict[str, Any]]:
        """Get all claims for a user"""
        try:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT c.*, a.name as airdrop_name, a.token_symbol
                    FROM claims c
                    JOIN airdrops a ON c.airdrop_id = a.id
                    WHERE c.user_id = $1
                    ORDER BY c.claimed_at DESC
                """, telegram_id)
                return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"Error getting user claims: {e}")
            return []
    
    # Admin Wallet Management
    async def add_admin_wallet(self, telegram_id: int, wallet_address: str,
                              wallet_name: str, private_key: str) -> bool:
        """Add encrypted admin wallet"""
        try:
            encrypted_key = self.fernet.encrypt(private_key.encode())
            async with self.pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO admin_wallets (telegram_id, wallet_address, wallet_name, encrypted_private_key)
                    VALUES ($1, $2, $3, $4)
                """, telegram_id, wallet_address, wallet_name, encrypted_key)
                return True
        except Exception as e:
            logger.error(f"Error adding admin wallet: {e}")
            return False
    
    async def get_admin_wallets(self, telegram_id: int) -> List[Dict[str, Any]]:
        """Get admin wallets (without private keys)"""
        try:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT id, wallet_address, wallet_name, is_active, created_at
                    FROM admin_wallets WHERE telegram_id = $1 AND is_active = true
                """, telegram_id)
                return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"Error getting admin wallets: {e}")
            return []
    
    async def get_decrypted_private_key(self, wallet_id: int, telegram_id: int) -> Optional[str]:
        """Get decrypted private key for admin wallet"""
        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow("""
                    SELECT encrypted_private_key FROM admin_wallets 
                    WHERE id = $1 AND telegram_id = $2 AND is_active = true
                """, wallet_id, telegram_id)
                
                if row and row['encrypted_private_key']:
                    return self.fernet.decrypt(row['encrypted_private_key']).decode()
                return None
        except Exception as e:
            logger.error(f"Error getting private key: {e}")
            return None
    
    # Analytics
    async def get_airdrop_stats(self, airdrop_id: int) -> Dict[str, Any]:
        """Get airdrop statistics"""
        try:
            async with self.pool.acquire() as conn:
                stats = await conn.fetchrow("""
                    SELECT 
                        COUNT(c.id) as total_claims,
                        COUNT(CASE WHEN c.status = 'completed' THEN 1 END) as completed_claims,
                        COUNT(CASE WHEN c.status = 'pending' THEN 1 END) as pending_claims,
                        COUNT(CASE WHEN c.status = 'failed' THEN 1 END) as failed_claims,
                        COALESCE(SUM(CASE WHEN c.status = 'completed' THEN c.amount END), 0) as total_distributed
                    FROM claims c
                    WHERE c.airdrop_id = $1
                """, airdrop_id)
                return dict(stats) if stats else {}
        except Exception as e:
            logger.error(f"Error getting airdrop stats: {e}")
            return {}

# Global database instance
db = DatabaseManager()