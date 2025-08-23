import { MacOSControls } from './MacOSControls'
import { BrowserTab } from './BrowserTab'
import { Star } from 'lucide-react'

interface TitleBarProps {
  title: string
}

export function TitleBar({ title }: TitleBarProps) {
  return (
    <div className="h-[57px] bg-white/40 backdrop-blur-[27px] border-b border-white/20 flex items-center px-6">
      <MacOSControls />
      <BrowserTab title={title} />
      
      <div className="flex items-center gap-4">
        <button className="w-6 h-6 text-text-secondary hover:text-text-primary">
          <Star className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-300" />
        <button className="w-6 h-6 text-text-secondary hover:text-text-primary">
          ⋯
        </button>
      </div>
    </div>
  )
}