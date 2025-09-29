import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Gift, 
  Clock, 
  Users, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Coins
} from 'lucide-react'
import { useAirdrop } from '../contexts/AirdropContext'
import { useWallet } from '../contexts/WalletContext'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const AirdropCard = ({ airdrop, index = 0 }) => {
  const { claimAirdrop, getUserClaimForAirdrop } = useAirdrop()
  const { walletAddress } = useWallet()
  const { isAuthenticated } = useAuth()
  const [claiming, setClaiming] = useState(false)

  const userClaim = getUserClaimForAirdrop(airdrop.id)
  const canClaim = !userClaim && airdrop.status === 'active' && walletAddress && isAuthenticated
  const amountDisplay = airdrop.amount_per_claim / Math.pow(10, airdrop.token_decimals || 9)
  const totalDisplay = airdrop.total_amount / Math.pow(10, airdrop.token_decimals || 9)

  const handleClaim = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!isAuthenticated) {
      toast.error('Please login to claim airdrops')
      return
    }

    setClaiming(true)
    const result = await claimAirdrop(airdrop.id)
    
    if (result.success) {
      toast.success('Airdrop claimed successfully! 🎉')
    } else {
      toast.error(result.error || 'Failed to claim airdrop')
    }
    setClaiming(false)
  }

  const getStatusBadge = () => {
    if (userClaim) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Claimed
        </span>
      )
    }
    
    if (airdrop.status === 'active') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Clock className="w-3 h-3 mr-1" />
          Active
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
        <AlertCircle className="w-3 h-3 mr-1" />
        Ended
      </span>
    )
  }

  const progressPercentage = airdrop.max_claims 
    ? Math.min(((airdrop.current_claims || 0) / airdrop.max_claims) * 100, 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 * index }}
      className="card group hover:scale-105 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
            {airdrop.name}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
            {airdrop.description}
          </p>
        </div>
        <div className="ml-4">
          {getStatusBadge()}
        </div>
      </div>

      {/* Reward Display */}
      <div className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-white mb-1">
              {amountDisplay.toLocaleString()}
            </div>
            <div className="text-sm text-gray-300">
              {airdrop.token_symbol} per claim
            </div>
          </div>
          <div className="text-4xl opacity-60 group-hover:scale-110 transition-transform">
            🪙
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-white">
            {(airdrop.current_claims || 0).toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">Claims</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-white">
            {airdrop.max_claims ? (airdrop.max_claims - (airdrop.current_claims || 0)).toLocaleString() : '∞'}
          </div>
          <div className="text-xs text-gray-400">Remaining</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-white">
            {totalDisplay.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">Total Pool</div>
        </div>
      </div>

      {/* Progress Bar */}
      {airdrop.max_claims && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-full rounded-full"
            />
          </div>
        </div>
      )}

      {/* Token Info */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
        <div className="flex items-center space-x-1">
          <Coins className="w-3 h-3" />
          <span>Token: {airdrop.token_symbol}</span>
        </div>
        {airdrop.end_date && (
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>Ends: {new Date(airdrop.end_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="space-y-3">
        {!isAuthenticated ? (
          <button
            onClick={() => toast.error('Please login to claim airdrops')}
            className="btn-secondary w-full"
          >
            Login to Claim
          </button>
        ) : !walletAddress ? (
          <button
            onClick={() => toast.error('Please connect your wallet first')}
            className="btn-secondary w-full"
          >
            Connect Wallet First
          </button>
        ) : userClaim ? (
          <div className="space-y-2">
            <div className="text-center text-green-400 font-medium">
              ✅ Successfully Claimed
            </div>
            <div className="text-center text-xs text-gray-400">
              Claimed on {new Date(userClaim.claimed_at).toLocaleDateString()}
            </div>
            {userClaim.transaction_signature && (
              <a
                href={`https://explorer.solana.com/tx/${userClaim.transaction_signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-1 text-primary-400 hover:text-primary-300 text-xs transition-colors"
              >
                <span>View Transaction</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ) : canClaim ? (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="btn-primary w-full disabled:opacity-50 group-hover:shadow-lg group-hover:shadow-primary-500/25"
          >
            {claiming ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Claiming...
              </div>
            ) : (
              <>
                <Gift className="w-4 h-4 mr-2" />
                Claim {amountDisplay.toLocaleString()} {airdrop.token_symbol}
              </>
            )}
          </button>
        ) : (
          <button disabled className="btn-secondary w-full opacity-50 cursor-not-allowed">
            {airdrop.status !== 'active' ? 'Airdrop Ended' : 'Not Available'}
          </button>
        )}
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>ID: {airdrop.id}</span>
          <span>Created: {new Date(airdrop.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default AirdropCard