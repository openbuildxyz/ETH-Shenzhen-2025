import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  Wallet,
  TrendingUp,
  PieChart,
  Zap,
  DollarSign,
  BarChart3,
  Activity,
  CreditCard,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

const Dashboard: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const [activeTab, setActiveTab] = useState<'mint' | 'redeem'>('mint')
  const [mintAmount, setMintAmount] = useState('')
  const [collateralAmount, setCollateralAmount] = useState('')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <section id="dashboard" className="dashboard section">
      <div className="container">
        <motion.div
          ref={ref}
          className="dashboard-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">
            KUSD <span className="text-gradient">Dashboard</span>
          </h2>
          <p className="section-description">
            Monitor your positions, manage collateral, and optimize yields in real-time
          </p>
        </motion.div>

        <motion.div
          className="dashboard-grid"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* Portfolio Overview */}
          <motion.div variants={cardVariants} className="dashboard-card portfolio-card glow">
            <div className="card-header">
              <div className="card-title">
                <PieChart size={24} />
                <h3>Portfolio Overview</h3>
              </div>
              <motion.button
                className="refresh-btn"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
              >
                <RefreshCw size={16} />
              </motion.button>
            </div>

            <div className="portfolio-stats">
              <div className="stat-large">
                <div className="stat-value">$12,847.32</div>
                <div className="stat-label">Total Portfolio Value</div>
                <div className="stat-change positive">
                  <ArrowUpRight size={16} />
                  +5.24%
                </div>
              </div>

              <div className="portfolio-breakdown">
                <div className="breakdown-item">
                  <div className="breakdown-color bg-gradient-1"></div>
                  <span>KUSD Balance</span>
                  <span className="breakdown-value">$8,420.50</span>
                </div>
                <div className="breakdown-item">
                  <div className="breakdown-color bg-gradient-2"></div>
                  <span>Collateral</span>
                  <span className="breakdown-value">$4,426.82</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={cardVariants} className="dashboard-card stats-grid">
            <div className="quick-stat glow">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">15.8%</div>
                <div className="stat-label">Current APY</div>
              </div>
            </div>

            <div className="quick-stat glow">
              <div className="stat-icon">
                <Activity size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">142%</div>
                <div className="stat-label">Collateral Ratio</div>
              </div>
            </div>

            <div className="quick-stat glow">
              <div className="stat-icon">
                <DollarSign size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">$2.5M</div>
                <div className="stat-label">TVL</div>
              </div>
            </div>

            <div className="quick-stat glow">
              <div className="stat-icon">
                <BarChart3 size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">$184.2K</div>
                <div className="stat-label">Daily Volume</div>
              </div>
            </div>
          </motion.div>

          {/* Mint/Redeem Interface */}
          <motion.div variants={cardVariants} className="dashboard-card mint-redeem-card glow">
            <div className="card-header">
              <div className="tab-selector">
                <button
                  className={`tab-btn ${activeTab === 'mint' ? 'active' : ''}`}
                  onClick={() => setActiveTab('mint')}
                >
                  <Zap size={16} />
                  Mint KUSD
                </button>
                <button
                  className={`tab-btn ${activeTab === 'redeem' ? 'active' : ''}`}
                  onClick={() => setActiveTab('redeem')}
                >
                  <CreditCard size={16} />
                  Redeem
                </button>
              </div>
            </div>

            <div className="mint-redeem-content">
              {activeTab === 'mint' ? (
                <div className="mint-form">
                  <div className="input-group">
                    <label>Collateral Amount</label>
                    <div className="input-wrapper">
                      <input
                        type="number"
                        placeholder="0.0"
                        value={collateralAmount}
                        onChange={(e) => setCollateralAmount(e.target.value)}
                        className="amount-input"
                      />
                      <select className="token-select">
                        <option>ETH</option>
                        <option>stETH</option>
                        <option>wstETH</option>
                        <option>rETH</option>
                      </select>
                    </div>
                  </div>

                  <div className="conversion-arrow">
                    <ArrowDownRight size={20} />
                  </div>

                  <div className="input-group">
                    <label>KUSD to Mint</label>
                    <div className="input-wrapper">
                      <input
                        type="number"
                        placeholder="0.0"
                        value={mintAmount}
                        onChange={(e) => setMintAmount(e.target.value)}
                        className="amount-input"
                      />
                      <span className="token-label">KUSD</span>
                    </div>
                  </div>

                  <div className="transaction-info">
                    <div className="info-row">
                      <span>Collateral Ratio</span>
                      <span className="text-accent">150%</span>
                    </div>
                    <div className="info-row">
                      <span>Liquidation Price</span>
                      <span>$1,834.22</span>
                    </div>
                    <div className="info-row">
                      <span>Est. Gas Fee</span>
                      <span>~$8.45</span>
                    </div>
                  </div>

                  <motion.button
                    className="action-btn primary glow-intense"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Mint KUSD
                  </motion.button>
                </div>
              ) : (
                <div className="redeem-form">
                  <div className="input-group">
                    <label>KUSD Amount</label>
                    <div className="input-wrapper">
                      <input
                        type="number"
                        placeholder="0.0"
                        value={mintAmount}
                        onChange={(e) => setMintAmount(e.target.value)}
                        className="amount-input"
                      />
                      <span className="token-label">KUSD</span>
                    </div>
                  </div>

                  <div className="conversion-arrow">
                    <ArrowDownRight size={20} />
                  </div>

                  <div className="input-group">
                    <label>Collateral to Receive</label>
                    <div className="input-wrapper">
                      <input
                        type="number"
                        placeholder="0.0"
                        value={collateralAmount}
                        onChange={(e) => setCollateralAmount(e.target.value)}
                        className="amount-input"
                      />
                      <select className="token-select">
                        <option>ETH</option>
                        <option>stETH</option>
                        <option>wstETH</option>
                        <option>rETH</option>
                      </select>
                    </div>
                  </div>

                  <motion.button
                    className="action-btn secondary glow"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Redeem Collateral
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div variants={cardVariants} className="dashboard-card transactions-card glow">
            <div className="card-header">
              <div className="card-title">
                <Activity size={24} />
                <h3>Recent Transactions</h3>
              </div>
              <button className="view-all-btn">View All</button>
            </div>

            <div className="transactions-list">
              <div className="transaction-item">
                <div className="transaction-icon mint">
                  <Zap size={16} />
                </div>
                <div className="transaction-details">
                  <div className="transaction-type">Mint KUSD</div>
                  <div className="transaction-time">2 hours ago</div>
                </div>
                <div className="transaction-amount">
                  <div className="amount positive">+1,250 KUSD</div>
                  <div className="usd-value">$1,250.00</div>
                </div>
              </div>

              <div className="transaction-item">
                <div className="transaction-icon deposit">
                  <ArrowDownRight size={16} />
                </div>
                <div className="transaction-details">
                  <div className="transaction-type">Deposit Collateral</div>
                  <div className="transaction-time">5 hours ago</div>
                </div>
                <div className="transaction-amount">
                  <div className="amount">0.75 ETH</div>
                  <div className="usd-value">$1,875.00</div>
                </div>
              </div>

              <div className="transaction-item">
                <div className="transaction-icon redeem">
                  <CreditCard size={16} />
                </div>
                <div className="transaction-details">
                  <div className="transaction-type">Redeem KUSD</div>
                  <div className="transaction-time">1 day ago</div>
                </div>
                <div className="transaction-amount">
                  <div className="amount negative">-500 KUSD</div>
                  <div className="usd-value">$500.00</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style jsx>{`
        .dashboard {
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .section-description {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .dashboard-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 24px;
          padding: 2rem;
          backdrop-filter: blur(20px);
          transition: all var(--transition-smooth);
          position: relative;
          overflow: hidden;
        }

        .dashboard-card::before {
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

        .dashboard-card:hover {
          background: var(--card-hover-bg);
          border-color: var(--card-hover-border);
          transform: translateY(-4px);
        }

        .dashboard-card:hover::before {
          opacity: 1;
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-primary);
          font-weight: 700;
          font-size: 1.25rem;
        }

        .refresh-btn,
        .view-all-btn {
          background: none;
          border: none;
          color: var(--text-accent);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all var(--transition-fast);
        }

        .refresh-btn:hover,
        .view-all-btn:hover {
          background: rgba(79, 172, 254, 0.1);
        }

        .portfolio-card {
          grid-column: 1 / -1;
        }

        .portfolio-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: center;
        }

        .stat-large .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .stat-large .stat-label {
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }

        .stat-change {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .stat-change.positive {
          color: var(--success);
        }

        .stat-change.negative {
          color: var(--danger);
        }

        .portfolio-breakdown {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .breakdown-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(79, 172, 254, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(79, 172, 254, 0.1);
        }

        .breakdown-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .bg-gradient-1 {
          background: var(--accent-primary);
        }

        .bg-gradient-2 {
          background: var(--accent-secondary);
        }

        .breakdown-value {
          margin-left: auto;
          font-weight: 600;
          color: var(--text-primary);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          padding: 1rem;
        }

        .quick-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          transition: all var(--transition-smooth);
        }

        .quick-stat:hover {
          background: var(--card-hover-bg);
          border-color: var(--card-hover-border);
          transform: scale(1.02);
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--accent-gradient);
          color: white;
        }

        .stat-content {
          text-align: center;
        }

        .quick-stat .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .quick-stat .stat-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .mint-redeem-card {
          grid-column: 1 / -1;
        }

        .tab-selector {
          display: flex;
          background: rgba(79, 172, 254, 0.1);
          border-radius: 12px;
          padding: 0.25rem;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: var(--text-secondary);
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all var(--transition-fast);
          font-weight: 600;
        }

        .tab-btn.active {
          background: var(--accent-gradient);
          color: white;
        }

        .mint-redeem-content {
          padding: 1rem 0;
        }

        .input-group {
          margin-bottom: 1.5rem;
        }

        .input-group label {
          display: block;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          background: rgba(79, 172, 254, 0.05);
          border: 1px solid var(--card-border);
          border-radius: 12px;
          padding: 1rem;
          transition: border-color var(--transition-fast);
        }

        .input-wrapper:focus-within {
          border-color: var(--accent-primary);
        }

        .amount-input {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 1.5rem;
          font-weight: 600;
          outline: none;
        }

        .amount-input::placeholder {
          color: var(--text-muted);
        }

        .token-select {
          background: var(--accent-gradient);
          border: none;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .token-label {
          color: var(--text-accent);
          font-weight: 600;
          padding: 0.5rem 1rem;
          background: rgba(79, 172, 254, 0.1);
          border-radius: 8px;
        }

        .conversion-arrow {
          display: flex;
          justify-content: center;
          margin: 1rem 0;
          color: var(--text-accent);
        }

        .transaction-info {
          background: rgba(79, 172, 254, 0.05);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
        }

        .info-row:last-child {
          margin-bottom: 0;
        }

        .action-btn {
          width: 100%;
          border: none;
          padding: 1rem 2rem;
          border-radius: 16px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-smooth);
        }

        .action-btn.primary {
          background: var(--accent-gradient);
          color: white;
        }

        .action-btn.secondary {
          background: transparent;
          border: 2px solid var(--accent-primary);
          color: var(--accent-primary);
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(79, 172, 254, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(79, 172, 254, 0.1);
          transition: all var(--transition-fast);
        }

        .transaction-item:hover {
          background: rgba(79, 172, 254, 0.1);
          border-color: rgba(79, 172, 254, 0.2);
        }

        .transaction-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          color: white;
        }

        .transaction-icon.mint {
          background: var(--success);
        }

        .transaction-icon.deposit {
          background: var(--accent-primary);
        }

        .transaction-icon.redeem {
          background: var(--warning);
        }

        .transaction-details {
          flex: 1;
        }

        .transaction-type {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .transaction-time {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .transaction-amount {
          text-align: right;
        }

        .amount {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .amount.positive {
          color: var(--success);
        }

        .amount.negative {
          color: var(--danger);
        }

        .usd-value {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .section-title {
            font-size: 2.5rem;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .portfolio-stats {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .tab-selector {
            flex-direction: column;
          }

          .tab-btn {
            justify-content: center;
          }
        }
      `}</style>
    </section>
  )
}

export default Dashboard