import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    Product: [
      { name: 'Features', href: '/#features' },
      { name: 'Pricing', href: '/#pricing' },
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/docs/api' },
    ],
    Resources: [
      { name: 'Installation Guide', href: '/docs/installation' },
      { name: 'User Guide', href: '/docs/user-guide' },
      { name: 'Admin Guide', href: '/docs/admin-guide' },
      { name: 'Troubleshooting', href: '/docs/troubleshooting' },
    ],
    Community: [
      { name: 'GitHub', href: 'https://github.com/dreyxd/MochiDrop' },
      { name: 'Discord', href: 'https://discord.gg/mochidrop' },
      { name: 'Telegram', href: 'https://t.me/mochidrop_community' },
      { name: 'Twitter', href: 'https://twitter.com/mochidrop' },
    ],
    Company: [
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  }

  return (
    <footer className="bg-dark-950 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">🍡</span>
              <span className="text-xl font-bold gradient-text">MochiDrop</span>
            </Link>
            
            <p className="text-gray-400 mb-6 max-w-md">
              Advanced Solana airdrop management platform for developers and organizations. 
              Built with security, scalability, and ease of use in mind.
            </p>
            
            <div className="flex space-x-4">
              <a
                href="https://github.com/dreyxd/MochiDrop"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <i className="fab fa-github"></i>
              </a>
              <a
                href="https://discord.gg/mochidrop"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <i className="fab fa-discord"></i>
              </a>
              <a
                href="https://t.me/mochidrop_community"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <i className="fab fa-telegram"></i>
              </a>
              <a
                href="https://twitter.com/mochidrop"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith('http') ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm">
            © {currentYear} MochiDrop. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms
            </Link>
            <Link to="/security" className="text-gray-400 hover:text-white text-sm transition-colors">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer