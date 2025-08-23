'use client'

import { useState } from 'react'
import { Project } from '@/types'
import { Eye, Heart, Star, Edit, Trash2, MoreHorizontal, Copy } from 'lucide-react'
import { TAG_COLORS, DEFAULT_PROJECT_IMAGE } from '@/lib/constants'

interface MyProjectCardProps {
  project: Project
  viewMode: 'grid' | 'list'
  onEdit: () => void
  onDelete: () => void
}

export function MyProjectCard({ project, viewMode, onEdit, onDelete }: MyProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  const copyProjectId = () => {
    navigator.clipboard.writeText(project.id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'deleted':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString()
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-6">
          {/* Image */}
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src={project.image || project.image_url || DEFAULT_PROJECT_IMAGE}
              alt={project.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_PROJECT_IMAGE
              }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status || 'unknown'}
                  </span>
                  {project.pricing_model === 'subscription' && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      Subscription
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">
                  ETH {
                    project.pricing_model === 'subscription' && project.subscription_price_per_period 
                      ? (project.subscription_price_per_period / 100).toFixed(3) 
                      : (project.price / 100).toFixed(3)
                  }
                  {project.pricing_model === 'subscription' && project.subscription_period && (
                    <span className="text-sm font-normal">
                      /{project.subscription_period === 'daily' ? 'day' : 
                        project.subscription_period === 'weekly' ? 'week' :
                        project.subscription_period === 'monthly' ? 'month' : 
                        project.subscription_period === 'yearly' ? 'year' : 'period'}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{project.description}</p>
            
            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {project.views || 0}
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {project.likes || 0}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                {project.rating ? project.rating.toFixed(1) : '0.0'}
              </div>
              <span>Created: {formatDate(project.created_at)}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={copyProjectId}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
              >
                <Copy className="w-4 h-4" />
                {copiedId ? 'Copied!' : 'Copy ID'}
              </button>
              <button
                onClick={onDelete}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="h-48 overflow-hidden">
        <img 
          src={project.image || project.image_url || DEFAULT_PROJECT_IMAGE}
          alt={project.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_PROJECT_IMAGE
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{project.name}</h3>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => { onEdit(); setShowMenu(false) }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => { copyProjectId(); setShowMenu(false) }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy ID
                </button>
                <button
                  onClick={() => { onDelete(); setShowMenu(false) }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status and type */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {project.status || 'unknown'}
          </span>
          {project.pricing_model === 'subscription' && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
              Subscription
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mb-3">
          <p className="text-xl font-bold text-primary">
            ETH {
              project.pricing_model === 'subscription' && project.subscription_price_per_period 
                ? (project.subscription_price_per_period / 100).toFixed(3) 
                : (project.price / 100).toFixed(3)
            }
            {project.pricing_model === 'subscription' && project.subscription_period && (
              <span className="text-sm font-normal">
                /{project.subscription_period === 'daily' ? 'day' : 
                  project.subscription_period === 'weekly' ? 'week' :
                  project.subscription_period === 'monthly' ? 'month' : 
                  project.subscription_period === 'yearly' ? 'year' : 'period'}
              </span>
            )}
          </p>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{project.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {project.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded text-xs font-medium ${TAG_COLORS[tag.type]} truncate`}
            >
              {tag.label}
            </span>
          ))}
          {project.tags.length > 2 && (
            <span className="text-gray-500 text-xs">+{project.tags.length - 2}</span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {project.views || 0}
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {project.likes || 0}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              {project.rating ? project.rating.toFixed(1) : '0.0'}
            </div>
          </div>
        </div>

        {/* Date */}
        <p className="text-xs text-gray-400">Created: {formatDate(project.created_at)}</p>
      </div>
    </div>
  )
}

