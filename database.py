import sqlite3
import os
from datetime import datetime
from typing import Optional, List, Dict

class Database:
    def __init__(self, db_path: str = "./mochidrop.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize database with required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                telegram_id INTEGER PRIMARY KEY,
                username TEXT,
                wallet_address TEXT UNIQUE,
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                tokens_claimed INTEGER DEFAULT 0,
                is_eligible BOOLEAN DEFAULT 1,
                referral_count INTEGER DEFAULT 0
            )
        ''')
        
        # Tasks table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_name TEXT NOT NULL,
                task_description TEXT NOT NULL,
                task_type TEXT NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # User tasks completion table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                telegram_id INTEGER,
                task_id INTEGER,
                completed BOOLEAN DEFAULT 0,
                completion_date TIMESTAMP,
                FOREIGN KEY (telegram_id) REFERENCES users (telegram_id),
                FOREIGN KEY (task_id) REFERENCES tasks (id),
                UNIQUE(telegram_id, task_id)
            )
        ''')
        
        # Transactions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                telegram_id INTEGER,
                wallet_address TEXT,
                transaction_hash TEXT,
                token_amount INTEGER,
                status TEXT DEFAULT 'pending',
                created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (telegram_id) REFERENCES users (telegram_id)
            )
        ''')
        
        # Admin settings table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def add_user(self, telegram_id: int, username: str, wallet_address: str) -> bool:
        """Add new user to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO users (telegram_id, username, wallet_address)
                VALUES (?, ?, ?)
            ''', (telegram_id, username, wallet_address))
            
            conn.commit()
            conn.close()
            return True
        except sqlite3.IntegrityError:
            return False
    
    def get_user(self, telegram_id: int) -> Optional[Dict]:
        """Get user by telegram ID"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE telegram_id = ?', (telegram_id,))
        user = cursor.fetchone()
        
        conn.close()
        
        if user:
            return {
                'telegram_id': user[0],
                'username': user[1],
                'wallet_address': user[2],
                'registration_date': user[3],
                'tokens_claimed': user[4],
                'is_eligible': user[5],
                'referral_count': user[6]
            }
        return None
    
    def wallet_exists(self, wallet_address: str) -> bool:
        """Check if wallet already exists"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT 1 FROM users WHERE wallet_address = ?', (wallet_address,))
        exists = cursor.fetchone() is not None
        
        conn.close()
        return exists
    
    def add_task(self, task_name: str, task_description: str, task_type: str) -> int:
        """Add new task and return task ID"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO tasks (task_name, task_description, task_type)
            VALUES (?, ?, ?)
        ''', (task_name, task_description, task_type))
        
        task_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return task_id
    
    def get_active_tasks(self) -> List[Dict]:
        """Get all active tasks"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM tasks WHERE is_active = 1')
        tasks = cursor.fetchall()
        
        conn.close()
        
        return [{
            'id': task[0],
            'task_name': task[1],
            'task_description': task[2],
            'task_type': task[3],
            'is_active': task[4],
            'created_date': task[5]
        } for task in tasks]
    
    def complete_task(self, telegram_id: int, task_id: int) -> bool:
        """Mark task as completed for user"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO user_tasks (telegram_id, task_id, completed, completion_date)
                VALUES (?, ?, 1, ?)
            ''', (telegram_id, task_id, datetime.now()))
            
            conn.commit()
            conn.close()
            return True
        except:
            return False
    
    def get_user_completed_tasks(self, telegram_id: int) -> List[int]:
        """Get list of completed task IDs for user"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT task_id FROM user_tasks 
            WHERE telegram_id = ? AND completed = 1
        ''', (telegram_id,))
        
        tasks = cursor.fetchall()
        conn.close()
        
        return [task[0] for task in tasks]
    
    def add_transaction(self, telegram_id: int, wallet_address: str, token_amount: int, tx_hash: str = None) -> int:
        """Add transaction record"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO transactions (telegram_id, wallet_address, transaction_hash, token_amount)
            VALUES (?, ?, ?, ?)
        ''', (telegram_id, wallet_address, tx_hash, token_amount))
        
        tx_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return tx_id
    
    def update_transaction_status(self, tx_id: int, status: str, tx_hash: str = None):
        """Update transaction status"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if tx_hash:
            cursor.execute('''
                UPDATE transactions 
                SET status = ?, transaction_hash = ?
                WHERE id = ?
            ''', (status, tx_hash, tx_id))
        else:
            cursor.execute('''
                UPDATE transactions 
                SET status = ?
                WHERE id = ?
            ''', (status, tx_id))
        
        conn.commit()
        conn.close()
    
    def get_total_tokens_distributed(self) -> int:
        """Get total tokens distributed"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT SUM(token_amount) FROM transactions 
            WHERE status = 'completed'
        ''')
        
        result = cursor.fetchone()[0]
        conn.close()
        
        return result if result else 0
    
    def get_user_count(self) -> int:
        """Get total user count"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM users')
        count = cursor.fetchone()[0]
        
        conn.close()
        return count
    
    def set_setting(self, key: str, value: str):
        """Set admin setting"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO settings (key, value, updated_date)
            VALUES (?, ?, ?)
        ''', (key, value, datetime.now()))
        
        conn.commit()
        conn.close()
    
    def get_setting(self, key: str) -> Optional[str]:
        """Get admin setting"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT value FROM settings WHERE key = ?', (key,))
        result = cursor.fetchone()
        
        conn.close()
        return result[0] if result else None