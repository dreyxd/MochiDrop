from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes, ConversationHandler
from auth_middleware import require_role
from database_new import db
from solana_handler_simple import SolanaHandler
import logging

logger = logging.getLogger(__name__)

# Conversation states
WAITING_FOR_WALLET_ADDRESS = 1
WAITING_FOR_NEW_WALLET_ADDRESS = 2

class UserHandlers:
    """Handlers for user (receiver) commands"""
    
    def __init__(self):
        self.solana_handler = SolanaHandler()
    
    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command - User registration"""
        try:
            telegram_id = update.effective_user.id
            first_name = update.effective_user.first_name or "User"
            username = update.effective_user.username
            
            # Check if user already exists
            existing_user = await db.get_user(telegram_id)
            
            if existing_user:
                if existing_user['wallet_address']:
                    # User already registered with wallet
                    keyboard = [
                        [InlineKeyboardButton("🎯 Browse Airdrops", callback_data="browse_airdrops")],
                        [InlineKeyboardButton("💼 My Wallet", callback_data="my_wallet")],
                        [InlineKeyboardButton("🎁 My Claims", callback_data="my_claims")]
                    ]
                    reply_markup = InlineKeyboardMarkup(keyboard)
                    
                    await update.message.reply_text(
                        f"🍡 **Welcome back, {first_name}!**\n\n"
                        f"✅ **Your wallet is registered:**\n"
                        f"`{existing_user['wallet_address'][:8]}...{existing_user['wallet_address'][-8:]}`\n\n"
                        f"🎯 **Quick Actions:**\n"
                        f"Use the buttons below or these commands:\n\n"
                        f"• `/airdrops` - Browse available airdrops\n"
                        f"• `/mywallet` - Manage your wallet\n"
                        f"• `/myclaims` - View your claim history\n"
                        f"• `/help` - Get help\n\n"
                        f"Ready to claim some airdrops? 🚀",
                        reply_markup=reply_markup,
                        parse_mode='Markdown'
                    )
                else:
                    # User exists but no wallet
                    await update.message.reply_text(
                        f"🍡 **Welcome back, {first_name}!**\n\n"
                        f"❌ **No wallet registered**\n\n"
                        f"To participate in airdrops, please provide your Solana wallet address.\n\n"
                        f"📝 **Send your wallet address now:**\n"
                        f"Example: `9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM`\n\n"
                        f"🔒 **Security:** We only store your public wallet address.",
                        parse_mode='Markdown'
                    )
                    return WAITING_FOR_WALLET_ADDRESS
            else:
                # New user registration
                user_id = await db.create_user(
                    telegram_id=telegram_id,
                    first_name=first_name,
                    username=username,
                    role='receiver'
                )
                
                if user_id:
                    # Send the cute mochi character image first
                    with open('mochi_character.svg', 'rb') as photo:
                        await update.message.reply_photo(
                            photo=photo,
                            caption=(
                                f"🍡 **Welcome to MochiDrop, {first_name}!**\n\n"
                                f"✨ **Meet your fluffy friend!** ✨\n\n"
                                f"🎯 **Your Personal Airdrop Portal**\n"
                                f"Get free tokens from various Solana projects!\n\n"
                                f"🌟 **What you can do:**\n"
                                f"• 🎁 Claim free token airdrops\n"
                                f"• 💰 Manage your Solana wallet\n"
                                f"• 📊 Track your claim history\n"
                                f"• 🚀 Discover new projects\n\n"
                                f"📝 **First, let's register your Solana wallet:**\n"
                                f"Send your wallet address to get started!\n\n"
                                f"Example: `9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM`\n\n"
                                f"🔒 **Security:** We only store your public wallet address."
                            ),
                            parse_mode='Markdown'
                        )
                    return WAITING_FOR_WALLET_ADDRESS
                else:
                    await update.message.reply_text(
                        "❌ **Registration Error**\n\n"
                        "There was an error creating your account. Please try again."
                    )
        
        except Exception as e:
            logger.error(f"Error in start command: {e}")
            await update.message.reply_text("❌ An error occurred. Please try again.")
    

    
    async def receive_wallet_address(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Receive and validate wallet address"""
        try:
            wallet_address = update.message.text.strip()
            telegram_id = update.effective_user.id
            first_name = update.effective_user.first_name or "User"
            
            # Validate wallet address
            if not self.solana_handler.validate_wallet_address(wallet_address):
                await update.message.reply_text(
                    "❌ **Invalid Wallet Address**\n\n"
                    "Please provide a valid Solana wallet address.\n"
                    "It should be 32-44 characters long and contain only valid base58 characters.\n\n"
                    "**Example:** `9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM`\n\n"
                    "💡 **Tips:**\n"
                    "• Copy from your Solana wallet app\n"
                    "• Double-check for typos\n"
                    "• Make sure it's your receive address"
                )
                return WAITING_FOR_WALLET_ADDRESS
            
            # Update user with wallet address
            success = await db.update_user_wallet(telegram_id, wallet_address)
            
            if success:
                keyboard = [
                    [InlineKeyboardButton("🎯 Browse Airdrops", callback_data="browse_airdrops")],
                    [InlineKeyboardButton("💼 View My Wallet", callback_data="my_wallet")]
                ]
                reply_markup = InlineKeyboardMarkup(keyboard)
                
                await update.message.reply_text(
                    f"🎉 **Registration Complete!**\n\n"
                    f"✅ **Wallet Registered:**\n"
                    f"`{wallet_address}`\n\n"
                    f"🎯 **You're all set, {first_name}!**\n\n"
                    f"**What's next?**\n"
                    f"• Browse available airdrops\n"
                    f"• Claim free tokens\n"
                    f"• Track your rewards\n\n"
                    f"**Available Commands:**\n"
                    f"• `/airdrops` - Browse available airdrops\n"
                    f"• `/mywallet` - Manage your wallet\n"
                    f"• `/myclaims` - View your claim history\n"
                    f"• `/help` - Get help\n\n"
                    f"🚀 **Ready to claim your first airdrop?**",
                    reply_markup=reply_markup,
                    parse_mode='Markdown'
                )
                return ConversationHandler.END
            else:
                await update.message.reply_text(
                    "❌ **Registration Failed**\n\n"
                    "There was an error saving your wallet. Please try again."
                )
                return WAITING_FOR_WALLET_ADDRESS
        
        except Exception as e:
            logger.error(f"Error receiving wallet address: {e}")
            await update.message.reply_text("❌ An error occurred. Please try again.")
            return WAITING_FOR_WALLET_ADDRESS
    
    @require_role('receiver')
    async def airdrops_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /airdrops command - browse available airdrops"""
        try:
            # Get active airdrops
            airdrops = await db.get_active_airdrops()
            
            if not airdrops:
                await update.message.reply_text(
                    "🔍 **No Active Airdrops**\n\n"
                    "There are currently no active airdrops available.\n\n"
                    "Check back later or follow our announcements for new opportunities! 🚀"
                )
                return
            
            # Create airdrop list
            message = "🎯 **Available Airdrops**\n\n"
            
            for airdrop in airdrops[:10]:  # Limit to 10 airdrops
                # Calculate remaining claims
                remaining = airdrop['max_claims'] - airdrop['current_claims'] if airdrop['max_claims'] else "Unlimited"
                
                # Format amount per claim
                amount_display = f"{airdrop['amount_per_claim'] / (10 ** airdrop['token_decimals']):.2f}"
                
                message += (
                    f"🍡 **{airdrop['name']}**\n"
                    f"💰 **Reward:** {amount_display} {airdrop['token_symbol']}\n"
                    f"📊 **Remaining:** {remaining}\n"
                    f"📝 **Description:** {airdrop['description'][:100]}...\n"
                    f"🆔 **ID:** `{airdrop['id']}`\n\n"
                )
            
            message += (
                "💡 **How to claim:**\n"
                f"Use `/claim <airdrop_id>` to claim tokens\n"
                f"Example: `/claim {airdrops[0]['id']}`"
            )
            
            await update.message.reply_text(message, parse_mode='Markdown')
        
        except Exception as e:
            logger.error(f"Error in airdrops command: {e}")
            await update.message.reply_text("❌ An error occurred while fetching airdrops.")
    

        """Handle /claim command - claim airdrop tokens"""
        try:
            # Check if airdrop ID provided
            if not context.args:
                await update.message.reply_text(
                    "❓ **Missing Airdrop ID**\n\n"
                    "Please specify which airdrop you want to claim.\n\n"
                    "**Usage:** `/claim <airdrop_id>`\n"
                    "**Example:** `/claim 1`\n\n"
                    "Use `/airdrops` to see available airdrops and their IDs.",
                    parse_mode='Markdown'
                )
                return
            
            try:
                airdrop_id = int(context.args[0])
            except ValueError:
                await update.message.reply_text("❌ Invalid airdrop ID. Please use a number.")
                return
            
            telegram_id = update.effective_user.id
            user = await db.get_user(telegram_id)
            
            # Check if user has wallet connected
            if not user or not user['wallet_address']:
                await update.message.reply_text(
                    "💼 **Wallet Required**\n\n"
                    "You need to connect a wallet before claiming airdrops.\n\n"
                    "Use `/start` to connect your wallet first."
                )
                return
            
            # Get airdrop details
            airdrop = await db.get_airdrop(airdrop_id)
            if not airdrop:
                await update.message.reply_text("❌ Airdrop not found.")
                return
            
            # Check airdrop status
            if airdrop['status'] != 'active':
                await update.message.reply_text(
                    f"⏸️ **Airdrop Not Available**\n\n"
                    f"This airdrop is currently **{airdrop['status']}** and not accepting claims."
                )
                return
            
            # Check if max claims reached
            if airdrop['max_claims'] and airdrop['current_claims'] >= airdrop['max_claims']:
                await update.message.reply_text(
                    "🔒 **Airdrop Full**\n\n"
                    "This airdrop has reached its maximum number of claims.\n"
                    "Better luck next time! 🍀"
                )
                return
            
            # Create claim
            claim_id = await db.create_claim(airdrop_id, telegram_id, airdrop['amount_per_claim'])
            
            if claim_id:
                # Format amount display
                amount_display = f"{airdrop['amount_per_claim'] / (10 ** airdrop['token_decimals']):.2f}"
                
                await update.message.reply_text(
                    f"🎉 **Claim Submitted Successfully!**\n\n"
                    f"🍡 **Airdrop:** {airdrop['name']}\n"
                    f"💰 **Amount:** {amount_display} {airdrop['token_symbol']}\n"
                    f"💼 **To Wallet:** `{user['wallet_address']}`\n"
                    f"🆔 **Claim ID:** `{claim_id}`\n\n"
                    f"⏳ **Status:** Processing...\n\n"
                    f"Your tokens will be sent to your wallet shortly. "
                    f"Use `/myclaims` to track the status of this and other claims.",
                    parse_mode='Markdown'
                )
                
                # TODO: Trigger actual token transfer in background
                # For now, we'll mark it as completed immediately (simulation)
                await db.update_claim_status(claim_id, 'completed', 'simulated_tx_signature_' + str(claim_id))
                
            else:
                await update.message.reply_text(
                    "❌ **Claim Failed**\n\n"
                    "You may have already claimed this airdrop, or there was an error.\n"
                    "Each user can only claim once per airdrop."
                )
        
        except Exception as e:
            logger.error(f"Error in claim command: {e}")
            await update.message.reply_text("❌ An error occurred while processing your claim.")
    
    @require_role('receiver')
    async def mywallet_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /mywallet command - view/update wallet"""
        try:
            telegram_id = update.effective_user.id
            user = await db.get_user(telegram_id)
            
            if not user or not user['wallet_address']:
                keyboard = [
                    [InlineKeyboardButton("🔗 Connect Wallet", callback_data="connect_wallet")]
                ]
                reply_markup = InlineKeyboardMarkup(keyboard)
                
                await update.message.reply_text(
                    "💼 **No Wallet Connected**\n\n"
                    "You haven't connected a Solana wallet yet.\n\n"
                    "Connect your wallet to start claiming airdrops!",
                    reply_markup=reply_markup
                )
                return
            
            # Get wallet balance (simulated for now)
            sol_balance = await self.solana_handler.get_sol_balance(user['wallet_address'])
            
            keyboard = [
                [InlineKeyboardButton("🔄 Update Wallet", callback_data="connect_wallet")],
                [InlineKeyboardButton("📊 View Claims", callback_data="view_claims")]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await update.message.reply_text(
                f"💼 **Your Wallet**\n\n"
                f"🔗 **Address:** `{user['wallet_address']}`\n"
                f"💰 **SOL Balance:** {sol_balance:.4f} SOL\n"
                f"📅 **Connected:** {user['created_at'].strftime('%Y-%m-%d')}\n\n"
                f"🔒 **Security Note:** We only store your public address. "
                f"Your private keys remain safe with you!",
                reply_markup=reply_markup,
                parse_mode='Markdown'
            )
        
        except Exception as e:
            logger.error(f"Error in mywallet command: {e}")
            await update.message.reply_text("❌ An error occurred while fetching wallet info.")
    
    @require_role('receiver')
    async def myclaims_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /myclaims command - view claim history"""
        try:
            telegram_id = update.effective_user.id
            claims = await db.get_user_claims(telegram_id)
            
            if not claims:
                await update.message.reply_text(
                    "📋 **No Claims Yet**\n\n"
                    "You haven't made any airdrop claims yet.\n\n"
                    "Use `/airdrops` to browse available airdrops and start claiming! 🚀"
                )
                return
            
            message = "📋 **Your Claim History**\n\n"
            
            for claim in claims[:10]:  # Show last 10 claims
                # Format amount
                amount_display = f"{claim['amount'] / (10 ** 9):.2f}"  # Assuming 9 decimals
                
                # Status emoji
                status_emoji = {
                    'pending': '⏳',
                    'processing': '🔄',
                    'completed': '✅',
                    'failed': '❌'
                }.get(claim['status'], '❓')
                
                message += (
                    f"{status_emoji} **{claim['airdrop_name']}**\n"
                    f"💰 {amount_display} {claim['token_symbol']}\n"
                    f"📅 {claim['claimed_at'].strftime('%Y-%m-%d %H:%M')}\n"
                    f"🆔 Claim ID: `{claim['id']}`\n"
                )
                
                if claim['transaction_signature'] and claim['status'] == 'completed':
                    message += f"🔗 TX: `{claim['transaction_signature'][:20]}...`\n"
                
                message += "\n"
            
            if len(claims) > 10:
                message += f"... and {len(claims) - 10} more claims"
            
            await update.message.reply_text(message, parse_mode='Markdown')
        
        except Exception as e:
            logger.error(f"Error in myclaims command: {e}")
            await update.message.reply_text("❌ An error occurred while fetching your claims.")
    
    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /help command - show help information"""
        try:
            user = context.user_data.get('user_info', {})
            role = user.get('role', 'receiver')
            
            message = (
                "🍡 **MochiDrop Help Center**\n\n"
                "**🎯 Available Commands:**\n\n"
                "**Basic Commands:**\n"
                "• `/start` - Register and connect wallet\n"
                "• `/airdrops` - Browse available airdrops\n"
                "• `/claim <id>` - Claim airdrop tokens\n"
                "• `/mywallet` - View/update your wallet\n"
                "• `/myclaims` - View your claim history\n"
                "• `/help` - Show this help message\n\n"
            )
            
            if role == 'admin':
                message += (
                    "**🔧 Admin Commands:**\n"
                    "• `/admin login <password>` - Admin authentication\n"
                    "• `/admin dashboard` - Admin control panel\n"
                    "• `/admin create_airdrop` - Create new airdrop\n"
                    "• `/admin stats` - View statistics\n\n"
                )
            
            message += (
                "**❓ Need Help?**\n"
                "• Make sure your wallet address is correct\n"
                "• Each airdrop can only be claimed once\n"
                "• Transactions may take a few minutes to process\n"
                "• Contact support if you encounter issues\n\n"
                "**🔒 Security:**\n"
                "• Never share your private keys or seed phrase\n"
                "• Only provide your public wallet address\n"
                "• Verify all transactions on Solana explorer\n\n"
                "Happy claiming! 🚀"
            )
            
            await update.message.reply_text(message, parse_mode='Markdown')
        
        except Exception as e:
            logger.error(f"Error in help command: {e}")
            await update.message.reply_text("❌ An error occurred while loading help.")
    
    async def update_wallet_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle wallet update request"""
        try:
            await update.message.reply_text(
                "🔄 **Update Wallet Address**\n\n"
                "Please send your new Solana wallet address.\n\n"
                "**Example:** `9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM`\n\n"
                "⚠️ **Important:**\n"
                "• This will replace your current wallet address\n"
                "• Future airdrops will be sent to the new address\n"
                "• Past claims are not affected\n\n"
                "🔒 **Security:** Only your public address is stored.",
                parse_mode='Markdown'
            )
            return WAITING_FOR_NEW_WALLET_ADDRESS
        
        except Exception as e:
            logger.error(f"Error in update wallet: {e}")
            await update.message.reply_text("❌ Error starting wallet update.")
    
    async def receive_new_wallet_address(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Receive new wallet address for update"""
        try:
            new_wallet_address = update.message.text.strip()
            telegram_id = update.effective_user.id
            
            # Validate wallet address
            if not self.solana_handler.validate_wallet_address(new_wallet_address):
                await update.message.reply_text(
                    "❌ **Invalid Wallet Address**\n\n"
                    "Please provide a valid Solana wallet address.\n"
                    "It should be 32-44 characters long and contain only valid base58 characters.\n\n"
                    "**Example:** `9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM`"
                )
                return WAITING_FOR_NEW_WALLET_ADDRESS
            
            # Get current wallet for comparison
            current_user = await db.get_user(telegram_id)
            if current_user and current_user['wallet_address'] == new_wallet_address:
                await update.message.reply_text(
                    "ℹ️ **Same Wallet Address**\n\n"
                    "This is the same wallet address you already have registered.\n"
                    "No changes were made."
                )
                return ConversationHandler.END
            
            # Update wallet address
            success = await db.update_user_wallet(telegram_id, new_wallet_address)
            
            if success:
                await update.message.reply_text(
                    f"✅ **Wallet Updated Successfully!**\n\n"
                    f"🔄 **New Address:**\n`{new_wallet_address}`\n\n"
                    f"✅ **Changes Applied:**\n"
                    f"• Future airdrops will be sent to this address\n"
                    f"• Your account is ready for new claims\n"
                    f"• Past claims remain unchanged\n\n"
                    f"🎯 **Ready to claim more airdrops?**\n"
                    f"Use `/airdrops` to browse available campaigns!",
                    parse_mode='Markdown'
                )
                return ConversationHandler.END
            else:
                await update.message.reply_text(
                    "❌ **Update Failed**\n\n"
                    "There was an error updating your wallet. Please try again."
                )
                return WAITING_FOR_NEW_WALLET_ADDRESS
        
        except Exception as e:
            logger.error(f"Error receiving new wallet address: {e}")
            await update.message.reply_text("❌ An error occurred. Please try again.")
            return WAITING_FOR_NEW_WALLET_ADDRESS
    
    async def cancel_user_conversation(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Cancel any ongoing user conversation"""
        await update.message.reply_text(
            "❌ **Operation Cancelled**\n\n"
            "You can restart anytime with the appropriate command.\n\n"
            "💡 **Quick commands:**\n"
            "• `/start` - Register or update wallet\n"
            "• `/airdrops` - Browse airdrops\n"
            "• `/help` - Get help"
        )
        return ConversationHandler.END

# Create handler instance
user_handlers = UserHandlers()