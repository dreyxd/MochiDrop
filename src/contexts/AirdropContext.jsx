import React, { createContext, useContext, useState, useEffect } from 'react'
import { airdropAPI } from '../services/api'
import { useAuth } from './AuthContext'

const AirdropContext = createContext()

export const useAirdrop = () => {
  const context = useContext(AirdropContext)
  if (!context) {
    throw new Error('useAirdrop must be used within an AirdropProvider')
  }
  return context
}

export const AirdropProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [airdrops, setAirdrops] = useState([])
  const [userClaims, setUserClaims] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalAirdrops: 0,
    activeAirdrops: 0,
    totalClaims: 0,
    totalDistributed: 0
  })

  useEffect(() => {
    if (isAuthenticated) {
      fetchAirdrops()
      fetchUserClaims()
      fetchStats()
    }
  }, [isAuthenticated])

  const fetchAirdrops = async () => {
    try {
      setLoading(true)
      const response = await airdropAPI.getActiveAirdrops()
      setAirdrops(response.airdrops || [])
    } catch (error) {
      console.error('Error fetching airdrops:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserClaims = async () => {
    try {
      const response = await airdropAPI.getUserClaims()
      setUserClaims(response.claims || [])
    } catch (error) {
      console.error('Error fetching user claims:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await airdropAPI.getStats()
      setStats(response.stats || stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const claimAirdrop = async (airdropId) => {
    try {
      const response = await airdropAPI.claimAirdrop(airdropId)
      
      if (response.success) {
        // Refresh data
        await fetchUserClaims()
        await fetchAirdrops()
        return { success: true, claim: response.claim }
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const createAirdrop = async (airdropData) => {
    try {
      const response = await airdropAPI.createAirdrop(airdropData)
      
      if (response.success) {
        await fetchAirdrops()
        return { success: true, airdrop: response.airdrop }
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const updateAirdrop = async (airdropId, updateData) => {
    try {
      const response = await airdropAPI.updateAirdrop(airdropId, updateData)
      
      if (response.success) {
        await fetchAirdrops()
        return { success: true, airdrop: response.airdrop }
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const getAirdropById = (id) => {
    return airdrops.find(airdrop => airdrop.id === id)
  }

  const getUserClaimForAirdrop = (airdropId) => {
    return userClaims.find(claim => claim.airdrop_id === airdropId)
  }

  const value = {
    airdrops,
    userClaims,
    loading,
    stats,
    fetchAirdrops,
    fetchUserClaims,
    fetchStats,
    claimAirdrop,
    createAirdrop,
    updateAirdrop,
    getAirdropById,
    getUserClaimForAirdrop
  }

  return (
    <AirdropContext.Provider value={value}>
      {children}
    </AirdropContext.Provider>
  )
}