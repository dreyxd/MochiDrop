"""
Enhanced Solana Wallet Management System for MochiDrop Admins
Handles wallet generation, connection, balance checking, and token distribution
"""

import os
import json
import base58
import asyncio
import logging
from typing import Dict, List, Optional, Tuple
from decimal import Decimal
from cryptography.fernet import Fernet
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.system_program import TransferParams, transfer
from solders.transaction import Transaction
from solders.message import Message
from solana.rpc.async_api import AsyncClient
from solana.rpc.commitment import Confirmed
from solana.rpc.types import TxOpts
from spl.token.async_client import AsyncToken
from spl.token.constants import TOKEN_PROGRAM_ID
from spl.token.instructions import get_associated_token_address
import aiohttp

logger = logging.getLogger(__name__)

class SolanaWalletManager:
    """Enhanced Solana wallet management for admin operations"""
    
    def __init__(self):
        self.rpc_url = os.getenv('SOLANA_RPC_URL', 'https://api.devnet.solana.com')
        self.client = AsyncClient(self.rpc_url)
        self.encryption_key = self._get_or_create_encryption_key()
        self.fernet = Fernet(self.encryption_key)
        
        # Token registry for common SPL tokens
        self.token_registry = {
            'USDC': {
                'mint': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',  # Mainnet USDC
                'decimals': 6,
                'symbol': 'USDC'
            },
            'USDT': {
                'mint': '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',  # Mainnet USDT
                'decimals': 6,
                'symbol': 'USDT'
            },
            'SOL': {
                'mint': 'So11111111111111111111111111111111111111112',  # Wrapped SOL
                'decimals': 9,
                'symbol': 'SOL'
            }
        }
    
    def _get_or_create_encryption_key(self) -> bytes:
        """Get or create encryption key for wallet private keys"""
        key_file = 'wallet_encryption.key'
        
        if os.path.exists(key_file):
            with open(key_file, 'rb') as f:
                return f.read()
        else:
            key = Fernet.generate_key()
            with open(key_file, 'wb') as f:
                f.write(key)
            return key
    
    def encrypt_private_key(self, private_key: str) -> str:
        """Encrypt a private key for secure storage"""
        try:
            encrypted = self.fernet.encrypt(private_key.encode())
            return base58.b58encode(encrypted).decode()
        except Exception as e:
            logger.error(f"Error encrypting private key: {e}")
            raise
    
    def decrypt_private_key(self, encrypted_key: str) -> str:
        """Decrypt a private key for use"""
        try:
            encrypted_bytes = base58.b58decode(encrypted_key)
            decrypted = self.fernet.decrypt(encrypted_bytes)
            return decrypted.decode()
        except Exception as e:
            logger.error(f"Error decrypting private key: {e}")
            raise
    
    def generate_new_wallet(self) -> Dict[str, str]:
        """Generate a new Solana wallet keypair"""
        try:
            # Generate new keypair
            keypair = Keypair()
            
            # Get public key (wallet address)
            public_key = str(keypair.pubkey())
            
            # Get private key as base58 string
            private_key_bytes = bytes(keypair)
            private_key = base58.b58encode(private_key_bytes).decode()
            
            return {
                'public_key': public_key,
                'private_key': private_key,
                'mnemonic': None  # We're not generating mnemonic phrases
            }
        
        except Exception as e:
            logger.error(f"Error generating wallet: {e}")
            raise
    
    def validate_wallet_address(self, address: str) -> bool:
        """Validate a Solana wallet address"""
        try:
            if not address or len(address) < 32 or len(address) > 44:
                return False
            
            # Try to decode as base58
            decoded = base58.b58decode(address)
            
            # Solana public keys should be 32 bytes
            if len(decoded) != 32:
                return False
            
            # Try to create Pubkey object
            Pubkey.from_string(address)
            return True
        
        except Exception:
            return False
    
    def validate_private_key(self, private_key: str) -> bool:
        """Validate a Solana private key"""
        try:
            if not private_key:
                return False
            
            # Try to decode and create keypair
            private_key_bytes = base58.b58decode(private_key)
            
            # Solana private keys should be 64 bytes (32 bytes secret + 32 bytes public)
            if len(private_key_bytes) != 64:
                return False
            
            # Try to create keypair
            Keypair.from_bytes(private_key_bytes)
            return True
        
        except Exception:
            return False
    
    async def get_sol_balance(self, wallet_address: str) -> float:
        """Get SOL balance for a wallet"""
        try:
            pubkey = Pubkey.from_string(wallet_address)
            response = await self.client.get_balance(pubkey, commitment=Confirmed)
            
            if response.value is not None:
                # Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
                return response.value / 1_000_000_000
            return 0.0
        
        except Exception as e:
            logger.error(f"Error getting SOL balance for {wallet_address}: {e}")
            return 0.0
    
    async def get_token_balance(self, wallet_address: str, token_mint: str) -> float:
        """Get SPL token balance for a wallet"""
        try:
            wallet_pubkey = Pubkey.from_string(wallet_address)
            mint_pubkey = Pubkey.from_string(token_mint)
            
            # Get associated token account
            token_account = get_associated_token_address(wallet_pubkey, mint_pubkey)
            
            # Get token account info
            response = await self.client.get_token_account_balance(token_account, commitment=Confirmed)
            
            if response.value and response.value.amount:
                # Get token decimals
                decimals = response.value.decimals
                amount = int(response.value.amount)
                return amount / (10 ** decimals)
            
            return 0.0
        
        except Exception as e:
            logger.error(f"Error getting token balance for {wallet_address}, mint {token_mint}: {e}")
            return 0.0
    
    async def get_all_token_balances(self, wallet_address: str) -> Dict[str, float]:
        """Get balances for all known tokens"""
        balances = {}
        
        # Get SOL balance
        balances['SOL'] = await self.get_sol_balance(wallet_address)
        
        # Get SPL token balances
        for symbol, token_info in self.token_registry.items():
            if symbol != 'SOL':  # Skip SOL as we already got it
                balance = await self.get_token_balance(wallet_address, token_info['mint'])
                if balance > 0:  # Only include tokens with balance
                    balances[symbol] = balance
        
        return balances
    
    async def send_sol(self, from_private_key: str, to_address: str, amount: float) -> Optional[str]:
        """Send SOL from one wallet to another"""
        try:
            # Create keypair from private key
            private_key_bytes = base58.b58decode(from_private_key)
            from_keypair = Keypair.from_bytes(private_key_bytes)
            
            # Create destination pubkey
            to_pubkey = Pubkey.from_string(to_address)
            
            # Convert SOL to lamports
            lamports = int(amount * 1_000_000_000)
            
            # Create transfer instruction
            transfer_instruction = transfer(
                TransferParams(
                    from_pubkey=from_keypair.pubkey(),
                    to_pubkey=to_pubkey,
                    lamports=lamports
                )
            )
            
            # Get recent blockhash
            recent_blockhash = await self.client.get_latest_blockhash()
            
            # Create transaction
            message = Message.new_with_blockhash(
                [transfer_instruction],
                from_keypair.pubkey(),
                recent_blockhash.value.blockhash
            )
            
            transaction = Transaction.new_unsigned(message)
            transaction.sign([from_keypair], recent_blockhash.value.blockhash)
            
            # Send transaction
            response = await self.client.send_transaction(
                transaction,
                opts=TxOpts(skip_confirmation=False, preflight_commitment=Confirmed)
            )
            
            if response.value:
                logger.info(f"SOL transfer successful: {response.value}")
                return str(response.value)
            
            return None
        
        except Exception as e:
            logger.error(f"Error sending SOL: {e}")
            return None
    
    async def send_spl_token(self, from_private_key: str, to_address: str, 
                           token_mint: str, amount: float, decimals: int = 6) -> Optional[str]:
        """Send SPL tokens from one wallet to another"""
        try:
            # Create keypair from private key
            private_key_bytes = base58.b58decode(from_private_key)
            from_keypair = Keypair.from_bytes(private_key_bytes)
            
            # Create pubkeys
            to_pubkey = Pubkey.from_string(to_address)
            mint_pubkey = Pubkey.from_string(token_mint)
            
            # Calculate token amount with decimals
            token_amount = int(amount * (10 ** decimals))
            
            # Create SPL token client
            token_client = AsyncToken(
                conn=self.client,
                pubkey=mint_pubkey,
                program_id=TOKEN_PROGRAM_ID,
                payer=from_keypair
            )
            
            # Get or create associated token accounts
            from_token_account = get_associated_token_address(from_keypair.pubkey(), mint_pubkey)
            to_token_account = get_associated_token_address(to_pubkey, mint_pubkey)
            
            # Transfer tokens
            response = await token_client.transfer(
                source=from_token_account,
                dest=to_token_account,
                owner=from_keypair,
                amount=token_amount,
                multi_signers=None
            )
            
            if response.value:
                logger.info(f"SPL token transfer successful: {response.value}")
                return str(response.value)
            
            return None
        
        except Exception as e:
            logger.error(f"Error sending SPL token: {e}")
            return None
    
    async def get_token_info(self, token_mint: str) -> Optional[Dict]:
        """Get information about a token mint"""
        try:
            mint_pubkey = Pubkey.from_string(token_mint)
            
            # Get mint account info
            response = await self.client.get_account_info(mint_pubkey, commitment=Confirmed)
            
            if response.value and response.value.data:
                # Parse mint data (simplified)
                return {
                    'mint': token_mint,
                    'exists': True,
                    'owner': str(response.value.owner)
                }
            
            return None
        
        except Exception as e:
            logger.error(f"Error getting token info for {token_mint}: {e}")
            return None
    
    async def estimate_transaction_fee(self, transaction_type: str = 'transfer') -> float:
        """Estimate transaction fee in SOL"""
        try:
            # Get recent blockhash and fee calculator
            response = await self.client.get_recent_blockhash(commitment=Confirmed)
            
            if response.value:
                # Base fee is typically 5000 lamports for simple transfers
                base_fee = 5000
                
                # Add extra for SPL token transfers
                if transaction_type == 'spl_transfer':
                    base_fee += 2000
                
                return base_fee / 1_000_000_000  # Convert to SOL
            
            return 0.000005  # Default estimate
        
        except Exception as e:
            logger.error(f"Error estimating transaction fee: {e}")
            return 0.000005
    
    async def batch_send_tokens(self, from_private_key: str, recipients: List[Dict], 
                              token_mint: str = None, decimals: int = 6) -> Dict[str, str]:
        """Send tokens to multiple recipients in batch"""
        results = {}
        
        for recipient in recipients:
            try:
                to_address = recipient['address']
                amount = recipient['amount']
                
                if token_mint:
                    # Send SPL token
                    tx_hash = await self.send_spl_token(
                        from_private_key, to_address, token_mint, amount, decimals
                    )
                else:
                    # Send SOL
                    tx_hash = await self.send_sol(from_private_key, to_address, amount)
                
                results[to_address] = tx_hash if tx_hash else "FAILED"
                
                # Small delay between transactions to avoid rate limiting
                await asyncio.sleep(0.5)
            
            except Exception as e:
                logger.error(f"Error in batch send to {recipient.get('address', 'unknown')}: {e}")
                results[recipient.get('address', 'unknown')] = "ERROR"
        
        return results
    
    async def get_transaction_status(self, tx_hash: str) -> Dict:
        """Get the status of a transaction"""
        try:
            response = await self.client.get_transaction(tx_hash, commitment=Confirmed)
            
            if response.value:
                return {
                    'confirmed': True,
                    'success': response.value.transaction.meta.err is None,
                    'slot': response.value.slot,
                    'block_time': response.value.block_time
                }
            
            return {'confirmed': False, 'success': False}
        
        except Exception as e:
            logger.error(f"Error getting transaction status for {tx_hash}: {e}")
            return {'confirmed': False, 'success': False, 'error': str(e)}
    
    async def close(self):
        """Close the RPC client connection"""
        try:
            await self.client.close()
        except Exception as e:
            logger.error(f"Error closing Solana client: {e}")

# Create global instance
solana_wallet_manager = SolanaWalletManager()