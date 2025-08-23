import { Star, Home, Lock } from 'lucide-react'

interface AddressBarProps {
  url: string
}

export function AddressBar({ url }: AddressBarProps) {
  return (
    <div className="h-12 bg-white flex items-center px-6">
      <div className="flex items-center gap-2 mr-6">
        <button className="w-6 h-6 text-text-secondary hover:text-text-primary disabled:opacity-50" disabled>
          ←
        </button>
        <button className="w-6 h-6 text-text-secondary hover:text-text-primary">
          →
        </button>
        <button className="w-6 h-6 text-text-secondary hover:text-text-primary">
          ↻
        </button>
        <button className="w-6 h-6 text-text-secondary hover:text-text-primary">
          <Home className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 mx-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-bg-secondary rounded-full">
          <div className="w-3 h-3 text-text-secondary">
            <Lock className="w-3 h-3" />
          </div>
          <span className="text-text-secondary text-base">{url}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="w-6 h-6 text-text-secondary hover:text-text-primary">
          <Star className="w-5 h-5" />
        </button>
        <div className="w-6 h-6 rounded-full bg-gray-300" />
      </div>
    </div>
  )
}