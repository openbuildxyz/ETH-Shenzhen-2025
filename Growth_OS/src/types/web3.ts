export interface Web3Product {
  id: string
  onChainId?: string
  title: string
  description: string
  price: number
  currency: 'USDT' | 'USDC' | 'ETH' | 'MATIC'
  category: 'course' | 'consulting' | 'digital' | 'ai' | 'crypto' | 'education'
  files: {
    name: string
    url: string
    type: string
    ipfsHash?: string
  }[]
  coverImage: string
  seller: {
    walletAddress: string
    username: string
    avatar: string
    verified: boolean
  }
  aiGenerated: {
    title?: string
    description?: string
    keywords: string[]
    socialPosts: {
      twitter?: string
      linkedin?: string
      telegram?: string
    }
    seoMeta: {
      title: string
      description: string
      keywords: string[]
    }
  }
  stats: {
    views: number
    purchases: number
    rating: number
    reviews: number
  }
  blockchain: {
    network: 'ethereum' | 'polygon' | 'base' | 'arbitrum'
    contractAddress?: string
    tokenId?: string
    transactionHash?: string
  }
  status: 'draft' | 'published' | 'sold' | 'paused'
  createdAt: string
  updatedAt: string
}

export interface PaymentTransaction {
  id: string
  productId: string
  buyerAddress: string
  sellerAddress: string
  amount: number
  currency: string
  transactionHash: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  escrowAddress?: string
  createdAt: string
  completedAt?: string
}

export interface UserProfile {
  id?: string
  email: string
  walletAddress?: string  // Made optional - not required for Web2 users
  username: string
  bio?: string
  avatar: string
  social: {
    twitter?: string
    linkedin?: string
    github?: string
    website?: string
    wechat?: string      // Added WeChat
    alipay?: string      // Added Alipay
  }
  stats: {
    totalSales: number
    totalProducts: number
    rating: number
    joinedAt: string
  }
  verification: {
    isVerified: boolean
    kycCompleted: boolean
    badgeLevel: 'bronze' | 'silver' | 'gold' | 'platinum'
    emailVerified?: boolean  // Added email verification
  }
}