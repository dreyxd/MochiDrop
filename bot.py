"""
MochiDrop 🍡 - Solana Airdrop Management Telegram Bot
A role-based Telegram bot for managing Solana token airdrops with admin and user roles
"""

import os
import asyncio
import logging
from datetime import datetime
from telegram import Update
from telegram.ext import (
    Application, CommandHandler, MessageHandler, CallbackQueryHandler, 
    ContextTypes, ConversationHandler, filters
)
from dotenv import load_dotenv

# Import our modules
from database_new import db
from auth_middleware import auth_middleware
from user_handlers import user_handlers, WAITING_FOR_WALLET_ADDRESS, WAITING_FOR_NEW_WALLET_ADDRESS
from admin_handlers import admin_handlers, WAITING_FOR_ADMIN_PASSWORD, WAITING_FOR_AIRDROP_NAME, WAITING_FOR_AIRDROP_DESCRIPTION, WAITING_FOR_TOKEN_DETAILS, WAITING_FOR_AIRDROP_AMOUNTS, WAITING_FOR_MAX_CLAIMS, WAITING_FOR_PRIVATE_KEY
from callback_handlers import callback_handlers
from solana_wallet_manager import solana_wallet_manager

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO,
    handlers=[
        logging.FileHandler('mochidrop.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class MochiDropBot:
    """Main MochiDrop bot class with role-based access control"""
    
    def __init__(self):
        self.bot_token = os.getenv('BOT_TOKEN')
        if not self.bot_token:
            raise ValueError("BOT_TOKEN environment variable is required")
        
        # Initialize application
        self.application = None
        
        # Bot configuration
        self.admin_telegram_ids = self._parse_admin_ids()
        self.admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
        
        logger.info("MochiDrop bot initialized successfully")
    
    def _parse_admin_ids(self) -> list:
        """Parse admin telegram IDs from environment variable"""
        admin_ids_str = os.getenv('ADMIN_TELEGRAM_IDS', '')
        if not admin_ids_str:
            logger.warning("No ADMIN_TELEGRAM_IDS configured")
            return []
        
        try:
            return [int(id.strip()) for id in admin_ids_str.split(',') if id.strip()]
        except ValueError as e:
            logger.error(f"Error parsing ADMIN_TELEGRAM_IDS: {e}")
            return []
    
    async def setup_handlers(self):
        """Setup all command handlers and conversation flows"""
        
        # Initialize middleware and handlers with application context
        auth_middleware.set_application(self.application)
        user_handlers.set_application(self.application)
        admin_handlers.set_application(self.application)
        callback_handlers.set_application(self.application)
        
        # User conversation handler for wallet registration
        user_conversation = ConversationHandler(
            entry_points=[
                CommandHandler('start', user_handlers.start_command),
                CallbackQueryHandler(user_handlers.start_registration_callback, pattern='^start_registration$')
            ],
            states={
                WAITING_FOR_WALLET_ADDRESS: [
                    MessageHandler(filters.TEXT & ~filters.COMMAND, user_handlers.receive_wallet_address)
                ],
                WAITING_FOR_NEW_WALLET_ADDRESS: [
                    MessageHandler(filters.TEXT & ~filters.COMMAND, user_handlers.receive_new_wallet_address)
                ]
            },
            fallbacks=[
                CommandHandler('cancel', user_handlers.cancel_command),
                CommandHandler('start', user_handlers.start_command)
            ],
            per_user=True,
            per_chat=True
        )
        
        # Admin conversation handler for login and airdrop creation
        admin_conversation = ConversationHandler(
            entry_points=[
                CommandHandler('admin', admin_handlers.admin_login_command)
            ],
            states={
                WAITING_FOR_ADMIN_PASSWORD: [
                    MessageHandler(filters.TEXT & ~filters.COMMAND, admin_handlers.receive_admin_password)
                ],
                WAITING_FOR_AIRDROP_NAME: [
                    MessageHandler(filters.TEXT & ~filters.COMMAND, admin_handlers.receive_airdrop_name)
                ],
                WAITING_FOR_AIRDROP_DESCRIPTION: [
                    MessageHandler(filters.TEXT & ~filters.COMMAND, admin_handlers.receive_airdrop_description)
                ],
                WAITING_FOR_TOKEN_DETAILS: [
                    MessageHandler(filters.TEXT & ~filters.COMMAND, admin_handlers.receive_token_details)
                ],
                WAITING_FOR_AIRDROP_AMOUNTS: [
                    MessageHandler(filters.TEXT & ~filters.COMMAND, admin_handlers.receive_airdrop_amounts)
                ],
                WAITING_FOR_MAX_CLAIMS: [
                    MessageHandler(filters.TEXT & ~filters.COMMAND, admin_handlers.receive_max_claims)
                ],
                WAITING_FOR_PRIVATE_KEY: [
                    MessageHandler(filters.TEXT & ~filters.COMMAND, admin_handlers.receive_private_key)
                ]
            },
            fallbacks=[
                CommandHandler('cancel', admin_handlers.cancel_admin_conversation),
                CommandHandler('admin', admin_handlers.admin_login_command)
            ],
            per_user=True,
            per_chat=True
        )
        
        # Add conversation handlers
        self.application.add_handler(user_conversation)
        self.application.add_handler(admin_conversation)
        
        # User command handlers
        self.application.add_handler(CommandHandler('airdrops', user_handlers.airdrops_command))
        self.application.add_handler(CommandHandler('mywallet', user_handlers.mywallet_command))
        self.application.add_handler(CommandHandler('myclaims', user_handlers.myclaims_command))
        self.application.add_handler(CommandHandler('help', user_handlers.help_command))
        self.application.add_handler(CommandHandler('updatewallet', user_handlers.update_wallet_command))
        
        # Admin command handlers (these will be protected by middleware)
        self.application.add_handler(CommandHandler('dashboard', admin_handlers.admin_dashboard_command))
        self.application.add_handler(CommandHandler('create_airdrop', admin_handlers.create_airdrop_command))
        self.application.add_handler(CommandHandler('connect_wallet', admin_handlers.connect_wallet_command))
        self.application.add_handler(CommandHandler('stats', admin_handlers.admin_stats_command))
        self.application.add_handler(CommandHandler('logout', admin_handlers.admin_logout_command))
        
        # Callback query handlers for inline keyboards
        self.application.add_handler(CallbackQueryHandler(callback_handlers.handle_callback))
        
        # Error handler
        self.application.add_error_handler(self.error_handler)
        
        logger.info("All handlers setup successfully")
    
    async def error_handler(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle errors that occur during bot operation"""
        logger.error(f"Exception while handling an update: {context.error}")
        
        # Try to send error message to user
        try:
            if update and update.effective_chat:
                await update.effective_chat.send_message(
                    "❌ An error occurred while processing your request. Please try again later."
                )
        except Exception as e:
            logger.error(f"Failed to send error message to user: {e}")
    
    async def initialize_database(self):
        """Initialize database connection and create tables if needed"""
        try:
            await db.initialize()
            logger.info("Database initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise
    
    async def cleanup(self):
        """Cleanup resources when bot shuts down"""
        try:
            await db.close()
            logger.info("Database connection closed")
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
    
    def run(self):
        """Start the bot"""
        async def main():
            try:
                # Initialize database
                await self.initialize_database()
                
                # Create application
                self.application = Application.builder().token(self.bot_token).build()
                
                # Setup handlers
                await self.setup_handlers()
                
                # Start the bot
                logger.info("Starting MochiDrop bot...")
                await self.application.initialize()
                await self.application.start()
                await self.application.updater.start_polling()
                
                logger.info("MochiDrop bot is running! Press Ctrl+C to stop.")
                
                # Keep the bot running
                await self.application.updater.idle()
                
            except KeyboardInterrupt:
                logger.info("Bot stopped by user")
            except Exception as e:
                logger.error(f"Error running bot: {e}")
                raise
            finally:
                # Cleanup
                if self.application:
                    await self.application.updater.stop()
                    await self.application.stop()
                    await self.application.shutdown()
                await self.cleanup()
        
        # Run the async main function
        asyncio.run(main())

if __name__ == "__main__":
    try:
        bot = MochiDropBot()
        bot.run()
    except Exception as e:
        logger.error(f"Failed to start bot: {e}")
        exit(1)