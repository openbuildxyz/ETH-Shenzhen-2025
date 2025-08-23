'use client'

import { useState } from 'react'
import { FilterType, ProductZone } from '@/types'
import { FILTER_OPTIONS } from '@/lib/constants'
import { Search, X, Loader2 } from 'lucide-react'
import { CategoryZones } from './CategoryZones'

interface ControlBarProps {
  onFilterChange?: (filter: FilterType) => void
  onCreateProject?: () => void
  onSearch?: (query: string) => void
  activeFilter?: FilterType
  isSearching?: boolean
  // 新增专区相关props
  activeZone?: ProductZone
  onZoneChange?: (zone: ProductZone) => void
}

export function ControlBar({ onFilterChange, onCreateProject, onSearch, activeFilter = 'time', isSearching = false, activeZone = 'all', onZoneChange }: ControlBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const handleFilterClick = (filter: FilterType) => {
    onFilterChange?.(filter)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch?.(query)
  }

  const clearSearch = () => {
    setSearchQuery('')
    onSearch?.('')
  }

  return (
    <div className="pl-20 pr-20 py-3 flex items-center justify-between">
      {/* 左侧控件组 */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onCreateProject}
          className="bg-primary text-text-inverse px-4 py-2 rounded-md text-md font-medium shadow-button hover:bg-blue-500 transition-colors"
        >
          Create Project
        </button>

        {/* Search Box */}
        <div className={`
          relative flex items-center bg-white rounded-lg shadow-button transition-all duration-200
          ${isSearchFocused ? 'ring-2 ring-primary ring-opacity-50' : ''}
        `}>
          {isSearching && searchQuery ? (
            <Loader2 className="w-4 h-4 text-primary absolute left-3 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-gray-400 absolute left-3" />
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search products, creators, or tags..."
            className="w-64 pl-10 pr-10 py-2 text-sm border-0 rounded-lg focus:outline-none focus:ring-0 bg-transparent text-text-primary placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Options */}
        <div className="bg-white rounded-md p-1 shadow-button flex">
          {FILTER_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleFilterClick(key)}
              className={`
                px-3 py-1 text-sm font-medium rounded transition-colors
                ${activeFilter === key 
                  ? 'bg-gray-200 text-text-primary' 
                  : 'text-text-primary hover:bg-gray-100'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 右侧专区选择器 */}
      <CategoryZones
        activeZone={activeZone}
        onZoneChange={onZoneChange}
      />
    </div>
  )
}