import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Book, 
  Code, 
  Settings, 
  Shield, 
  Users, 
  Rocket,
  ExternalLink,
  Copy,
  Search
} from 'lucide-react'

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')

  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: <Book className="w-4 h-4" />,
      content: {
        title: 'MochiDrop Documentation',
        description: 'Complete guide for setting up and using MochiDrop',
        items: [
          'Quick start guide',
          'Installation instructions',
          'Configuration options',
          'API reference'
        ]
      }
    },
    {
      id: 'installation',
      title: 'Installation',
      icon: <Rocket className="w-4 h-4" />,
      content: {
        title: 'Installation Guide',
        description: 'Get MochiDrop running on your system',
        code: `# Clone the repository
git clone https://github.com/dreyxd/MochiDrop.git
cd MochiDrop

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start the application
npm run dev`
      }
    },
    {
      id: 'configuration',
      title: 'Configuration',
      icon: <Settings className="w-4 h-4" />,
      content: {
        title: 'Configuration Guide',
        description: 'Configure MochiDrop for your needs',
        items: [
          'Environment variables',
          'Database setup',
          'Solana network configuration',
          'Security settings'
        ]
      }
    },
    {
      id: 'api',
      title: 'API Reference',
      icon: <Code className="w-4 h-4" />,
      content: {
        title: 'API Reference',
        description: 'Complete API documentation for developers',
        items: [
          'Authentication endpoints',
          'Airdrop management',
          'User operations',
          'Webhook integration'
        ]
      }
    },
    {
      id: 'security',
      title: 'Security',
      icon: <Shield className="w-4 h-4" />,
      content: {
        title: 'Security Best Practices',
        description: 'Keep your airdrops secure',
        items: [
          'Wallet security',
          'Private key management',
          'Access control',
          'Audit logging'
        ]
      }
    },
    {
      id: 'user-guide',
      title: 'User Guide',
      icon: <Users className="w-4 h-4" />,
      content: {
        title: 'User Guide',
        description: 'How to use MochiDrop as an end user',
        items: [
          'Account registration',
          'Wallet connection',
          'Claiming airdrops',
          'Managing claims'
        ]
      }
    }
  ]

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard')
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24">
              <div className="card">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="text-2xl">📚</div>
                  <h2 className="text-lg font-semibold text-white">Documentation</h2>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search docs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10 w-full"
                  />
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {filteredSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-primary-500 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {section.icon}
                      <span className="text-sm font-medium">{section.title}</span>
                    </button>
                  ))}
                </nav>

                {/* Quick Links */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                    Quick Links
                  </h3>
                  <div className="space-y-2">
                    <a
                      href="https://github.com/dreyxd/MochiDrop"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      <i className="fab fa-github w-4 h-4"></i>
                      <span>GitHub Repository</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href="https://discord.gg/mochidrop"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      <i className="fab fa-discord w-4 h-4"></i>
                      <span>Discord Community</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-3"
          >
            <div className="card">
              {sections.map((section) => {
                if (section.id !== activeSection) return null

                return (
                  <div key={section.id}>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white">
                        {section.icon}
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-white">
                          {section.content.title}
                        </h1>
                        <p className="text-gray-400">
                          {section.content.description}
                        </p>
                      </div>
                    </div>

                    {/* Code Block */}
                    {section.content.code && (
                      <div className="relative mb-8">
                        <div className="bg-dark-900 border border-white/10 rounded-lg p-6 overflow-x-auto">
                          <button
                            onClick={() => copyCode(section.content.code)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Copy code"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <pre className="text-sm text-gray-300 font-mono">
                            <code>{section.content.code}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Content Items */}
                    {section.content.items && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white mb-4">
                          Key Topics
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {section.content.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                              <span className="text-gray-300">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Content Based on Section */}
                    {section.id === 'overview' && (
                      <div className="mt-8 space-y-6">
                        <div className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-white mb-3">
                            🚀 Getting Started
                          </h3>
                          <p className="text-gray-300 mb-4">
                            New to MochiDrop? Start with our quick setup guide to get your first airdrop running in minutes.
                          </p>
                          <button
                            onClick={() => setActiveSection('installation')}
                            className="btn-primary"
                          >
                            Start Installation
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
                            <h4 className="font-semibold text-white mb-3">For Developers</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                              <li>• REST API integration</li>
                              <li>• Webhook notifications</li>
                              <li>• Custom implementations</li>
                              <li>• Multi-tenant support</li>
                            </ul>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
                            <h4 className="font-semibold text-white mb-3">For Users</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                              <li>• Easy wallet connection</li>
                              <li>• One-click claims</li>
                              <li>• Claim history tracking</li>
                              <li>• Real-time notifications</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {section.id === 'api' && (
                      <div className="mt-8 space-y-6">
                        <div className="bg-dark-900 border border-white/10 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-white mb-4">
                            Authentication Example
                          </h3>
                          <div className="relative">
                            <button
                              onClick={() => copyCode(`curl -H "Authorization: Bearer YOUR_TOKEN" \\
     -H "Content-Type: application/json" \\
     https://api.mochidrop.com/v1/airdrops`)}
                              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <pre className="text-sm text-gray-300 font-mono overflow-x-auto">
                              <code>{`curl -H "Authorization: Bearer YOUR_TOKEN" \\
     -H "Content-Type: application/json" \\
     https://api.mochidrop.com/v1/airdrops`}</code>
                            </pre>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
                            <h4 className="font-semibold text-white mb-3">Base URL</h4>
                            <code className="text-primary-400 text-sm">https://api.mochidrop.com/v1</code>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
                            <h4 className="font-semibold text-white mb-3">Rate Limits</h4>
                            <div className="text-sm text-gray-300">
                              <div>Free: 100 req/hour</div>
                              <div>Pro: 10,000 req/hour</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="card text-center">
            <div className="text-4xl mb-6">🤝</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Need Help?
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our community and support team are here to help.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://discord.gg/mochidrop"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center justify-center"
              >
                <i className="fab fa-discord w-5 h-5 mr-2"></i>
                Join Discord
              </a>
              <a
                href="https://github.com/dreyxd/MochiDrop/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center justify-center"
              >
                <i className="fab fa-github w-5 h-5 mr-2"></i>
                Report Issue
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Documentation