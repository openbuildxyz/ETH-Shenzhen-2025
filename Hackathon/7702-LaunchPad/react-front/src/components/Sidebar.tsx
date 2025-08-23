import React from 'react'
import { NavLink } from 'react-router-dom'
import { NavigationItem } from '../types'

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    name: '控制面板',
    path: '/',
    icon: '🏠',
  },
  {
    id: 'batch-transaction',
    name: '批量交易',
    path: '/batch-transaction',
    icon: '📦',
  },
  {
    id: 'recovery',
    name: '资产恢复',
    path: '/recovery',
    icon: '🔐',
  },
  {
    id: 'subscription',
    name: '订阅服务',
    path: '/subscription',
    icon: '💳',
  },
]

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 gradient-sidebar h-full border-r border-white/30">
      <div className="p-6 border-b border-white/20">
        <h1 className="text-xl font-bold bg-gradient-blue bg-clip-text text-transparent">ModuleHub</h1>
        <p className="text-sm text-gray-600 mt-1">智能合约管理平台</p>
      </div>
      
      <nav className="mt-6">
        <div className="px-3">
          {navigationItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 mb-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-blue-soft text-white shadow-lg transform scale-105 border-r-2 border-blue-400'
                    : 'text-gray-600 hover:bg-white/60 hover:text-gray-900 hover:shadow-md hover:transform hover:scale-102'
                }`
              }
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
        <div className="text-xs text-gray-500 text-center">
          <p>ERC-7702 Account Abstraction</p>
          <p className="mt-1">版本 1.0.0</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
