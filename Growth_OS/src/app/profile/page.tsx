'use client'

import dynamicImport from 'next/dynamic'

// Force dynamic rendering  
export const dynamic = 'force-dynamic'

// Dynamic import with loading component
const ProfileContent = dynamicImport(() => import('./ProfileContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-bg-blue">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="bg-white rounded-xl p-8 shadow-card text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-lg text-text-primary">Loading...</div>
        </div>
      </div>
    </div>
  )
})

export default function ProfilePage() {
  return <ProfileContent />
}