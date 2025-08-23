'use client'

import { createPortal } from 'react-dom'
import { OrderWithProduct } from '@/lib/orders'
import { 
  Calendar, 
  DollarSign, 
  User, 
  Package, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Repeat,
  ShoppingCart
} from 'lucide-react'

interface OrderDetailModalProps {
  order: OrderWithProduct | null
  isOpen: boolean
  onClose: () => void
  mounted: boolean
  userRole: 'buyer' | 'seller'
}

export function OrderDetailModal({ order, isOpen, onClose, mounted }: OrderDetailModalProps) {
  if (!isOpen || !mounted || !order) return null

  const formatErrorMessage = (errorMessage: string) => {
    if (!errorMessage) return ''
    
    // 如果错误信息包含 HTML 内容，简化为通用错误信息
    if (errorMessage.includes('<!DOCTYPE html>') || errorMessage.includes('<html')) {
      return 'Payment processing failed. Please try again.'
    }
    
    // 如果错误信息包含 StreamFlow API Error，提取主要信息
    if (errorMessage.includes('StreamFlow API Error')) {
      const match = errorMessage.match(/StreamFlow API Error \((\d+)\)/)
      if (match) {
        const statusCode = match[1]
        switch (statusCode) {
          case '404':
            return 'Service temporarily unavailable'
          case '400':
            return 'Invalid payment request'
          case '401':
            return 'Authentication failed'
          case '500':
            return 'Payment service error'
          default:
            return 'Payment processing failed'
        }
      }
    }
    
    // 如果错误信息很长，截断显示
    if (errorMessage.length > 200) {
      return errorMessage.substring(0, 200) + '...'
    }
    
    return errorMessage
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'active':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-600" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const modalContent = (
    <div 
      className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50 animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4 animate-slideUpAndScale" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
            <p className="text-gray-600 text-sm">Order #{order.id.slice(0, 8)}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(order.status)}
              <span className={`px-3 py-2 rounded-lg border font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{(order.total_amount / 100).toFixed(3)} ETH</div>
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Information
            </h3>
            <div className="flex gap-4">
              <div 
                className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
                style={{
                  backgroundImage: `url(${order.product.image_url || '/project-image.png'})`
                }}
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">{order.product.name}</h4>
                <p className="text-gray-600 text-sm mb-2">{order.product.description}</p>
                
                {/* Product Type */}
                <div className="flex items-center gap-2">
                  {order.product_type === 'subscription' ? (
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      <Repeat className="w-3 h-3 mr-1" />
                      Subscription
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Product
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Details */}
          {order.product_type === 'subscription' && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Subscription Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600 font-medium">Billing Period:</span>
                  <p className="text-blue-800">{order.subscription_period}</p>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Duration:</span>
                  <p className="text-blue-800">{order.subscription_duration} months</p>
                </div>
                {order.subscription_start_date && (
                  <div>
                    <span className="text-blue-600 font-medium">Start Date:</span>
                    <p className="text-blue-800">{formatDate(order.subscription_start_date)}</p>
                  </div>
                )}
                {order.subscription_end_date && (
                  <div>
                    <span className="text-blue-600 font-medium">End Date:</span>
                    <p className="text-blue-800">{formatDate(order.subscription_end_date)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Parties Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Buyer */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                Buyer
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 font-medium">Name:</span>
                  <p className="text-gray-800">{order.buyer.username}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Email:</span>
                  <p className="text-gray-800">{order.buyer.email}</p>
                </div>
                {order.buyer_wallet_address && (
                  <div>
                    <span className="text-gray-600 font-medium">Wallet:</span>
                    <p className="text-gray-800 font-mono text-xs">
                      {order.buyer_wallet_address.slice(0, 6)}...{order.buyer_wallet_address.slice(-4)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Seller */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Seller
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 font-medium">Name:</span>
                  <p className="text-gray-800">{order.seller.username}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Email:</span>
                  <p className="text-gray-800">{order.seller.email}</p>
                </div>
                {order.seller_wallet_address && (
                  <div>
                    <span className="text-gray-600 font-medium">Wallet:</span>
                    <p className="text-gray-800 font-mono text-xs">
                      {order.seller_wallet_address.slice(0, 6)}...{order.seller_wallet_address.slice(-4)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* StreamFlow Information */}
          {order.streamflow_stream_id && (
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                StreamFlow Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-orange-600 font-medium">Stream ID:</span>
                  <p className="text-orange-800 font-mono text-xs">{order.streamflow_stream_id}</p>
                </div>
                {order.streamflow_seller_id && (
                  <div>
                    <span className="text-orange-600 font-medium">Seller ID:</span>
                    <p className="text-orange-800 font-mono text-xs">{order.streamflow_seller_id}</p>
                  </div>
                )}
                {order.stream_amount && (
                  <div>
                    <span className="text-orange-600 font-medium">Stream Amount:</span>
                    <p className="text-orange-800">{parseInt(order.stream_amount) / 1_000_000_000} SOL</p>
                  </div>
                )}
                {order.stream_period_seconds && (
                  <div>
                    <span className="text-orange-600 font-medium">Release Period:</span>
                    <p className="text-orange-800">{Math.floor(order.stream_period_seconds / 86400)} days</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Timeline */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Order Timeline
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-800">{formatDate(order.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="text-gray-800">{formatDate(order.updated_at)}</span>
              </div>
              {order.last_retry_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Retry:</span>
                  <span className="text-gray-800">{formatDate(order.last_retry_at)}</span>
                </div>
              )}
              {order.retry_count > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Retry Count:</span>
                  <span className="text-gray-800">{order.retry_count}</span>
                </div>
              )}
            </div>
          </div>

          {/* Error Information */}
          {order.error_message && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Error Details
              </h3>
              <p className="text-red-700 text-sm">{formatErrorMessage(order.error_message)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}