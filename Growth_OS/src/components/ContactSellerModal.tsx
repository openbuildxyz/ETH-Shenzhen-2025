'use client'

import { createPortal } from 'react-dom'
import { useState } from 'react'
import { X, Mail, Globe, Linkedin, Copy, CheckCircle } from 'lucide-react'

interface SellerInfo {
  id: string
  username: string
  email: string
  bio?: string
  avatar?: string
  wallet_address?: string
  social_linkedin?: string
  social_website?: string
}

interface ContactSellerModalProps {
  sellerInfo: SellerInfo | null
  isOpen: boolean
  onClose: () => void
  mounted: boolean
}

export function ContactSellerModal({ sellerInfo, isOpen, onClose, mounted }: ContactSellerModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!isOpen || !mounted || !sellerInfo) return null

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const modalContent = (
    <div 
      className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50 animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-md w-full mx-4 animate-slideUpAndScale" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Contact Seller</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              {sellerInfo.avatar ? (
                <img 
                  src={sellerInfo.avatar} 
                  alt={sellerInfo.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                  {sellerInfo.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {sellerInfo.username}
              </h3>
              {sellerInfo.bio && (
                <p className="text-gray-600 text-sm leading-relaxed">
                  {sellerInfo.bio}
                </p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            {/* Email */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-900">{sellerInfo.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleCopy(sellerInfo.email, 'email')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-md transition-colors"
              >
                {copiedField === 'email' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* SOL/Wallet Address */}
            {sellerInfo.wallet_address && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                    <p className="text-sm font-mono text-gray-900 truncate">
                      {sellerInfo.wallet_address}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(sellerInfo.wallet_address!, 'wallet')}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-md transition-colors flex-shrink-0"
                >
                  {copiedField === 'wallet' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}

            {/* Social Links */}
            {(sellerInfo.social_linkedin || sellerInfo.social_website) && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">Social Links</p>
                
                {sellerInfo.social_linkedin && (
                  <a
                    href={sellerInfo.social_linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">LinkedIn Profile</span>
                  </a>
                )}
                
                {sellerInfo.social_website && (
                  <a
                    href={sellerInfo.social_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <Globe className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Website</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg">
          <p className="text-xs text-gray-500 text-center">
            Click to copy contact information or visit social links
          </p>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}