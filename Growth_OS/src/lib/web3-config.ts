export const SUPPORTED_NETWORKS = {
  base: {
    id: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }
  }
} as const

export const SUPPORTED_TOKENS = {
  USDT: {
    symbol: 'USDT',
    decimals: 6,
    addresses: {
      base: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
      polygon: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
    }
  },
  USDC: {
    symbol: 'USDC',
    decimals: 6,
    addresses: {
      base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      polygon: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
    }
  },
  ETH: {
    symbol: 'ETH',
    decimals: 18,
    addresses: {
      base: 'native',
      polygon: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
    }
  }
} as const

export const CONTRACT_ADDRESSES = {
  ESCROW: {
    base: '0x...',
    polygon: '0x...'
  },
  MARKETPLACE: {
    base: '0x...',
    polygon: '0x...'
  }
} as const

export const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/'
export const PINATA_API_URL = 'https://api.pinata.cloud'