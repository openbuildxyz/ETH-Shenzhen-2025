'use client'

import { UserProfile } from '@/types/web3'
import { Package, Star, PartyPopper, CheckCircle, Circle, DollarSign } from 'lucide-react'

interface ProfileStatsProps {
  profile: UserProfile
}

export function ProfileStats({ profile }: ProfileStatsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 总销售额 */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-secondary text-sm font-medium">Total Sales</p>
            <p className="text-2xl font-bold text-text-primary">
              {formatCurrency(profile.stats.totalSales)}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm">
            <span className="text-green-500 font-medium">+12.5%</span>
            <span className="text-text-secondary ml-2">vs last month</span>
          </div>
        </div>
      </div>

      {/* 产品数量 */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-secondary text-sm font-medium">Products</p>
            <p className="text-2xl font-bold text-text-primary">
              {profile.stats.totalProducts}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm">
            <span className="text-blue-500 font-medium">3 active</span>
            <span className="text-text-secondary ml-2">listings</span>
          </div>
        </div>
      </div>

      {/* 用户评分 */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-secondary text-sm font-medium">Rating</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-text-primary">
                {profile.stats.rating.toFixed(1)}
              </p>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-sm ${
                      star <= Math.floor(profile.stats.rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    <Star className="w-4 h-4 text-yellow-500" />
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Star className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm">
            <span className="text-text-secondary">Based on 42 reviews</span>
          </div>
        </div>
      </div>

      {/* 加入时间 */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-secondary text-sm font-medium">Member Since</p>
            <p className="text-lg font-bold text-text-primary">
              {formatDate(profile.stats.joinedAt)}
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <PartyPopper className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm">
            <span className="text-text-secondary">
              {Math.floor((Date.now() - new Date(profile.stats.joinedAt).getTime()) / (1000 * 60 * 60 * 24))} days
            </span>
          </div>
        </div>
      </div>

      {/* 验证状态 */}
      <div className="bg-white rounded-xl p-6 shadow-card md:col-span-2 lg:col-span-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Verification Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              profile.verification.isVerified ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <span className={`text-sm ${
                profile.verification.isVerified ? 'text-green-600' : 'text-gray-400'
              }`}>
                {profile.verification.isVerified ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-400" />
                )}
              </span>
            </div>
            <div>
              <p className="font-medium text-text-primary">Identity Verified</p>
              <p className="text-sm text-text-secondary">
                {profile.verification.isVerified ? 'Verified' : 'Not verified'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              profile.verification.kycCompleted ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <span className={`text-sm ${
                profile.verification.kycCompleted ? 'text-green-600' : 'text-gray-400'
              }`}>
                {profile.verification.kycCompleted ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-400" />
                )}
              </span>
            </div>
            <div>
              <p className="font-medium text-text-primary">KYC Completed</p>
              <p className="text-sm text-text-secondary">
                {profile.verification.kycCompleted ? 'Completed' : 'Pending'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              profile.verification.badgeLevel === 'platinum' ? 'bg-purple-100' :
              profile.verification.badgeLevel === 'gold' ? 'bg-yellow-100' :
              profile.verification.badgeLevel === 'silver' ? 'bg-gray-100' :
              'bg-orange-100'
            }`}>
              <span className={`text-sm ${
                profile.verification.badgeLevel === 'platinum' ? 'text-purple-600' :
                profile.verification.badgeLevel === 'gold' ? 'text-yellow-600' :
                profile.verification.badgeLevel === 'silver' ? 'text-gray-600' :
                'text-orange-600'
              }`}>
                ★
              </span>
            </div>
            <div>
              <p className="font-medium text-text-primary">Badge Level</p>
              <p className="text-sm text-text-secondary capitalize">
                {profile.verification.badgeLevel}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}