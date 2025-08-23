import { useEffect, useState } from 'react'
import { ProjectCard } from './ProjectCard'
import { Project, ProductZone } from '@/types'
import { ProductsService } from '@/lib/products'

export interface ProjectGridProps {
  products: Project[]
  activeZone?: ProductZone
  sortBy?: 'time' | 'price' | 'likes' | 'views'
  initialOpenProductId?: string
}

export function ProjectGrid({ products, activeZone = 'all', sortBy = 'time', initialOpenProductId }: ProjectGridProps) {
  const [fallbackProducts, setFallbackProducts] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)

  // 如果没有收到数据，直接在这里获取（使用同样的筛选条件）
  useEffect(() => {
    if (!Array.isArray(products) || products.length === 0) {
      setLoading(true)
      
      const sortField = sortBy === 'time' ? 'created_at' : 
                       sortBy === 'price' ? 'price' :
                       sortBy === 'likes' ? 'likes' : 'views'
      
      ProductsService.getProducts({
        zone: activeZone,
        sortBy: sortField,
        sortOrder: 'desc',
        limit: 50
      }).then(data => {
        setFallbackProducts(data)
        setLoading(false)
      }).catch(error => {
        console.error('ProjectGrid failed to fetch products:', error)
        setLoading(false)
      })
    }
  }, [products, activeZone, sortBy])

  // 使用传入的数据或者自己获取的数据
  const finalProducts = Array.isArray(products) && products.length > 0 ? products : fallbackProducts
  
  // 如果正在加载
  if (loading) {
    return (
      <div className="px-6 py-8">
        <div className="text-center text-white">
          <p>Loading products...</p>
        </div>
      </div>
    )
  }

  // 如果没有产品
  if (!Array.isArray(finalProducts) || finalProducts.length === 0) {
    return (
      <div className="px-6 py-8">
        <div className="text-center text-white">
          <p>No products found in this category.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center max-w-7xl mx-auto">
        {finalProducts.map((project) => (
          <ProjectCard 
            key={project.id} 
            {...project} 
            initialOpen={initialOpenProductId === project.id}
          />
        ))}
      </div>
    </div>
  )
}