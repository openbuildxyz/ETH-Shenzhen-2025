'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/types/web3'
import { User } from '@supabase/supabase-js'

export interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  connectWallet: (walletAddress: string) => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

// Auth hook implementation
export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('AuthProvider useEffect - initializing...')
    // Get initial session
    if (supabase) {
      console.log('Supabase available, getting session...')
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('Initial session:', session)
        setUser(session?.user ?? null)
        if (session?.user) {
          console.log('User found, loading profile for:', session.user.id)
          loadUserProfile(session.user.id)
        } else {
          console.log('No user session found')
          setLoading(false)
        }
      })

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session)
        setUser(session?.user ?? null)
        if (session?.user) {
          console.log('User authenticated, loading profile for:', session.user.id)
          loadUserProfile(session.user.id)
        } else {
          console.log('User signed out, clearing profile')
          setProfile(null)
          setLoading(false)
        }
      })

      return () => subscription.unsubscribe()
    } else {
      console.log('Supabase not available')
      // Fallback for no Supabase config
      setLoading(false)
    }
  }, [])

  const loadUserProfile = async (userId: string) => {
    if (!supabase) {
      console.log('No supabase client available for loading profile')
      return
    }
    
    console.log('Loading user profile for ID:', userId)
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('Profile query result:', { data, error })

      if (error) {
        console.error('Profile loading error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        if (error.code !== 'PGRST116') {
          throw error
        }
      }

      if (data) {
        console.log('Profile loaded successfully:', data)
        setProfile(convertToUserProfile(data))
      } else {
        console.log('No profile data found')
        setProfile(null)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      console.log('Profile loading completed')
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    if (!supabase) throw new Error('Supabase configuration missing. Please check your environment variables.')
    
    console.log('Attempting to sign up user:', email)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          bio: 'Hello! I\'m new to WorkWork.',
          avatar: 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4'
        }
      }
    })

    if (error) {
      console.error('Supabase auth error:', error)
      
      // 处理特定错误类型
      if (error.message.includes('User already registered')) {
        throw new Error('This email is already registered. Please try signing in instead.')
      } else if (error.message.includes('Invalid email')) {
        throw new Error('Please enter a valid email address.')
      } else if (error.message.includes('Password')) {
        throw new Error('Password must be at least 6 characters long.')
      } else {
        throw new Error(`Registration failed: ${error.message}`)
      }
    }

    if (data.user) {
      console.log('User created successfully. Profile will be auto-created by database trigger:', data.user.id)
      // Profile is now automatically created by database trigger
      // No need to wait in development mode
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Supabase signin error:', error)
      
      // 处理特定错误类型
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.')
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Please confirm your email address before signing in.')
      } else if (error.message.includes('Too many requests')) {
        throw new Error('Too many login attempts. Please try again later.')
      } else {
        throw new Error(`Sign in failed: ${error.message}`)
      }
    }
  }

  const signOut = async () => {
    if (!supabase) return
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const connectWallet = async (walletAddress: string) => {
    if (!supabase || !user) return
    
    const { error } = await supabase
      .from('users')
      .update({ wallet_address: walletAddress })
      .eq('id', user.id)

    if (error) throw error

    // Reload profile
    await loadUserProfile(user.id)
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!supabase || !user) return
    
    const { error } = await supabase
      .from('users')
      .update({
        username: updates.username,
        bio: updates.bio,
        avatar: updates.avatar,
        social_wechat: updates.social?.wechat,
        social_alipay: updates.social?.alipay,
        social_linkedin: updates.social?.linkedin,
        social_website: updates.social?.website,
      })
      .eq('id', user.id)

    if (error) throw error

    // Reload profile
    await loadUserProfile(user.id)
  }

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    connectWallet,
    updateProfile,
  }
}

// Helper function to convert Supabase data to UserProfile
function convertToUserProfile(data: Record<string, unknown>): UserProfile {
  return {
    id: data.id as string,
    email: data.email as string,
    walletAddress: data.wallet_address as string | undefined,
    username: data.username as string,
    bio: (data.bio as string) || '',
    avatar: (data.avatar as string) || 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4',
    social: {
      wechat: data.social_wechat as string | undefined,
      alipay: data.social_alipay as string | undefined,
      linkedin: data.social_linkedin as string | undefined,
      website: data.social_website as string | undefined,
      twitter: '',
      github: '',
    },
    stats: {
      totalSales: 0,
      totalProducts: 0,
      rating: 0,
      joinedAt: (data.created_at as string)?.split('T')[0] || new Date().toISOString().split('T')[0]
    },
    verification: {
      isVerified: false,
      kycCompleted: false,
      badgeLevel: 'bronze',
      emailVerified: (data.email_verified as boolean) || false
    }
  }
}