'use client'

import { useEffect, useState, useCallback } from 'react'
import { OrdersService } from '@/lib/orders'
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign,
  RefreshCw
} from 'lucide-react'

interface OrderStatsProps {
  userId: string
  role: 'buyer' | 'seller'
}

interface OrderStats {
  total: number
  pending: number
  active: number
  completed: number
  cancelled: number
  failed: number
}

export function OrderStats({ userId, role }: OrderStatsProps) {
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStats = useCallback(async () => {
    setLoading(true)
    try {
      const statsData = await OrdersService.getOrderStats(userId, role)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load order stats:', error)
    } finally {
      setLoading(false)
    }
  }, [userId, role])

  useEffect(() => {
    loadStats()
  }, [userId, role, loadStats])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded mb-2"></div>
            <div className="w-16 h-6 bg-gray-200 rounded mb-1"></div>
            <div className="w-12 h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const statItems = [
    {
      label: 'Total Orders',
      value: stats.total,
      icon: role === 'buyer' ? ShoppingCart : DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      label: 'Active',
      value: stats.active,
      icon: RefreshCw,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Cancelled',
      value: stats.cancelled,
      icon: XCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      label: 'Failed',
      value: stats.failed,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon
        return (
          <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className={`w-8 h-8 ${item.bgColor} rounded-lg flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {item.value}
            </div>
            <div className="text-sm text-gray-600">
              {item.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}