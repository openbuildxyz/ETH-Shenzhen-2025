'use client'

import { useWallet } from '@/hooks/useWallet'

export function WalletButton() {
  const { address, isConnected, isConnecting, balance, connect, disconnect } = useWallet()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnecting) {
    return (
      <button 
        disabled
        className="bg-gray-400 text-white px-4 py-2 rounded-lg"
      >
        Connecting...
      </button>
    )
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-white rounded-lg px-3 py-2 text-sm">
          <div className="font-medium text-text-primary">{formatAddress(address)}</div>
          {balance && (
            <div className="text-text-secondary text-xs">
              {balance} ETH
            </div>
          )}
        </div>
        <button 
          onClick={disconnect}
          className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button 
      onClick={connect}
      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
    >
      Connect Wallet
    </button>
  )
}