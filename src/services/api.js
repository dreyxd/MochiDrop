import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mochidrop_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mochidrop_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  verifyToken: async (token) => {
    const response = await api.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData)
    return response.data
  }
}

// Wallet API
export const walletAPI = {
  connectWallet: async (address) => {
    const response = await api.post('/wallet/connect', { address })
    return response.data
  },

  disconnectWallet: async () => {
    const response = await api.post('/wallet/disconnect')
    return response.data
  },

  getBalance: async (address) => {
    const response = await api.get(`/wallet/balance/${address}`)
    return response.data
  },

  getTokenBalances: async (address) => {
    const response = await api.get(`/wallet/tokens/${address}`)
    return response.data
  }
}

// Airdrop API
export const airdropAPI = {
  getActiveAirdrops: async () => {
    const response = await api.get('/airdrops/active')
    return response.data
  },

  getAirdrop: async (id) => {
    const response = await api.get(`/airdrops/${id}`)
    return response.data
  },

  claimAirdrop: async (airdropId) => {
    const response = await api.post(`/airdrops/${airdropId}/claim`)
    return response.data
  },

  getUserClaims: async () => {
    const response = await api.get('/claims/user')
    return response.data
  },

  getStats: async () => {
    const response = await api.get('/stats')
    return response.data
  },

  // Admin endpoints
  createAirdrop: async (airdropData) => {
    const response = await api.post('/admin/airdrops', airdropData)
    return response.data
  },

  updateAirdrop: async (id, updateData) => {
    const response = await api.put(`/admin/airdrops/${id}`, updateData)
    return response.data
  },

  getAdminStats: async () => {
    const response = await api.get('/admin/stats')
    return response.data
  },

  getUsers: async () => {
    const response = await api.get('/admin/users')
    return response.data
  }
}

export default api