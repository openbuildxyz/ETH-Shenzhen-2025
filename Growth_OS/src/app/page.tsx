import { HomeContent } from '@/components/HomeContent'

// Force dynamic rendering due to auth usage in Header
export const dynamic = 'force-dynamic'

export default function Home() {
  return <HomeContent />
}
