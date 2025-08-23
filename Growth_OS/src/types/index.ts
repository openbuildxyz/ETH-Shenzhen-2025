export type TagType = 'ai' | 'crypto' | 'education'
export type PricingModel = 'one_time' | 'subscription'
export type SubscriptionPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type ProductZone = 'courses' | 'products' | 'services' | 'events' | 'accommodation' | 'all'

export interface Tag {
  label: string
  type: TagType
}

export interface ProductImage {
  url: string
  alt: string
}

export interface SubscriptionPrices {
  daily?: number
  weekly?: number
  monthly?: number
  yearly?: number
}

export interface Project {
  id: string
  name: string
  author: string
  author_id?: string
  author_name?: string
  description: string
  price: number
  currency: string
  category?: string
  zone?: ProductZone // 新增专区字段
  image?: string // 保留用于向后兼容
  image_url?: string // 保留用于向后兼容
  images?: ProductImage[] // 新的多图字段
  tags: Tag[]
  views?: number
  likes?: number
  rating?: number
  verified?: boolean
  status?: 'active' | 'inactive' | 'deleted'
  created_at?: string
  updated_at?: string
  // 新的订阅模式字段
  pricing_model?: PricingModel
  subscription_period?: SubscriptionPeriod
  subscription_prices?: SubscriptionPrices
  // 保留旧字段用于向后兼容
  product_type?: 'product' | 'subscription'
  subscription_duration?: number
  subscription_price_per_period?: number
}

export type FilterType = 'time' | 'price' | 'likes' | 'views'

export interface User {
  username: string
  walletAddress: string
  avatar: string
}

export interface SellerInfo {
  id: string
  username: string
  email: string
  bio?: string
  avatar?: string
  wallet_address?: string
  social_linkedin?: string
  social_website?: string
}

export interface DropdownMenuItem {
  id: string
  label: string
  action: () => void
}