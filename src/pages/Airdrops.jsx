import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Gift, 
  Clock, 
  Users, 
  Coins, 
  ExternalLink, 
  Filter,
  Search,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useAirdrop } from '../contexts/AirdropContext'
import { useWallet } from '../contexts/WalletContext'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Airdrops = () => {
  const { airdrops, userClaims, loading, claimAirdrop, getUserClaimForAirdrop } = useAirdrop()
  const { walletAddress } = useWallet()
  const { isAuthenticated } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [claimingId, setClaimingId] = useState(null)

  const filteredAirdrops = airdrops.filter(airdrop => {
    const matchesSearch = airdrop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         airdrop.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && airdrop.status === 'active') ||
                         (filterStatus === 'claimed' && getUserClaimForAirdrop(airdrop.id)) ||
                         (filterStatus === 'available' && !getUserClaimForAirdrop(airdrop.id) && airdrop.status === 'active')
    
    return matchesSearch && matchesFilter
  })

  const handleClaim = async (airdropId) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!isAuthenticated) {
      toast.error('Please login to claim airdrops')
      return
    }

    setClaimingId(airdropId)
    const result = await claimAirdrop(airdropId)
    
    if (result.success) {
      toast.success('Airdrop claimed successfully! 🎉')
    } else {
      toast.error(result.error || 'Failed to claim airdrop')
    }
    setClaimingId(null)
  }

  const getStatusBadge = (airdrop) => {
    const userClaim = getUserClaimForAirdrop(airdrop.id)
    
    if (userClaim) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Claimed
        </span>
      )
    }
    
    if (airdrop.status === 'active') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Clock className="w-3 h-3 mr-1" />
          Active
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
        <AlertCircle className="w-3 h-3 mr-1" />
        Ended
      </span>
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
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            🎁 Available Airdrops
          </h1>
          <p className="text-gray-400">
            Discover and claim free tokens from various Solana projects
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col lg:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search airdrops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="all">All Airdrops</option>
              <option value="active">Active</option>
              <option value="available">Available to Claim</option>
              <option value="claimed">Already Claimed</option>
            </select>
          </div>
        </motion.div>

        {/* Airdrops Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-6 bg-white/10 rounded mb-4"></div>
                <div className="h-4 bg-white/5 rounded mb-2"></div>
                <div className="h-4 bg-white/5 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-white/5 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredAirdrops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAirdrops.map((airdrop, index) => {
              const userClaim = getUserClaimForAirdrop(airdrop.id)
              const canClaim = !userClaim && airdrop.status === 'active' && walletAddress
              const amountDisplay = airdrop.amount_per_claim / Math.pow(10, airdrop.token_decimals)
              
              return (
                <motion.div
                  key={airdrop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="card group hover:scale-105 transition-transform"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">
                        {airdrop.name}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {airdrop.description}
                      </p>
                    </div>
                    {getStatusBadge(airdrop)}
                  </div>

                  {/* Reward Info */}
                  <div className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {amountDisplay.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-300">
                          {airdrop.token_symbol} per claim
                        </div>
                      </div>
                      <div className="text-4xl opacity-50">
                        🪙
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">
                        {airdrop.current_claims || 0}
                      </div>
                      <div className="text-xs text-gray-400">Claims</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">
                        {airdrop.max_claims ? `${airdrop.max_claims - (airdrop.current_claims || 0)}` : '∞'}
                      </div>
                      <div className="text-xs text-gray-400">Remaining</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {airdrop.max_claims && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(((airdrop.current_claims || 0) / airdrop.max_claims) * 100)}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(((airdrop.current_claims || 0) / airdrop.max_claims) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="space-y-2">
                    {!isAuthenticated ? (
                      <Link to="/login" className="btn-primary w-full text-center">
                        Login to Claim
                      </Link>
                    ) : !walletAddress ? (
                      <Link to="/profile" className="btn-secondary w-full text-center">
                        Connect Wallet First
                      </Link>
                    ) : userClaim ? (
                      <div className="text-center">
                        <div className="text-green-400 font-medium mb-1">
                          ✅ Already Claimed
                        </div>
                        <div className="text-xs text-gray-400">
                          Claimed on {new Date(userClaim.claimed_at).toLocaleDateString()}
                        </div>
                        {userClaim.transaction_signature && (
                          <a
                            href={`https://explorer.solana.com/tx/${userClaim.transaction_signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-400 hover:text-primary-300 text-xs inline-flex items-center mt-1"
                          >
                            View Transaction <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        )}
                      </div>
                    ) : canClaim ? (
                      <button
                        onClick={() => handleClaim(airdrop.id)}
                        disabled={claimingId === airdrop.id}
                        className="btn-primary w-full disabled:opacity-50"
                      >
                        {claimingId === airdrop.id ? (
                          <div className="flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Claiming...
                          </div>
                        ) : (
                          <>
                            <Gift className="w-4 h-4 mr-2" />
                            Claim Airdrop
                          </>
                        )}
                      </button>
                    ) : (
                      <button disabled className="btn-secondary w-full opacity-50 cursor-not-allowed">
                        Not Available
                      </button>
                    )}
                  </div>

                  {/* Additional Info */}
                  {airdrop.end_date && (
                    <div className="mt-3 text-xs text-gray-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Ends: {new Date(airdrop.end_date).toLocaleDateString()}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No airdrops found
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No airdrops are currently available'
              }
            </p>
            {(searchTerm || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterStatus('all')
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        )}

        {/* Info Banner */}
        {!walletAddress && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  Connect Your Wallet to Claim Airdrops
                </h3>
                <p className="text-gray-300">
                  You need to connect a Solana wallet to participate in airdrops and receive tokens.
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

export default Airdrops