'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { User, LogOut, Settings, Package, ShoppingBag } from 'lucide-react'
import { BrandLogo } from './header/BrandLogo'
import { AuthModal } from './auth/AuthModal'
import { useAuth } from '@/providers/AuthProvider'

export function Header() {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const router = useRouter()
  
  const { user, profile, signOut } = useAuth()

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  const handleSignOut = async () => {
    await signOut()
    setShowDropdown(false)
  }

  return (
    <>
      <div className="mx-6 mt-4 h-14 bg-primary flex items-center justify-between px-2 shadow-button rounded-full">
        <BrandLogo />
        
        <div className="flex items-center space-x-4">
          {user && profile ? (
            // Authenticated user
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 bg-white hover:bg-gray-50 rounded-full px-3 py-2 transition-colors shadow-sm"
              >
                <Image
                  src={profile.avatar}
                  alt={profile.username}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-gray-900 font-medium hidden sm:block">
                  {profile.username}
                </span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 bg-white">
                    <p className="text-sm font-medium text-gray-900 truncate">{profile.username}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {profile.walletAddress 
                        ? `${profile.walletAddress.slice(0, 6)}...${profile.walletAddress.slice(-4)}`
                        : profile.email
                      }
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      router.push('/profile')
                      setShowDropdown(false)
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      router.push('/projects')
                      setShowDropdown(false)
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Package className="w-4 h-4" />
                    <span>My Projects</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      router.push('/orders')
                      setShowDropdown(false)
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>My Orders</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      router.push('/settings')
                      setShowDropdown(false)
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Unauthenticated user
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleAuthClick('signin')}
                className="text-white hover:text-white/80 font-medium px-4 py-2 rounded-full hover:bg-white/10 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => handleAuthClick('signup')}
                className="bg-white text-primary hover:bg-white/90 font-medium px-4 py-2 rounded-full transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </>
  )
}