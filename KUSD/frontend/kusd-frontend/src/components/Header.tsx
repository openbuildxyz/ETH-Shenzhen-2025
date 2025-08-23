import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Menu, X, Wallet, ChevronDown } from 'lucide-react'
import { useWeb3 } from '../context/Web3Context'

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showWalletDropdown, setShowWalletDropdown] = useState(false)
  const { isConnected, account, balance, connectWallet, disconnectWallet, isConnecting, chainId, clearPendingRequests } = useWeb3()

  // Debug logs
  React.useEffect(() => {
    console.log('Header - Wallet State:', {
      isConnected,
      isConnecting,
      account,
      balance,
      chainId
    })
  }, [isConnected, isConnecting, account, balance, chainId])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <motion.header
      className={`header ${isScrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <motion.div
            className="logo"
            whileHover={{ scale: 1.05 }}
            onClick={() => scrollToSection('hero')}
          >
            <span className="logo-text text-gradient">KUSD</span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            <ul className="nav-list">
              <li><button onClick={() => scrollToSection('hero')} className="nav-link">Home</button></li>
              <li><button onClick={() => scrollToSection('dashboard')} className="nav-link">Dashboard</button></li>
              <li><button onClick={() => scrollToSection('features')} className="nav-link">Features</button></li>
              <li><button onClick={() => scrollToSection('contact')} className="nav-link">Contact</button></li>
            </ul>
          </nav>

          {/* Connect Wallet Button */}
          {!isConnected ? (
            <motion.button
              className="connect-wallet-btn glow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={connectWallet}
              disabled={isConnecting}
            >
              <Wallet size={20} />
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </motion.button>
          ) : (
            <div className="wallet-connected">
              <motion.button
                className="wallet-info-btn glow"
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
              >
                <div className="wallet-info">
                  <span className="wallet-balance">{balance} ETH</span>
                  <span className="wallet-address">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                </div>
                <ChevronDown size={16} />
              </motion.button>

              {showWalletDropdown && (
                <motion.div
                  className="wallet-dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="dropdown-item">
                    <span>Network:</span>
                    <span className="network-name">
                      {chainId === 1 ? 'Mainnet' : 
                       chainId === 11155111 ? 'Sepolia' : 
                       chainId === 42161 ? 'Arbitrum' : 
                       chainId === 10 ? 'Optimism' : 'Unknown'}
                    </span>
                  </div>
                  <div className="dropdown-item">
                    <span>Balance:</span>
                    <span>{balance} ETH</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-btn disconnect-btn"
                    onClick={disconnectWallet}
                  >
                    Disconnect
                  </button>
                </motion.div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <motion.nav
          className={`nav-mobile ${isMobileMenuOpen ? 'open' : ''}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: isMobileMenuOpen ? 'auto' : 0,
            opacity: isMobileMenuOpen ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <ul className="nav-list-mobile">
            <li><button onClick={() => scrollToSection('hero')} className="nav-link-mobile">Home</button></li>
            <li><button onClick={() => scrollToSection('dashboard')} className="nav-link-mobile">Dashboard</button></li>
            <li><button onClick={() => scrollToSection('features')} className="nav-link-mobile">Features</button></li>
            <li><button onClick={() => scrollToSection('contact')} className="nav-link-mobile">Contact</button></li>
          </ul>
        </motion.nav>

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ 
            position: 'fixed', 
            top: '100px', 
            right: '10px', 
            background: 'rgba(0,0,0,0.9)', 
            color: 'white', 
            padding: '10px', 
            borderRadius: '4px', 
            fontSize: '12px',
            zIndex: 9999,
            fontFamily: 'monospace'
          }}>
            <div>isConnecting: {isConnecting.toString()}</div>
            <div>isConnected: {isConnected.toString()}</div>
            <div>account: {account || 'null'}</div>
            <div>balance: {balance}</div>
            <button 
              onClick={clearPendingRequests}
              style={{
                marginTop: '8px',
                padding: '4px 8px',
                backgroundColor: '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Clear Pending
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 1rem 0;
          transition: all var(--transition-smooth);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid transparent;
        }

        .header.scrolled {
          background: rgba(26, 26, 46, 0.95);
          border-bottom: 1px solid var(--card-border);
          box-shadow: var(--shadow-card);
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          display: flex;
          flex-direction: column;
          cursor: pointer;
          user-select: none;
        }

        .logo-text {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .logo-subtitle {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: -0.2rem;
        }

        .nav-desktop {
          display: none;
        }

        .nav-list {
          display: flex;
          list-style: none;
          gap: 2rem;
        }

        .nav-link {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          transition: color var(--transition-fast);
          position: relative;
        }

        .nav-link:hover {
          color: var(--text-accent);
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--accent-gradient);
          transition: width var(--transition-fast);
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .connect-wallet-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--accent-gradient);
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-smooth);
        }

        .connect-wallet-btn:hover {
          transform: translateY(-1px);
        }

        .connect-wallet-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .wallet-connected {
          position: relative;
        }

        .wallet-info-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          color: var(--text-primary);
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-smooth);
          backdrop-filter: blur(10px);
        }

        .wallet-info-btn:hover {
          background: var(--card-hover-bg);
          border-color: var(--card-hover-border);
        }

        .wallet-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.2rem;
        }

        .wallet-balance {
          font-size: 0.9rem;
          color: var(--text-accent);
        }

        .wallet-address {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .wallet-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          min-width: 200px;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 12px;
          padding: 1rem;
          backdrop-filter: blur(20px);
          box-shadow: var(--shadow-card);
          z-index: 1000;
        }

        .dropdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          font-size: 0.9rem;
        }

        .dropdown-item span:first-child {
          color: var(--text-secondary);
        }

        .dropdown-item span:last-child {
          color: var(--text-primary);
          font-weight: 500;
        }

        .network-name {
          color: var(--text-accent);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--card-border);
          margin: 0.75rem 0;
        }

        .dropdown-btn {
          width: 100%;
          background: none;
          border: 1px solid var(--card-border);
          color: var(--text-secondary);
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all var(--transition-fast);
          font-size: 0.9rem;
        }

        .disconnect-btn:hover {
          background: rgba(240, 65, 65, 0.1);
          border-color: var(--danger);
          color: var(--danger);
        }

        .mobile-menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          padding: 0.5rem;
        }

        .nav-mobile {
          overflow: hidden;
          background: var(--card-bg);
          border-radius: 12px;
          margin-top: 1rem;
          border: 1px solid var(--card-border);
        }

        .nav-mobile.open {
          box-shadow: var(--shadow-card);
        }

        .nav-list-mobile {
          list-style: none;
          padding: 1rem 0;
        }

        .nav-link-mobile {
          display: block;
          width: 100%;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          padding: 1rem 1.5rem;
          text-align: left;
          transition: all var(--transition-fast);
        }

        .nav-link-mobile:hover {
          color: var(--text-accent);
          background: rgba(79, 172, 254, 0.1);
        }

        @media (min-width: 768px) {
          .nav-desktop {
            display: block;
          }

          .mobile-menu-btn {
            display: none;
          }

          .nav-mobile {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .logo-text {
            font-size: 1.5rem;
          }

          .connect-wallet-btn span {
            display: none;
          }

          .connect-wallet-btn {
            padding: 0.75rem;
          }
        }
      `}</style>
    </motion.header>
  )
}

export default Header