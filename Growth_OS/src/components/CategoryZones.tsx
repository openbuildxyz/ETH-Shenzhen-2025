'use client'

import { 
  GraduationCap, 
  Package, 
  Headphones, 
  Calendar, 
  Building2,
  Grid3X3
} from 'lucide-react'
import { ProductZone } from '@/types'

interface CategoryZonesProps {
  activeZone?: ProductZone
  onZoneChange?: (zone: ProductZone) => void
}

const ZONE_CONFIG = [
  {
    key: 'all' as const,
    label: 'All',
    icon: Grid3X3,
    description: 'Browse everything',
    color: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  },
  {
    key: 'courses' as const,
    label: 'Courses',
    icon: GraduationCap,
    description: 'Learn & develop skills',
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  },
  {
    key: 'products' as const,
    label: 'Products',
    icon: Package,
    description: 'Tools & templates',
    color: 'bg-green-100 text-green-700 hover:bg-green-200'
  },
  {
    key: 'services' as const,
    label: 'Services',
    icon: Headphones,
    description: 'Professional help',
    color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
  },
  {
    key: 'events' as const,
    label: 'Events',
    icon: Calendar,
    description: 'Conferences & meetups',
    color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
  },
  {
    key: 'accommodation' as const,
    label: 'Accommodation',
    icon: Building2,
    description: 'Spaces & stays',
    color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
  }
]

export function CategoryZones({ activeZone = 'all', onZoneChange }: CategoryZonesProps) {
  const handleZoneClick = (zone: ProductZone) => {
    onZoneChange?.(zone)
  }

  return (
    <div className="bg-white rounded-md p-1 shadow-button flex">
      {ZONE_CONFIG.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => handleZoneClick(key)}
          className={`
            px-3 py-1 text-sm font-medium rounded transition-colors flex items-center gap-1.5
            ${activeZone === key 
              ? 'bg-gray-200 text-text-primary' 
              : 'text-text-primary hover:bg-gray-100'
            }
          `}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </button>
      ))}
    </div>
  )
}