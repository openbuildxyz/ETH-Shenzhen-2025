import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  Brain,
  Shield,
  Zap,
  Globe,
  Lock,
  TrendingUp,
  Users,
  Layers,
  Clock,
  BarChart3,
  Cpu,
  Smartphone
} from 'lucide-react'

const Features: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

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

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Optimization",
      description: "Advanced machine learning algorithms continuously optimize yield strategies across multiple DeFi platforms.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Multi-Asset Collateral",
      description: "Diversify risk with support for LSTs, RWAs, and traditional crypto assets as collateral.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "Instant Liquidity",
      description: "Mint and redeem KUSD instantly with minimal slippage and competitive fees.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Globe,
      title: "Multi-Chain Support",
      description: "Deploy on Ethereum, Arbitrum, Optimism, and other leading blockchain networks.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Lock,
      title: "Security First",
      description: "Built with OpenZeppelin contracts, comprehensive audits, and battle-tested security practices.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: TrendingUp,
      title: "Competitive Yields",
      description: "Earn industry-leading yields through automated DeFi strategies and platform incentives.",
      color: "from-yellow-500 to-orange-500"
    }
  ]

  const stats = [
    {
      icon: Users,
      value: "12,847",
      label: "Active Users",
      color: "text-blue-400"
    },
    {
      icon: BarChart3,
      value: "$2.5M",
      label: "Total Value Locked",
      color: "text-green-400"
    },
    {
      icon: Clock,
      value: "99.7%",
      label: "Uptime",
      color: "text-purple-400"
    },
    {
      icon: Layers,
      value: "8",
      label: "Supported Assets",
      color: "text-orange-400"
    }
  ]

  return (
    <section id="features" className="features section">
      <div className="container">
        <motion.div
          ref={ref}
          className="features-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">
            Why Choose <span className="text-gradient">KUSD</span>
          </h2>
          <p className="section-description">
            Experience the next generation of stablecoin technology with advanced features 
            designed for maximum efficiency and security.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="feature-card glow-intense"
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
            >
              <div className={`feature-icon-wrapper bg-gradient-to-br ${feature.color}`}>
                <feature.icon size={32} className="feature-icon" />
              </div>
              
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              
              <div className="feature-overlay"></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="stats-section"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="stat-card glow"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              >
                <div className="stat-icon-wrapper">
                  <stat.icon size={24} className={stat.color} />
                </div>
                <div className="stat-content">
                  <div className="stat-value text-gradient">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technology Showcase */}
        <motion.div
          className="tech-showcase"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <div className="tech-grid">
            <motion.div
              className="tech-card glow"
              whileHover={{ scale: 1.02 }}
            >
              <div className="tech-header">
                <Cpu size={32} className="text-blue-400" />
                <h4>Advanced Architecture</h4>
              </div>
              <p>Modular smart contract design with upgradeable proxies and role-based access control.</p>
              <div className="tech-tags">
                <span className="tech-tag">Solidity 0.8.24</span>
                <span className="tech-tag">OpenZeppelin</span>
                <span className="tech-tag">UUPS Proxy</span>
              </div>
            </motion.div>

            <motion.div
              className="tech-card glow"
              whileHover={{ scale: 1.02 }}
            >
              <div className="tech-header">
                <Smartphone size={32} className="text-green-400" />
                <h4>User Experience</h4>
              </div>
              <p>Intuitive interface with real-time updates, mobile-first design, and seamless wallet integration.</p>
              <div className="tech-tags">
                <span className="tech-tag">React</span>
                <span className="tech-tag">TypeScript</span>
                <span className="tech-tag">Web3</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .features {
          background: linear-gradient(180deg, transparent 0%, rgba(26, 26, 46, 0.3) 100%);
        }

        .features-header {
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
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-bottom: 6rem;
        }

        .feature-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 24px;
          padding: 2.5rem;
          backdrop-filter: blur(20px);
          transition: all var(--transition-smooth);
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--accent-gradient);
          opacity: 0;
          transition: opacity var(--transition-smooth);
        }

        .feature-card:hover {
          background: var(--card-hover-bg);
          border-color: var(--card-hover-border);
          transform: translateY(-8px);
        }

        .feature-card:hover::before {
          opacity: 1;
        }

        .feature-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at center, rgba(79, 172, 254, 0.1) 0%, transparent 70%);
          opacity: 0;
          transition: opacity var(--transition-smooth);
          pointer-events: none;
        }

        .feature-card:hover .feature-overlay {
          opacity: 1;
        }

        .feature-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          position: relative;
        }

        .feature-icon {
          color: white;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }

        .feature-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .feature-description {
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 1rem;
        }

        .stats-section {
          margin-bottom: 6rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .stat-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 2rem;
          backdrop-filter: blur(20px);
          transition: all var(--transition-smooth);
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .stat-card:hover {
          background: var(--card-hover-bg);
          border-color: var(--card-hover-border);
          transform: translateY(-4px);
        }

        .stat-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: 16px;
          background: rgba(79, 172, 254, 0.1);
          border: 1px solid rgba(79, 172, 254, 0.2);
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .tech-showcase {
          margin-top: 4rem;
        }

        .tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .tech-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 2.5rem;
          backdrop-filter: blur(20px);
          transition: all var(--transition-smooth);
        }

        .tech-card:hover {
          background: var(--card-hover-bg);
          border-color: var(--card-hover-border);
          transform: translateY(-4px);
        }

        .tech-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .tech-header h4 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .tech-card p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tech-tag {
          background: rgba(79, 172, 254, 0.1);
          border: 1px solid rgba(79, 172, 254, 0.2);
          color: var(--text-accent);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .section-title {
            font-size: 2.5rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            margin-bottom: 4rem;
          }

          .feature-card {
            padding: 2rem;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }

          .stat-card {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .tech-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .tech-card {
            padding: 2rem;
          }
        }

        @media (max-width: 480px) {
          .features-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  )
}

export default Features