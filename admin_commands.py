import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes
from telegram.constants import ParseMode
from database import Database
from solana_handler import SolanaHandler
import csv
from datetime import datetime

class AdminCommands:
    def __init__(self, db: Database, solana: SolanaHandler, admin_chat_id: int):
        self.db = db
        self.solana = solana
        self.admin_chat_id = admin_chat_id
    
    def is_admin(self, user_id: int) -> bool:
        """Check if user is admin"""
        return user_id == self.admin_chat_id
    
    async def set_task_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /set_task command - Add new task"""
        if not self.is_admin(update.effective_user.id):
            return
        
        if len(context.args) < 3:
            await update.message.reply_text(
                "❌ **Usage:** `/set_task <task_name> <description> <type>`\n\n"
                "**Example:** `/set_task \"Follow Twitter\" \"Follow @ProjectXYZ\" social`\n\n"
                "**Types:** social, referral, quiz, custom",
                parse_mode=ParseMode.MARKDOWN
            )
            return
        
        task_name = context.args[0].strip('"')
        task_description = context.args[1].strip('"')
        task_type = context.args[2]
        
        task_id = self.db.add_task(task_name, task_description, task_type)
        
        await update.message.reply_text(
            f"✅ **Task Added Successfully!**\n\n"
            f"**ID:** {task_id}\n"
            f"**Name:** {task_name}\n"
            f"**Description:** {task_description}\n"
            f"**Type:** {task_type}",
            parse_mode=ParseMode.MARKDOWN
        )
    
    async def list_tasks_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /list_tasks command"""
        if not self.is_admin(update.effective_user.id):
            return
        
        tasks = self.db.get_active_tasks()
        
        if not tasks:
            await update.message.reply_text("📝 No active tasks found.")
            return
        
        task_text = "📋 **Active Tasks:**\n\n"
        for task in tasks:
            task_text += f"**ID {task['id']}:** {task['task_name']}\n"
            task_text += f"📝 {task['task_description']}\n"
            task_text += f"🏷️ Type: {task['task_type']}\n"
            task_text += f"📅 Created: {task['created_date'][:10]}\n\n"
        
        await update.message.reply_text(task_text, parse_mode=ParseMode.MARKDOWN)
    
    async def export_users_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /export_users command - Export user data to CSV"""
        if not self.is_admin(update.effective_user.id):
            return
        
        # Get all users from database
        import sqlite3
        conn = sqlite3.connect(self.db.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT u.telegram_id, u.username, u.wallet_address, u.registration_date, 
                   u.tokens_claimed, u.referral_count,
                   t.transaction_hash, t.token_amount, t.status
            FROM users u
            LEFT JOIN transactions t ON u.telegram_id = t.telegram_id
        ''')
        
        users = cursor.fetchall()
        conn.close()
        
        if not users:
            await update.message.reply_text("📝 No users found.")
            return
        
        # Create CSV file
        filename = f"mochidrop_users_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        filepath = os.path.join(os.getcwd(), filename)
        
        with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow([
                'Telegram ID', 'Username', 'Wallet Address', 'Registration Date',
                'Tokens Claimed', 'Referral Count', 'Transaction Hash', 
                'Token Amount', 'Status'
            ])
            
            for user in users:
                writer.writerow(user)
        
        # Send file to admin
        with open(filepath, 'rb') as file:
            await update.message.reply_document(
                document=file,
                filename=filename,
                caption=f"📊 **User Export Complete**\n\nTotal Users: {len(users)}"
            )
        
        # Clean up file
        os.remove(filepath)
    
    async def set_tokens_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /set_tokens command - Set tokens per user"""
        if not self.is_admin(update.effective_user.id):
            return
        
        if len(context.args) != 1:
            await update.message.reply_text(
                "❌ **Usage:** `/set_tokens <amount>`\n\n"
                "**Example:** `/set_tokens 150`",
                parse_mode=ParseMode.MARKDOWN
            )
            return
        
        try:
            amount = int(context.args[0])
            self.db.set_setting('tokens_per_user', str(amount))
            
            await update.message.reply_text(
                f"✅ **Tokens per user updated to:** {amount}",
                parse_mode=ParseMode.MARKDOWN
            )
        except ValueError:
            await update.message.reply_text("❌ Invalid amount. Please enter a number.")
    
    async def pause_airdrop_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /pause_airdrop command"""
        if not self.is_admin(update.effective_user.id):
            return
        
        self.db.set_setting('airdrop_active', 'false')
        
        await update.message.reply_text(
            "⏸️ **Airdrop paused successfully!**\n\n"
            "Use `/resume_airdrop` to resume.",
            parse_mode=ParseMode.MARKDOWN
        )
    
    async def resume_airdrop_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /resume_airdrop command"""
        if not self.is_admin(update.effective_user.id):
            return
        
        # Check token balance before resuming
        token_balance = await self.solana.get_token_balance()
        tokens_per_user = int(self.db.get_setting('tokens_per_user') or '100')
        
        if token_balance < tokens_per_user:
            await update.message.reply_text(
                f"❌ **Cannot resume airdrop!**\n\n"
                f"Insufficient token balance: {token_balance:.2f}\n"
                f"Required per user: {tokens_per_user}",
                parse_mode=ParseMode.MARKDOWN
            )
            return
        
        self.db.set_setting('airdrop_active', 'true')
        
        await update.message.reply_text(
            "▶️ **Airdrop resumed successfully!**\n\n"
            f"Token balance: {token_balance:.2f}",
            parse_mode=ParseMode.MARKDOWN
        )
    
    async def check_balance_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /check_balance command"""
        if not self.is_admin(update.effective_user.id):
            return
        
        token_balance = await self.solana.get_token_balance()
        sol_balance = await self.solana.get_sol_balance()
        tokens_per_user = int(self.db.get_setting('tokens_per_user') or '100')
        
        remaining_airdrops = int(token_balance / tokens_per_user) if tokens_per_user > 0 else 0
        
        balance_text = f"""
💰 **Wallet Balances**

🪙 **Token Balance:** {token_balance:.2f}
⚡ **SOL Balance:** {sol_balance:.6f}
👥 **Remaining Airdrops:** {remaining_airdrops}
💵 **Tokens per User:** {tokens_per_user}

{'✅ Ready for airdrops' if token_balance >= tokens_per_user else '❌ Insufficient tokens'}
        """
        
        await update.message.reply_text(balance_text, parse_mode=ParseMode.MARKDOWN)
    
    async def broadcast_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /broadcast command - Send message to all users"""
        if not self.is_admin(update.effective_user.id):
            return
        
        if not context.args:
            await update.message.reply_text(
                "❌ **Usage:** `/broadcast <message>`\n\n"
                "**Example:** `/broadcast New airdrop round starting soon!`",
                parse_mode=ParseMode.MARKDOWN
            )
            return
        
        message = ' '.join(context.args)
        
        # Get all users
        import sqlite3
        conn = sqlite3.connect(self.db.db_path)
        cursor = conn.cursor()
        cursor.execute('SELECT telegram_id FROM users')
        users = cursor.fetchall()
        conn.close()
        
        if not users:
            await update.message.reply_text("📝 No users to broadcast to.")
            return
        
        # Confirm broadcast
        keyboard = [
            [InlineKeyboardButton("✅ Confirm Broadcast", callback_data=f"confirm_broadcast_{len(users)}")],
            [InlineKeyboardButton("❌ Cancel", callback_data="cancel_broadcast")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            f"📢 **Broadcast Preview:**\n\n{message}\n\n"
            f"**Recipients:** {len(users)} users\n\n"
            f"Confirm to send?",
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=reply_markup
        )
        
        # Store message for callback
        context.user_data['broadcast_message'] = message
        context.user_data['broadcast_users'] = [user[0] for user in users]
    
    async def confirm_broadcast_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle broadcast confirmation"""
        query = update.callback_query
        await query.answer()
        
        if not self.is_admin(query.from_user.id):
            return
        
        message = context.user_data.get('broadcast_message')
        users = context.user_data.get('broadcast_users', [])
        
        if not message or not users:
            await query.edit_message_text("❌ Broadcast data not found.")
            return
        
        await query.edit_message_text("📤 Broadcasting message...")
        
        success_count = 0
        failed_count = 0
        
        for user_id in users:
            try:
                await context.bot.send_message(
                    chat_id=user_id,
                    text=f"📢 **MochiDrop Announcement**\n\n{message}",
                    parse_mode=ParseMode.MARKDOWN
                )
                success_count += 1
            except Exception as e:
                failed_count += 1
        
        await query.edit_message_text(
            f"✅ **Broadcast Complete!**\n\n"
            f"✅ Sent: {success_count}\n"
            f"❌ Failed: {failed_count}",
            parse_mode=ParseMode.MARKDOWN
        )
        
        # Clean up user data
        context.user_data.pop('broadcast_message', None)
        context.user_data.pop('broadcast_users', None)
    
    async def dev_help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /dev_help command"""
        if not self.is_admin(update.effective_user.id):
            return
        
        help_text = """
🛠️ **MochiDrop Admin Commands**

**Task Management:**
• `/set_task "name" "description" type` - Add new task
• `/list_tasks` - View all active tasks

**Airdrop Control:**
• `/pause_airdrop` - Pause airdrop distribution
• `/resume_airdrop` - Resume airdrop distribution
• `/set_tokens <amount>` - Set tokens per user

**Monitoring:**
• `/admin_stats` - View bot statistics
• `/check_balance` - Check wallet balances
• `/export_users` - Export user data to CSV

**Communication:**
• `/broadcast <message>` - Send message to all users

**Setup Guide:**
1️⃣ Create SPL token on Solana
2️⃣ Fund airdrop wallet with tokens
3️⃣ Set tasks using `/set_task`
4️⃣ Configure token amount with `/set_tokens`
5️⃣ Monitor with `/admin_stats` and `/check_balance`
        """
        
        await update.message.reply_text(help_text, parse_mode=ParseMode.MARKDOWN)