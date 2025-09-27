-- MochiDrop Database Schema
-- Role-based Solana Airdrop Management System

-- Users table with role-based access
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(20) DEFAULT 'receiver' CHECK (role IN ('admin', 'receiver')),
    wallet_address VARCHAR(44), -- Solana wallet address (base58)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin authentication sessions
CREATE TABLE admin_sessions (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT REFERENCES users(telegram_id),
    session_token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Airdrop campaigns
CREATE TABLE airdrops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    token_mint VARCHAR(44) NOT NULL, -- SPL token mint address
    token_symbol VARCHAR(10),
    token_decimals INTEGER DEFAULT 9,
    total_amount BIGINT NOT NULL, -- Total tokens allocated (in smallest unit)
    amount_per_claim BIGINT NOT NULL, -- Tokens per user claim
    max_claims INTEGER, -- Maximum number of claims allowed
    current_claims INTEGER DEFAULT 0,
    admin_wallet VARCHAR(44) NOT NULL, -- Admin wallet funding the airdrop
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_by BIGINT REFERENCES users(telegram_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User claims tracking
CREATE TABLE claims (
    id SERIAL PRIMARY KEY,
    airdrop_id INTEGER REFERENCES airdrops(id),
    user_id BIGINT REFERENCES users(telegram_id),
    amount BIGINT NOT NULL, -- Amount claimed (in smallest unit)
    transaction_signature VARCHAR(88), -- Solana transaction signature
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    UNIQUE(airdrop_id, user_id) -- One claim per user per airdrop
);

-- Admin wallets for airdrop management
CREATE TABLE admin_wallets (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT REFERENCES users(telegram_id),
    wallet_address VARCHAR(44) NOT NULL,
    wallet_name VARCHAR(255),
    encrypted_private_key TEXT, -- Encrypted private key
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction logs for audit trail
CREATE TABLE transaction_logs (
    id SERIAL PRIMARY KEY,
    airdrop_id INTEGER REFERENCES airdrops(id),
    claim_id INTEGER REFERENCES claims(id),
    from_wallet VARCHAR(44),
    to_wallet VARCHAR(44),
    amount BIGINT,
    transaction_signature VARCHAR(88),
    status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_airdrops_status ON airdrops(status);
CREATE INDEX idx_airdrops_created_by ON airdrops(created_by);
CREATE INDEX idx_claims_airdrop_user ON claims(airdrop_id, user_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_admin_sessions_telegram_id ON admin_sessions(telegram_id);
CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_airdrops_updated_at BEFORE UPDATE ON airdrops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();