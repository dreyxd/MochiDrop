import React, { useState } from 'react'
import { Wallet, Copy, ExternalLink, RefreshCw } from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'
import toast from 'react-hot-toast'

const WalletButton = () => {
  const { walletAddress, balance, loading, connectWallet, disconnectWallet, refreshBalances } = useWallet()
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [walletInput, setWalletInput] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnectWallet = async () => {
    if (!walletInput.trim()) {
      toast.error('Please enter a wallet address')
      return
    }

    setIsConnecting(true)
    const result = await connectWallet(walletInput.trim())
    
    if (result.success) {
      toast.success('Wallet connected successfully!')
      setShowWalletModal(false)
      setWalletInput('')
    } else {
      toast.error(result.error || 'Failed to connect wallet')
    }
    setIsConnecting(false)
  }

  const handleDisconnectWallet = async () => {
    const result = await disconnectWallet()
    if (result.success) {
      toast.success('Wallet disconnected')
    } else {
      toast.error('Failed to disconnect wallet')
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    toast.success('Address copied to clipboard')
  }

  const openInExplorer = () => {
    window.open(`https://explorer.solana.com/address/${walletAddress}`, '_blank')
  }

  if (!walletAddress) {
    return (
      <>
        <button
          onClick={() => setShowWalletModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          <Wallet className="w-4 h-4" />
          <span>Connect Wallet</span>
        </button>

        {/* Connect Wallet Modal */}
        {showWalletModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 border border-white/10 rounded-xl p-6 w-full max-w-md">
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
                    <i className="fas fa-info-circle text-blue-400 mt-0.5"></i>
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
                    disabled={isConnecting}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Connecting...
                      </div>
                    ) : (
                      'Connect'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Wallet Info */}
      <div className="hidden sm:flex items-center space-x-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <div className="text-sm">
          <div className="text-gray-300 font-medium">
            {`${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`}
          </div>
          <div className="text-xs text-gray-400">
            {balance.toFixed(4)} SOL
          </div>
        </div>
      </div>

      {/* Wallet Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={refreshBalances}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          title="Refresh Balance"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>

        <button
          onClick={copyAddress}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          title="Copy Address"
        >
          <Copy className="w-4 h-4" />
        </button>

        <button
          onClick={openInExplorer}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          title="View in Explorer"
        >
          <ExternalLink className="w-4 h-4" />
        </button>

        <button
          onClick={handleDisconnectWallet}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Disconnect Wallet"
        >
          <i className="fas fa-unlink w-4 h-4"></i>
        </button>
      </div>
    </div>
  )
}

export default WalletButton