import React from 'react'
import { motion } from 'framer-motion'
import {
  Github,
  Twitter,
  MessageCircle,
  Mail,
  ExternalLink,
  ArrowUp,
  Book,
  FileText,
  Shield,
  Zap
} from 'lucide-react'

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer id="contact" className="footer">
      <div className="container">
        {/* Main Footer Content */}
        <div className="footer-content">
          <div className="footer-grid">
            {/* Brand Section */}
            <motion.div
              className="footer-section brand-section"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="footer-logo">
                <span className="logo-text text-gradient">KUSD</span>
              </div>
              <p className="footer-description">
                Next-generation multi-asset stablecoin with AI-powered yield optimization. 
                Building the future of decentralized finance.
              </p>
              <div className="social-links">
                <motion.a
                  href="#"
                  className="social-link glow"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Twitter size={20} />
                </motion.a>
                <motion.a
                  href="#"
                  className="social-link glow"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Github size={20} />
                </motion.a>
                <motion.a
                  href="#"
                  className="social-link glow"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MessageCircle size={20} />
                </motion.a>
                <motion.a
                  href="#"
                  className="social-link glow"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Mail size={20} />
                </motion.a>
              </div>
            </motion.div>

            {/* KUSD Links */}
            <motion.div
              className="footer-section"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="footer-heading">KUSD</h4>
              <ul className="footer-links">
                <li>
                  <button onClick={() => scrollToSection('dashboard')} className="footer-link">
                    <Zap size={16} />
                    Launch App
                  </button>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    <Book size={16} />
                    Documentation
                    <ExternalLink size={14} />
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    <FileText size={16} />
                    Whitepaper
                    <ExternalLink size={14} />
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    <Shield size={16} />
                    Security Audits
                    <ExternalLink size={14} />
                  </a>
                </li>
              </ul>
            </motion.div>

            {/* Resources */}
            <motion.div
              className="footer-section"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="footer-heading">Resources</h4>
              <ul className="footer-links">
                <li>
                  <button onClick={() => scrollToSection('features')} className="footer-link">
                    Features
                  </button>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Blog
                    <ExternalLink size={14} />
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Community
                    <ExternalLink size={14} />
                  </a>
                </li>
              </ul>
            </motion.div>

            {/* Developers */}
            <motion.div
              className="footer-section"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h4 className="footer-heading">Developers</h4>
              <ul className="footer-links">
                <li>
                  <a href="#" className="footer-link">
                    API Documentation
                    <ExternalLink size={14} />
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Smart Contracts
                    <ExternalLink size={14} />
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Bug Bounty
                    <ExternalLink size={14} />
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Grant Program
                    <ExternalLink size={14} />
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Newsletter Signup */}
          <motion.div
            className="newsletter-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="newsletter-card glow">
              <div className="newsletter-content">
                <h3>Stay Updated</h3>
                <p>Get the latest updates on KUSD developments and DeFi insights.</p>
                <div className="newsletter-form">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="newsletter-input"
                  />
                  <motion.button
                    className="newsletter-btn glow-intense"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Subscribe
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-bottom-left">
              <p>&copy; 2024 KUSD. All rights reserved.</p>
              <div className="footer-legal">
                <a href="#" className="legal-link">Privacy Policy</a>
                <a href="#" className="legal-link">Terms of Service</a>
                <a href="#" className="legal-link">Risk Disclosure</a>
              </div>
            </div>
            
            <motion.button
              className="scroll-to-top glow"
              onClick={scrollToTop}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowUp size={20} />
            </motion.button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: linear-gradient(180deg, transparent 0%, rgba(10, 10, 10, 0.8) 50%, #0a0a0a 100%);
          border-top: 1px solid var(--card-border);
          position: relative;
          overflow: hidden;
        }

        .footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--accent-gradient);
          opacity: 0.5;
        }

        .footer-content {
          padding: 6rem 0 3rem;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 4rem;
        }

        .footer-section {
          display: flex;
          flex-direction: column;
        }

        .brand-section {
          max-width: 350px;
        }

        .footer-logo {
          display: flex;
          flex-direction: column;
          margin-bottom: 1.5rem;
        }

        .logo-text {
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .logo-subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
          margin-top: -0.3rem;
        }

        .footer-description {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          color: var(--text-secondary);
          text-decoration: none;
          transition: all var(--transition-smooth);
          backdrop-filter: blur(10px);
        }

        .social-link:hover {
          background: var(--card-hover-bg);
          border-color: var(--card-hover-border);
          color: var(--text-accent);
          transform: translateY(-2px);
        }

        .footer-heading {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          position: relative;
        }

        .footer-heading::after {
          content: '';
          position: absolute;
          bottom: -0.5rem;
          left: 0;
          width: 30px;
          height: 2px;
          background: var(--accent-gradient);
        }

        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .footer-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: color var(--transition-fast);
          padding: 0;
        }

        .footer-link:hover {
          color: var(--text-accent);
        }

        .newsletter-section {
          margin-top: 2rem;
        }

        .newsletter-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 2.5rem;
          backdrop-filter: blur(20px);
          position: relative;
          overflow: hidden;
        }

        .newsletter-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--accent-gradient);
        }

        .newsletter-content h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .newsletter-content p {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .newsletter-form {
          display: flex;
          gap: 1rem;
        }

        .newsletter-input {
          flex: 1;
          background: rgba(79, 172, 254, 0.05);
          border: 1px solid var(--card-border);
          border-radius: 12px;
          padding: 1rem 1.5rem;
          color: var(--text-primary);
          font-size: 1rem;
          outline: none;
          transition: border-color var(--transition-fast);
        }

        .newsletter-input:focus {
          border-color: var(--accent-primary);
        }

        .newsletter-input::placeholder {
          color: var(--text-muted);
        }

        .newsletter-btn {
          background: var(--accent-gradient);
          border: none;
          color: white;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-smooth);
          white-space: nowrap;
        }

        .newsletter-btn:hover {
          transform: translateY(-1px);
        }

        .footer-bottom {
          border-top: 1px solid var(--card-border);
          padding: 2rem 0;
        }

        .footer-bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-bottom-left p {
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }

        .footer-legal {
          display: flex;
          gap: 2rem;
        }

        .legal-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          transition: color var(--transition-fast);
        }

        .legal-link:hover {
          color: var(--text-accent);
        }

        .scroll-to-top {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          color: var(--text-accent);
          cursor: pointer;
          transition: all var(--transition-smooth);
          backdrop-filter: blur(10px);
        }

        .scroll-to-top:hover {
          background: var(--card-hover-bg);
          border-color: var(--card-hover-border);
          transform: translateY(-2px);
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }

          .brand-section {
            grid-column: 1 / -1;
            max-width: none;
          }
        }

        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .newsletter-form {
            flex-direction: column;
          }

          .newsletter-btn {
            width: 100%;
          }

          .footer-bottom-content {
            flex-direction: column;
            gap: 1.5rem;
            text-align: center;
          }

          .footer-legal {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .footer-content {
            padding: 4rem 0 2rem;
          }

          .social-links {
            justify-content: center;
          }

          .footer-legal {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </footer>
  )
}

export default Footer