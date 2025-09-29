import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Wallet, 
  History, 
  Settings, 
  Copy, 
  ExternalLink,
  Edit3,
  Save,
  X
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useWallet } from '../contexts/WalletContext'
import { useAirdrop } from '../contexts/AirdropContext'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const { walletAddress, balance, tokenBalances, connectWallet, disconnectWallet } = useWallet()
  const { userClaims } = useAirdrop()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    username: user?.username || ''
  })
  const [walletInput, setWalletInput] = useState('')
  const [showWalletModal, setShowWalletModal] = useState(false)

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'wallet', label: 'Wallet', icon: <Wallet className="w-4 h-4" /> },
    { id: 'claims', label: 'Claims History', icon: <History className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ]

  const handleSaveProfile = async () => {
    const result = await updateProfile(editForm)
    if (result.success) {
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } else {
      toast.error(result.error || 'Failed to update profile')
    }
  }

  const handleConnectWallet = async () => {
    if (!walletInput.trim()) {
      toast.error('Please enter a wallet address')
      return
    }

    const result = await connectWallet(walletInput.trim())
    if (result.success) {
      toast.success('Wallet connected successfully!')
      setShowWalletModal(false)
      setWalletInput('')
    } else {
      toast.error(result.error || 'Failed to connect wallet')
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    toast.success('Address copied to clipboard')
  }

  const totalClaimed = userClaims.reduce((total, claim) => {
    if (claim.status === 'completed') {
      return total + (claim.amount / Math.pow(10, 9)) // Assuming 9 decimals
    }
    return total
  }, 0)

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            👤 Profile Settings
          </h1>
          <p className="text-gray-400">
            Manage your account, wallet, and airdrop history
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex space-x-1 mb-8 bg-white/5 border border-white/10 rounded-lg p-1"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 text-primary-400 hover:text-primary-300"
                >
                  {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.first_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">
                      {user?.first_name} {user?.last_name}
                    </div>
                    <div className="text-gray-400">
                      @{user?.username || 'No username'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Member since {new Date(user?.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={editForm.first_name}
                          onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                          className="input w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={editForm.last_name}
                          onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                          className="input w-full"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="input w-full"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button onClick={handleSaveProfile} className="btn-primary">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        First Name
                      </label>
                      <div className="text-white">{user?.first_name || 'Not set'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Last Name
                      </label>
                      <div className="text-white">{user?.last_name || 'Not set'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Username
                      </label>
                      <div className="text-white">@{user?.username || 'Not set'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Role
                      </label>
                      <div className="text-white capitalize">{user?.role || 'User'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              {/* Wallet Connection */}
              <div className="card">
                <h2 className="text-xl font-semibold text-white mb-6">Wallet Connection</h2>
                
                {walletAddress ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">Wallet Connected</div>
                          <div className="text-sm text-gray-300 font-mono">
                            {`${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={copyAddress}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          title="Copy Address"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`https://explorer.solana.com/address/${walletAddress}`, '_blank')}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          title="View in Explorer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">SOL Balance</div>
                        <div className="text-xl font-semibold text-white">
                          {balance.toFixed(4)} SOL
                        </div>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Token Accounts</div>
                        <div className="text-xl font-semibold text-white">
                          {Object.keys(tokenBalances).length}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={disconnectWallet}
                      className="btn-outline text-red-400 border-red-500/30 hover:bg-red-500/10"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      No Wallet Connected
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Connect your Solana wallet to start claiming airdrops
                    </p>
                    <button
                      onClick={() => setShowWalletModal(true)}
                      className="btn-primary"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Wallet
                    </button>
                  </div>
                )}
              </div>

              {/* Token Balances */}
              {Object.keys(tokenBalances).length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-white mb-4">Token Balances</h3>
                  <div className="space-y-3">
                    {Object.entries(tokenBalances).map(([mint, amount]) => (
                      <div key={mint} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            T
                          </div>
                          <div>
                            <div className="font-medium text-white">Token</div>
                            <div className="text-xs text-gray-400 font-mono">
                              {`${mint.slice(0, 8)}...${mint.slice(-8)}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-white">{amount.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Claims History Tab */}
          {activeTab === 'claims' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-6">Claims History</h2>
              
              {userClaims.length > 0 ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Total Claims</div>
                      <div className="text-xl font-semibold text-white">{userClaims.length}</div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Successful</div>
                      <div className="text-xl font-semibold text-white">
                        {userClaims.filter(claim => claim.status === 'completed').length}
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Total Claimed</div>
                      <div className="text-xl font-semibold text-white">{totalClaimed.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Claims List */}
                  <div className="space-y-3">
                    {userClaims.map((claim) => (
                      <div
                        key={claim.id}
                        className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-white">{claim.airdrop_name}</h4>
                          <span className={`text-sm font-medium ${
                            claim.status === 'completed' ? 'text-green-400' :
                            claim.status === 'pending' ? 'text-yellow-400' :
                            claim.status === 'processing' ? 'text-blue-400' :
                            'text-red-400'
                          }`}>
                            {claim.status === 'completed' ? '✅ Completed' :
                             claim.status === 'pending' ? '⏳ Pending' :
                             claim.status === 'processing' ? '🔄 Processing' :
                             '❌ Failed'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-300">
                            <span className="font-medium">{claim.amount / Math.pow(10, 9)}</span>
                            <span className="text-gray-400 ml-1">{claim.token_symbol}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(claim.claimed_at).toLocaleDateString()}
                          </div>
                        </div>

                        {claim.transaction_signature && (
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <a
                              href={`https://explorer.solana.com/tx/${claim.transaction_signature}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-400 hover:text-primary-300 text-xs inline-flex items-center"
                            >
                              View Transaction <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Claims Yet</h3>
                  <p className="text-gray-400 mb-6">
                    You haven't claimed any airdrops yet. Start exploring available campaigns!
                  </p>
                  <Link to="/airdrops" className="btn-primary">
                    Browse Airdrops
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-6">Account Settings</h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <i className="fas fa-info-circle text-blue-400 mt-1"></i>
                    <div>
                      <h4 className="font-medium text-blue-300 mb-1">Account Information</h4>
                      <p className="text-sm text-blue-200">
                        Your account is secure and all sensitive data is encrypted. 
                        We never store your private keys or seed phrases.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div>
                      <div className="font-medium text-white">Account ID</div>
                      <div className="text-sm text-gray-400">{user?.id}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div>
                      <div className="font-medium text-white">Role</div>
                      <div className="text-sm text-gray-400 capitalize">{user?.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div>
                      <div className="font-medium text-white">Member Since</div>
                      <div className="text-sm text-gray-400">
                        {new Date(user?.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Connect Wallet Modal */}
        {showWalletModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-dark-800 border border-white/10 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Connect Wallet</h3>
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Solana Wallet Address
                  </label>
                  <input
                    type="text"
                    value={walletInput}
                    onChange={(e) => setWalletInput(e.target.value)}
                    placeholder="Enter your Solana wallet address..."
                    className="input w-full"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Example: 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <i className="fas fa-shield-alt text-blue-400 mt-0.5"></i>
                    <div className="text-sm text-blue-300">
                      <p className="font-medium mb-1">Security Note</p>
                      <p>We only store your public wallet address. Never share your private keys or seed phrase.</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowWalletModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConnectWallet}
                    className="flex-1 btn-primary"
                  >
                    Connect
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile