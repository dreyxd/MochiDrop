import asyncio
from solana.rpc.async_api import AsyncClient
from solana.rpc.commitment import Confirmed
from solders.keypair import Keypair
from solders.pubkey import Pubkey as PublicKey
from solana.transaction import Transaction
import base58
import os
from typing import Optional, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SolanaHandler:
    def __init__(self, rpc_url: str, private_key: str, token_mint: str):
        self.rpc_url = rpc_url
        self.client = AsyncClient(rpc_url)
        
        # Convert private key from base58 to Keypair
        try:
            private_key_bytes = base58.b58decode(private_key)
            self.keypair = Keypair.from_secret_key(private_key_bytes)
            self.wallet_pubkey = self.keypair.public_key
        except Exception as e:
            logger.error(f"Invalid private key format: {e}")
            raise ValueError("Invalid private key format")
        
        self.token_mint = PublicKey(token_mint)
        
    async def get_token_balance(self) -> float:
        """Get SPL token balance of the airdrop wallet"""
        try:
            # Get token accounts for the wallet
            response = await self.client.get_token_accounts_by_owner(
                self.wallet_pubkey,
                {"mint": self.token_mint},
                commitment=Confirmed
            )
            
            if not response.value:
                logger.warning("No token account found for the specified mint")
                return 0.0
            
            # Get the token account info
            token_account = response.value[0].pubkey
            account_info = await self.client.get_token_account_balance(
                token_account,
                commitment=Confirmed
            )
            
            if account_info.value:
                # Convert from smallest unit to actual tokens
                balance = float(account_info.value.amount) / (10 ** account_info.value.decimals)
                return balance
            
            return 0.0
            
        except Exception as e:
            logger.error(f"Error getting token balance: {e}")
            return 0.0
    
    async def get_sol_balance(self) -> float:
        """Get SOL balance for transaction fees"""
        try:
            response = await self.client.get_balance(self.wallet_pubkey)
            return response.value / 1e9  # Convert lamports to SOL
        except Exception as e:
            logger.error(f"Error getting SOL balance: {e}")
            return 0.0
    
    async def send_tokens(self, recipient_address: str, amount: float) -> Tuple[bool, Optional[str]]:
        """Send SPL tokens to recipient"""
        try:
            recipient_pubkey = PublicKey(recipient_address)
            
            # Check if we have enough tokens
            current_balance = await self.get_token_balance()
            if current_balance < amount:
                logger.error(f"Insufficient token balance. Required: {amount}, Available: {current_balance}")
                return False, None
            
            # Check SOL balance for fees
            sol_balance = await self.get_sol_balance()
            if sol_balance < 0.001:  # Minimum SOL for transaction fees
                logger.error(f"Insufficient SOL for transaction fees. Available: {sol_balance}")
                return False, None
            
            # Get or create associated token account for recipient
            recipient_token_account = await self._get_or_create_associated_token_account(recipient_pubkey)
            if not recipient_token_account:
                return False, None
            
            # Get sender's token account
            sender_token_accounts = await self.client.get_token_accounts_by_owner(
                self.wallet_pubkey,
                {"mint": self.token_mint},
                commitment=Confirmed
            )
            
            if not sender_token_accounts.value:
                logger.error("No token account found for sender")
                return False, None
            
            sender_token_account = sender_token_accounts.value[0].pubkey
            
            # Get token decimals
            mint_info = await self.client.get_account_info(self.token_mint)
            decimals = 9  # Default, you might want to parse this from mint info
            
            # Convert amount to smallest unit
            amount_in_smallest_unit = int(amount * (10 ** decimals))
            
            # Create transfer instruction
            transfer_instruction = transfer(
                TransferParams(
                    program_id=TOKEN_PROGRAM_ID,
                    source=sender_token_account,
                    dest=recipient_token_account,
                    owner=self.wallet_pubkey,
                    amount=amount_in_smallest_unit
                )
            )
            
            # Create and send transaction
            transaction = Transaction()
            transaction.add(transfer_instruction)
            
            # Get recent blockhash
            recent_blockhash = await self.client.get_latest_blockhash()
            transaction.recent_blockhash = recent_blockhash.value.blockhash
            
            # Sign transaction
            transaction.sign(self.keypair)
            
            # Send transaction
            response = await self.client.send_transaction(transaction)
            
            if response.value:
                logger.info(f"Transaction sent successfully: {response.value}")
                
                # Wait for confirmation
                await self._wait_for_confirmation(response.value)
                return True, str(response.value)
            else:
                logger.error("Failed to send transaction")
                return False, None
                
        except Exception as e:
            logger.error(f"Error sending tokens: {e}")
            return False, None
    
    async def _get_or_create_associated_token_account(self, recipient_pubkey: PublicKey) -> Optional[PublicKey]:
        """Get or create associated token account for recipient"""
        try:
            from spl.token.instructions import get_associated_token_address
            
            # Calculate associated token account address
            associated_token_account = get_associated_token_address(
                recipient_pubkey,
                self.token_mint
            )
            
            # Check if account exists
            account_info = await self.client.get_account_info(associated_token_account)
            
            if account_info.value is None:
                # Account doesn't exist, create it
                from spl.token.instructions import create_associated_token_account
                
                create_instruction = create_associated_token_account(
                    payer=self.wallet_pubkey,
                    owner=recipient_pubkey,
                    mint=self.token_mint
                )
                
                transaction = Transaction()
                transaction.add(create_instruction)
                
                # Get recent blockhash
                recent_blockhash = await self.client.get_latest_blockhash()
                transaction.recent_blockhash = recent_blockhash.value.blockhash
                
                # Sign and send
                transaction.sign(self.keypair)
                response = await self.client.send_transaction(transaction)
                
                if response.value:
                    await self._wait_for_confirmation(response.value)
                    logger.info(f"Created associated token account: {associated_token_account}")
                else:
                    logger.error("Failed to create associated token account")
                    return None
            
            return associated_token_account
            
        except Exception as e:
            logger.error(f"Error with associated token account: {e}")
            return None
    
    async def _wait_for_confirmation(self, signature: str, max_retries: int = 30):
        """Wait for transaction confirmation"""
        for i in range(max_retries):
            try:
                response = await self.client.get_signature_statuses([signature])
                if response.value and response.value[0]:
                    status = response.value[0]
                    if status.confirmation_status == "confirmed" or status.confirmation_status == "finalized":
                        logger.info(f"Transaction confirmed: {signature}")
                        return True
                
                await asyncio.sleep(2)  # Wait 2 seconds before retry
                
            except Exception as e:
                logger.error(f"Error checking confirmation: {e}")
                await asyncio.sleep(2)
        
        logger.warning(f"Transaction confirmation timeout: {signature}")
        return False
    
    async def validate_wallet_address(self, address: str) -> bool:
        """Validate if the provided address is a valid Solana wallet"""
        try:
            PublicKey(address)
            return True
        except:
            return False
    
    async def close(self):
        """Close the RPC client"""
        await self.client.close()