from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes, ConversationHandler
from auth_middleware import require_admin, require_authenticated_admin, AdminAuth
from database_new import db
from solana_handler_simple import SolanaHandler
import logging
import re
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# Conversation states
WAITING_FOR_ADMIN_PASSWORD = 1
WAITING_FOR_AIRDROP_NAME = 2
WAITING_FOR_AIRDROP_DESCRIPTION = 3
WAITING_FOR_TOKEN_MINT = 4
WAITING_FOR_TOKEN_SYMBOL = 5
WAITING_FOR_TOTAL_AMOUNT = 6
WAITING_FOR_AMOUNT_PER_CLAIM = 7
WAITING_FOR_MAX_CLAIMS = 8
WAITING_FOR_PRIVATE_KEY = 9
WAITING_FOR_WALLET_NAME = 10

class AdminHandlers:
    """Handlers for admin commands"""
    
    def __init__(self):
        self.solana_handler = SolanaHandler()
    
    async def admin_login_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /admin login command"""
        try:
            if not context.args:
                await update.message.reply_text(
                    "🔐 **Admin Login**\n\n"
                    "Please provide the admin password.\n\n"
                    "**Usage:** `/admin login <password>`",
                    parse_mode='Markdown'
                )
                return
            
            password = ' '.join(context.args)
            success = await AdminAuth.login_admin(update, context, password)
            
            if success:
                # Delete the message containing the password for security
                try:
                    await update.message.delete()
                except:
                    pass  # Ignore if can't delete
        
        except Exception as e:
            logger.error(f"Error in admin login: {e}")
            await update.message.reply_text("❌ Login error. Please try again.")
    
    @require_authenticated_admin
    async def admin_logout_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /admin logout command"""
        await AdminAuth.logout_admin(update, context)
    
    @require_authenticated_admin
    async def admin_dashboard_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /admin dashboard command"""
        try:
            user = context.user_data.get('user_info', {})
            
            # Get admin statistics
            total_users = len(await db.pool.fetch("SELECT id FROM users WHERE role = 'receiver'"))
            total_airdrops = len(await db.pool.fetch("SELECT id FROM airdrops"))
            active_airdrops = len(await db.pool.fetch("SELECT id FROM airdrops WHERE status = 'active'"))
            total_claims = len(await db.pool.fetch("SELECT id FROM claims"))
            
            keyboard = [
                [
                    InlineKeyboardButton("🎯 Create Airdrop", callback_data="admin_create_airdrop"),
                    InlineKeyboardButton("💼 Manage Wallets", callback_data="admin_wallets")
                ],
                [
                    InlineKeyboardButton("📊 View Statistics", callback_data="admin_stats"),
                    InlineKeyboardButton("👥 Manage Users", callback_data="admin_users")
                ],
                [
                    InlineKeyboardButton("🔄 Refresh Dashboard", callback_data="admin_dashboard")
                ]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await update.message.reply_text(
                f"🔧 **Admin Dashboard**\n\n"
                f"👋 **Welcome, {user.get('first_name', 'Admin')}!**\n\n"
                f"📊 **Quick Stats:**\n"
                f"• **Users:** {total_users}\n"
                f"• **Total Airdrops:** {total_airdrops}\n"
                f"• **Active Airdrops:** {active_airdrops}\n"
                f"• **Total Claims:** {total_claims}\n\n"
                f"🛠️ **Admin Tools:**\n"
                f"Select an option below to manage your airdrops and users.",
                reply_markup=reply_markup,
                parse_mode='Markdown'
            )
        
        except Exception as e:
            logger.error(f"Error in admin dashboard: {e}")
            await update.message.reply_text("❌ Error loading dashboard.")
    
    @require_authenticated_admin
    async def admin_create_airdrop_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /admin create_airdrop command"""
        try:
            await update.message.reply_text(
                "🎯 **Create New Airdrop**\n\n"
                "Let's create a new airdrop campaign step by step.\n\n"
                "📝 **Step 1/7:** What's the name of your airdrop?\n\n"
                "**Example:** `MochiToken Community Airdrop`",
                parse_mode='Markdown'
            )
            
            # Initialize airdrop creation data
            context.user_data['creating_airdrop'] = {}
            
            return WAITING_FOR_AIRDROP_NAME
        
        except Exception as e:
            logger.error(f"Error starting airdrop creation: {e}")
            await update.message.reply_text("❌ Error starting airdrop creation.")
    
    async def receive_airdrop_name(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Receive airdrop name"""
        try:
            name = update.message.text.strip()
            
            if len(name) < 3 or len(name) > 100:
                await update.message.reply_text(
                    "❌ **Invalid Name**\n\n"
                    "Airdrop name must be between 3 and 100 characters.\n"
                    "Please try again."
                )
                return WAITING_FOR_AIRDROP_NAME
            
            context.user_data['creating_airdrop']['name'] = name
            
            await update.message.reply_text(
                f"✅ **Name Set:** {name}\n\n"
                f"📝 **Step 2/7:** Provide a description for your airdrop.\n\n"
                f"**Example:** `Rewarding our early community members with 100 MOCHI tokens each.`",
                parse_mode='Markdown'
            )
            
            return WAITING_FOR_AIRDROP_DESCRIPTION
        
        except Exception as e:
            logger.error(f"Error receiving airdrop name: {e}")
            return WAITING_FOR_AIRDROP_NAME
    
    async def receive_airdrop_description(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Receive airdrop description"""
        try:
            description = update.message.text.strip()
            
            if len(description) < 10 or len(description) > 500:
                await update.message.reply_text(
                    "❌ **Invalid Description**\n\n"
                    "Description must be between 10 and 500 characters.\n"
                    "Please try again."
                )
                return WAITING_FOR_AIRDROP_DESCRIPTION
            
            context.user_data['creating_airdrop']['description'] = description
            
            await update.message.reply_text(
                f"✅ **Description Set**\n\n"
                f"📝 **Step 3/7:** What's the SPL token mint address?\n\n"
                f"This is the address of the token you want to airdrop.\n\n"
                f"**Example:** `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` (USDC)\n\n"
                f"⚠️ **Important:** Make sure this is correct - it cannot be changed later!",
                parse_mode='Markdown'
            )
            
            return WAITING_FOR_TOKEN_MINT
        
        except Exception as e:
            logger.error(f"Error receiving airdrop description: {e}")
            return WAITING_FOR_AIRDROP_DESCRIPTION
    
    async def receive_token_mint(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Receive token mint address"""
        try:
            token_mint = update.message.text.strip()
            
            # Validate mint address format (basic validation)
            if not self.solana_handler.validate_wallet_address(token_mint):
                await update.message.reply_text(
                    "❌ **Invalid Mint Address**\n\n"
                    "Please provide a valid Solana token mint address.\n"
                    "It should be 32-44 characters long."
                )
                return WAITING_FOR_TOKEN_MINT
            
            context.user_data['creating_airdrop']['token_mint'] = token_mint
            
            await update.message.reply_text(
                f"✅ **Token Mint Set**\n\n"
                f"📝 **Step 4/7:** What's the token symbol?\n\n"
                f"**Example:** `MOCHI`, `USDC`, `SOL`\n\n"
                f"This will be displayed to users.",
                parse_mode='Markdown'
            )
            
            return WAITING_FOR_TOKEN_SYMBOL
        
        except Exception as e:
            logger.error(f"Error receiving token mint: {e}")
            return WAITING_FOR_TOKEN_MINT
    
    async def receive_token_symbol(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Receive token symbol"""
        try:
            symbol = update.message.text.strip().upper()
            
            if len(symbol) < 1 or len(symbol) > 10:
                await update.message.reply_text(
                    "❌ **Invalid Symbol**\n\n"
                    "Token symbol must be 1-10 characters.\n"
                    "Please try again."
                )
                return WAITING_FOR_TOKEN_SYMBOL
            
            context.user_data['creating_airdrop']['token_symbol'] = symbol
            
            await update.message.reply_text(
                f"✅ **Token Symbol Set:** {symbol}\n\n"
                f"📝 **Step 5/7:** How many tokens total do you want to allocate for this airdrop?\n\n"
                f"**Example:** `10000` (for 10,000 tokens)\n\n"
                f"💡 **Note:** Enter the amount in whole tokens, not the smallest unit.",
                parse_mode='Markdown'
            )
            
            return WAITING_FOR_TOTAL_AMOUNT
        
        except Exception as e:
            logger.error(f"Error receiving token symbol: {e}")
            return WAITING_FOR_TOKEN_SYMBOL
    
    async def receive_total_amount(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Receive total amount"""
        try:
            try:
                total_amount = float(update.message.text.strip())
                if total_amount <= 0:
                    raise ValueError()
            except ValueError:
                await update.message.reply_text(
                    "❌ **Invalid Amount**\n\n"
                    "Please enter a valid positive number.\n"
                    "Example: `10000`"
                )
                return WAITING_FOR_TOTAL_AMOUNT
            
            # Convert to smallest unit (assuming 9 decimals for now)
            context.user_data['creating_airdrop']['total_amount'] = int(total_amount * (10 ** 9))
            context.user_data['creating_airdrop']['token_decimals'] = 9
            
            await update.message.reply_text(
                f"✅ **Total Amount Set:** {total_amount:,.0f} {context.user_data['creating_airdrop']['token_symbol']}\n\n"
                f"📝 **Step 6/7:** How many tokens should each user receive?\n\n"
                f"**Example:** `100` (each user gets 100 tokens)\n\n"
                f"💡 **Tip:** This determines how many users can participate.",
                parse_mode='Markdown'
            )
            
            return WAITING_FOR_AMOUNT_PER_CLAIM
        
        except Exception as e:
            logger.error(f"Error receiving total amount: {e}")
            return WAITING_FOR_TOTAL_AMOUNT
    
    async def receive_amount_per_claim(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Receive amount per claim"""
        try:
            try:
                amount_per_claim = float(update.message.text.strip())
                if amount_per_claim <= 0:
                    raise ValueError()
            except ValueError:
                await update.message.reply_text(
                    "❌ **Invalid Amount**\n\n"
                    "Please enter a valid positive number.\n"
                    "Example: `100`"
                )
                return WAITING_FOR_AMOUNT_PER_CLAIM
            
            # Convert to smallest unit
            amount_per_claim_units = int(amount_per_claim * (10 ** 9))
            total_amount_units = context.user_data['creating_airdrop']['total_amount']
            
            # Calculate max possible claims
            max_possible_claims = total_amount_units // amount_per_claim_units
            
            context.user_data['creating_airdrop']['amount_per_claim'] = amount_per_claim_units
            
            await update.message.reply_text(
                f"✅ **Amount Per Claim Set:** {amount_per_claim:,.0f} {context.user_data['creating_airdrop']['token_symbol']}\n\n"
                f"📊 **Maximum Possible Claims:** {max_possible_claims:,}\n\n"
                f"📝 **Step 7/7:** Set the maximum number of claims (or type 'unlimited').\n\n"
                f"**Example:** `{max_possible_claims}` or `unlimited`\n\n"
                f"💡 **Recommendation:** Use `{max_possible_claims}` to distribute all tokens.",
                parse_mode='Markdown'
            )
            
            return WAITING_FOR_MAX_CLAIMS
        
        except Exception as e:
            logger.error(f"Error receiving amount per claim: {e}")
            return WAITING_FOR_AMOUNT_PER_CLAIM
    
    async def receive_max_claims(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Receive max claims and create airdrop"""
        try:
            max_claims_input = update.message.text.strip().lower()
            
            if max_claims_input == 'unlimited':
                max_claims = None
            else:
                try:
                    max_claims = int(max_claims_input)
                    if max_claims <= 0:
                        raise ValueError()
                except ValueError:
                    await update.message.reply_text(
                        "❌ **Invalid Input**\n\n"
                        "Please enter a positive number or 'unlimited'.\n"
                        "Example: `1000` or `unlimited`"
                    )
                    return WAITING_FOR_MAX_CLAIMS
            
            # Get admin wallet (for now, use a placeholder)
            admin_wallet = "AdminWalletPlaceholder123456789"  # TODO: Get from admin's connected wallets
            
            # Create airdrop in database
            airdrop_data = context.user_data['creating_airdrop']
            telegram_id = update.effective_user.id
            
            airdrop_id = await db.create_airdrop(
                name=airdrop_data['name'],
                description=airdrop_data['description'],
                token_mint=airdrop_data['token_mint'],
                token_symbol=airdrop_data['token_symbol'],
                token_decimals=airdrop_data['token_decimals'],
                total_amount=airdrop_data['total_amount'],
                amount_per_claim=airdrop_data['amount_per_claim'],
                max_claims=max_claims,
                admin_wallet=admin_wallet,
                created_by=telegram_id
            )
            
            if airdrop_id:
                # Calculate display amounts
                total_display = airdrop_data['total_amount'] / (10 ** 9)
                per_claim_display = airdrop_data['amount_per_claim'] / (10 ** 9)
                
                keyboard = [
                    [InlineKeyboardButton("🚀 Activate Airdrop", callback_data=f"activate_airdrop_{airdrop_id}")],
                    [InlineKeyboardButton("📊 View Details", callback_data=f"view_airdrop_{airdrop_id}")],
                    [InlineKeyboardButton("🏠 Back to Dashboard", callback_data="admin_dashboard")]
                ]
                reply_markup = InlineKeyboardMarkup(keyboard)
                
                await update.message.reply_text(
                    f"🎉 **Airdrop Created Successfully!**\n\n"
                    f"🆔 **Airdrop ID:** `{airdrop_id}`\n"
                    f"🍡 **Name:** {airdrop_data['name']}\n"
                    f"💰 **Total Pool:** {total_display:,.0f} {airdrop_data['token_symbol']}\n"
                    f"🎯 **Per User:** {per_claim_display:,.0f} {airdrop_data['token_symbol']}\n"
                    f"👥 **Max Claims:** {max_claims if max_claims else 'Unlimited'}\n"
                    f"📊 **Status:** Draft (not yet active)\n\n"
                    f"⚠️ **Next Steps:**\n"
                    f"1. Fund your admin wallet with tokens\n"
                    f"2. Activate the airdrop to start accepting claims\n"
                    f"3. Share the airdrop with your community!",
                    reply_markup=reply_markup,
                    parse_mode='Markdown'
                )
                
                # Clear creation data
                del context.user_data['creating_airdrop']
                return ConversationHandler.END
            else:
                await update.message.reply_text(
                    "❌ **Creation Failed**\n\n"
                    "There was an error creating the airdrop. Please try again."
                )
                return ConversationHandler.END
        
        except Exception as e:
            logger.error(f"Error receiving max claims: {e}")
            await update.message.reply_text("❌ Error creating airdrop.")
            return ConversationHandler.END
    
    @require_authenticated_admin
    async def admin_wallet_connect_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /admin wallet connect command"""
        try:
            await update.message.reply_text(
                "💼 **Connect Admin Wallet**\n\n"
                "To manage airdrops, you need to connect a Solana wallet.\n\n"
                "⚠️ **SECURITY WARNING:**\n"
                "• Your private key will be encrypted and stored securely\n"
                "• Only use wallets dedicated for airdrops\n"
                "• Never share your private key with anyone else\n\n"
                "📝 **Step 1:** Give this wallet a name (for your reference)\n\n"
                "**Example:** `Main Airdrop Wallet`",
                parse_mode='Markdown'
            )
            
            return WAITING_FOR_WALLET_NAME
        
        except Exception as e:
            logger.error(f"Error in wallet connect: {e}")
            await update.message.reply_text("❌ Error starting wallet connection.")
    
    async def receive_wallet_name(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Receive wallet name"""
        try:
            wallet_name = update.message.text.strip()
            
            if len(wallet_name) < 3 or len(wallet_name) > 50:
                await update.message.reply_text(
                    "❌ **Invalid Name**\n\n"
                    "Wallet name must be between 3 and 50 characters.\n"
                    "Please try again."
                )
                return WAITING_FOR_WALLET_NAME
            
            context.user_data['connecting_wallet'] = {'name': wallet_name}
            
            await update.message.reply_text(
                f"✅ **Wallet Name Set:** {wallet_name}\n\n"
                f"📝 **Step 2:** Send your wallet's private key.\n\n"
                f"🔒 **Security Notes:**\n"
                f"• This message will be deleted immediately after processing\n"
                f"• Your key will be encrypted before storage\n"
                f"• Only send base58 encoded private keys\n\n"
                f"**Example format:** `5Kb8kLf9CJmKdnq6...` (64 characters)\n\n"
                f"⚠️ **CAUTION:** Only proceed if you trust this bot completely!",
                parse_mode='Markdown'
            )
            
            return WAITING_FOR_PRIVATE_KEY
        
        except Exception as e:
            logger.error(f"Error receiving wallet name: {e}")
            return WAITING_FOR_WALLET_NAME
    
    async def receive_private_key(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Receive and store private key"""
        try:
            private_key = update.message.text.strip()
            
            # Delete the message immediately for security
            try:
                await update.message.delete()
            except:
                pass
            
            # Basic validation of private key format
            if len(private_key) < 32 or len(private_key) > 88:
                await update.effective_chat.send_message(
                    "❌ **Invalid Private Key Format**\n\n"
                    "Please check your private key and try again.\n"
                    "Use `/admin wallet connect` to restart."
                )
                return ConversationHandler.END
            
            # Generate wallet address from private key (simulated)
            wallet_address = f"Generated_Address_From_Key_{len(private_key)}"  # TODO: Implement actual key derivation
            
            # Store encrypted wallet
            telegram_id = update.effective_user.id
            wallet_name = context.user_data['connecting_wallet']['name']
            
            success = await db.add_admin_wallet(
                telegram_id=telegram_id,
                wallet_address=wallet_address,
                wallet_name=wallet_name,
                private_key=private_key
            )
            
            if success:
                await update.effective_chat.send_message(
                    f"✅ **Wallet Connected Successfully!**\n\n"
                    f"💼 **Name:** {wallet_name}\n"
                    f"🔗 **Address:** `{wallet_address}`\n\n"
                    f"🔒 **Security:** Your private key has been encrypted and stored securely.\n\n"
                    f"You can now use this wallet to fund and manage airdrops!",
                    parse_mode='Markdown'
                )
            else:
                await update.effective_chat.send_message(
                    "❌ **Connection Failed**\n\n"
                    "There was an error storing your wallet. Please try again."
                )
            
            # Clear sensitive data
            del context.user_data['connecting_wallet']
            return ConversationHandler.END
        
        except Exception as e:
            logger.error(f"Error receiving private key: {e}")
            await update.effective_chat.send_message("❌ Error processing wallet connection.")
            return ConversationHandler.END
    
    @require_authenticated_admin
    async def admin_stats_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /admin stats command"""
        try:
            # Get comprehensive statistics
            async with db.pool.acquire() as conn:
                # User stats
                total_users = await conn.fetchval("SELECT COUNT(*) FROM users WHERE role = 'receiver'")
                users_with_wallets = await conn.fetchval("SELECT COUNT(*) FROM users WHERE wallet_address IS NOT NULL AND role = 'receiver'")
                
                # Airdrop stats
                total_airdrops = await conn.fetchval("SELECT COUNT(*) FROM airdrops")
                active_airdrops = await conn.fetchval("SELECT COUNT(*) FROM airdrops WHERE status = 'active'")
                draft_airdrops = await conn.fetchval("SELECT COUNT(*) FROM airdrops WHERE status = 'draft'")
                
                # Claim stats
                total_claims = await conn.fetchval("SELECT COUNT(*) FROM claims")
                completed_claims = await conn.fetchval("SELECT COUNT(*) FROM claims WHERE status = 'completed'")
                pending_claims = await conn.fetchval("SELECT COUNT(*) FROM claims WHERE status = 'pending'")
                
                # Recent activity (last 24 hours)
                recent_users = await conn.fetchval("""
                    SELECT COUNT(*) FROM users 
                    WHERE created_at > NOW() - INTERVAL '24 hours' AND role = 'receiver'
                """)
                recent_claims = await conn.fetchval("""
                    SELECT COUNT(*) FROM claims 
                    WHERE claimed_at > NOW() - INTERVAL '24 hours'
                """)
            
            # Calculate percentages
            wallet_percentage = (users_with_wallets / total_users * 100) if total_users > 0 else 0
            claim_success_rate = (completed_claims / total_claims * 100) if total_claims > 0 else 0
            
            await update.message.reply_text(
                f"📊 **MochiDrop Statistics**\n\n"
                f"👥 **Users:**\n"
                f"• Total Users: {total_users:,}\n"
                f"• With Wallets: {users_with_wallets:,} ({wallet_percentage:.1f}%)\n"
                f"• New (24h): {recent_users:,}\n\n"
                f"🎯 **Airdrops:**\n"
                f"• Total Created: {total_airdrops:,}\n"
                f"• Currently Active: {active_airdrops:,}\n"
                f"• In Draft: {draft_airdrops:,}\n\n"
                f"🎁 **Claims:**\n"
                f"• Total Claims: {total_claims:,}\n"
                f"• Completed: {completed_claims:,} ({claim_success_rate:.1f}%)\n"
                f"• Pending: {pending_claims:,}\n"
                f"• Recent (24h): {recent_claims:,}\n\n"
                f"📈 **Performance:**\n"
                f"• Success Rate: {claim_success_rate:.1f}%\n"
                f"• Wallet Adoption: {wallet_percentage:.1f}%\n\n"
                f"🕒 **Last Updated:** {datetime.now().strftime('%Y-%m-%d %H:%M UTC')}",
                parse_mode='Markdown'
            )
        
        except Exception as e:
            logger.error(f"Error in admin stats: {e}")
            await update.message.reply_text("❌ Error loading statistics.")
    
    async def cancel_admin_conversation(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Cancel any ongoing admin conversation"""
        # Clear any sensitive data
        if 'creating_airdrop' in context.user_data:
            del context.user_data['creating_airdrop']
        if 'connecting_wallet' in context.user_data:
            del context.user_data['connecting_wallet']
        
        await update.message.reply_text(
            "❌ **Operation Cancelled**\n\n"
            "You can restart anytime from the admin dashboard.\n"
            "Use `/admin dashboard` to continue."
        )
        return ConversationHandler.END

# Create handler instance
admin_handlers = AdminHandlers()