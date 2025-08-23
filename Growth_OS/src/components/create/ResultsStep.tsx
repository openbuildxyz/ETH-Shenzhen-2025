'use client'

import { useState } from 'react'
import { ProductData } from './ProductUploadFlow'
import { useRouter } from 'next/navigation'
import { PartyPopper, FileText } from 'lucide-react'
import { TwitterIcon } from '../icons/TwitterIcon'

interface ResultsStepProps {
  data: ProductData
  workflowResult: Record<string, unknown>
  onRestart: () => void
}

export function ResultsStep({ data, workflowResult, onRestart }: ResultsStepProps) {
  const router = useRouter()
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({})

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied({ ...copied, [key]: true })
    setTimeout(() => {
      setCopied({ ...copied, [key]: false })
    }, 2000)
  }

  // Extract results from AI generated content and workflow response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workflowData = workflowResult as any
  
  // Use AI generated social media content first, fallback to workflow or default
  const tweetContent = data.aiContent?.socialPosts?.twitter || 
                       workflowData?.data?.outputs?.tweet || 
                       `🔥 GAME-CHANGER ALERT! Just dropped "${data.aiContent?.title || 'my revolutionary project'}" on WorkWork! This will blow your mind! 🚀🤯 Don't sleep on this! #WorkWork #GameChanger #MustHave #TechRevolution`
                       
  const xhsContent = data.aiContent?.socialPosts?.linkedin || 
                     workflowData?.data?.outputs?.xhs || 
                     `🎆 绝了！宝藏发现！${data.aiContent?.title || '我的神级项目'}强势登陆WorkWork！

🔥 太香了，姐妹们必须冲：
✨ ${data.aiContent?.category || '开发'}神器，效果炸裂！
⚡ 零基础直接起飞
🎯 实战干货，学到就是赚到！

错过系列后悔！速度上车！🏃‍♀️💨

#编程宝藏 #技能up #WorkWork #强推 #开发神器`
  
  // Extract product information
  const product = workflowData?.product
  const productId = workflowData?.productId || product?.id
  const productUrl = productId ? `/?product=${productId}` : null
  
  // Extract Twitter URL from tweet content
  const extractTwitterUrl = (content: string) => {
    const urlMatch = content.match(/https:\/\/x\.com\/[^\s]+/);
    return urlMatch ? urlMatch[0] : null;
  }
  
  const twitterUrl = extractTwitterUrl(tweetContent)

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mb-6">
          <PartyPopper className="w-16 h-16 mx-auto text-blue-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Success! Your Product is Live</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Congratulations! Your product has been successfully published and is now live on the platform. 
          Here are the AI-generated social media posts for your product.
        </p>
      </div>

      {/* Social Media Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Twitter Post */}
        <div className="space-y-4">
          {twitterUrl ? (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <iframe
                src={`https://platform.twitter.com/embed/Tweet.html?id=${twitterUrl.split('/').pop()}`}
                width="100%"
                height="400"
                frameBorder="0"
                scrolling="no"
                className="w-full"
              />
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center">
                  <TwitterIcon size={32} className="text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-gray-900">WorkWork Bot</h3>
                  <p className="text-gray-500 text-sm">@WorkWorkBot</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{tweetContent}</p>
              </div>
              
              <div className="flex items-center justify-between text-gray-500 text-sm border-t pt-3">
                <div className="flex items-center space-x-4">
                  <span>12:45 PM · Aug 15, 2025</span>
                  <span className="flex items-center space-x-1">
                    <span>💬</span>
                    <span>0</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>🔄</span>
                    <span>0</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>❤️</span>
                    <span>0</span>
                  </span>
                </div>
                <button 
                  onClick={() => copyToClipboard(tweetContent, 'tweet')}
                  className="text-blue-500 hover:text-blue-700 font-medium"
                >
                  {copied.tweet ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
          
          {twitterUrl && (
            <div className="text-center">
              <button 
                onClick={() => copyToClipboard(twitterUrl, 'twitterUrl')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {copied.twitterUrl ? 'Copied!' : 'Copy Tweet URL'}
              </button>
            </div>
          )}
        </div>

        {/* XHS Post */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden">
              <img 
                src="https://www.szniego.com/uploads/image/20230408/1680945993.png" 
                alt="小红书"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to SVG icon if image fails to load
                  e.currentTarget.style.display = 'none'
                  const fallback = document.createElement('div')
                  fallback.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-red-400 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">小红书</div>'
                  e.currentTarget.parentNode?.appendChild(fallback)
                }}
              />
            </div>
            <div className="ml-4">
              <h3 className="font-bold text-gray-900">WorkWork Bot</h3>
              <p className="text-gray-500 text-sm">小红书官方账号</p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{xhsContent}</p>
          </div>
          
          <div className="flex items-center justify-between text-gray-500 text-sm border-t pt-3">
            <div className="flex items-center space-x-4">
              <span>12:45 PM · Aug 15, 2025</span>
              <span className="flex items-center space-x-1">
                <span>❤️</span>
                <span>0</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>💬</span>
                <span>0</span>
              </span>
            </div>
            <button 
              onClick={() => copyToClipboard(xhsContent, 'xhs')}
              className="text-red-500 hover:text-red-700 font-medium"
            >
              {copied.xhs ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Product Link */}
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">View Your Published Product</h3>
        <p className="text-gray-600 mb-4">
          Your product is now live on WorkWork. Share this link with your audience.
        </p>
        {productId ? (
          <div className="space-y-4">
            <div className="bg-[#f9fafc] border border-gray-200 rounded-lg p-4">
              <p className="text-blue-800 font-semibold mb-2">Product Successfully Published!</p>
              <p className="text-blue-700 text-sm">Product ID: {productId}</p>
              {product?.name && <p className="text-blue-700 text-sm">Name: {product.name}</p>}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-800 font-mono text-sm break-all max-w-md">
                {window.location.origin}{productUrl}
              </div>
              <button 
                onClick={() => copyToClipboard(`${window.location.origin}${productUrl}`, 'link')}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {copied.link ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">⚠️ Product was published but ID not available</p>
            <p className="text-yellow-700 text-sm">Check your products page to find your published item</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => {
            if (productId) {
              // 跳转到首页并通过URL参数打开产品模态框
              router.push(`/?product=${productId}`)
            } else {
              router.push('/')
            }
          }}
          className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          {productId ? 'View Product' : 'View Platform'}
        </button>
        <button
          onClick={onRestart}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Create Another Product
        </button>
      </div>
    </div>
  )
}