import Image from 'next/image'
import { BRAND_LOGO_URL } from '@/lib/constants'

export function BrandLogo() {
  return (
    <button 
      onClick={() => window.location.href = '/'}
      className="rounded-full px-2 py-1 h-10 flex items-center hover:opacity-80 transition-opacity cursor-pointer" 
      style={{backgroundColor: '#16b4f2'}}
    >
      <Image 
        src={BRAND_LOGO_URL}
        alt="GrowthOS Logo" 
        width={160}
        height={40}
        className="h-10 w-auto object-contain rounded-lg"
        quality={100}
        priority
        unoptimized
      />
    </button>
  )
}