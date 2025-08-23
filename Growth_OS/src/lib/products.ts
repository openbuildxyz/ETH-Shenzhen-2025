import { supabase } from './supabase'
import { Project, Tag, ProductImage, ProductZone } from '@/types'

export interface ProductsFilter {
  category?: string
  zone?: ProductZone
  sortBy?: 'created_at' | 'price' | 'views' | 'likes' | 'rating'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export class ProductsService {
  // 获取所有产品
  static async getProducts(filter: ProductsFilter = {}): Promise<Project[]> {
    if (!supabase) {
      console.warn('Supabase not configured, returning empty array')
      return []
    }

    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('status', 'active')

      // 应用过滤器
      if (filter.category) {
        query = query.eq('category', filter.category)
      }
      
      if (filter.zone && filter.zone !== 'all') {
        query = query.eq('zone', filter.zone)
      }

      // 应用排序
      if (filter.sortBy) {
        query = query.order(filter.sortBy, { 
          ascending: filter.sortOrder === 'asc' 
        })
      } else {
        // 默认按创建时间倒序
        query = query.order('created_at', { ascending: false })
      }

      // 应用分页
      if (filter.limit) {
        query = query.limit(filter.limit)
      }
      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching products:', error)
        return []
      }

      return data?.map(item => ProductsService.transformProduct(item)) || []
    } catch (error) {
      console.error('Error in getProducts:', error)
      return []
    }
  }

  // 获取用户产品（包括所有状态）
  static async getUserProducts(userId: string, includeDeleted = false): Promise<Project[]> {
    if (!supabase) {
      console.warn('Supabase not configured, returning empty array')
      return []
    }

    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('author_id', userId)

      if (!includeDeleted) {
        query = query.neq('status', 'deleted')
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Error fetching user products:', error)
        return []
      }

      return data?.map(item => ProductsService.transformProduct(item)) || []
    } catch (error) {
      console.error('Error in getUserProducts:', error)
      return []
    }
  }

  // 根据ID获取单个产品
  static async getProductById(id: string): Promise<Project | null> {
    if (!supabase) {
      console.warn('Supabase not configured')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single()

      if (error) {
        console.error('Error fetching product:', error)
        return null
      }

      return data ? ProductsService.transformProduct(data) : null
    } catch (error) {
      console.error('Error in getProductById:', error)
      return null
    }
  }

  // 增加产品浏览次数
  static async incrementViews(productId: string): Promise<void> {
    if (!supabase) return

    try {
      await supabase.rpc('increment_product_views', {
        product_id: productId
      })
    } catch (error) {
      console.error('Error incrementing views:', error)
    }
  }

  // 切换产品点赞状态
  static async toggleLike(productId: string, isLiked: boolean): Promise<void> {
    if (!supabase) return

    try {
      await supabase.rpc('toggle_product_like', {
        product_id: productId,
        increment: !isLiked // 如果当前已点赞，则取消（减少）；否则增加
      })
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  // 获取产品类别列表
  static async getCategories(): Promise<string[]> {
    if (!supabase) return []

    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('status', 'active')

      if (error) {
        console.error('Error fetching categories:', error)
        return []
      }

      // 去重并排序
      const categories = [...new Set(data.map(item => item.category))]
      return categories.filter(Boolean).sort()
    } catch (error) {
      console.error('Error in getCategories:', error)
      return []
    }
  }

  // 搜索产品
  static async searchProducts(query: string, filter: ProductsFilter = {}): Promise<Project[]> {
    if (!supabase || !query.trim()) {
      return this.getProducts(filter)
    }

    try {
      let dbQuery = supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,author_name.ilike.%${query}%`)

      // 应用过滤器
      if (filter.category) {
        dbQuery = dbQuery.eq('category', filter.category)
      }
      
      if (filter.zone && filter.zone !== 'all') {
        dbQuery = dbQuery.eq('zone', filter.zone)
      }

      // 应用排序
      if (filter.sortBy) {
        dbQuery = dbQuery.order(filter.sortBy, { 
          ascending: filter.sortOrder === 'asc' 
        })
      } else {
        dbQuery = dbQuery.order('created_at', { ascending: false })
      }

      // 应用分页
      if (filter.limit) {
        dbQuery = dbQuery.limit(filter.limit)
      }

      const { data, error } = await dbQuery

      if (error) {
        console.error('Error searching products:', error)
        return []
      }

      return data?.map(item => ProductsService.transformProduct(item)) || []
    } catch (error) {
      console.error('Error in searchProducts:', error)
      return []
    }
  }

  // 转换数据库数据为前端使用的格式
  static transformProduct(dbProduct: Record<string, unknown>): Project {
    const images = ProductsService.parseImages(dbProduct.images)
    const firstImage = images.length > 0 ? images[0].url : undefined
    
    return {
      id: dbProduct.id as string,
      name: dbProduct.name as string,
      author: dbProduct.author_name as string,
      author_id: dbProduct.author_id as string,
      author_name: dbProduct.author_name as string,
      description: dbProduct.description as string,
      price: parseFloat(dbProduct.price as string),
      currency: dbProduct.currency as string,
      category: dbProduct.category as string,
      zone: dbProduct.zone as ProductZone,
      image: firstImage, // 向后兼容，使用第一张图片
      image_url: firstImage, // 向后兼容，使用第一张图片
      images: images, // 新的多图字段
      tags: ProductsService.parseTags(dbProduct.tags),
      views: (dbProduct.views as number) || 0,
      likes: (dbProduct.likes as number) || 0,
      rating: parseFloat((dbProduct.rating as string) || '0') || 0,
      verified: true, // 可以基于作者验证状态设置
      status: dbProduct.status as 'active' | 'inactive' | 'deleted',
      created_at: dbProduct.created_at as string,
      updated_at: dbProduct.updated_at as string,
      // 订阅相关字段
      product_type: dbProduct.product_type as 'product' | 'subscription',
      pricing_model: dbProduct.pricing_model as 'one_time' | 'subscription',
      subscription_period: dbProduct.subscription_period as 'daily' | 'weekly' | 'monthly' | 'yearly',
      subscription_price_per_period: dbProduct.subscription_price_per_period ? parseFloat(dbProduct.subscription_price_per_period as string) : undefined,
      subscription_duration: dbProduct.subscription_duration as number,
      subscription_prices: ProductsService.parseSubscriptionPrices(dbProduct.subscription_prices)
    }
  }

  // 解析标签JSON数据
  static parseTags(tagsJson: unknown): Tag[] {
    if (!tagsJson) return []
    
    try {
      if (typeof tagsJson === 'string') {
        return JSON.parse(tagsJson)
      }
      return Array.isArray(tagsJson) ? tagsJson : []
    } catch (error) {
      console.error('Error parsing tags:', error)
      return []
    }
  }

  // 解析图片JSON数据
  static parseImages(imagesJson: unknown): ProductImage[] {
    if (!imagesJson) return []
    
    try {
      if (typeof imagesJson === 'string') {
        return JSON.parse(imagesJson)
      }
      return Array.isArray(imagesJson) ? imagesJson : []
    } catch (error) {
      console.error('Error parsing images:', error)
      return []
    }
  }

  // 解析订阅价格JSON数据
  static parseSubscriptionPrices(pricesJson: unknown): { daily?: number; weekly?: number; monthly?: number; yearly?: number } | undefined {
    if (!pricesJson) return undefined
    
    try {
      if (typeof pricesJson === 'string') {
        return JSON.parse(pricesJson)
      }
      return typeof pricesJson === 'object' ? pricesJson as { daily?: number; weekly?: number; monthly?: number; yearly?: number } : undefined
    } catch (error) {
      console.error('Error parsing subscription prices:', error)
      return undefined
    }
  }

  // 更新产品
  static async updateProduct(productId: string, updates: Partial<{
    name: string
    description: string
    price: number
    currency: string
    category: string
    status: 'active' | 'inactive'
    images: Array<{ url: string; alt: string }>
    pricing_model: 'one_time' | 'subscription'
    subscription_period: 'daily' | 'weekly' | 'monthly' | 'yearly'
    subscription_prices: { daily?: number; weekly?: number; monthly?: number; yearly?: number }
    subscription_price_per_period: number | null
    subscription_duration: number | null
    product_type: 'product' | 'subscription'
  }>): Promise<Project> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    try {
      const updateData: Record<string, unknown> = { ...updates }
      
      // Convert images array to JSON if provided
      if (updates.images) {
        updateData.images = JSON.stringify(updates.images)
      }
      
      // Convert subscription_prices to JSON if provided
      if (updates.subscription_prices) {
        updateData.subscription_prices = JSON.stringify(updates.subscription_prices)
      }

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
        .select()
        .single()

      if (error) {
        console.error('Error updating product:', error)
        throw new Error(`Failed to update product: ${error.message}`)
      }

      return ProductsService.transformProduct(data)
    } catch (error) {
      console.error('Error in updateProduct:', error)
      throw error
    }
  }

  // 删除产品（软删除）
  static async deleteProduct(productId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'deleted' })
        .eq('id', productId)

      if (error) {
        console.error('Error deleting product:', error)
        throw new Error(`Failed to delete product: ${error.message}`)
      }
    } catch (error) {
      console.error('Error in deleteProduct:', error)
      throw error
    }
  }

  // 永久删除产品
  static async permanentDeleteProduct(productId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) {
        console.error('Error permanently deleting product:', error)
        throw new Error(`Failed to permanently delete product: ${error.message}`)
      }
    } catch (error) {
      console.error('Error in permanentDeleteProduct:', error)
      throw error
    }
  }
}