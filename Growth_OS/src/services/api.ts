import { Web3Product, UserProfile } from '@/types/web3'
import { userService } from './userService'

// 模拟API服务 - 黑客松阶段可以用本地数据，后期替换为真实API
class ApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api'

  async getProducts(): Promise<Web3Product[]> {
    // 黑客松阶段返回模拟数据
    return this.getMockProducts()
  }

  async getProduct(id: string): Promise<Web3Product | null> {
    const products = await this.getMockProducts()
    return products.find(p => p.id === id) || null
  }

  async createProduct(product: Partial<Web3Product>): Promise<Web3Product> {
    // 黑客松阶段存储到localStorage
    const newProduct: Web3Product = {
      id: Date.now().toString(),
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    } as Web3Product

    const products = await this.getMockProducts()
    products.push(newProduct)
    localStorage.setItem('workwork_products', JSON.stringify(products))
    
    return newProduct
  }

  async updateProduct(id: string, updates: Partial<Web3Product>): Promise<Web3Product> {
    const products = await this.getMockProducts()
    const index = products.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Product not found')

    products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() }
    localStorage.setItem('workwork_products', JSON.stringify(products))
    
    return products[index]
  }

  async getUserProfile(walletAddress: string): Promise<UserProfile | null> {
    return await userService.getUserProfile(walletAddress)
  }

  async updateUserProfile(walletAddress: string, profile: UserProfile): Promise<UserProfile> {
    return await userService.updateUserProfile(walletAddress, profile)
  }

  async generateAIContent(prompt: string, type: 'title' | 'description' | 'keywords' | 'social'): Promise<string> {
    // 黑客松阶段使用模拟AI响应
    const mockResponses = {
      title: '🚀 Ultimate Crypto Trading Course - From Zero to Pro',
      description: 'Master cryptocurrency trading with this comprehensive course. Learn technical analysis, risk management, and advanced trading strategies from industry experts.',
      keywords: 'crypto, trading, blockchain, investment, DeFi, NFT, web3',
      social: '🔥 Just launched my new crypto trading course! Learn how to navigate the markets like a pro. Use code LAUNCH50 for 50% off! #crypto #trading #education'
    }
    
    return mockResponses[type] || 'AI generated content'
  }

  private async getMockProducts(): Promise<Web3Product[]> {
    // Clear old data and always use fresh mock data for testing
    localStorage.removeItem('workwork_products')

    // Return default mock data
    const mockProducts: Web3Product[] = [
      {
        id: '1',
        title: 'Complete Web3 Development Course',
        description: 'Learn to build decentralized applications from scratch. This comprehensive course covers Solidity, React, and smart contract development.',
        price: 299,
        currency: 'USDC',
        category: 'course',
        files: [
          { name: 'course-videos.zip', url: '/files/course.zip', type: 'application/zip' },
          { name: 'source-code.zip', url: '/files/code.zip', type: 'application/zip' }
        ],
        coverImage: '/project-image.png',
        seller: {
          walletAddress: '0x742d35Cc6634C0532925a3b8D41B2C02D32A8efb',
          username: 'Web3 Master',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=web3master',
          verified: true
        },
        aiGenerated: {
          keywords: ['web3', 'blockchain', 'solidity', 'dapp', 'smart contracts'],
          socialPosts: {
            twitter: '🚀 Just launched my complete Web3 dev course! Perfect for developers wanting to enter the blockchain space. #Web3 #Blockchain #Development',
            linkedin: 'Excited to announce my comprehensive Web3 development course, covering everything from smart contracts to full-stack dApps.'
          },
          seoMeta: {
            title: 'Complete Web3 Development Course - Learn Blockchain Programming',
            description: 'Master Web3 development with our comprehensive course covering Solidity, smart contracts, and dApp development.',
            keywords: ['web3', 'blockchain', 'solidity', 'smart contracts', 'dapp development']
          }
        },
        stats: {
          views: 1250,
          purchases: 89,
          rating: 4.8,
          reviews: 45
        },
        blockchain: {
          network: 'base'
        },
        status: 'published',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T15:45:00Z'
      },
      {
        id: '2',
        title: 'Crypto Trading Masterclass',
        description: 'Professional trading strategies and risk management techniques used by institutional traders.',
        price: 199,
        currency: 'USDT',
        category: 'crypto',
        files: [
          { name: 'trading-guide.pdf', url: '/files/guide.pdf', type: 'application/pdf' }
        ],
        coverImage: '/project-image.png',
        seller: {
          walletAddress: '0x123...abc',
          username: 'Crypto Trader Pro',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=trader',
          verified: true
        },
        aiGenerated: {
          keywords: ['crypto', 'trading', 'investment', 'DeFi', 'technical analysis'],
          socialPosts: {
            twitter: '📈 New trading masterclass is live! Learn the strategies that helped me achieve 300% returns. #CryptoTrading #Investment'
          },
          seoMeta: {
            title: 'Crypto Trading Masterclass - Professional Trading Strategies',
            description: 'Learn professional cryptocurrency trading strategies and risk management from experienced traders.',
            keywords: ['crypto trading', 'cryptocurrency', 'investment', 'trading strategies']
          }
        },
        stats: {
          views: 2340,
          purchases: 156,
          rating: 4.9,
          reviews: 78
        },
        blockchain: {
          network: 'polygon'
        },
        status: 'published',
        createdAt: '2024-01-10T08:20:00Z',
        updatedAt: '2024-01-18T12:30:00Z'
      },
      {
        id: '3',
        title: 'AI Automation for Digital Nomads',
        description: 'Learn to automate your workflow using AI tools and increase productivity while traveling.',
        price: 149,
        currency: 'USDC',
        category: 'ai',
        files: [
          { name: 'automation-toolkit.zip', url: '/files/ai-tools.zip', type: 'application/zip' }
        ],
        coverImage: '/project-image.png',
        seller: {
          walletAddress: '0x456...def',
          username: 'AI Nomad Expert',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ainomad',
          verified: true
        },
        aiGenerated: {
          keywords: ['ai', 'automation', 'productivity', 'nomad', 'workflow'],
          socialPosts: {
            twitter: '🤖 New AI automation course for digital nomads! Work smarter, not harder. #AI #DigitalNomad #Productivity'
          },
          seoMeta: {
            title: 'AI Automation for Digital Nomads - Boost Your Productivity',
            description: 'Master AI automation tools to streamline your remote work and boost productivity as a digital nomad.',
            keywords: ['ai automation', 'digital nomad', 'productivity', 'remote work']
          }
        },
        stats: {
          views: 850,
          purchases: 67,
          rating: 4.6,
          reviews: 32
        },
        blockchain: {
          network: 'ethereum'
        },
        status: 'published',
        createdAt: '2024-01-12T14:15:00Z',
        updatedAt: '2024-01-25T09:20:00Z'
      },
      {
        id: '4',
        title: 'Freelance Business Blueprint',
        description: 'Complete guide to building a successful freelance business from anywhere in the world.',
        price: 99,
        currency: 'USDT',
        category: 'education',
        files: [
          { name: 'business-blueprint.pdf', url: '/files/blueprint.pdf', type: 'application/pdf' }
        ],
        coverImage: '/project-image.png',
        seller: {
          walletAddress: '0x789...ghi',
          username: 'Freelance Guru',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=freelance',
          verified: false
        },
        aiGenerated: {
          keywords: ['freelance', 'business', 'remote work', 'entrepreneurship'],
          socialPosts: {
            twitter: '💼 New freelance business blueprint! Learn to build a 6-figure remote business. #Freelance #RemoteWork #Business'
          },
          seoMeta: {
            title: 'Freelance Business Blueprint - Build Your Remote Empire',
            description: 'Complete guide to starting and scaling a successful freelance business from anywhere.',
            keywords: ['freelance business', 'remote work', 'entrepreneurship', 'digital nomad']
          }
        },
        stats: {
          views: 3200,
          purchases: 234,
          rating: 4.7,
          reviews: 156
        },
        blockchain: {
          network: 'base'
        },
        status: 'published',
        createdAt: '2024-01-05T11:00:00Z',
        updatedAt: '2024-01-22T16:45:00Z'
      }
    ]

    localStorage.setItem('workwork_products', JSON.stringify(mockProducts))
    return mockProducts
  }
}

export const apiService = new ApiService()