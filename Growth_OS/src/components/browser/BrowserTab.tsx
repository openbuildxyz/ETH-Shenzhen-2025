interface BrowserTabProps {
  title: string
}

export function BrowserTab({ title }: BrowserTabProps) {
  return (
    <div className="flex-1 flex justify-center">
      <div className="flex items-center gap-3 px-4 py-1 bg-white rounded-lg min-w-[200px]">
        <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 12 12" className="text-blue-500">
            <path d="M6 0L8.5 4H12L8.5 8L6 12L3.5 8L0 4H3.5L6 0Z" fill="currentColor" />
          </svg>
        </div>
        <span className="text-text-secondary text-[14px] font-medium">{title}</span>
      </div>
    </div>
  )
}