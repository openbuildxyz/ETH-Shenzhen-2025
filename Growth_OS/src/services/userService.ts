import { supabase, UserProfile as SupabaseUserProfile } from '@/lib/supabase'
import { UserProfile } from '@/types/web3'

class UserService {
  // 检查Supabase是否已配置
  private isSupabaseConfigured(): boolean {
    return !!(supabase && 
             process.env.NEXT_PUBLIC_SUPABASE_URL && 
             process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
             process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
             process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key')
  }

  async getUserProfile(walletAddress: string): Promise<UserProfile | null> {
    if (this.isSupabaseConfigured()) {
      return this.getProfileFromSupabase(walletAddress)
    } else {
      return this.getProfileFromLocalStorage(walletAddress)
    }
  }

  async updateUserProfile(walletAddress: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    if (this.isSupabaseConfigured()) {
      return this.updateProfileInSupabase(walletAddress, profileData)
    } else {
      return this.updateProfileInLocalStorage(walletAddress, profileData)
    }
  }

  // Supabase implementation
  private async getProfileFromSupabase(walletAddress: string): Promise<UserProfile | null> {
    if (!supabase) {
      return this.getProfileFromLocalStorage(walletAddress)
    }
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // User not found, return default profile
          return this.createDefaultProfile(walletAddress)
        }
        throw error
      }

      // Convert Supabase data to UserProfile format
      return this.convertSupabaseToUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile from Supabase:', error)
      return this.createDefaultProfile(walletAddress)
    }
  }

  private async updateProfileInSupabase(walletAddress: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    if (!supabase) {
      return this.updateProfileInLocalStorage(walletAddress, profileData)
    }
    
    try {
      // Extract the basic profile fields for Supabase
      const supabaseData: Partial<SupabaseUserProfile> = {
        wallet_address: walletAddress,
        username: profileData.username,
        bio: profileData.bio,
        avatar: profileData.avatar
      }

      const { data, error } = await supabase
        .from('users')
        .upsert(supabaseData, { 
          onConflict: 'wallet_address',
          ignoreDuplicates: false 
        })
        .select()
        .single()

      if (error) throw error

      // Return the updated profile
      return this.convertSupabaseToUserProfile(data)
    } catch (error) {
      console.error('Error updating user profile in Supabase:', error)
      // Fallback to localStorage
      return this.updateProfileInLocalStorage(walletAddress, profileData)
    }
  }

  // LocalStorage fallback implementation
  private async getProfileFromLocalStorage(walletAddress: string): Promise<UserProfile | null> {
    const stored = localStorage.getItem(`profile_${walletAddress}`)
    if (stored) {
      return JSON.parse(stored)
    }
    return this.createDefaultProfile(walletAddress)
  }

  private async updateProfileInLocalStorage(walletAddress: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    const currentProfile = await this.getProfileFromLocalStorage(walletAddress) || this.createDefaultProfile(walletAddress)
    const updatedProfile = { ...currentProfile, ...profileData }
    localStorage.setItem(`profile_${walletAddress}`, JSON.stringify(updatedProfile))
    return updatedProfile
  }

  // Helper methods
  private createDefaultProfile(walletAddress: string): UserProfile {
    return {
      walletAddress,
      username: 'Digital Nomad',
      avatar: 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4',
      bio: 'Building the future of work with Web3 technologies',
      email: '',
      stats: {
        totalSales: 0,
        totalProducts: 0,
        rating: 0,
        joinedAt: new Date().toISOString().split('T')[0]
      },
      verification: {
        isVerified: false,
        kycCompleted: false,
        badgeLevel: 'bronze'
      },
      social: {
        twitter: '',
        linkedin: '',
        github: '',
        website: ''
      }
    }
  }

  private convertSupabaseToUserProfile(supabaseData: SupabaseUserProfile): UserProfile {
    return {
      walletAddress: supabaseData.wallet_address,
      username: supabaseData.username,
      bio: supabaseData.bio || '',
      avatar: supabaseData.avatar || 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4',
      email: '',
      stats: {
        totalSales: 0,
        totalProducts: 0,
        rating: 0,
        joinedAt: supabaseData.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
      },
      verification: {
        isVerified: false,
        kycCompleted: false,
        badgeLevel: 'bronze'
      },
      social: {
        twitter: '',
        linkedin: '',
        github: '',
        website: ''
      }
    }
  }
}

export const userService = new UserService()