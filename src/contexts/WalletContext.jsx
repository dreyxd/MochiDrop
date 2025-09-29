import React, { createContext, useContext, useState, useEffect } from 'react'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { useAuth } from './AuthContext'
import { walletAPI } from '../services/api'

const WalletContext = createContext()

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

export const WalletProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [walletAddress, setWalletAddress] = useState(null)
  const [balance, setBalance] = useState(0)
  const [tokenBalances, setTokenBalances] = useState({})
  const [loading, setLoading] = useState(false)
  const [connection, setConnection] = useState(null)

  useEffect(() => {
    // Initialize Solana connection
    const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl('devnet')
    setConnection(new Connection(rpcUrl, 'confirmed'))
  }, [])

  useEffect(() => {
    if (isAuthenticated && user?.wallet_address) {
      setWalletAddress(user.wallet_address)
      fetchBalances(user.wallet_address)
    }
  }, [isAuthenticated, user])

  const connectWallet = async (address) => {
    try {
      setLoading(true)
      
      // Validate wallet address
      if (!isValidSolanaAddress(address)) {
        throw new Error('Invalid Solana wallet address')
      }

      // Update user profile with wallet address
      const response = await walletAPI.connectWallet(address)
      
      if (response.success) {
        setWalletAddress(address)
        await fetchBalances(address)
        return { success: true }
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const fetchBalances = async (address) => {
    if (!connection || !address) return

    try {
      // Fetch SOL balance
      const publicKey = new PublicKey(address)
      const solBalance = await connection.getBalance(publicKey)
      setBalance(solBalance / 1e9) // Convert lamports to SOL

      // Fetch token balances
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      })

      const balances = {}
      tokenAccounts.value.forEach(account => {
        const tokenInfo = account.account.data.parsed.info
        const mint = tokenInfo.mint
        const amount = tokenInfo.tokenAmount.uiAmount || 0
        
        if (amount > 0) {
          balances[mint] = amount
        }
      })
      
      setTokenBalances(balances)
    } catch (error) {
      console.error('Error fetching balances:', error)
    }
  }

  const isValidSolanaAddress = (address) => {
    try {
      new PublicKey(address)
      return true
    } catch {
      return false
    }
  }

  const disconnectWallet = async () => {
    try {
      await walletAPI.disconnectWallet()
      setWalletAddress(null)
      setBalance(0)
      setTokenBalances({})
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const refreshBalances = () => {
    if (walletAddress) {
      fetchBalances(walletAddress)
    }
  }

  const value = {
    walletAddress,
    balance,
    tokenBalances,
    loading,
    connection,
    connectWallet,
    disconnectWallet,
    refreshBalances,
    isValidSolanaAddress
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}