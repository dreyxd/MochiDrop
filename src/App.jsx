import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { WalletProvider } from './contexts/WalletContext'
import { AuthProvider } from './contexts/AuthContext'
import { AirdropProvider } from './contexts/AirdropContext'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Pages
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Airdrops from './pages/Airdrops'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import About from './pages/About'
import Documentation from './pages/Documentation'

function App() {
  return (
    <Router>
      <AuthProvider>
        <WalletProvider>
          <AirdropProvider>
            <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
              <Navbar />
              
              <main className="pt-16">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/airdrops" element={<Airdrops />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/docs" element={<Documentation />} />
                </Routes>
              </main>
              
              <Footer />
              
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'rgba(15, 23, 42, 0.95)',
                    color: '#f1f5f9',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                  },
                }}
              />
            </div>
          </AirdropProvider>
        </WalletProvider>
      </AuthProvider>
    </Router>
  )
}

export default App