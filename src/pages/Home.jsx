import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Zap, Users, BarChart3, Coins, Rocket } from 'lucide-react'
import { motion } from 'framer-motion'

const Home = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Enterprise Security',
      description: 'Bank-grade security with encrypted wallet management and comprehensive audit logging.',
      features: ['AES-256 encryption', 'Multi-signature support', 'Audit trails', 'Rate limiting']
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'Optimized for speed with automated distribution and real-time transaction processing.',
      features: ['Instant claims', 'Batch processing', 'Real-time updates', 'Auto-scaling']
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Multi-Tenant Platform',
      description: 'Support multiple projects with isolated data, custom branding, and flexible configurations.',
      features: ['Project isolation', 'Custom branding', 'Role management', 'API access']
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Advanced Analytics',
      description: 'Comprehensive analytics dashboard with real-time metrics and user insights.',
      features: ['Real-time metrics', 'User analytics', 'Campaign tracking', 'Export capabilities']
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: 'Solana Native',
      description: 'Built specifically for Solana with SPL token support and optimized transaction handling.',
      features: ['SPL tokens', 'Low fees', 'Fast finality', 'Native integration']
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: 'Easy Deployment',
      description: 'Deploy in minutes with Docker support and comprehensive documentation.',
      features: ['Docker ready', 'One-click deploy', 'Auto-updates', 'Cloud & self-hosted']
    }
  ]

  const stats = [
    { label: 'Airdrops Created', value: '10,000+' },
    { label: 'Tokens Distributed', value: '50M+' },
    { label: 'Active Users', value: '25,000+' },
    { label: 'Success Rate', value: '99.9%' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 text-6xl opacity-10 floating-animation">🍡</div>
          <div className="absolute top-40 left-10 text-4xl opacity-10 coin-animation" style={{ animationDelay: '2s' }}>💰</div>
          <div className="absolute bottom-40 right-20 text-4xl opacity-10 coin-animation" style={{ animationDelay: '4s' }}>🪙</div>
          <div className="absolute bottom-20 left-20 text-4xl opacity-10 coin-animation" style={{ animationDelay: '6s' }}>💎</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Advanced Solana
                <span className="gradient-text block">Airdrop Platform</span>
                for Everyone
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                MochiDrop transforms airdrop management with enterprise-grade security, 
                automated distribution, and comprehensive analytics. Built for the Solana ecosystem.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-8">
                <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                  <Shield className="w-4 h-4 text-primary-400" />
                  <span className="text-sm font-medium">Secure & Encrypted</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                  <Zap className="w-4 h-4 text-primary-400" />
                  <span className="text-sm font-medium">Lightning Fast</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                  <Users className="w-4 h-4 text-primary-400" />
                  <span className="text-sm font-medium">Multi-Tenant</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-primary inline-flex items-center justify-center">
                  <Rocket className="w-5 h-5 mr-2" />
                  Get Started Free
                </Link>
                <Link to="/demo" className="btn-secondary inline-flex items-center justify-center">
                  <i className="fas fa-play w-4 h-4 mr-2"></i>
                  View Demo
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="text-center"
                  >
                    <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-400">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl p-8 border border-white/10 backdrop-blur-sm">
                {/* Mock Interface */}
                <div className="bg-dark-800 rounded-lg border border-white/10 overflow-hidden">
                  <div className="bg-dark-700 px-4 py-3 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-400 ml-4">MochiDrop Dashboard</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Active Airdrops</h3>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <div className="font-medium text-white">DeFi Token Launch</div>
                          <div className="text-sm text-gray-400">100 DEFI per user</div>
                        </div>
                        <div className="text-green-400 font-medium">Active</div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <div className="font-medium text-white">Gaming Rewards</div>
                          <div className="text-sm text-gray-400">50 GAME per user</div>
                        </div>
                        <div className="text-green-400 font-medium">Active</div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <div className="font-medium text-white">NFT Holder Bonus</div>
                          <div className="text-sm text-gray-400">25 NFT per user</div>
                        </div>
                        <div className="text-yellow-400 font-medium">Pending</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 text-4xl floating-animation">🎁</div>
                <div className="absolute -bottom-4 -left-4 text-3xl coin-animation">⭐</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to run successful airdrop campaigns on Solana
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="card group hover:scale-105 transition-transform"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-300 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mr-3"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get your airdrop campaign running in minutes
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {[
                {
                  step: '01',
                  title: 'Create Your Project',
                  description: 'Register your project and configure token details, distribution rules, and campaign parameters.',
                  features: ['Project setup', 'Token configuration', 'Distribution rules']
                },
                {
                  step: '02',
                  title: 'Configure Airdrops',
                  description: 'Set up airdrop campaigns with custom requirements, eligibility criteria, and reward structures.',
                  features: ['Campaign setup', 'Requirements config', 'Reward distribution']
                },
                {
                  step: '03',
                  title: 'Launch Campaign',
                  description: 'Fund your distribution wallet and launch your airdrop campaign to start distributing tokens.',
                  features: ['Wallet funding', 'Campaign launch', 'Community sharing']
                },
                {
                  step: '04',
                  title: 'Monitor & Analyze',
                  description: 'Track campaign performance with real-time analytics and optimize your distribution strategy.',
                  features: ['Real-time tracking', 'Performance metrics', 'Strategy optimization']
                }
              ].map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  viewport={{ once: true }}
                  className="flex flex-col lg:flex-row items-center gap-8"
                >
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {step.step}
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="text-2xl font-semibold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-300 mb-4 leading-relaxed">
                      {step.description}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                      {step.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-sm text-gray-300"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500/10 to-secondary-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Launch Your Airdrop?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of projects using MochiDrop to distribute tokens and grow their communities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary inline-flex items-center justify-center">
                <Rocket className="w-5 h-5 mr-2" />
                Start Building Today
              </Link>
              <Link to="/docs" className="btn-secondary inline-flex items-center justify-center">
                <i className="fas fa-book w-4 h-4 mr-2"></i>
                View Documentation
              </Link>
            </div>
            
            <p className="text-sm text-gray-400 mt-6">
              Free tier available • No credit card required • Deploy in minutes
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home