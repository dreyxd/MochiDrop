import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Zap, Users, BarChart3, Coins, Rocket, Heart, Star } from 'lucide-react'

const About = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Enterprise Security',
      description: 'Bank-grade security with AES-256 encryption, multi-signature support, and comprehensive audit logging.'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'Optimized for speed with automated distribution, batch processing, and real-time transaction handling.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Multi-Tenant',
      description: 'Support multiple projects with isolated data, custom branding, and flexible role-based access control.'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Advanced Analytics',
      description: 'Comprehensive dashboard with real-time metrics, user insights, and campaign performance tracking.'
    }
  ]

  const team = [
    {
      name: 'Alex Chen',
      role: 'Lead Developer',
      avatar: '👨‍💻',
      description: 'Blockchain enthusiast with 5+ years in DeFi and Solana development.'
    },
    {
      name: 'Sarah Kim',
      role: 'Security Engineer',
      avatar: '👩‍🔒',
      description: 'Cybersecurity expert specializing in wallet security and encryption.'
    },
    {
      name: 'Mike Johnson',
      role: 'Product Manager',
      avatar: '👨‍💼',
      description: 'Product strategist with deep understanding of crypto user experience.'
    },
    {
      name: 'Lisa Wang',
      role: 'Community Manager',
      avatar: '👩‍🎨',
      description: 'Community builder passionate about growing Web3 ecosystems.'
    }
  ]

  const stats = [
    { label: 'Projects Launched', value: '500+' },
    { label: 'Tokens Distributed', value: '50M+' },
    { label: 'Active Communities', value: '1,000+' },
    { label: 'Success Rate', value: '99.9%' }
  ]

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="text-6xl mb-6 floating-animation">🍡</div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            About <span className="gradient-text">MochiDrop</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            MochiDrop is a comprehensive Solana-based airdrop management platform that empowers 
            developers and organizations to create, manage, and distribute token airdrops with 
            enterprise-grade security and scalability.
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                We believe that token distribution should be simple, secure, and accessible to everyone. 
                MochiDrop was born from the need to democratize airdrop management and make it easy 
                for projects of all sizes to engage with their communities.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Our platform combines the power of Solana's fast and low-cost blockchain with 
                intuitive user interfaces and enterprise-grade security to create the ultimate 
                airdrop management solution.
              </p>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl p-8 border border-white/10">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.1 * index }}
                      viewport={{ once: true }}
                      className="text-center"
                    >
                      <div className="text-2xl lg:text-3xl font-bold text-white mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-400">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose MochiDrop?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built with the latest technologies and best practices for the Solana ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Passionate developers and designers building the future of token distribution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="card text-center group hover:scale-105 transition-transform"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                  {member.avatar}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-1">
                  {member.name}
                </h3>
                
                <div className="text-primary-400 font-medium mb-3">
                  {member.role}
                </div>
                
                <p className="text-gray-400 text-sm leading-relaxed">
                  {member.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technology Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Built with Modern Technology</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Leveraging the best tools and frameworks for performance, security, and scalability
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'React', icon: '⚛️' },
              { name: 'Solana', icon: '🟣' },
              { name: 'PostgreSQL', icon: '🐘' },
              { name: 'Docker', icon: '🐳' },
              { name: 'Python', icon: '🐍' },
              { name: 'Node.js', icon: '🟢' }
            ].map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="card text-center group hover:scale-110 transition-transform"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {tech.icon}
                </div>
                <div className="text-sm font-medium text-white">
                  {tech.name}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Community Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="card max-w-4xl mx-auto">
            <div className="text-4xl mb-6">
              <Heart className="w-16 h-16 text-red-400 mx-auto" />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              Built for the Community
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              MochiDrop is open-source and community-driven. We believe in transparency, 
              collaboration, and building tools that benefit the entire Solana ecosystem.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/dreyxd/MochiDrop"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center justify-center"
              >
                <i className="fab fa-github w-5 h-5 mr-2"></i>
                View on GitHub
              </a>
              <a
                href="https://discord.gg/mochidrop"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center justify-center"
              >
                <i className="fab fa-discord w-5 h-5 mr-2"></i>
                Join Community
              </a>
            </div>
            
            <div className="flex items-center justify-center space-x-6 mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center space-x-2 text-gray-400">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">Open Source</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm">MIT License</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Community Driven</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default About