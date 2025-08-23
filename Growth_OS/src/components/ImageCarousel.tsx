'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductImage } from '@/types'
import { DEFAULT_PROJECT_IMAGE } from '@/lib/constants'

interface ImageCarouselProps {
  images: ProductImage[]
  projectName: string
  className?: string
}

export function ImageCarousel({ images, projectName, className = '' }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // 如果没有图片，使用默认图片
  const displayImages = images.length > 0 ? images : [
    { url: DEFAULT_PROJECT_IMAGE, alt: `${projectName} - Default Image` }
  ]
  
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? displayImages.length - 1 : prevIndex - 1
    )
  }
  
  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === displayImages.length - 1 ? 0 : prevIndex + 1
    )
  }
  
  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }
  
  return (
    <div className={`relative group ${className}`}>
      {/* Main Image */}
      <div className="w-full overflow-hidden rounded-lg bg-gray-100">
        <img 
          src={displayImages[currentIndex].url}
          alt={displayImages[currentIndex].alt}
          className="w-full h-auto object-contain transition-opacity duration-300"
          style={{ maxHeight: '400px' }}
          onError={(e) => {
            e.currentTarget.src = DEFAULT_PROJECT_IMAGE
          }}
        />
      </div>
      
      {/* Navigation Arrows - 只在多图时显示 */}
      {displayImages.length > 1 && (
        <>
          <button 
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
      
      {/* Dots Indicator - 只在多图时显示 */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {displayImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Image Counter - 只在多图时显示 */}
      {displayImages.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
          {currentIndex + 1} / {displayImages.length}
        </div>
      )}
    </div>
  )
}