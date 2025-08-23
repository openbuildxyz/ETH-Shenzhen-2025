import React from 'react'
import { formatEther } from 'viem'
import { useWallet } from '../contexts/WalletContext'

const WalletConnect: React.FC = () => {
  const { 
    address, 
    isConnected, 
    connector, 
    connect, 
    connectors, 
    disconnect, 
    isConnecting,
    balance 
  } = useWallet()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-4 bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 shadow-lg border border-white/30">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
          <span className="text-sm text-white/90 font-medium">已连接</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white">{formatAddress(address)}</span>
          <span className="text-xs text-white/70">
            {connector?.name} • {balance ? `${parseFloat(formatEther(balance)).toFixed(4)} ETH` : '0.0000 ETH'}
          </span>
        </div>
        
        <button
          onClick={() => disconnect()}
          className="text-sm text-red-200 hover:text-red-100 px-3 py-1 rounded border border-red-200/50 hover:border-red-100/70 transition-all duration-200 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm"
        >
          断开连接
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm text-white/90 font-medium">选择钱包连接：</span>
      <div className="flex space-x-2">
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => connect(connector)}
            disabled={isConnecting}
            className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? '连接中...' : connector.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default WalletConnect
