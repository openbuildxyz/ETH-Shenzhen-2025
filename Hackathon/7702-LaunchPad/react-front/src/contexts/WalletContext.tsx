import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createWalletClient, createPublicClient, custom, http, getAddress, type Address, type WalletClient } from 'viem'
import { sepolia, hardhat } from 'viem/chains'

// 钱包连接器类型
export interface WalletConnector {
  id: string
  name: string
  icon?: string
  connect: () => Promise<Address>
  disconnect: () => Promise<void>
  isInstalled: () => boolean
}

// 钱包状态接口
export interface WalletState {
  isConnected: boolean
  address?: Address
  balance?: bigint
  chainId?: number
  connector?: WalletConnector
  walletClient?: WalletClient
}

// 钱包上下文接口
export interface WalletContextType extends WalletState {
  connect: (connector: WalletConnector) => Promise<void>
  disconnect: () => Promise<void>
  connectors: WalletConnector[]
  isConnecting: boolean
  switchChain: (chainId: number) => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// MetaMask 连接器
const metaMaskConnector: WalletConnector = {
  id: 'metamask',
  name: 'MetaMask',
  icon: '🦊',
  connect: async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed')
    }
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    })
    return getAddress(accounts[0])
  },
  disconnect: async () => {
    // MetaMask doesn't have a programmatic disconnect
    // User needs to disconnect manually from the extension
  },
  isInstalled: () => {
    return typeof window !== 'undefined' && !!window.ethereum?.isMetaMask
  },
}

// OKX Wallet 连接器
const okxConnector: WalletConnector = {
  id: 'okx',
  name: 'OKX Wallet',
  icon: '🟠',
  connect: async () => {
    if (!window.okxwallet) {
      throw new Error('OKX Wallet not installed')
    }
    const accounts = await window.okxwallet.request({
      method: 'eth_requestAccounts',
    })
    return getAddress(accounts[0])
  },
  disconnect: async () => {
    // OKX Wallet doesn't have a programmatic disconnect
  },
  isInstalled: () => {
    return typeof window !== 'undefined' && !!window.okxwallet
  },
}

// 通用注入钱包连接器
const injectedConnector: WalletConnector = {
  id: 'injected',
  name: 'Browser Wallet',
  icon: '🌐',
  connect: async () => {
    if (!window.ethereum) {
      throw new Error('No wallet found')
    }
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    })
    return getAddress(accounts[0])
  },
  disconnect: async () => {
    // Generic disconnect
  },
  isInstalled: () => {
    return typeof window !== 'undefined' && !!window.ethereum
  },
}

// 获取可用的连接器
const getAvailableConnectors = (): WalletConnector[] => {
  const connectors: WalletConnector[] = []
  
  if (metaMaskConnector.isInstalled()) {
    connectors.push(metaMaskConnector)
  }
  
  if (okxConnector.isInstalled()) {
    connectors.push(okxConnector)
  }
  
  // 如果没有特定钱包，添加通用连接器
  if (connectors.length === 0 && injectedConnector.isInstalled()) {
    connectors.push(injectedConnector)
  }
  
  return connectors
}

// 获取当前链配置
const getCurrentChain = (chainId: number) => {
  switch (chainId) {
    case 11155111:
      return sepolia
    case 31337:
      return hardhat
    default:
      return sepolia
  }
}

// 钱包提供者组件
export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectors] = useState<WalletConnector[]>(getAvailableConnectors())

  // 获取余额
  const fetchBalance = async (address: Address, chainId: number) => {
    try {
      const chain = getCurrentChain(chainId)
      const client = createPublicClient({
        chain,
        transport: chainId === 31337 ? http('http://127.0.0.1:8545') : http(),
      })
      
      const balance = await client.getBalance({ address })
      return balance
    } catch (error) {
      console.error('Failed to fetch balance:', error)
      return BigInt(0)
    }
  }

  // 连接钱包
  const connect = async (connector: WalletConnector) => {
    setIsConnecting(true)
    try {
      const address = await connector.connect()
      
      // 获取链ID
      const chainId = await window.ethereum?.request({ method: 'eth_chainId' })
      const numericChainId = parseInt(chainId, 16)
      
      // 创建钱包客户端
      const chain = getCurrentChain(numericChainId)
      const walletClient = createWalletClient({
        account: address,
        chain,
        transport: custom(window.ethereum!),
      })
      
      // 获取余额
      const balance = await fetchBalance(address, numericChainId)
      
      setWalletState({
        isConnected: true,
        address,
        balance,
        chainId: numericChainId,
        connector,
        walletClient,
      })
      
      // 保存到本地存储
      localStorage.setItem('wallet-connector', connector.id)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }

  // 断开连接
  const disconnect = async () => {
    try {
      if (walletState.connector) {
        await walletState.connector.disconnect()
      }
      setWalletState({ isConnected: false })
      localStorage.removeItem('wallet-connector')
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  // 切换网络
  const switchChain = async (chainId: number) => {
    try {
      await window.ethereum?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })
    } catch (error: any) {
      // 如果网络不存在，尝试添加
      if (error.code === 4902) {
        const chain = getCurrentChain(chainId)
        await window.ethereum?.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${chainId.toString(16)}`,
              chainName: chain.name,
              rpcUrls: [chain.rpcUrls.default.http[0]],
              nativeCurrency: chain.nativeCurrency,
            },
          ],
        })
      } else {
        throw error
      }
    }
  }

  // 监听账户和网络变化
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else if (walletState.isConnected) {
          const newAddress = getAddress(accounts[0])
          setWalletState(prev => ({ ...prev, address: newAddress }))
        }
      }

      const handleChainChanged = (chainId: string) => {
        const numericChainId = parseInt(chainId, 16)
        setWalletState(prev => ({ ...prev, chainId: numericChainId }))
        
        // 重新获取余额
        if (walletState.address) {
          fetchBalance(walletState.address, numericChainId).then(balance => {
            setWalletState(prev => ({ ...prev, balance }))
          })
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum?.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [walletState.isConnected, walletState.address])

  // 自动重连
  useEffect(() => {
    const savedConnectorId = localStorage.getItem('wallet-connector')
    if (savedConnectorId) {
      const connector = connectors.find(c => c.id === savedConnectorId)
      if (connector && connector.isInstalled()) {
        // 检查是否已经连接
        window.ethereum?.request({ method: 'eth_accounts' })
          .then((accounts: string[]) => {
            if (accounts.length > 0) {
              connect(connector).catch(console.error)
            }
          })
          .catch(console.error)
      }
    }
  }, [])

  const contextValue: WalletContextType = {
    ...walletState,
    connect,
    disconnect,
    connectors,
    isConnecting,
    switchChain,
  }

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

// 使用钱包上下文的 Hook
export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

// 扩展 Window 接口
declare global {
  interface Window {
    ethereum?: any
    okxwallet?: any
  }
}