interface XiaohongshuIconProps {
  className?: string
  size?: number
}

export function XiaohongshuIcon({ className = "", size = 24 }: XiaohongshuIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      className={className}
    >
      <defs>
        <linearGradient id="xhs-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF4458" />
          <stop offset="100%" stopColor="#FF2847" />
        </linearGradient>
      </defs>
      <rect 
        width="32" 
        height="32" 
        rx="8" 
        fill="url(#xhs-gradient)"
      />
      <text 
        x="16" 
        y="22" 
        textAnchor="middle" 
        fill="white" 
        fontSize="12" 
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        小红书
      </text>
    </svg>
  )
}