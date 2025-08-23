import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const ParallaxBackground: React.FC = () => {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="parallax-background">
      {/* Animated gradient orbs */}
      <motion.div
        className="parallax-orb orb-1"
        style={{ y: scrollY * 0.5 }}
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <motion.div
        className="parallax-orb orb-2"
        style={{ y: scrollY * 0.3 }}
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <motion.div
        className="parallax-orb orb-3"
        style={{ y: scrollY * 0.7 }}
        animate={{
          x: [0, 120, 0],
          y: [0, -80, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="floating-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            y: scrollY * (0.1 + Math.random() * 0.3)
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}

      <style jsx>{`
        .parallax-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
          overflow: hidden;
        }

        .parallax-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.1;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, var(--accent-primary) 0%, transparent 70%);
          top: 20%;
          right: 10%;
        }

        .orb-2 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%);
          top: 60%;
          left: 5%;
        }

        .orb-3 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, #4facfe 0%, transparent 70%);
          top: 40%;
          left: 40%;
        }

        .floating-particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: var(--accent-primary);
          border-radius: 50%;
          box-shadow: 0 0 6px var(--accent-primary);
        }

        @media (max-width: 768px) {
          .parallax-orb {
            filter: blur(20px);
          }
          
          .orb-1, .orb-2, .orb-3 {
            width: 200px;
            height: 200px;
          }
        }
      `}</style>
    </div>
  )
}

export default ParallaxBackground