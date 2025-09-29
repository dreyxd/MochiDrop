// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// Solana Configuration
export const SOLANA_NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'devnet'
export const SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com'

// Application Constants
export const APP_NAME = 'MochiDrop'
export const APP_VERSION = '2.0.0'
export const APP_DESCRIPTION = 'Advanced Solana Airdrop Management Platform'

// Token Constants
export const LAMPORTS_PER_SOL = 1000000000
export const DEFAULT_TOKEN_DECIMALS = 9

// UI Constants
export const ITEMS_PER_PAGE = 12
export const MAX_DESCRIPTION_LENGTH = 500
export const MAX_NAME_LENGTH = 100

// Status Constants
export const AIRDROP_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

export const CLAIM_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  EXPIRED: 'expired'
}

export const USER_ROLES = {
  ADMIN: 'admin',
  RECEIVER: 'receiver'
}

// Validation Constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  SOLANA_ADDRESS_LENGTH: { MIN: 32, MAX: 44 }
}

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_WALLET: 'Invalid Solana wallet address',
  WALLET_REQUIRED: 'Wallet connection required',
  LOGIN_REQUIRED: 'Please login to continue',
  INSUFFICIENT_BALANCE: 'Insufficient token balance',
  ALREADY_CLAIMED: 'Airdrop already claimed',
  AIRDROP_ENDED: 'Airdrop has ended',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred'
}

// Success Messages
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully',
  AIRDROP_CLAIMED: 'Airdrop claimed successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  AIRDROP_CREATED: 'Airdrop created successfully'
}

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'mochidrop_token',
  USER_PREFERENCES: 'mochidrop_preferences',
  THEME: 'mochidrop_theme'
}

// External Links
export const EXTERNAL_LINKS = {
  GITHUB: 'https://github.com/dreyxd/MochiDrop',
  DISCORD: 'https://discord.gg/mochidrop',
  TELEGRAM: 'https://t.me/mochidrop_community',
  TWITTER: 'https://twitter.com/mochidrop',
  SOLANA_EXPLORER: 'https://explorer.solana.com',
  DOCS: 'https://docs.mochidrop.com'
}

// Feature Flags
export const FEATURES = {
  WALLET_ADAPTER: true,
  MULTI_TENANT: true,
  ANALYTICS: true,
  WEBHOOKS: true,
  ADMIN_PANEL: true,
  MOBILE_APP: false
}