'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { ProductsService } from '@/lib/products'
import { Project } from '@/types'
import { ProductEditModal } from '@/components/ProductEditModal'
import { Header } from '@/components/Header'
import { 
  Plus, 
  Search, 
  Grid, 
  List, 
  Eye, 
  Heart, 
  Edit, 
  Trash2, 
  RefreshCw,
  AlertCircle,
  Package,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { TAG_COLORS, DEFAULT_PROJECT_IMAGE } from '@/lib/constants'

// Force dynamic rendering due to auth usage
export const dynamic = 'force-dynamic'

export default function MyProjectsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list') // Default to list to match orders
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const loadMyProjects = useCallback(async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    try {
      // Get user products directly (more efficient)
      const myProjects = await ProductsService.getUserProducts(user.id)
      setProjects(myProjects)
    } catch (err) {
      console.error('Failed to load projects:', err)
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [user])


  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/')
      return
    }
    if (user) {
      loadMyProjects()
    }
  }, [user, authLoading, router, loadMyProjects])

  const handleProjectUpdate = async () => {
    await loadMyProjects()
    setEditingProject(null)
  }

  const handleProjectDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    
    try {
      await ProductsService.deleteProduct(projectId)
      await loadMyProjects()
    } catch (error) {
      console.error('Failed to delete project:', error)
      alert('Failed to delete project')
    }
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
          <p>Please log in to view your projects.</p>
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
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#38B6FF' }}>My Projects</h1>
          <p style={{ color: '#38B6FF', opacity: 0.8 }}>Manage and edit your published products</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {projects.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-blue-600">
                  {projects.reduce((sum, p) => sum + (p.views || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-pink-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Likes</p>
                <p className="text-2xl font-bold text-pink-600">
                  {projects.reduce((sum, p) => sum + (p.likes || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-4">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={loadMyProjects}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-blue-50 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              {/* Create Button */}
              <button
                onClick={() => router.push('/create')}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Project
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
                <p className="text-red-800 font-medium">Failed to load projects</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg p-8 text-center">
            <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your projects...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProjects.length === 0 && (
          <div className="bg-white rounded-lg p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {projects.length === 0 ? (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">Create your first project to get started</p>
                <button
                  onClick={() => router.push('/create')}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create Project
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No projects found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </>
            )}
          </div>
        )}

        {/* Projects List */}
        {!loading && filteredProjects.length > 0 && (
          <>
            {viewMode === 'list' ? (
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Product Info */}
                      <div className="flex gap-4 flex-1">
                        <div 
                          className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
                          style={{
                            backgroundImage: `url(${project.image || project.image_url || DEFAULT_PROJECT_IMAGE})`
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-800 text-lg">{project.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                              {(project.status || 'inactive').charAt(0).toUpperCase() + (project.status || 'inactive').slice(1)}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{project.description}</p>

                          {/* Product Type & Pricing */}
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-2">
                              {project.product_type === 'subscription' ? (
                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Subscription
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  <Package className="w-3 h-3 mr-1" />
                                  Product
                                </span>
                              )}
                            </div>
                            
                            <div className="text-lg font-semibold text-primary">
                              {(project.price / 100).toFixed(3)} ETH
                            </div>
                          </div>

                          {/* Project Stats */}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {project.views || 0} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {project.likes || 0} likes
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(project.created_at)}
                            </span>
                            {project.category && (
                              <span className={`px-2 py-0.5 rounded text-xs ${TAG_COLORS[project.category as keyof typeof TAG_COLORS] || 'bg-gray-100 text-gray-800'}`}>
                                {project.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 min-w-[120px]">
                        <button
                          onClick={() => window.open(`/?product=${project.id}`, '_blank')}
                          className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>
                        <button
                          onClick={() => setEditingProject(project)}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleProjectDelete(project.id)}
                          className="flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    {/* Image */}
                    <div className="relative">
                      <div 
                        className="w-full h-48 rounded-t-lg bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${project.image || project.image_url || DEFAULT_PROJECT_IMAGE})`
                        }}
                      />
                      <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {(project.status || 'inactive').charAt(0).toUpperCase() + (project.status || 'inactive').slice(1)}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2 truncate">{project.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-semibold text-primary">
                          {(project.price / 100).toFixed(3)} ETH
                        </span>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Eye className="w-3 h-3" />
                          {project.views || 0}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingProject(project)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => window.open(`/?product=${project.id}`, '_blank')}
                          className="px-3 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Edit Modal */}
        {editingProject && (
          <ProductEditModal
            project={editingProject}
            isOpen={!!editingProject}
            onClose={() => setEditingProject(null)}
            onUpdate={handleProjectUpdate}
          />
        )}
      </div>
    </div>
  )
}