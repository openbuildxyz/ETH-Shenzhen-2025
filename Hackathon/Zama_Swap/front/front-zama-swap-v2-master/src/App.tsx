import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useEffect, useState } from 'react'
import './App.css'
import AddLiquidity from './components/liquidity'
import Mint from './components/mint'
import Particles from './components/particles'
import ReserveCard from './components/reserve-card'
import Swap from './components/swap'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { initializeFheInstance } from './lib/fhe/instance'
import { cn } from './lib/utils'

function App() {
  const [currentPage, setCurrentPage] = useState<'swap' | 'mint' | 'liquidity'>(
    'swap'
  )

  useEffect(() => {
    initializeFheInstance()
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash === 'swap' || hash === 'mint' || hash === 'liquidity') {
        setCurrentPage(hash)
      } else {
        setCurrentPage('swap')
        window.location.hash = '#swap'
      }
    }

    handleHashChange()

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  const handleTabClick = (page: string) => {
    window.location.hash = `#${page}`
  }

  return (
    <div className='min-h-screen min-w-screen relative '>
      <Particles
        particleColors={['#e0f2fe', '#bae6fd', '#93c5fd', '#60a5fa']}
        particleCount={200}
        particleSpread={10}
        speed={0.3}
        particleBaseSize={900}
        moveParticlesOnHover={false}
        alphaParticles={true}
        disableRotation={true}
      ></Particles>
      <header className=' sticky top-0 z-50 px-6 py-4 flex justify-between items-center '>
        <div className='flex items-center gap-2'>
          <img src='/logo.png' alt='logo' className='size-20' />
        </div>
        <ConnectButton />
      </header>
      <main className=' flex flex-col items-center '>
        <ReserveCard />
        <Card className='w-xl bg-transparent rounded-lg border-0 relative'>
          <div className='flex flex-col items-center justify-center px-10'>
            <ul className='flex flex-row gap-2 w-full justify-start'>
              <li>
                <Button
                  variant='outline'
                  className={cn(
                    currentPage === 'swap' && ' bg-primary ',
                    'rounded-full cursor-pointer'
                  )}
                  onClick={() => handleTabClick('swap')}
                >
                  Swap
                </Button>
              </li>
              <li>
                <Button
                  variant='outline'
                  className={cn(
                    currentPage === 'liquidity' && ' bg-primary ',
                    'rounded-full cursor-pointer'
                  )}
                  onClick={() => handleTabClick('liquidity')}
                >
                  Liquidity
                </Button>
              </li>
              <li>
                <Button
                  variant='outline'
                  className={cn(
                    currentPage === 'mint' && ' bg-primary ',
                    'rounded-full cursor-pointer'
                  )}
                  onClick={() => handleTabClick('mint')}
                >
                  Mint
                </Button>
              </li>
            </ul>
          </div>
          {currentPage === 'swap' && <Swap />}
          {currentPage === 'liquidity' && <AddLiquidity />}
          {currentPage === 'mint' && <Mint />}
        </Card>
      </main>
    </div>
  )
}

export default App
