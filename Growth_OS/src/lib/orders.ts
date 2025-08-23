import { supabase } from './supabase'
import { StreamFlowService, StreamFlowUtils } from './streamflow'

// 类型定义
export interface Order {
  id: string
  product_id: string
  buyer_id: string
  seller_id: string
  total_amount: number
  currency: string
  streamflow_stream_id?: string
  streamflow_seller_id?: string
  buyer_wallet_address?: string
  seller_wallet_address?: string
  status: 'pending' | 'processing' | 'active' | 'completed' | 'cancelled' | 'failed'
  product_type: 'product' | 'subscription'
  subscription_period?: 'monthly' | 'quarterly' | 'yearly'
  subscription_duration?: number
  subscription_start_date?: string
  subscription_end_date?: string
  stream_amount?: string
  stream_amount_per_period?: string
  stream_period_seconds?: number
  stream_start_time?: string
  stream_end_time?: string
  error_message?: string
  retry_count: number
  last_retry_at?: string
  created_at: string
  updated_at: string
}

export interface OrderWithProduct extends Order {
  product: {
    id: string
    name: string
    description: string
    price: number
    currency: string
    images?: Array<{ url: string; alt: string }>
    image_url?: string // 计算得出的向后兼容字段
    author_name: string
  }
  buyer: {
    id: string
    username: string
    email: string
  }
  seller: {
    id: string
    username: string
    email: string
  }
}

export interface CreateOrderParams {
  productId: string
  buyerId: string
  buyerWalletAddress?: string
}

export class OrdersService {
  // 创建订单
  static async createOrder(params: CreateOrderParams): Promise<Order> {
    if (!supabase) {
      throw new Error('Supabase not available')
    }

    try {
      // 获取产品信息
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.productId)
        .eq('status', 'active')
        .single()

      if (productError || !product) {
        throw new Error('Product not found or inactive')
      }

      // 获取买家信息
      const { data: buyer, error: buyerError } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('id', params.buyerId)
        .single()

      if (buyerError || !buyer) {
        throw new Error('Buyer not found')
      }

      // 获取卖家信息
      const { data: seller, error: sellerError } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('id', product.author_id)
        .single()

      if (sellerError || !seller) {
        throw new Error('Seller not found')
      }

      // 验证支付条件
      const paymentValidation = await StreamFlowUtils.validatePaymentConditions(params.buyerId)
      if (!paymentValidation.canPay) {
        throw new Error(`Payment requirements not met. Please bind: ${paymentValidation.missingRequirements.join(' or ')}`)
      }

      // 计算订阅参数
      const streamParams = StreamFlowUtils.calculateSubscriptionParams(
        product.product_type,
        product.price,
        product.subscription_period,
        product.subscription_duration
      )

      // 创建订单记录
      const orderData = {
        product_id: params.productId,
        buyer_id: params.buyerId,
        seller_id: product.author_id,
        total_amount: product.price,
        currency: product.currency,
        buyer_wallet_address: params.buyerWalletAddress || buyer.wallet_address,
        seller_wallet_address: seller.wallet_address,
        status: 'pending' as const,
        product_type: product.product_type,
        subscription_period: product.subscription_period,
        subscription_duration: product.subscription_duration,
        subscription_start_date: product.product_type === 'subscription' ? streamParams.startTime : null,
        subscription_end_date: product.product_type === 'subscription' ? streamParams.endTime : null,
        stream_amount: streamParams.amount,
        stream_amount_per_period: streamParams.amountPerPeriod,
        stream_period_seconds: streamParams.period,
        stream_start_time: streamParams.startTime,
        stream_end_time: streamParams.endTime,
        retry_count: 0
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (orderError) {
        throw new Error(`Failed to create order: ${orderError.message}`)
      }

      return order
    } catch (error) {
      console.error('OrdersService createOrder error:', error)
      throw error
    }
  }

  // 处理订单支付（对接StreamFlow）
  static async processPayment(orderId: string): Promise<Order> {
    if (!supabase) {
      throw new Error('Supabase not available')
    }

    try {
      // 获取订单信息
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (orderError || !order) {
        throw new Error('Order not found')
      }

      if (order.status !== 'pending') {
        throw new Error(`Order status is ${order.status}, cannot process payment`)
      }

      // 更新订单状态为处理中
      await supabase
        .from('orders')
        .update({ 
          status: 'processing',
          retry_count: order.retry_count + 1,
          last_retry_at: new Date().toISOString()
        })
        .eq('id', orderId)

      try {
        // 确保卖家在StreamFlow中存在
        const streamflowSellerId = await StreamFlowService.ensureSeller(order.seller_id)

        // 创建StreamFlow流支付
        const stream = await StreamFlowService.createStream({
          sellerId: streamflowSellerId,
          buyerAddress: order.buyer_wallet_address || 'BUYER_PLACEHOLDER',
          tokenMint: 'So11111111111111111111111111111111111111112', // SOL
          amount: order.stream_amount!,
          amountPerPeriod: order.stream_amount_per_period!,
          period: order.stream_period_seconds!,
          startTime: order.stream_start_time!,
          endTime: order.stream_end_time!,
          automaticWithdrawal: true,
          cancelableBySender: order.product_type === 'subscription',
          cancelableByRecipient: order.product_type === 'subscription',
          orderId: order.id,
          productName: `WorkWork Order ${order.id}`,
          productType: order.product_type
        })

        // 激活流支付
        await StreamFlowService.activateStream(stream.id)

        // 更新订单信息
        const { data: updatedOrder, error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'active',
            streamflow_stream_id: stream.id,
            streamflow_seller_id: streamflowSellerId,
            error_message: null
          })
          .eq('id', orderId)
          .select()
          .single()

        if (updateError) {
          throw new Error(`Failed to update order: ${updateError.message}`)
        }

        return updatedOrder
      } catch (streamflowError) {
        // StreamFlow操作失败，更新订单状态
        await supabase
          .from('orders')
          .update({
            status: 'failed',
            error_message: streamflowError instanceof Error ? streamflowError.message : 'Unknown error'
          })
          .eq('id', orderId)

        throw streamflowError
      }
    } catch (error) {
      console.error('OrdersService processPayment error:', error)
      throw error
    }
  }

  // 取消订单
  static async cancelOrder(orderId: string, userId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not available')
    }

    try {
      // 获取订单信息
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .single()

      if (orderError || !order) {
        throw new Error('Order not found or access denied')
      }

      if (['completed', 'cancelled'].includes(order.status)) {
        throw new Error(`Order is already ${order.status}`)
      }

      // 如果有StreamFlow流支付，先取消它
      if (order.streamflow_stream_id && order.status === 'active') {
        try {
          await StreamFlowService.cancelStream(order.streamflow_stream_id)
        } catch (error) {
          console.error('Failed to cancel StreamFlow stream:', error)
          // 继续取消本地订单，即使StreamFlow取消失败
        }
      }

      // 更新订单状态
      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
    } catch (error) {
      console.error('OrdersService cancelOrder error:', error)
      throw error
    }
  }

  // 获取用户订单列表
  static async getUserOrders(
    userId: string, 
    role: 'buyer' | 'seller' = 'buyer',
    limit: number = 20,
    offset: number = 0
  ): Promise<OrderWithProduct[]> {
    if (!supabase) {
      throw new Error('Supabase not available')
    }

    try {
      const userIdField = role === 'buyer' ? 'buyer_id' : 'seller_id'
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          product:products!inner (
            id, name, description, price, currency, images, author_name
          ),
          buyer:users!orders_buyer_id_fkey (
            id, username, email
          ),
          seller:users!orders_seller_id_fkey (
            id, username, email
          )
        `)
        .eq(userIdField, userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        throw new Error(`Failed to fetch orders: ${error.message}`)
      }

      // 转换数据并添加向后兼容的 image_url 字段
      const transformedOrders = (orders || []).map(order => ({
        ...order,
        product: {
          ...order.product,
          image_url: order.product.images && order.product.images.length > 0 
            ? order.product.images[0].url 
            : 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4'
        }
      }))

      return transformedOrders
    } catch (error) {
      console.error('OrdersService getUserOrders error:', error)
      throw error
    }
  }

  // 获取订单详情
  static async getOrderById(orderId: string, userId: string): Promise<OrderWithProduct> {
    if (!supabase) {
      throw new Error('Supabase not available')
    }

    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          product:products!inner (
            id, name, description, price, currency, images, author_name
          ),
          buyer:users!orders_buyer_id_fkey (
            id, username, email
          ),
          seller:users!orders_seller_id_fkey (
            id, username, email
          )
        `)
        .eq('id', orderId)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .single()

      if (error || !order) {
        throw new Error('Order not found or access denied')
      }

      // 转换数据并添加向后兼容的 image_url 字段
      const transformedOrder = {
        ...order,
        product: {
          ...order.product,
          image_url: order.product.images && order.product.images.length > 0 
            ? order.product.images[0].url 
            : 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4'
        }
      }

      return transformedOrder
    } catch (error) {
      console.error('OrdersService getOrderById error:', error)
      throw error
    }
  }

  // 重试失败的订单
  static async retryOrder(orderId: string, userId: string): Promise<Order> {
    if (!supabase) {
      throw new Error('Supabase not available')
    }

    try {
      // 获取订单信息
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('buyer_id', userId) // 只允许买家重试
        .single()

      if (orderError || !order) {
        throw new Error('Order not found or access denied')
      }

      if (order.status !== 'failed') {
        throw new Error('Only failed orders can be retried')
      }

      if (order.retry_count >= 3) {
        throw new Error('Maximum retry attempts reached')
      }

      // 重置订单状态为pending并处理支付
      await supabase
        .from('orders')
        .update({ 
          status: 'pending',
          error_message: null
        })
        .eq('id', orderId)

      return await this.processPayment(orderId)
    } catch (error) {
      console.error('OrdersService retryOrder error:', error)
      throw error
    }
  }

  // 获取订单统计
  static async getOrderStats(userId: string, role: 'buyer' | 'seller' = 'buyer'): Promise<{
    total: number
    pending: number
    active: number
    completed: number
    cancelled: number
    failed: number
  }> {
    if (!supabase) {
      throw new Error('Supabase not available')
    }

    try {
      const userIdField = role === 'buyer' ? 'buyer_id' : 'seller_id'
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select('status')
        .eq(userIdField, userId)

      if (error) {
        throw new Error(`Failed to fetch order stats: ${error.message}`)
      }

      const stats = {
        total: orders?.length || 0,
        pending: 0,
        active: 0,
        completed: 0,
        cancelled: 0,
        failed: 0
      }

      orders?.forEach(order => {
        if (order.status in stats) {
          stats[order.status as keyof typeof stats]++
        }
      })

      return stats
    } catch (error) {
      console.error('OrdersService getOrderStats error:', error)
      throw error
    }
  }
}