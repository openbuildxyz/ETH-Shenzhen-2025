import React from 'react'
import './App.css'
import Header from './components/Header'
import Hero from './components/Hero'
import Dashboard from './components/Dashboard'
import Features from './components/Features'
import Footer from './components/Footer'
import ParallaxBackground from './components/ParallaxBackground'

function App() {
  return (
    <div className="app">
      <ParallaxBackground />
      <Header />
      <main>
        <Hero />
        <Dashboard />
        <Features />
      </main>
      <Footer />
    </div>
  )
}

export default App
