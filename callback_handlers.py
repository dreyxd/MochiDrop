from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes
from auth_middleware import require_authenticated_admin, require_role
from database_new import db
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class CallbackHandlers:
    """Handlers for inline keyboard callbacks"""
    
    @require_authenticated_admin
    async def handle_admin_dashboard_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle admin dashboard callback"""
        try:
            query = update.callback_query
            await query.answer()
            
            user = context.user_data.get('user_info', {})
            
            # Get admin statistics
            async with db.pool.acquire() as conn:
                total_users = await conn.fetchval("SELECT COUNT(*) FROM users WHERE role = 'receiver'")
                total_airdrops = await conn.fetchval("SELECT COUNT(*) FROM airdrops")
                active_airdrops = await conn.fetchval("SELECT COUNT(*) FROM airdrops WHERE status = 'active'")
                total_claims = await conn.fetchval("SELECT COUNT(*) FROM claims")
            
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
            
            await query.edit_message_text(
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
            logger.error(f"Error in admin dashboard callback: {e}")
            await query.answer("❌ Error loading dashboard.", show_alert=True)
    
    @require_authenticated_admin
    async def handle_admin_stats_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle admin stats callback"""
        try:
            query = update.callback_query
            await query.answer()
            
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
            
            keyboard = [
                [InlineKeyboardButton("🏠 Back to Dashboard", callback_data="admin_dashboard")]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await query.edit_message_text(
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
                reply_markup=reply_markup,
                parse_mode='Markdown'
            )
        
        except Exception as e:
            logger.error(f"Error in admin stats callback: {e}")
            await query.answer("❌ Error loading statistics.", show_alert=True)
    
    @require_authenticated_admin
    async def handle_admin_wallets_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle admin wallets callback"""
        try:
            query = update.callback_query
            await query.answer()
            
            telegram_id = update.effective_user.id
            
            # Get admin wallets
            wallets = await db.get_admin_wallets(telegram_id)
            
            if not wallets:
                keyboard = [
                    [InlineKeyboardButton("➕ Connect New Wallet", callback_data="connect_wallet")],
                    [InlineKeyboardButton("🏠 Back to Dashboard", callback_data="admin_dashboard")]
                ]
                reply_markup = InlineKeyboardMarkup(keyboard)
                
                await query.edit_message_text(
                    "💼 **Wallet Management**\n\n"
                    "❌ **No wallets connected**\n\n"
                    "To create and manage airdrops, you need to connect at least one Solana wallet.\n\n"
                    "🔒 **Security:** Your private keys are encrypted and stored securely.",
                    reply_markup=reply_markup,
                    parse_mode='Markdown'
                )
            else:
                wallet_text = ""
                keyboard = []
                
                for i, wallet in enumerate(wallets, 1):
                    wallet_text += f"**{i}. {wallet['wallet_name']}**\n"
                    wallet_text += f"   📍 `{wallet['wallet_address'][:8]}...{wallet['wallet_address'][-8:]}`\n"
                    wallet_text += f"   📅 Added: {wallet['created_at'].strftime('%Y-%m-%d')}\n\n"
                    
                    keyboard.append([
                        InlineKeyboardButton(f"💰 Check Balance #{i}", callback_data=f"check_balance_{wallet['id']}"),
                        InlineKeyboardButton(f"🗑️ Remove #{i}", callback_data=f"remove_wallet_{wallet['id']}")
                    ])
                
                keyboard.extend([
                    [InlineKeyboardButton("➕ Connect New Wallet", callback_data="connect_wallet")],
                    [InlineKeyboardButton("🏠 Back to Dashboard", callback_data="admin_dashboard")]
                ])
                
                reply_markup = InlineKeyboardMarkup(keyboard)
                
                await query.edit_message_text(
                    f"💼 **Wallet Management**\n\n"
                    f"📊 **Connected Wallets ({len(wallets)}):**\n\n"
                    f"{wallet_text}"
                    f"🔒 **Security:** All private keys are encrypted.",
                    reply_markup=reply_markup,
                    parse_mode='Markdown'
                )
        
        except Exception as e:
            logger.error(f"Error in admin wallets callback: {e}")
            await query.answer("❌ Error loading wallets.", show_alert=True)
    
    @require_authenticated_admin
    async def handle_admin_users_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle admin users callback"""
        try:
            query = update.callback_query
            await query.answer()
            
            # Get user statistics and recent users
            async with db.pool.acquire() as conn:
                total_users = await conn.fetchval("SELECT COUNT(*) FROM users WHERE role = 'receiver'")
                users_with_wallets = await conn.fetchval("SELECT COUNT(*) FROM users WHERE wallet_address IS NOT NULL AND role = 'receiver'")
                
                # Get recent users (last 10)
                recent_users = await conn.fetch("""
                    SELECT telegram_id, first_name, username, wallet_address, created_at
                    FROM users 
                    WHERE role = 'receiver'
                    ORDER BY created_at DESC 
                    LIMIT 10
                """)
            
            user_list = ""
            if recent_users:
                for i, user in enumerate(recent_users, 1):
                    name = user['first_name'] or "Unknown"
                    username = f"@{user['username']}" if user['username'] else "No username"
                    wallet_status = "✅" if user['wallet_address'] else "❌"
                    date = user['created_at'].strftime('%m/%d')
                    
                    user_list += f"{i}. **{name}** ({username}) {wallet_status} - {date}\n"
            else:
                user_list = "No users found."
            
            keyboard = [
                [InlineKeyboardButton("📊 Export User List", callback_data="export_users")],
                [InlineKeyboardButton("🔄 Refresh", callback_data="admin_users")],
                [InlineKeyboardButton("🏠 Back to Dashboard", callback_data="admin_dashboard")]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await query.edit_message_text(
                f"👥 **User Management**\n\n"
                f"📊 **Overview:**\n"
                f"• Total Users: {total_users:,}\n"
                f"• With Wallets: {users_with_wallets:,}\n"
                f"• Wallet Rate: {(users_with_wallets/total_users*100) if total_users > 0 else 0:.1f}%\n\n"
                f"👤 **Recent Users (Last 10):**\n"
                f"{user_list}\n"
                f"✅ = Has wallet, ❌ = No wallet",
                reply_markup=reply_markup,
                parse_mode='Markdown'
            )
        
        except Exception as e:
            logger.error(f"Error in admin users callback: {e}")
            await query.answer("❌ Error loading users.", show_alert=True)
    
    async def handle_activate_airdrop_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle activate airdrop callback"""
        try:
            query = update.callback_query
            await query.answer()
            
            # Extract airdrop ID from callback data
            airdrop_id = int(query.data.split('_')[-1])
            
            # Update airdrop status to active
            success = await db.update_airdrop_status(airdrop_id, 'active')
            
            if success:
                # Get airdrop details
                airdrop = await db.get_airdrop(airdrop_id)
                
                keyboard = [
                    [InlineKeyboardButton("📊 View Details", callback_data=f"view_airdrop_{airdrop_id}")],
                    [InlineKeyboardButton("🏠 Back to Dashboard", callback_data="admin_dashboard")]
                ]
                reply_markup = InlineKeyboardMarkup(keyboard)
                
                await query.edit_message_text(
                    f"🚀 **Airdrop Activated!**\n\n"
                    f"🍡 **{airdrop['name']}** is now live and accepting claims!\n\n"
                    f"📢 **Share with your community:**\n"
                    f"Users can now use `/airdrops` to see and claim from this airdrop.\n\n"
                    f"🎯 **Airdrop ID:** `{airdrop_id}`\n"
                    f"📊 **Status:** Active ✅",
                    reply_markup=reply_markup,
                    parse_mode='Markdown'
                )
            else:
                await query.answer("❌ Failed to activate airdrop.", show_alert=True)
        
        except Exception as e:
            logger.error(f"Error activating airdrop: {e}")
            await query.answer("❌ Error activating airdrop.", show_alert=True)
    
    async def handle_view_airdrop_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle view airdrop details callback"""
        try:
            query = update.callback_query
            await query.answer()
            
            # Extract airdrop ID from callback data
            airdrop_id = int(query.data.split('_')[-1])
            
            # Get airdrop details
            airdrop = await db.get_airdrop(airdrop_id)
            
            if not airdrop:
                await query.answer("❌ Airdrop not found.", show_alert=True)
                return
            
            # Get claim statistics
            async with db.pool.acquire() as conn:
                total_claims = await conn.fetchval("SELECT COUNT(*) FROM claims WHERE airdrop_id = $1", airdrop_id)
                completed_claims = await conn.fetchval("SELECT COUNT(*) FROM claims WHERE airdrop_id = $1 AND status = 'completed'", airdrop_id)
                pending_claims = await conn.fetchval("SELECT COUNT(*) FROM claims WHERE airdrop_id = $1 AND status = 'pending'", airdrop_id)
            
            # Calculate display amounts
            total_display = airdrop['total_amount'] / (10 ** airdrop['token_decimals'])
            per_claim_display = airdrop['amount_per_claim'] / (10 ** airdrop['token_decimals'])
            distributed = completed_claims * per_claim_display
            remaining = total_display - distributed
            
            status_emoji = "✅" if airdrop['status'] == 'active' else "📝" if airdrop['status'] == 'draft' else "❌"
            
            keyboard = []
            if airdrop['status'] == 'draft':
                keyboard.append([InlineKeyboardButton("🚀 Activate Airdrop", callback_data=f"activate_airdrop_{airdrop_id}")])
            elif airdrop['status'] == 'active':
                keyboard.append([InlineKeyboardButton("⏸️ Pause Airdrop", callback_data=f"pause_airdrop_{airdrop_id}")])
            
            keyboard.append([InlineKeyboardButton("🏠 Back to Dashboard", callback_data="admin_dashboard")])
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await query.edit_message_text(
                f"🎯 **Airdrop Details**\n\n"
                f"🍡 **Name:** {airdrop['name']}\n"
                f"📝 **Description:** {airdrop['description']}\n"
                f"🆔 **ID:** `{airdrop_id}`\n"
                f"📊 **Status:** {airdrop['status'].title()} {status_emoji}\n\n"
                f"💰 **Token Info:**\n"
                f"• **Symbol:** {airdrop['token_symbol']}\n"
                f"• **Mint:** `{airdrop['token_mint'][:8]}...{airdrop['token_mint'][-8:]}`\n\n"
                f"📊 **Distribution:**\n"
                f"• **Total Pool:** {total_display:,.0f} {airdrop['token_symbol']}\n"
                f"• **Per Claim:** {per_claim_display:,.0f} {airdrop['token_symbol']}\n"
                f"• **Max Claims:** {airdrop['max_claims'] if airdrop['max_claims'] else 'Unlimited'}\n\n"
                f"📈 **Progress:**\n"
                f"• **Total Claims:** {total_claims:,}\n"
                f"• **Completed:** {completed_claims:,}\n"
                f"• **Pending:** {pending_claims:,}\n"
                f"• **Distributed:** {distributed:,.0f} {airdrop['token_symbol']}\n"
                f"• **Remaining:** {remaining:,.0f} {airdrop['token_symbol']}\n\n"
                f"📅 **Created:** {airdrop['created_at'].strftime('%Y-%m-%d %H:%M UTC')}",
                reply_markup=reply_markup,
                parse_mode='Markdown'
            )
        
        except Exception as e:
            logger.error(f"Error viewing airdrop: {e}")
            await query.answer("❌ Error loading airdrop details.", show_alert=True)
    
    @require_role('receiver')
    async def handle_claim_airdrop_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle claim airdrop callback"""
        try:
            query = update.callback_query
            await query.answer()
            
            # Extract airdrop ID from callback data
            airdrop_id = int(query.data.split('_')[-1])
            telegram_id = update.effective_user.id
            
            # Check if user has a wallet
            user = await db.get_user(telegram_id)
            if not user or not user['wallet_address']:
                await query.edit_message_text(
                    "❌ **Wallet Required**\n\n"
                    "You need to register a Solana wallet address before claiming airdrops.\n\n"
                    "Use `/start` to register your wallet address.",
                    parse_mode='Markdown'
                )
                return
            
            # Check if user already claimed this airdrop
            existing_claim = await db.get_user_claim(telegram_id, airdrop_id)
            if existing_claim:
                status_text = "✅ Completed" if existing_claim['status'] == 'completed' else "⏳ Processing"
                await query.edit_message_text(
                    f"ℹ️ **Already Claimed**\n\n"
                    f"You have already claimed this airdrop.\n\n"
                    f"**Status:** {status_text}\n"
                    f"**Claimed:** {existing_claim['claimed_at'].strftime('%Y-%m-%d %H:%M UTC')}\n\n"
                    f"Use `/myclaims` to view all your claims.",
                    parse_mode='Markdown'
                )
                return
            
            # Get airdrop details
            airdrop = await db.get_airdrop(airdrop_id)
            if not airdrop or airdrop['status'] != 'active':
                await query.edit_message_text(
                    "❌ **Airdrop Unavailable**\n\n"
                    "This airdrop is no longer active or doesn't exist.",
                    parse_mode='Markdown'
                )
                return
            
            # Check if airdrop has reached max claims
            if airdrop['max_claims']:
                current_claims = len(await db.pool.fetch("SELECT id FROM claims WHERE airdrop_id = $1", airdrop_id))
                if current_claims >= airdrop['max_claims']:
                    await query.edit_message_text(
                        "❌ **Airdrop Full**\n\n"
                        "This airdrop has reached its maximum number of claims.\n\n"
                        "Check `/airdrops` for other available airdrops.",
                        parse_mode='Markdown'
                    )
                    return
            
            # Create claim
            claim_id = await db.create_claim(
                telegram_id=telegram_id,
                airdrop_id=airdrop_id,
                wallet_address=user['wallet_address'],
                amount=airdrop['amount_per_claim']
            )
            
            if claim_id:
                # Calculate display amount
                amount_display = airdrop['amount_per_claim'] / (10 ** airdrop['token_decimals'])
                
                await query.edit_message_text(
                    f"🎉 **Claim Successful!**\n\n"
                    f"🍡 **Airdrop:** {airdrop['name']}\n"
                    f"💰 **Amount:** {amount_display:,.0f} {airdrop['token_symbol']}\n"
                    f"📍 **To Wallet:** `{user['wallet_address'][:8]}...{user['wallet_address'][-8:]}`\n\n"
                    f"⏳ **Status:** Processing\n\n"
                    f"Your tokens will be sent to your wallet shortly. "
                    f"Use `/myclaims` to track the status of all your claims.\n\n"
                    f"🎯 **Claim ID:** `{claim_id}`",
                    parse_mode='Markdown'
                )
            else:
                await query.edit_message_text(
                    "❌ **Claim Failed**\n\n"
                    "There was an error processing your claim. Please try again later.",
                    parse_mode='Markdown'
                )
        
        except Exception as e:
            logger.error(f"Error claiming airdrop: {e}")
            await query.answer("❌ Error processing claim.", show_alert=True)

# Create handler instance
callback_handlers = CallbackHandlers()