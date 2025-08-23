import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ethers } from 'ethers'

interface Web3ContextType {
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  account: string | null
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
  balance: string
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (chainId: number) => Promise<void>
  clearPendingRequests: () => Promise<void>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

interface Web3ProviderProps {
  children: ReactNode
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [balance, setBalance] = useState('0.0')

  // Debug logs for state changes
  useEffect(() => {
    console.log('Web3Context State Update:', {
      isConnected,
      isConnecting,
      account,
      chainId,
      balance
    })
  }, [isConnected, isConnecting, account, chainId, balance])

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection()
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  // Update balance when account or chainId changes
  useEffect(() => {
    if (account && provider && isConnected) {
      console.log('Updating balance for:', account)
      updateBalance()
    }
  }, [account, provider, chainId, isConnected])

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        console.log('Checking existing wallet connection...')
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        console.log('Existing accounts found:', accounts)
        
        if (accounts.length > 0) {
          console.log('Initializing provider for existing connection')
          await initializeProvider()
        } else {
          console.log('No existing wallet connection found')
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    } else {
      console.log('No ethereum provider found')
    }
  }

  const initializeProvider = async () => {
    if (window.ethereum) {
      try {
        console.log('Initializing provider...')
        
        const browserProvider = new ethers.BrowserProvider(window.ethereum)
        const network = await browserProvider.getNetwork()
        const signerInstance = await browserProvider.getSigner()
        const address = await signerInstance.getAddress()

        console.log('Provider initialized:', {
          address,
          chainId: Number(network.chainId)
        })

        setProvider(browserProvider)
        setSigner(signerInstance)
        setAccount(address)
        setChainId(Number(network.chainId))
        setIsConnected(true)
        setIsConnecting(false) // Ensure connecting state is reset on success
        
      } catch (error) {
        console.error('Error initializing provider:', error)
        setIsConnecting(false) // Reset connecting state on error
        throw error
      }
    }
  }

  const updateBalance = async () => {
    if (provider && account) {
      try {
        console.log('Updating balance for account:', account)
        const balanceWei = await provider.getBalance(account)
        const balanceEth = ethers.formatEther(balanceWei)
        const formattedBalance = parseFloat(balanceEth).toFixed(4)
        console.log('Balance updated:', formattedBalance, 'ETH')
        setBalance(formattedBalance)
      } catch (error) {
        console.error('Error updating balance:', error)
        // Don't set balance to 0 on error, keep previous value
      }
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet')
      return
    }

    // Check if already connecting
    if (isConnecting) {
      console.log('Connection already in progress')
      return
    }

    setIsConnecting(true)
    try {
      // First check if already connected
      const existingAccounts = await window.ethereum.request({ method: 'eth_accounts' })
      
      if (existingAccounts.length > 0) {
        console.log('Wallet already connected, initializing...')
        await initializeProvider()
        return
      }

      // Request account access
      console.log('Requesting account access...')
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Initialize provider
      await initializeProvider()
      
      // Success - connecting state will be set to false after provider is initialized
      console.log('Wallet connected successfully')
      
    } catch (error: any) {
      console.error('Error connecting wallet:', error)
      
      // Reset connecting state on error
      setIsConnecting(false)
      
      if (error.code === 4001) {
        alert('❌ Connection Rejected\n\nYou rejected the connection request. Please click "Connect Wallet" again and approve the connection in MetaMask.')
      } else if (error.code === -32002) {
        // Pending request error
        setIsConnecting(false)
        alert('⏳ Connection Request Pending\n\n' +
              'There is already a connection request waiting in MetaMask.\n\n' +
              'Please:\n' +
              '1. Open MetaMask extension\n' +
              '2. Check for any pending requests\n' +
              '3. Approve or reject the request\n' +
              '4. Then try connecting again')
      } else if (error.code === -32603) {
        alert('🔧 MetaMask Internal Error\n\nPlease try refreshing the page and connecting again.')
      } else {
        alert(`❌ Connection Error\n\n${error.message || 'Unknown error occurred'}\n\nPlease try again or refresh the page.`)
      }
    }
  }

  // Add function to handle pending requests
  const clearPendingRequests = async () => {
    if (window.ethereum) {
      try {
        // This might help clear any pending state
        await window.ethereum.request({ method: 'eth_accounts' })
      } catch (error) {
        console.log('Error clearing pending requests:', error)
      }
    }
  }

  const disconnectWallet = () => {
    setProvider(null)
    setSigner(null)
    setAccount(null)
    setChainId(null)
    setIsConnected(false)
    setBalance('0.0')
  }

  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) return

    const chainIdHex = `0x${targetChainId.toString(16)}`
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      })
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added to wallet
        try {
          const networkConfig = getNetworkConfig(targetChainId)
          if (networkConfig) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [networkConfig],
            })
          }
        } catch (addError) {
          console.error('Error adding network:', addError)
        }
      } else {
        console.error('Error switching network:', error)
      }
    }
  }

  const getNetworkConfig = (chainId: number) => {
    const configs: { [key: number]: any } = {
      1: {
        chainId: '0x1',
        chainName: 'Ethereum Mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.infura.io/v3/'],
        blockExplorerUrls: ['https://etherscan.io/'],
      },
      11155111: {
        chainId: '0xaa36a7',
        chainName: 'Sepolia Testnet',
        nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
        rpcUrls: ['https://sepolia.infura.io/v3/'],
        blockExplorerUrls: ['https://sepolia.etherscan.io/'],
      },
      42161: {
        chainId: '0xa4b1',
        chainName: 'Arbitrum One',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://arbiscan.io/'],
      },
      10: {
        chainId: '0xa',
        chainName: 'Optimism',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.optimism.io'],
        blockExplorerUrls: ['https://optimistic.etherscan.io/'],
      },
    }
    return configs[chainId]
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else if (accounts[0] !== account) {
      initializeProvider()
    }
  }

  const handleChainChanged = () => {
    window.location.reload()
  }

  const value: Web3ContextType = {
    provider,
    signer,
    account,
    chainId,
    isConnected,
    isConnecting,
    balance,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    clearPendingRequests,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}