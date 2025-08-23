import React from 'react'
import Sidebar from './Sidebar'
import WalletConnect from './WalletConnect'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-blue-light">
      {/* 顶部钱包连接栏 */}
      <header className="gradient-header shadow-lg border-b border-white/20 sticky top-0 z-50 backdrop-blur-md">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-white drop-shadow-sm">ModuleHub - Hub for Wallet Modules</h2>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>
      
      <div className="flex h-[calc(100vh-73px)]">
        {/* 侧边导航栏 */}
        <aside className="relative">
          <Sidebar />
        </aside>
        
        {/* 主要内容区域 */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
