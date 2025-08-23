import { supabase } from './supabase'

// StreamFlow API配置
const STREAMFLOW_API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api.streamflow.example.com' // 生产环境地址
  : 'http://localhost:8080' // 开发环境地址，避免与Next.js端口冲突

// 类型定义
export interface StreamFlowSeller {
  id: string
  walletAddress: string
  name: string
  email: string
  description: string
}

export interface StreamFlowStream {
  id: string
  streamId?: string
  sellerId: string
  buyerAddress: string
  tokenMint: string
  amount: string
  amountPerPeriod: string
  period: number
  startTime: string
  endTime: string
  cliffTime?: string
  cliffAmount?: string
  canTopup?: boolean
  cancelableBySender?: boolean
  cancelableByRecipient?: boolean
  transferableBySender?: boolean
  transferableByRecipient?: boolean
  automaticWithdrawal?: boolean
  withdrawalFrequency?: number
  orderId?: string
  productName?: string
  productType?: string
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  feeAmount: string
  treasuryAddress: string
}

export interface CreateStreamParams {
  sellerId: string
  buyerAddress: string
  tokenMint: string
  amount: string
  amountPerPeriod: string
  period: number
  startTime: string
  endTime: string
  cliffTime?: string
  cliffAmount?: string
  canTopup?: boolean
  cancelableBySender?: boolean
  cancelableByRecipient?: boolean
  transferableBySender?: boolean
  transferableByRecipient?: boolean
  automaticWithdrawal?: boolean
  withdrawalFrequency?: number
  orderId?: string
  productName?: string
  productType?: string
}

// API请求封装
async function streamflowRequest(endpoint: string, options: RequestInit = {}) {
  // 在开发环境中使用模拟数据，避免调用不存在的API
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 Mock StreamFlow API call: ${endpoint}`, options.body ? JSON.parse(options.body as string) : {})
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 根据不同的端点返回模拟数据
    if (endpoint === '/api/sellers' && options.method === 'POST') {
      return {
        success: true,
        data: {
          id: `seller_${Date.now()}`,
          walletAddress: 'mock_wallet_address',
          name: 'Mock Seller',
          email: 'seller@example.com',
          description: 'Mock seller account'
        }
      }
    }
    
    if (endpoint.includes('/api/streams') && options.method === 'POST') {
      return {
        success: true,
        data: {
          id: `stream_${Date.now()}`,
          status: 'PENDING',
          treasuryAddress: 'mock_treasury',
          feeAmount: '0.1'
        }
      }
    }
    
    if (endpoint.includes('/activate') && options.method === 'POST') {
      return {
        success: true,
        data: { status: 'ACTIVE' }
      }
    }
    
    if (endpoint.includes('/cancel') && options.method === 'POST') {
      return {
        success: true,
        data: { status: 'CANCELLED' }
      }
    }
    
    // 默认成功响应
    return {
      success: true,
      data: {}
    }
  }
  
  // 生产环境的真实API调用
  const url = `${STREAMFLOW_API_BASE}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`StreamFlow API Error (${response.status}): ${errorText}`)
  }

  return response.json()
}

export class StreamFlowService {
  // 创建卖家账户
  static async createSeller(params: {
    walletAddress: string
    name: string
    email: string
    description: string
  }): Promise<StreamFlowSeller> {
    try {
      const response = await streamflowRequest('/api/sellers', {
        method: 'POST',
        body: JSON.stringify(params),
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to create seller')
      }

      return response.data
    } catch (error) {
      console.error('StreamFlow createSeller error:', error)
      throw error
    }
  }

  // 获取或创建卖家（确保用户有StreamFlow账户）
  static async ensureSeller(userId: string): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase not available')
    }

    try {
      // 检查是否已存在StreamFlow卖家记录
      const { data: existingSeller } = await supabase
        .from('streamflow_sellers')
        .select('streamflow_seller_id')
        .eq('user_id', userId)
        .single()

      if (existingSeller) {
        return existingSeller.streamflow_seller_id
      }

      // 获取用户信息
      const { data: userProfile } = await supabase
        .from('users')
        .select('username, email, bio, wallet_address')
        .eq('id', userId)
        .single()

      if (!userProfile) {
        throw new Error('User profile not found')
      }

      if (!userProfile.wallet_address) {
        throw new Error('User must have an Ethereum wallet address to become a seller')
      }

      // 创建StreamFlow卖家账户
      const streamflowSeller = await this.createSeller({
        walletAddress: userProfile.wallet_address,
        name: userProfile.username || 'Anonymous Seller',
        email: userProfile.email || '',
        description: userProfile.bio || 'WorkWork seller'
      })

      // 保存映射关系
      const { error: insertError } = await supabase
        .from('streamflow_sellers')
        .insert({
          user_id: userId,
          streamflow_seller_id: streamflowSeller.id,
          wallet_address: userProfile.wallet_address,
          name: userProfile.username,
          email: userProfile.email,
          description: userProfile.bio
        })

      if (insertError) {
        console.error('Failed to save streamflow seller mapping:', insertError)
        // 如果保存失败，仍然返回sellerId，下次会重试
      }

      return streamflowSeller.id
    } catch (error) {
      console.error('StreamFlow ensureSeller error:', error)
      throw error
    }
  }

  // 创建流支付
  static async createStream(params: CreateStreamParams): Promise<StreamFlowStream> {
    try {
      const response = await streamflowRequest('/api/streams', {
        method: 'POST',
        body: JSON.stringify(params),
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to create stream')
      }

      return response.data
    } catch (error) {
      console.error('StreamFlow createStream error:', error)
      throw error
    }
  }

  // 激活流支付
  static async activateStream(streamId: string): Promise<{
    streamId: string
    transactionId: string
    derivedWalletAddress: string
    feeAmount: string
    finalAmount: string
  }> {
    try {
      const response = await streamflowRequest(`/api/streams/${streamId}/activate`, {
        method: 'POST',
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to activate stream')
      }

      return response.data
    } catch (error) {
      console.error('StreamFlow activateStream error:', error)
      throw error
    }
  }

  // 获取流支付详情
  static async getStream(streamId: string): Promise<StreamFlowStream> {
    try {
      const response = await streamflowRequest(`/api/streams/${streamId}`)

      if (!response.success) {
        throw new Error(response.error || 'Failed to get stream')
      }

      return response.data
    } catch (error) {
      console.error('StreamFlow getStream error:', error)
      throw error
    }
  }

  // 取消流支付
  static async cancelStream(streamId: string): Promise<void> {
    try {
      const response = await streamflowRequest(`/api/streams/${streamId}/cancel`, {
        method: 'POST',
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to cancel stream')
      }
    } catch (error) {
      console.error('StreamFlow cancelStream error:', error)
      throw error
    }
  }

  // 获取卖家的所有流支付
  static async getSellerStreams(sellerId: string): Promise<StreamFlowStream[]> {
    try {
      const response = await streamflowRequest(`/api/streams/seller/${sellerId}`)

      if (!response.success) {
        throw new Error(response.error || 'Failed to get seller streams')
      }

      return response.data
    } catch (error) {
      console.error('StreamFlow getSellerStreams error:', error)
      throw error
    }
  }

  // 获取买家的所有流支付
  static async getBuyerStreams(buyerAddress: string): Promise<StreamFlowStream[]> {
    try {
      const response = await streamflowRequest(`/api/streams/buyer/${buyerAddress}`)

      if (!response.success) {
        throw new Error(response.error || 'Failed to get buyer streams')
      }

      return response.data
    } catch (error) {
      console.error('StreamFlow getBuyerStreams error:', error)
      throw error
    }
  }
}

// 工具函数
export class StreamFlowUtils {
  // SOL转换为lamports
  static solToLamports(sol: number): string {
    return (sol * 1_000_000_000).toString()
  }

  // lamports转换为SOL
  static lamportsToSol(lamports: string): number {
    return parseInt(lamports) / 1_000_000_000
  }

  // 计算订阅参数
  static calculateSubscriptionParams(
    type: 'product' | 'subscription',
    price: number,
    subscriptionPeriod?: 'monthly' | 'quarterly' | 'yearly',
    subscriptionDuration?: number
  ) {
    const now = new Date()
    const startTime = new Date(now.getTime() + 5 * 60 * 1000) // 5分钟后开始
    
    if (type === 'product') {
      // 一次性商品：立即释放全部金额
      return {
        amount: this.solToLamports(price),
        amountPerPeriod: this.solToLamports(price),
        period: 1, // 1秒
        startTime: startTime.toISOString(),
        endTime: new Date(startTime.getTime() + 1000).toISOString(), // 开始后1秒结束
        automaticWithdrawal: true,
        cancelableBySender: false,
        cancelableByRecipient: false
      }
    } else {
      // 订阅服务：按周期释放
      if (!subscriptionPeriod || !subscriptionDuration) {
        throw new Error('Subscription period and duration are required for subscription products')
      }

      const periodSeconds = {
        monthly: 30 * 24 * 60 * 60, // 30天
        quarterly: 90 * 24 * 60 * 60, // 90天  
        yearly: 365 * 24 * 60 * 60 // 365天
      }[subscriptionPeriod]

      const totalPeriods = subscriptionDuration / ({
        monthly: 1,
        quarterly: 3,
        yearly: 12
      }[subscriptionPeriod])

      const totalAmount = price * totalPeriods
      const endTime = new Date(startTime.getTime() + subscriptionDuration * 30 * 24 * 60 * 60 * 1000)

      return {
        amount: this.solToLamports(totalAmount),
        amountPerPeriod: this.solToLamports(price),
        period: periodSeconds,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        automaticWithdrawal: true,
        cancelableBySender: true,
        cancelableByRecipient: true
      }
    }
  }

  // 验证用户支付条件
  static async validatePaymentConditions(userId: string): Promise<{
    canPay: boolean
    hasWallet: boolean
    hasPaymentMethod: boolean
    missingRequirements: string[]
  }> {
    if (!supabase) {
      throw new Error('Supabase not available')
    }

    try {
      const { data: user } = await supabase
        .from('users')
        .select('wallet_address, social_wechat, social_alipay')
        .eq('id', userId)
        .single()

      if (!user) {
        throw new Error('User not found')
      }

      const hasWallet = !!user.wallet_address
      const hasPaymentMethod = !!(user.social_wechat || user.social_alipay)
      const canPay = hasWallet || hasPaymentMethod

      const missingRequirements = []
      if (!hasWallet) missingRequirements.push('Ethereum wallet')
      if (!hasPaymentMethod) missingRequirements.push('WeChat or Alipay')

      return {
        canPay,
        hasWallet,
        hasPaymentMethod,
        missingRequirements: canPay ? [] : missingRequirements
      }
    } catch (error) {
      console.error('Error validating payment conditions:', error)
      throw error
    }
  }
}