'use client'

import { useEffect } from 'react'
import type { Project } from '@/types'
import { TAG_COLORS, DEFAULT_PROJECT_IMAGE } from '@/lib/constants'
import { useModal } from '@/hooks/useModal'
import { ProjectModal } from './ProjectModal'
import { Eye, Heart, Star, CheckCircle } from 'lucide-react'

interface ProjectCardProps extends Project {
  initialOpen?: boolean
}

export function ProjectCard(props: ProjectCardProps) {
  const { initialOpen, ...project } = props
  const modal = useModal()
  
  // 如果有initialOpen属性，自动打开模态框
  useEffect(() => {
    if (initialOpen) {
      modal.open()
    }
  }, [initialOpen, modal])
  

  return (
    <>
      <div 
        className="w-full max-w-[280px] h-[360px] bg-bg-primary rounded-lg shadow-card overflow-hidden flex flex-col hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
        onClick={modal.open}
      >
        <div 
          className="h-[180px] w-full rounded-t-lg"
          style={{
            backgroundImage: `url(${project.image || project.image_url || DEFAULT_PROJECT_IMAGE})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        <div className="h-[180px] px-4 py-3 bg-white flex flex-col">
          {/* Header section: fixed height */}
          <div className="flex items-start justify-between mb-2 h-[50px] shrink-0">
            <div className="flex-1 mr-3">
              <h3 className="text-text-primary text-base font-bold line-clamp-1 leading-tight mb-1">
                {project.name}
              </h3>
              <p className="text-text-tertiary text-[10px] line-clamp-1 leading-tight">
                {project.author}
              </p>
            </div>
            
            <div className="text-right shrink-0">
              <div className="leading-tight">
                <span className="text-primary text-base font-bold font-brand mr-1">
                  ETH
                </span>
                <span className="text-primary text-2xl font-bold font-brand">
                  {project.pricing_model === 'subscription' && project.subscription_price_per_period 
                    ? (project.subscription_price_per_period / 100).toFixed(3) 
                    : (project.price / 100).toFixed(3)}
                </span>
                {project.pricing_model === 'subscription' && project.subscription_period && (
                  <div className="text-primary text-xs font-medium mt-0.5">
                    /{project.subscription_period === 'daily' ? 'day' : 
                      project.subscription_period === 'weekly' ? 'week' :
                      project.subscription_period === 'monthly' ? 'month' : 
                      project.subscription_period === 'yearly' ? 'year' : 'period'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description section: fixed height with overflow control */}
          <div className="h-[70px] mb-2 overflow-hidden shrink-0 relative">
            <p className="text-text-primary text-xs leading-[1.4] line-clamp-3 overflow-hidden mb-1">
              {project.description.length > 80 ? project.description.substring(0, 80) + '...' : project.description}
            </p>
            <div className="text-center absolute bottom-0 left-0 right-0">
              <span className="text-primary text-xs cursor-pointer hover:underline bg-white px-2">
                Click for details
              </span>
            </div>
          </div>

          {/* Tags section: fixed height to prevent overflow */}
          <div className="h-[24px] mb-2 shrink-0 overflow-hidden">
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className={`px-2 py-0.5 rounded-lg text-xs font-medium shadow-tag ${TAG_COLORS[tag.type]} truncate max-w-[80px]`}
                  title={tag.label}
                >
                  {tag.label}
                </span>
              ))}
              {project.tags.length > 2 && (
                <span className="text-text-secondary text-xs self-center">
                  +{project.tags.length - 2}
                </span>
              )}
            </div>
          </div>

          {/* Statistics: fixed at bottom */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 shrink-0">
            <div className="flex items-center space-x-3 text-xs text-text-secondary">
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{project.views}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>{project.likes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>{project.rating ? project.rating.toFixed(1) : '0.0'}</span>
              </div>
            </div>
            
            <div className="text-green-500 text-sm" title="Verified Creator">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
      
      <ProjectModal
        project={project}
        isOpen={modal.isOpen}
        onClose={modal.close}
        mounted={modal.mounted}
      />
    </>
  )
}