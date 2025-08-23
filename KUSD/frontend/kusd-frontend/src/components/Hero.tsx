import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react'

const Hero: React.FC = () => {
  const scrollToDashboard = () => {
    const dashboard = document.getElementById('dashboard')
    if (dashboard) {
      dashboard.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="hero" className="hero section">
      <div className="container">
        <div className="hero-content">
          {/* Main Content */}
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Next-Gen <span className="text-gradient">Multi-Asset</span>
              <br />
              Stablecoin
            </motion.h1>

            <motion.p
              className="hero-description"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Mint KUSD stablecoins backed by liquid staking tokens, real-world assets, 
              and traditional crypto with AI-powered yield optimization strategies.
            </motion.p>

            <motion.div
              className="hero-buttons"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.button
                className="btn-primary glow-intense"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToDashboard}
              >
                Launch App
                <ArrowRight size={20} />
              </motion.button>

              <motion.button
                className="btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="hero-stats"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <div className="stat-item">
                <div className="stat-value text-gradient">$2.5M</div>
                <div className="stat-label">Total Value Locked</div>
              </div>
              <div className="stat-item">
                <div className="stat-value text-gradient">15.8%</div>
                <div className="stat-label">Average APY</div>
              </div>
              <div className="stat-item">
                <div className="stat-value text-gradient">99.7%</div>
                <div className="stat-label">Uptime</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            className="hero-features"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              className="feature-card glow animate-float"
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <div className="feature-icon">
                <TrendingUp size={32} />
              </div>
              <h3>AI-Powered Yields</h3>
              <p>Automated strategies optimize your returns across DeFi platforms</p>
            </motion.div>

            <motion.div
              className="feature-card glow animate-float"
              whileHover={{ scale: 1.05, rotateY: 5 }}
              style={{ animationDelay: '2s' }}
            >
              <div className="feature-icon">
                <Shield size={32} />
              </div>
              <h3>Multi-Asset Collateral</h3>
              <p>Diversify risk with LSTs, RWAs, and traditional crypto assets</p>
            </motion.div>

            <motion.div
              className="feature-card glow animate-float"
              whileHover={{ scale: 1.05, rotateY: 5 }}
              style={{ animationDelay: '4s' }}
            >
              <div className="feature-icon">
                <Zap size={32} />
              </div>
              <h3>Instant Liquidity</h3>
              <p>Mint and redeem KUSD instantly with minimal slippage</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          position: relative;
          padding-top: 6rem;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .hero-text {
          max-width: 600px;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .hero-description {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--accent-gradient);
          border: none;
          color: white;
          padding: 1rem 2rem;
          border-radius: 16px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-smooth);
        }

        .btn-secondary {
          background: transparent;
          border: 2px solid var(--card-border);
          color: var(--text-primary);
          padding: 1rem 2rem;
          border-radius: 16px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-smooth);
          backdrop-filter: blur(10px);
        }

        .btn-secondary:hover {
          border-color: var(--accent-primary);
          background: rgba(79, 172, 254, 0.1);
          box-shadow: var(--glow-primary);
        }

        .hero-stats {
          display: flex;
          gap: 3rem;
        }

        .stat-item {
          text-align: left;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: var(--text-muted);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .hero-features {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .feature-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 2rem;
          backdrop-filter: blur(20px);
          transition: all var(--transition-smooth);
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--accent-gradient);
          opacity: 0;
          transition: opacity var(--transition-smooth);
        }

        .feature-card:hover {
          background: var(--card-hover-bg);
          border-color: var(--card-hover-border);
          transform: translateY(-4px);
        }

        .feature-card:hover::before {
          opacity: 1;
        }

        .feature-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: 16px;
          background: var(--accent-gradient);
          margin-bottom: 1.5rem;
          color: white;
        }

        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }

        .feature-card p {
          color: var(--text-secondary);
          line-height: 1.5;
        }

        @media (max-width: 1024px) {
          .hero-content {
            grid-template-columns: 1fr;
            gap: 3rem;
          }

          .hero-title {
            font-size: 3rem;
          }

          .hero-features {
            flex-direction: row;
            overflow-x: auto;
            gap: 1rem;
            padding-bottom: 1rem;
          }

          .feature-card {
            flex-shrink: 0;
            width: 280px;
          }
        }

        @media (max-width: 768px) {
          .hero {
            padding-top: 5rem;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-description {
            font-size: 1.1rem;
          }

          .hero-buttons {
            flex-direction: column;
            gap: 1rem;
          }

          .btn-primary,
          .btn-secondary {
            width: 100%;
            justify-content: center;
          }

          .hero-stats {
            gap: 1.5rem;
            justify-content: space-between;
          }

          .stat-value {
            font-size: 1.5rem;
          }

          .hero-features {
            flex-direction: column;
          }

          .feature-card {
            width: 100%;
          }
        }
      `}</style>
    </section>
  )
}

export default Hero