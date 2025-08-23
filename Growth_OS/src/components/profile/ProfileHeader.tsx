'use client'

import Image from 'next/image'
import { UserProfile } from '@/types/web3'
import { useWallet } from '@/hooks/useWallet'
import { CheckCircle, Star, X, Edit, Twitter, Briefcase, Globe } from 'lucide-react'

interface ProfileHeaderProps {
  profile: UserProfile
  isEditing: boolean
  onToggleEdit: () => void
}

export function ProfileHeader({ profile, isEditing, onToggleEdit }: ProfileHeaderProps) {
  const { balance } = useWallet()

  return (
    <div className="bg-white rounded-xl p-8 shadow-card">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-8">
          {/* 头像 */}
          <div className="relative flex-shrink-0">
            <Image
              src={profile.avatar}
              alt="Profile Avatar"
              width={120}
              height={120}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-primary shadow-lg"
            />
            {profile.verification.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* 基本信息 */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
                {profile.username}
              </h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium w-fit ${
                profile.verification.badgeLevel === 'platinum' ? 'bg-purple-100 text-purple-800' :
                profile.verification.badgeLevel === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                profile.verification.badgeLevel === 'silver' ? 'bg-gray-100 text-gray-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>{profile.verification.badgeLevel.toUpperCase()}</span>
                </div>
              </span>
            </div>
            
            {profile.walletAddress ? (
              <p className="text-text-secondary font-mono text-sm break-all">
                {profile.walletAddress.slice(0, 8)}...{profile.walletAddress.slice(-8)}
              </p>
            ) : (
              <p className="text-text-secondary text-sm">
                No wallet connected
              </p>
            )}
            
            {profile.bio && (
              <p className="text-text-primary text-base leading-relaxed max-w-2xl">
                {profile.bio}
              </p>
            )}

            {/* 余额和统计 */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {balance && (
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                  <span className="text-text-secondary">Balance:</span>
                  <span className="font-semibold text-primary">{balance} ETH</span>
                </div>
              )}
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                <span className="text-text-secondary">Sales:</span>
                <span className="font-semibold text-green-600">${profile.stats.totalSales.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-1 rounded-full">
                <span className="text-text-secondary">Rating:</span>
                <span className="font-semibold text-yellow-600">{profile.stats.rating}/5</span>
              </div>
            </div>

            {/* 社交链接 */}
            {(profile.social.twitter || profile.social.linkedin || profile.social.website) && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {profile.social.twitter && (
                  <a 
                    href={`https://twitter.com/${profile.social.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 text-sm font-medium"
                  >
                    <Twitter className="w-4 h-4" />
                    <span>{profile.social.twitter}</span>
                  </a>
                )}
                {profile.social.linkedin && (
                  <a 
                    href={profile.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-700 hover:text-blue-800 text-sm font-medium"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {profile.social.website && (
                  <a 
                    href={profile.social.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 编辑按钮 */}
        <div className="flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={onToggleEdit}
            className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isEditing 
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-button'
                : 'bg-primary text-white hover:bg-blue-600 shadow-button hover:shadow-lg'
            }`}
          >
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}