import { TagType } from '@/types'

export const TAG_COLORS: Record<TagType, string> = {
  ai: 'bg-[#FFDCF9] text-tag-ai',
  crypto: 'bg-[#C7FFCC] text-tag-crypto', 
  education: 'bg-[#ABD5FF] text-tag-education',
}

export const FILTER_OPTIONS = [
  { key: 'time' as const, label: 'Time' },
  { key: 'price' as const, label: 'Price' },
  { key: 'likes' as const, label: 'Likes' },
  { key: 'views' as const, label: 'Views' },
]

export const DEFAULT_PROJECT_IMAGE = '/project-image.png'

export const BRAND_LOGO_URL = '/growthos-logo-new.png'

export const DEFAULT_USER = {
  username: 'Username',
  walletAddress: 'Wallet Address',
  avatar: 'https://pbs.twimg.com/profile_images/1912362795879809025/HbzzOBdl_400x400.jpg'
}