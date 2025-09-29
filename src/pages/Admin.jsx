import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Crown, 
  Plus, 
  Users, 
  BarChart3, 
  Settings, 
  Gift,
  Wallet,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { airdropAPI } from '../services/api'
import toast from 'react-hot-toast'

const Admin = () => {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [adminStats, setAdminStats] = useState({})
  const [users, setUsers] = useState([])
  const [airdrops, setAirdrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    token_mint: '',
    token_symbol: '',
    total_amount: '',
    amount_per_claim: '',
    max_claims: ''
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      window.location.href = '/dashboard'
      return
    }
    
    fetchAdminData()
  }, [isAuthenticated, user])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      const [statsResponse, usersResponse] = await Promise.all([
        airdropAPI.getAdminStats(),
        airdropAPI.getUsers()
      ])
      
      setAdminStats(statsResponse.stats || {})
      setUsers(usersResponse.users || [])
    } catch (error) {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAirdrop = async () => {
    try {
      const airdropData = {
        ...createForm,
        total_amount: parseInt(createForm.total_amount) * Math.pow(10, 9), // Convert to smallest unit
        amount_per_claim: parseInt(createForm.amount_per_claim) * Math.pow(10, 9),
        max_claims: createForm.max_claims ? parseInt(createForm.max_claims) : null,
        token_decimals: 9
      }

      const result = await airdropAPI.createAirdrop(airdropData)
      
      if (result.success) {
        toast.success('Airdrop created successfully!')
        setShowCreateModal(false)
        setCreateForm({
          name: '',
          description: '',
          token_mint: '',
          token_symbol: '',
          total_amount: '',
          amount_per_claim: '',
          max_claims: ''
        })
        fetchAdminData()
      } else {
        toast.error(result.error || 'Failed to create airdrop')
      }
    } catch (error) {
      toast.error('Error creating airdrop')
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'airdrops', label: 'Airdrops', icon: <Gift className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ]

  const overviewStats = [
    {
      title: 'Total Users',
      value: adminStats.total_users || 0,
      icon: <Users className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%'
    },
    {
      title: 'Active Airdrops',
      value: adminStats.active_airdrops || 0,
      icon: <Gift className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      change: '+8%'
    },
    {
      title: 'Total Claims',
      value: adminStats.total_claims || 0,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      change: '+15%'
    },
    {
      title: 'Success Rate',
      value: `${adminStats.success_rate || 98.5}%`,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      change: '+2%'
    }
  ]

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <Crown className="w-8 h-8 text-yellow-400 mr-3" />
              Admin Dashboard
            </h1>
            <p className="text-gray-400">
              Manage airdrops, users, and platform settings
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Airdrop
          </button>
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
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {overviewStats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="card"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                        {stat.icon}
                      </div>
                      <span className="text-green-400 text-sm font-medium">
                        {stat.change}
                      </span>
                    </div>
                    
                    <div className="text-2xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {stat.title}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
                  <div className="space-y-3">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {user.first_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-white">{user.first_name} {user.last_name}</div>
                          <div className="text-xs text-gray-400">@{user.username}</div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-white">Database</span>
                      </div>
                      <span className="text-green-400 text-sm">Healthy</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-white">Solana RPC</span>
                      </div>
                      <span className="text-green-400 text-sm">Connected</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        <span className="text-white">Queue</span>
                      </div>
                      <span className="text-yellow-400 text-sm">3 pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-6">User Management</h2>
              
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-white/5 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user.first_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-400">
                            @{user.username} • {user.role}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-white">
                            {user.wallet_address ? '✅ Wallet Connected' : '❌ No Wallet'}
                          </div>
                          <div className="text-xs text-gray-400">
                            Joined {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Create Airdrop Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-dark-800 border border-white/10 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Create New Airdrop</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Airdrop Name
                    </label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="e.g., Launch Airdrop"
                      className="input w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Token Symbol
                    </label>
                    <input
                      type="text"
                      value={createForm.token_symbol}
                      onChange={(e) => setCreateForm({ ...createForm, token_symbol: e.target.value })}
                      placeholder="e.g., MOCHI"
                      className="input w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="Describe your airdrop campaign..."
                    rows={3}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Token Mint Address
                  </label>
                  <input
                    type="text"
                    value={createForm.token_mint}
                    onChange={(e) => setCreateForm({ ...createForm, token_mint: e.target.value })}
                    placeholder="Solana token mint address"
                    className="input w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Total Amount
                    </label>
                    <input
                      type="number"
                      value={createForm.total_amount}
                      onChange={(e) => setCreateForm({ ...createForm, total_amount: e.target.value })}
                      placeholder="1000000"
                      className="input w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Amount per Claim
                    </label>
                    <input
                      type="number"
                      value={createForm.amount_per_claim}
                      onChange={(e) => setCreateForm({ ...createForm, amount_per_claim: e.target.value })}
                      placeholder="100"
                      className="input w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Claims (Optional)
                    </label>
                    <input
                      type="number"
                      value={createForm.max_claims}
                      onChange={(e) => setCreateForm({ ...createForm, max_claims: e.target.value })}
                      placeholder="1000"
                      className="input w-full"
                    />
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div className="text-sm text-yellow-300">
                      <p className="font-medium mb-1">Important</p>
                      <p>Make sure your project wallet is funded with enough tokens before activating the airdrop.</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAirdrop}
                    className="flex-1 btn-primary"
                  >
                    Create Airdrop
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

export default Admin