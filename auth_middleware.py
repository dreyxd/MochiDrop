import os
import hashlib
from functools import wraps
from typing import List, Callable, Any
from telegram import Update
from telegram.ext import ContextTypes
from database_new import db
import logging

logger = logging.getLogger(__name__)

# Pre-configured admin IDs from environment
ADMIN_IDS = [int(id.strip()) for id in os.getenv('ADMIN_TELEGRAM_IDS', '').split(',') if id.strip()]
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'mochi_admin_2024')

class AuthMiddleware:
    """Role-based authentication middleware for MochiDrop bot"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password for secure storage"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Verify password against hash"""
        return hashlib.sha256(password.encode()).hexdigest() == hashed
    
    @staticmethod
    async def ensure_user_exists(update: Update) -> bool:
        """Ensure user exists in database, create if not"""
        try:
            user = update.effective_user
            telegram_id = user.id
            
            # Check if user exists
            existing_user = await db.get_user(telegram_id)
            
            if not existing_user:
                # Determine role - admin if in pre-configured list
                role = 'admin' if telegram_id in ADMIN_IDS else 'receiver'
                
                # Create new user
                success = await db.create_user(
                    telegram_id=telegram_id,
                    username=user.username,
                    first_name=user.first_name,
                    last_name=user.last_name,
                    role=role
                )
                
                if success:
                    logger.info(f"Created new user: {telegram_id} with role: {role}")
                    return True
                else:
                    logger.error(f"Failed to create user: {telegram_id}")
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error ensuring user exists: {e}")
            return False

def require_role(allowed_roles: List[str]):
    """Decorator to require specific roles for command access"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(update: Update, context: ContextTypes.DEFAULT_TYPE, *args, **kwargs):
            try:
                # Ensure user exists in database
                if not await AuthMiddleware.ensure_user_exists(update):
                    await update.message.reply_text("❌ Authentication error. Please try again.")
                    return
                
                telegram_id = update.effective_user.id
                user = await db.get_user(telegram_id)
                
                if not user:
                    await update.message.reply_text("❌ User not found. Please contact support.")
                    return
                
                # Check if user has required role
                if user['role'] not in allowed_roles:
                    if 'admin' in allowed_roles:
                        await update.message.reply_text(
                            "🔒 **Admin Access Required**\n\n"
                            "This command is restricted to administrators only.\n"
                            "Use `/admin login <password>` to authenticate as admin."
                        )
                    else:
                        await update.message.reply_text("❌ Insufficient permissions.")
                    return
                
                # Store user info in context for use in handler
                context.user_data['user_info'] = user
                
                # Call the original function
                return await func(update, context, *args, **kwargs)
                
            except Exception as e:
                logger.error(f"Error in role middleware: {e}")
                await update.message.reply_text("❌ An error occurred. Please try again.")
        
        return wrapper
    return decorator

def require_admin(func: Callable) -> Callable:
    """Decorator to require admin role"""
    return require_role(['admin'])(func)

def require_authenticated_admin(func: Callable) -> Callable:
    """Decorator to require authenticated admin (with session)"""
    @wraps(func)
    async def wrapper(update: Update, context: ContextTypes.DEFAULT_TYPE, *args, **kwargs):
        try:
            telegram_id = update.effective_user.id
            
            # First check if user is admin
            user = await db.get_user(telegram_id)
            if not user or user['role'] != 'admin':
                await update.message.reply_text(
                    "🔒 **Admin Access Required**\n\n"
                    "This command requires admin authentication.\n"
                    "Use `/admin login <password>` first."
                )
                return
            
            # Check if admin has active session
            session_token = context.user_data.get('admin_session_token')
            if not session_token or not await db.validate_admin_session(telegram_id, session_token):
                await update.message.reply_text(
                    "🔐 **Session Expired**\n\n"
                    "Your admin session has expired.\n"
                    "Please login again with `/admin login <password>`"
                )
                return
            
            # Store user info in context
            context.user_data['user_info'] = user
            
            # Call the original function
            return await func(update, context, *args, **kwargs)
            
        except Exception as e:
            logger.error(f"Error in authenticated admin middleware: {e}")
            await update.message.reply_text("❌ Authentication error. Please try again.")
    
    return wrapper

def require_receiver(func: Callable) -> Callable:
    """Decorator to require receiver role (default users)"""
    return require_role(['receiver', 'admin'])(func)  # Admins can also use receiver commands

class AdminAuth:
    """Admin authentication helper"""
    
    @staticmethod
    async def login_admin(update: Update, context: ContextTypes.DEFAULT_TYPE, password: str) -> bool:
        """Authenticate admin user"""
        try:
            telegram_id = update.effective_user.id
            
            # Verify password
            if password != ADMIN_PASSWORD:
                await update.message.reply_text("❌ Invalid admin password.")
                return False
            
            # Check if user exists and is admin
            user = await db.get_user(telegram_id)
            if not user:
                # Create admin user if they're in the pre-configured list
                if telegram_id in ADMIN_IDS:
                    await db.create_user(
                        telegram_id=telegram_id,
                        username=update.effective_user.username,
                        first_name=update.effective_user.first_name,
                        last_name=update.effective_user.last_name,
                        role='admin'
                    )
                    user = await db.get_user(telegram_id)
                else:
                    await update.message.reply_text("❌ You are not authorized as an admin.")
                    return False
            
            if user['role'] != 'admin':
                await update.message.reply_text("❌ You are not authorized as an admin.")
                return False
            
            # Create admin session
            session_token = await db.create_admin_session(telegram_id, duration_hours=24)
            if session_token:
                context.user_data['admin_session_token'] = session_token
                await update.message.reply_text(
                    "✅ **Admin Authentication Successful**\n\n"
                    "You are now logged in as an administrator.\n"
                    "Session valid for 24 hours.\n\n"
                    "Use `/admin dashboard` to access admin controls."
                )
                return True
            else:
                await update.message.reply_text("❌ Failed to create admin session.")
                return False
                
        except Exception as e:
            logger.error(f"Error in admin login: {e}")
            await update.message.reply_text("❌ Login error. Please try again.")
            return False
    
    @staticmethod
    async def logout_admin(update: Update, context: ContextTypes.DEFAULT_TYPE) -> bool:
        """Logout admin user"""
        try:
            # Clear session token from context
            if 'admin_session_token' in context.user_data:
                del context.user_data['admin_session_token']
            
            await update.message.reply_text(
                "👋 **Admin Logout Successful**\n\n"
                "You have been logged out from admin session."
            )
            return True
            
        except Exception as e:
            logger.error(f"Error in admin logout: {e}")
            return False

# Utility functions for role checking
async def is_admin(telegram_id: int) -> bool:
    """Check if user is admin"""
    return await db.is_admin(telegram_id)

async def get_user_role(telegram_id: int) -> str:
    """Get user role"""
    user = await db.get_user(telegram_id)
    return user['role'] if user else 'receiver'

# Command access control lists
ADMIN_COMMANDS = [
    'admin_dashboard', 'admin_create_airdrop', 'admin_wallet_connect',
    'admin_wallet_generate', 'admin_wallet_balance', 'admin_fund_airdrop',
    'admin_stats', 'admin_users', 'admin_login', 'admin_logout'
]

RECEIVER_COMMANDS = [
    'start', 'airdrops', 'claim', 'mywallet', 'myclaims', 'help'
]

def get_available_commands(role: str) -> List[str]:
    """Get available commands for role"""
    if role == 'admin':
        return ADMIN_COMMANDS + RECEIVER_COMMANDS
    else:
        return RECEIVER_COMMANDS