'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { OrdersService, OrderWithProduct } from '@/lib/orders'
import { OrderStats } from '@/components/OrderStats'
import { OrderDetailModal } from '@/components/OrderDetailModal'
import { Header } from '@/components/Header'
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Repeat,
  Calendar,
  DollarSign,
  Filter,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  Eye
} from 'lucide-react'

// Force dynamic rendering due to auth usage
export const dynamic = 'force-dynamic'

type OrderRole = 'buyer' | 'seller'
type OrderStatusFilter = 'all' | 'pending' | 'processing' | 'active' | 'completed' | 'cancelled' | 'failed'

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<OrderWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<OrderRole>('buyer')
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all')
  const [retryingOrders, setRetryingOrders] = useState<Set<string>>(new Set())
  const [cancellingOrders, setCancellingOrders] = useState<Set<string>>(new Set())
  const [selectedOrder, setSelectedOrder] = useState<OrderWithProduct | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  const loadOrders = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const fetchedOrders = await OrdersService.getUserOrders(user.id, role, 50, 0)
      
      // Apply status filter
      const filteredOrders = statusFilter === 'all' 
        ? fetchedOrders 
        : fetchedOrders.filter(order => order.status === statusFilter)
      
      setOrders(filteredOrders)
    } catch (err) {
      console.error('Failed to load orders:', err)
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [user, role, statusFilter])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user, role, statusFilter, loadOrders])

  const handleViewOrder = (order: OrderWithProduct) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  const handleRetryOrder = async (orderId: string) => {
    if (!user) return

    setRetryingOrders(prev => new Set(prev).add(orderId))

    try {
      await OrdersService.retryOrder(orderId, user.id)
      await loadOrders() // Refresh orders list
    } catch (err) {
      console.error('Failed to retry order:', err)
      alert(err instanceof Error ? err.message : 'Failed to retry order')
    } finally {
      setRetryingOrders(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!user) return

    if (!confirm('Are you sure you want to cancel this order?')) return

    setCancellingOrders(prev => new Set(prev).add(orderId))

    try {
      await OrdersService.cancelOrder(orderId, user.id)
      await loadOrders() // Refresh orders list
    } catch (err) {
      console.error('Failed to cancel order:', err)
      alert(err instanceof Error ? err.message : 'Failed to cancel order')
    } finally {
      setCancellingOrders(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-600" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
    if (errorMessage.length > 100) {
      return errorMessage.substring(0, 100) + '...'
    }
    
    return errorMessage
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg-blue flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-blue flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p>Please log in to view your orders.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-blue">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#38B6FF' }}>Order Management</h1>
          <p style={{ color: '#38B6FF', opacity: 0.8 }}>Track your purchases and sales</p>
        </div>

        {/* Order Statistics */}
        <div className="mb-6">
          <OrderStats userId={user.id} role={role} />
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Role Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setRole('buyer')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  role === 'buyer'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <ShoppingCart className="w-4 h-4 inline mr-2" />
                My Purchases
              </button>
              <button
                onClick={() => setRole('seller')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  role === 'seller'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <DollarSign className="w-4 h-4 inline mr-2" />
                My Sales
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as OrderStatusFilter)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <button
                onClick={loadOrders}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1 text-sm text-primary hover:bg-blue-50 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Failed to load orders</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg p-8 text-center">
            <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-lg p-8 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {role === 'buyer' ? 'No purchases yet' : 'No sales yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {role === 'buyer' 
                ? 'Start exploring our marketplace to find amazing products and services.'
                : 'Create your first product to start selling on WorkWork.'
              }
            </p>
            <button
              onClick={() => window.location.href = role === 'buyer' ? '/' : '/create'}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {role === 'buyer' ? 'Browse Products' : 'Create Product'}
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Product Info */}
                  <div className="flex gap-4 flex-1">
                    <div 
                      className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
                      style={{
                        backgroundImage: `url(${order.product.image_url || '/project-image.png'})`
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 text-lg">{order.product.name}</h3>
                        <div className="flex items-center gap-2 ml-4">
                          {getStatusIcon(order.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2">
                        {role === 'buyer' ? `by ${order.product.author_name}` : `to ${order.buyer.username}`}
                      </p>

                      {/* Product Type & Pricing */}
                      <div className="flex items-center gap-4 mb-2">
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
                        
                        <div className="text-lg font-semibold text-primary">
                          {(order.total_amount / 100).toFixed(3)} ETH
                        </div>
                      </div>

                      {/* Subscription Details */}
                      {order.product_type === 'subscription' && order.subscription_period && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {order.subscription_period} billing • {order.subscription_duration} months total
                          </span>
                        </div>
                      )}

                      {/* Order Details */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>Order #{order.id.slice(0, 8)}</span>
                        <span>{formatDate(order.created_at)}</span>
                        {order.streamflow_stream_id && (
                          <span className="flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            StreamFlow: {order.streamflow_stream_id.slice(0, 8)}
                          </span>
                        )}
                      </div>

                      {/* Error Message */}
                      {order.error_message && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {formatErrorMessage(order.error_message)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[120px]">
                    {/* View Details Button */}
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </button>
                    {/* Retry Button */}
                    {order.status === 'failed' && role === 'buyer' && order.retry_count < 3 && (
                      <button
                        onClick={() => handleRetryOrder(order.id)}
                        disabled={retryingOrders.has(order.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {retryingOrders.has(order.id) ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        Retry
                      </button>
                    )}

                    {/* Cancel Button */}
                    {['pending', 'processing', 'active'].includes(order.status) && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrders.has(order.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        {cancellingOrders.has(order.id) ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        Cancel
                      </button>
                    )}

                    {/* Contact Button */}
                    {role === 'buyer' && (
                      <button
                        onClick={() => alert(`Contact ${order.seller.username} about order ${order.id}`)}
                        className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Contact
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Detail Modal */}
        <OrderDetailModal
          order={selectedOrder}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedOrder(null)
          }}
          mounted={mounted}
          userRole={role}
        />
      </div>
    </div>
  )
}