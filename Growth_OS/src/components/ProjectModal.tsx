'use client'

import { createPortal } from 'react-dom'
import { useState } from 'react'
import { Project, SellerInfo } from '@/types'
import { TAG_COLORS, DEFAULT_PROJECT_IMAGE } from '@/lib/constants'
import { ShoppingCart, MessageCircle, DollarSign, Eye, Heart, Star } from 'lucide-react'
import { PurchaseConfirmModal } from './PurchaseConfirmModal'
import { ContactSellerModal } from './ContactSellerModal'
import { ImageCarousel } from './ImageCarousel'

interface ProjectModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  mounted: boolean
}

export function ProjectModal({ project, isOpen, onClose, mounted }: ProjectModalProps) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null)
  
  if (!isOpen || !mounted) return null

  const modalContent = (
    <div 
      className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50 animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto m-4 animate-slideUpAndScale" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-4 flex items-start justify-between z-20 shadow-sm">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-text-primary mb-1">{project.name}</h2>
            <p className="text-text-tertiary text-sm">by {project.author}</p>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 text-primary mr-1" />
                <span className="text-primary text-lg font-bold font-brand mr-1">ETH</span>
                <span className="text-primary text-2xl font-bold font-brand">
                  {project.pricing_model === 'subscription' && project.subscription_price_per_period 
                    ? (project.subscription_price_per_period / 100).toFixed(3) 
                    : (project.price / 100).toFixed(3)}
                </span>
                {project.pricing_model === 'subscription' && project.subscription_period && (
                  <span className="text-primary text-sm font-medium ml-1">
                    /{project.subscription_period === 'daily' ? 'day' : 
                      project.subscription_period === 'weekly' ? 'week' :
                      project.subscription_period === 'monthly' ? 'month' : 
                      project.subscription_period === 'yearly' ? 'year' : 'period'}
                  </span>
                )}
              </div>
              {project.pricing_model === 'subscription' && (
                <div className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                  Subscription
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {project.views || 0}
                </div>
                <div className="flex items-center">
                  <Heart className="w-4 h-4 mr-1" />
                  {project.likes || 0}
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  {project.rating || 0}
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light ml-4"
          >
            ×
          </button>
        </div>
        
        <div className="p-4 relative z-0">
          <div className="w-full mb-4">
            <ImageCarousel 
              images={project.images || []}
              projectName={project.name}
              className="w-full"
            />
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Description</h3>
            <p className="text-text-primary text-sm leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-lg text-sm font-medium shadow-tag ${TAG_COLORS[tag.type]}`}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>

          {/* Subscription Details */}
          {project.pricing_model === 'subscription' && project.subscription_prices && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Subscription Pricing</h3>
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
                {project.subscription_prices.daily && (
                  <div className="text-sm">
                    <span className="text-gray-600">Daily:</span>
                    <span className="font-medium ml-1">ETH {(project.subscription_prices.daily / 100).toFixed(3)}</span>
                  </div>
                )}
                {project.subscription_prices.weekly && (
                  <div className="text-sm">
                    <span className="text-gray-600">Weekly:</span>
                    <span className="font-medium ml-1">ETH {(project.subscription_prices.weekly / 100).toFixed(3)}</span>
                  </div>
                )}
                {project.subscription_prices.monthly && (
                  <div className="text-sm">
                    <span className="text-gray-600">Monthly:</span>
                    <span className="font-medium ml-1">ETH {(project.subscription_prices.monthly / 100).toFixed(3)}</span>
                  </div>
                )}
                {project.subscription_prices.yearly && (
                  <div className="text-sm">
                    <span className="text-gray-600">Yearly:</span>
                    <span className="font-medium ml-1">ETH {(project.subscription_prices.yearly / 100).toFixed(3)}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Subscribers can choose the subscription period that suits their needs
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t pt-4">
            <div className="flex gap-3">
              <button 
                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium"
                onClick={() => setShowPurchaseModal(true)}
              >
                <ShoppingCart className="w-5 h-5" />
                {project.product_type === 'subscription' 
                  ? `Subscribe - ${((project.subscription_price_per_period || project.price) / 100).toFixed(3)} ETH/${project.subscription_period}`
                  : `Buy Now - ${(project.price / 100).toFixed(3)} ETH`
                }
              </button>
              <button 
                className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 font-medium"
                onClick={() => handleContact(project)}
              >
                <MessageCircle className="w-5 h-5" />
                Contact Seller
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              Multiple payment methods available
            </p>
          </div>
        </div>
      </div>
    </div>
  )


  // Handle contact seller
  async function handleContact(project: Project) {
    try {
      // Mock seller info - in a real app, you'd fetch this from your API
      const mockSellerInfo: SellerInfo = {
        id: project.author_id || '1',
        username: project.author,
        email: `${project.author.toLowerCase().replace(/\s+/g, '')}@example.com`,
        bio: `Hi! I'm ${project.author}, passionate about creating amazing digital products. Feel free to reach out for any questions about my work.`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.author}`,
        wallet_address: '0x742d35Cc6634C0532925a3b8D41B2C02D32A8efb',
        social_linkedin: `https://linkedin.com/in/${project.author.toLowerCase().replace(/\s+/g, '')}`,
        social_website: `https://${project.author.toLowerCase().replace(/\s+/g, '')}.dev`
      }
      
      setSellerInfo(mockSellerInfo)
      setShowContactModal(true)
    } catch (error) {
      console.error('Failed to load seller info:', error)
    }
  }

  return (
    <>
      {createPortal(modalContent, document.body)}
      <PurchaseConfirmModal 
        project={project}
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        mounted={mounted}
      />
      <ContactSellerModal 
        sellerInfo={sellerInfo}
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        mounted={mounted}
      />
    </>
  )
}