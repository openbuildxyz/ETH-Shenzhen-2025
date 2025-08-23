import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Only create client if both values are properly configured
export const supabase = (supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key') 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database types
export interface UserProfile {
  id: string
  email: string
  username: string
  bio?: string
  avatar?: string
  wallet_address?: string
  social_wechat?: string
  social_alipay?: string
  social_linkedin?: string
  social_website?: string
  email_verified?: boolean
  is_active?: boolean
  created_at?: string
  updated_at?: string
}