import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Users, 
  Coins, 
  TrendingUp, 
  Gift, 
  Wallet,
  RefreshCw,
  Plus
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useAirdrop } from '../contexts/AirdropContext'
import { useWallet } from '../contexts/WalletContext'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth()
  const { airdrops, userClaims, stats, loading, fetchStats } = useAirdrop()
  const { walletAddress, balance } = useWallet()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/login'
    }
  }, [isAuthenticated])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchStats()
      toast.success('Dashboard refreshed')
    } catch (error) {
      toast.error('Failed to refresh dashboard')
    } finally {
      setRefreshing(false)
    }
  }

  const dashboardStats = [
    {
      title: 'Available Airdrops',
      value: airdrops.length,
      icon: <Gift className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%'
    },
    {
      title: 'My Claims',
      value: userClaims.length,
      icon: <Coins className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      change: '+8%'
    },
    {
      title: 'Wallet Balance',
      value: `${balance.toFixed(4)} SOL`,
      icon: <Wallet className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      change: '+5%'
    },
    {
      title: 'Success Rate',
      value: '98.5%',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      change: '+2%'
    }
  ]

  const recentClaims = userClaims.slice(0, 5)
  const activeAirdrops = airdrops.filter(airdrop => airdrop.status === 'active').slice(0, 6)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.first_name || 'User'}! 🍡
            </h1>
            <p className="text-gray-400">
              Manage your airdrops and track your token claims
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center space-x-3 mt-4 lg:mt-0"
          >
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            {user?.role === 'admin' && (
              <Link to="/admin" className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Admin Panel
              </Link>
            )}
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Airdrops */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Active Airdrops</h3>
              <Link to="/airdrops" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                View All <ArrowRight className="w-4 h-4 inline ml-1" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-white/5 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : activeAirdrops.length > 0 ? (
              <div className="space-y-4">
                {activeAirdrops.map((airdrop) => (
                  <div
                    key={airdrop.id}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{airdrop.name}</h4>
                      <span className="text-green-400 text-sm font-medium">Active</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{airdrop.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-300">
                        <span className="font-medium">{airdrop.amount_per_claim / Math.pow(10, airdrop.token_decimals)}</span>
                        <span className="text-gray-400 ml-1">{airdrop.token_symbol}</span>
                      </div>
                      <Link
                        to={`/airdrops/${airdrop.id}`}
                        className="text-primary-400 hover:text-primary-300 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No active airdrops available</p>
                <Link to="/airdrops" className="text-primary-400 hover:text-primary-300 text-sm font-medium mt-2 inline-block">
                  Browse All Airdrops
                </Link>
              </div>
            )}
          </motion.div>

          {/* Recent Claims */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Recent Claims</h3>
              <Link to="/profile" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                View All <ArrowRight className="w-4 h-4 inline ml-1" />
              </Link>
            </div>

            {recentClaims.length > 0 ? (
              <div className="space-y-4">
                {recentClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg"
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No claims yet</p>
                <Link to="/airdrops" className="text-primary-400 hover:text-primary-300 text-sm font-medium mt-2 inline-block">
                  Browse Airdrops
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Wallet Status */}
        {!walletAddress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-300">
                  Connect a Solana wallet to start claiming airdrops and receiving tokens.
                </p>
              </div>
              <Link to="/profile" className="btn-primary">
                Connect Wallet
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Dashboard