import { supabase } from './supabase'

// 类型定义
export interface UserSettings {
  id: string
  user_id: string
  // 通知设置
  email_notifications: boolean
  push_notifications: boolean
  order_notifications: boolean
  marketing_notifications: boolean
  security_notifications: boolean
  // 隐私设置
  profile_visibility: 'public' | 'private' | 'contacts_only'
  show_online_status: boolean
  allow_contact_from_strangers: boolean
  show_purchase_history: boolean
  // 界面设置
  language: 'en' | 'zh' | 'es' | 'fr' | 'de' | 'ja' | 'ko'
  theme: 'light' | 'dark' | 'auto'
  currency_preference: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'KRW' | 'SOL'
  timezone: string
  // 安全设置
  two_factor_enabled: boolean
  session_timeout: number
  require_password_change: boolean
  // API设置
  api_access_enabled: boolean
  webhooks_enabled: boolean
  // 时间戳
  created_at: string
  updated_at: string
}

export interface UserNotification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'security' | 'marketing'
  is_read: boolean
  is_archived: boolean
  related_id?: string
  related_type?: string
  sent_via_email: boolean
  sent_via_push: boolean
  created_at: string
  read_at?: string
  archived_at?: string
}

export interface UserApiKey {
  id: string
  user_id: string
  key_name: string
  api_key: string
  api_secret: string
  permissions: string[]
  last_used_at?: string
  expires_at?: string
  is_active: boolean
  created_at: string
}

export class SettingsService {
  // 获取用户设置
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    if (!supabase) {
      throw new Error('Supabase not available')
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching user settings:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getUserSettings:', error)
      throw error
    }
  }

  // 更新用户设置
  static async updateUserSettings(
    userId: string, 
    settings: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<UserSettings> {
    if (!supabase) {
      throw new Error('Supabase not available')
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update(settings)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update settings: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error in updateUserSettings:', error)
      throw error
    }
  }

  // 获取用户通知
  static async getUserNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false
  ): Promise<UserNotification[]> {
    if (!supabase) {
      throw new Error('Supabase not available')
    }

    try {
      let query = supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (unreadOnly) {
        query = query.eq('is_read', false)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to fetch notifications: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserNotifications:', error)
      throw error
    }
  }

  // 标记通知为已读
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not available')
    }

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId)

      if (error) {
        throw new Error(`Failed to mark notification as read: ${error.message}`)
      }
    } catch (error) {
      console.error('Error in markNotificationAsRead:', error)
      throw error
    }
  }

  // 批量标记通知为已读
  static async markAllNotificationsAsRead(userId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not available')
    }

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        throw new Error(`Failed to mark notifications as read: ${error.message}`)
      }
    } catch (error) {
      console.error('Error in markAllNotificationsAsRead:', error)
      throw error
    }
  }

  // 创建通知
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: UserNotification['type'],
    relatedId?: string,
    relatedType?: string
  ): Promise<UserNotification> {
    if (!supabase) {
      throw new Error('Supabase not available')
    }

    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          related_id: relatedId,
          related_type: relatedType
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create notification: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error in createNotification:', error)
      throw error
    }
  }

  // 获取用户API密钥
  static async getUserApiKeys(userId: string): Promise<UserApiKey[]> {
    if (!supabase) {
      throw new Error('Supabase not available')
    }

    try {
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch API keys: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserApiKeys:', error)
      throw error
    }
  }

  // 创建API密钥
  static async createApiKey(
    userId: string,
    keyName: string,
    permissions: string[] = [],
    expiresAt?: string
  ): Promise<UserApiKey> {
    if (!supabase) {
      throw new Error('Supabase not available')
    }

    try {
      // 生成API密钥和密钥
      const apiKey = this.generateApiKey()
      const apiSecret = this.generateApiSecret()

      const { data, error } = await supabase
        .from('user_api_keys')
        .insert({
          user_id: userId,
          key_name: keyName,
          api_key: apiKey,
          api_secret: apiSecret,
          permissions,
          expires_at: expiresAt
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create API key: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error in createApiKey:', error)
      throw error
    }
  }

  // 删除API密钥
  static async deleteApiKey(keyId: string, userId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not available')
    }

    try {
      const { error } = await supabase
        .from('user_api_keys')
        .update({ is_active: false })
        .eq('id', keyId)
        .eq('user_id', userId)

      if (error) {
        throw new Error(`Failed to delete API key: ${error.message}`)
      }
    } catch (error) {
      console.error('Error in deleteApiKey:', error)
      throw error
    }
  }

  // 生成API密钥
  private static generateApiKey(): string {
    return 'ww_' + this.generateRandomString(32)
  }

  // 生成API密钥
  private static generateApiSecret(): string {
    return 'wws_' + this.generateRandomString(48)
  }

  // 生成随机字符串
  private static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // 获取通知统计
  static async getNotificationStats(userId: string): Promise<{
    total: number
    unread: number
    byType: Record<string, number>
  }> {
    if (!supabase) {
      throw new Error('Supabase not available')
    }

    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('type, is_read')
        .eq('user_id', userId)
        .eq('is_archived', false)

      if (error) {
        throw new Error(`Failed to fetch notification stats: ${error.message}`)
      }

      const stats = {
        total: data?.length || 0,
        unread: data?.filter(n => !n.is_read).length || 0,
        byType: {} as Record<string, number>
      }

      data?.forEach(notification => {
        stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('Error in getNotificationStats:', error)
      throw error
    }
  }
}