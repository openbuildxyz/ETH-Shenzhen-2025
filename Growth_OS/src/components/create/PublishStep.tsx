'use client'

import { useState, useEffect } from 'react'
import { ProductData } from './ProductUploadFlow'
import { useRouter } from 'next/navigation'
import { PartyPopper, AlertTriangle, Rocket, Loader2 } from 'lucide-react'
// import { runDifyWorkflow } from '@/lib/dify' // Temporarily disabled
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'
import { TagType } from '@/types'

interface PublishStepProps {
  data: ProductData
  onPrev: () => void
  onNext: () => void
  onWorkflowComplete: (result: Record<string, unknown>) => void
}


export function PublishStep({ data, onPrev, onNext, onWorkflowComplete }: PublishStepProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [progress, setProgress] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [workflowResult, setWorkflowResult] = useState<Record<string, unknown> | null>(null)
  const [publishStep, setPublishStep] = useState('')
  const router = useRouter()
  const { user, profile } = useAuth()

  // Reset state when data changes
  useEffect(() => {
    setIsPublishing(false)
    setPublishSuccess(false)
    setProgress(0)
    setElapsedTime(0)
    setWorkflowResult(null)
  }, [data])

  const handlePublish = async () => {
    if (!user || !profile) {
      alert('Please log in to publish products')
      return
    }

    if (!supabase) {
      alert('Database connection not available')
      return
    }

    setIsPublishing(true)
    setProgress(0)
    setElapsedTime(0)

    try {
      // Step 1: Prepare helper functions
      const generateTitle = () => {
        if (data.aiContent?.title) return data.aiContent.title
        if (data.uploadType === 'github') return `GitHub Project: ${data.githubUrl?.split('/').pop() || 'Repository'}`
        if (data.uploadType === 'readme' && data.files[0]) return `Project: ${data.files[0].name.replace('.md', '').replace('README', 'Documentation')}`
        if (data.uploadType === 'zip') return 'Project Landing Page'
        if (data.uploadType === 'video') return 'Video Demonstration Project'
        return 'Untitled Project'
      }
      
      const generateDescription = () => {
        if (data.aiContent?.description) return data.aiContent.description
        if (data.uploadType === 'github') return `A project repository hosted on GitHub: ${data.githubUrl}`
        if (data.uploadType === 'readme') return `Project documentation and resources. ${data.readmeContent?.substring(0, 200) || ''}`
        if (data.uploadType === 'zip') return `Complete project package with landing page: ${data.zipUrl}`
        if (data.uploadType === 'video') return `Video demonstration and tutorial: ${data.videoUrl}`
        return 'A WorkWork platform project with detailed documentation and resources.'
      }
      
      const generateCategory = () => {
        if (data.aiContent?.category) return data.aiContent.category
        if (data.uploadType === 'github') return 'development'
        if (data.uploadType === 'video') return 'education'
        return 'other'
      }
      
      const generateTags = () => {
        if (data.aiContent?.keywords) {
          return data.aiContent.keywords.map(keyword => ({
            label: keyword,
            type: 'education' as TagType
          }))
        }
        
        const defaultTags = []
        if (data.uploadType === 'github') defaultTags.push({ label: 'GitHub', type: 'education' as TagType })
        if (data.uploadType === 'readme') defaultTags.push({ label: 'Documentation', type: 'education' as TagType })
        if (data.uploadType === 'video') defaultTags.push({ label: 'Video', type: 'education' as TagType })
        defaultTags.push({ label: 'WorkWork', type: 'education' as TagType })
        
        return defaultTags
      }

      // Step 2: Generate test social media content (AI placeholder)
      setPublishStep('Generating social media content...')
      setProgress(20)
      
      // Mock social media generation  
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const productTitle = generateTitle()
      const testSocialContent = {
        tweet: `[TEST] 🚀 Just published "${productTitle}" on WorkWork! Check out this amazing ${data.uploadType} project. #WorkWork #Development #Test`,
        xhs: `[TEST] 🎆 分享我在WorkWork上发布的新项目：${productTitle}！\n\n🔥 项目亮点：\n• 专业的${data.uploadType}教程\n• 实用的开发指导\n• 适合初学者入门\n\n#编程 #学习 #技术分享 #WorkWork`
      }
      
      const workflowResponse = {
        data: {
          outputs: testSocialContent
        }
      }
      
      // Step 3: Prepare product data
      setPublishStep('Preparing product data...')
      setProgress(40)
      
      const productData = {
        name: generateTitle(),
        description: generateDescription(),
        author_id: user.id,
        author_name: profile.username || 'Anonymous',
        price: data.aiContent?.price ?? 29.99,
        currency: data.aiContent?.currency || 'SOL',
        category: generateCategory(),
        images: data.aiContent?.images || [
          {
            url: 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4',
            alt: `${data.aiContent?.title || 'Product'} - Default Image`
          }
        ],
        tags: JSON.stringify(generateTags()),
        product_type: data.aiContent?.pricing_model === 'subscription' ? 'subscription' : 'product',
        status: 'active',
        views: 0,
        likes: 0,
        rating: 0.0,
        // 新的订阅模式字段
        pricing_model: data.aiContent?.pricing_model || 'one_time',
        subscription_period: data.aiContent?.subscription_period || null,
        subscription_prices: data.aiContent?.subscription_prices || null,
        subscription_price_per_period: data.aiContent?.pricing_model === 'subscription' 
          ? (data.aiContent?.subscription_prices?.[data.aiContent.subscription_period || 'monthly'] ?? data.aiContent?.price ?? 0)
          : null,
        subscription_duration: data.aiContent?.pricing_model === 'subscription' ? (data.aiContent?.subscription_duration ?? 1) : null
      }
      
      // Step 4: Save to database
      setPublishStep('Saving to database...')
      setProgress(70)
      
      const { data: savedProduct, error: dbError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single()
      
      if (dbError) {
        console.error('Database save error:', dbError)
        throw new Error(`Failed to save product: ${dbError.message}`)
      }
      
      console.log('Product saved to database:', savedProduct)
      
      // Step 5: Finalize
      setPublishStep('Publishing complete!')
      setProgress(100)
      
      // Combine workflow and database results
      const finalResult = {
        ...workflowResponse,
        product: savedProduct,
        productId: savedProduct.id,
        productUrl: `/product/${savedProduct.id}`,
        success: true
      }
      
      setWorkflowResult(finalResult)
      onWorkflowComplete(finalResult)
      setPublishSuccess(true)
      setIsPublishing(false)
      
      // Results will be shown automatically via workflowResult state
      // No need to call onNext() as the parent component handles the transition
      
    } catch (error) {
      console.error('Publishing failed:', error)
      setPublishStep(`Publishing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsPublishing(false)
      alert(`Publishing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Don't render success state here - let ResultsStep handle it
  // if (publishSuccess && workflowResult) {
  //   Results will be shown by ResultsStep component
  // }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Publish</h2>
        <p className="text-gray-600">Review your product summary and publish to the platform</p>
      </div>

      {/* Product Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Product Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Source</h4>
              <p className="text-gray-900 capitalize">
                {data.uploadType} 
                {data.uploadType === 'readme' || data.uploadType === 'zip' 
                  ? ` (${data.files.length} file${data.files.length > 1 ? 's' : ''})`
                  : ''
                }
              </p>
            </div>
            
            {data.difyFileId && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Dify File ID</h4>
                <p className="text-gray-900 font-mono text-sm">{data.difyFileId}</p>
              </div>
            )}
            
            {data.githubUrl && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">GitHub URL</h4>
                <p className="text-gray-900 text-sm break-all">{data.githubUrl}</p>
              </div>
            )}

            {data.zipUrl && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Landing Page URL</h4>
                <p className="text-gray-900 text-sm break-all">{data.zipUrl}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Files</h4>
              <div className="space-y-2">
                {data.files.map((file, index) => (
                  <div key={index} className="text-sm text-gray-700">
                    <span className="font-medium">{file.name}</span> 
                    <span className="text-gray-500"> ({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <AlertTriangle className="text-yellow-600 mr-3 w-5 h-5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-yellow-800 mb-1">Important Notes</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Once published, your product will be visible to all users</li>
              <li>• The AI generation process may take up to 60 seconds</li>
              <li>• You can edit product details anytime from your dashboard</li>
              <li>• Payments will be processed through smart contracts</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {isPublishing && (
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{publishStep || 'Processing...'}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {publishStep && (
            <p className="text-center text-sm text-gray-600">
              {publishStep}
            </p>
          )}
        </div>
      )}

      {/* Publish Button */}
      {!isPublishing ? (
        <div className="text-center">
          <button
            onClick={handlePublish}
            className="bg-gradient-to-r from-primary to-blue-600 text-white px-12 py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg"
          >
            <Rocket className="w-5 h-5 mr-2" />
            Publish Product
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Your product will be live immediately after publishing
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Publishing Your Product...</h3>
          <p className="text-gray-600">Please wait while we process your request</p>
        </div>
      )}

      {/* Navigation */}
      {!isPublishing && (
        <div className="flex justify-start">
          <button
            onClick={onPrev}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Back to Upload
          </button>
        </div>
      )}
    </div>
  )
}