'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Project } from '@/types'
import { ProductsService } from '@/lib/products'
import { SubscriptionPricing } from './create/SubscriptionPricing'
import { MultiImageEditor } from './create/MultiImageEditor'
import { X, Save, Loader2 } from 'lucide-react'

interface ProductEditModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function ProductEditModal({ project, isOpen, onClose, onUpdate }: ProductEditModalProps) {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    price: project.price,
    currency: project.currency,
    category: project.category || 'development',
    status: project.status || 'active',
    images: project.images || [],
    pricing_model: project.pricing_model || 'one_time',
    subscription_period: project.subscription_period,
    subscription_prices: project.subscription_prices,
    subscription_duration: project.subscription_duration ?? 1
  })
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Reset form data when project changes
    setFormData({
      name: project.name,
      description: project.description,
      price: project.price,
      currency: project.currency,
      category: project.category || 'development',
      status: project.status || 'active',
      images: project.images || [],
      pricing_model: project.pricing_model || 'one_time',
      subscription_period: project.subscription_period,
      subscription_prices: project.subscription_prices,
      subscription_duration: project.subscription_duration ?? 1
    })
  }, [project])

  const handleSave = async () => {
    setLoading(true)
    try {
      await ProductsService.updateProduct(project.id, {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        currency: formData.currency,
        category: formData.category,
        status: formData.status as 'active' | 'inactive',
        images: formData.images,
        pricing_model: formData.pricing_model,
        subscription_period: formData.subscription_period,
        subscription_prices: formData.subscription_prices,
        subscription_price_per_period: formData.pricing_model === 'subscription' 
          ? (formData.subscription_prices?.[formData.subscription_period || 'monthly'] ?? formData.price ?? 0)
          : null,
        subscription_duration: formData.pricing_model === 'subscription' ? formData.subscription_duration : null,
        product_type: formData.pricing_model === 'subscription' ? 'subscription' : 'product'
      })
      onUpdate()
    } catch (error) {
      console.error('Failed to update product:', error)
      alert('Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number | Array<{url: string; alt: string}>) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePricingChange = (data: {
    pricing_model: 'one_time' | 'subscription'
    price: number
    subscription_period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
    subscription_prices?: { daily?: number; weekly?: number; monthly?: number; yearly?: number }
    subscription_duration?: number
  }) => {
    setFormData(prev => ({
      ...prev,
      pricing_model: data.pricing_model,
      price: data.price,
      subscription_period: data.subscription_period,
      subscription_prices: data.subscription_prices,
      subscription_duration: data.subscription_duration ?? 1
    }))
  }

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div 
      className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50 animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4 animate-slideUpAndScale" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="development">Development</option>
                  <option value="education">Education</option>
                  <option value="ai">AI</option>
                  <option value="crypto">Crypto</option>
                  <option value="course">Course</option>
                  <option value="tools">Tools</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Right Column - Images */}
            <div>
              <MultiImageEditor
                images={formData.images}
                onChange={(images) => handleInputChange('images', images)}
                isEditing={true}
                onEditToggle={() => {}}
              />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <SubscriptionPricing
              currency={formData.currency}
              pricingModel={formData.pricing_model}
              oneTimePrice={formData.price}
              subscriptionPeriod={formData.subscription_period}
              subscriptionPrices={formData.subscription_prices}
              subscriptionDuration={formData.subscription_duration}
              onChange={handlePricingChange}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  // Use mounted state instead of typeof window check to prevent hydration mismatch
  return mounted ? createPortal(modalContent, document.body) : null
}