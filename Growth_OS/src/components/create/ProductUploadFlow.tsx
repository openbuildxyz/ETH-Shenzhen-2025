'use client'

import { useState } from 'react'
import { FileUploadStepWithPDF } from './FileUploadStepWithPDF'
import { AIGenerationStep } from './AIGenerationStep'
import { PreviewStep } from './PreviewStep'
import { PublishStep } from './PublishStep'
import { ResultsStep } from './ResultsStep'

export type UploadData = {
  uploadType: 'readme' | 'zip' | 'github' | 'video' | null
  files: File[]
  githubUrl: string
  videoUrl: string
  zipUrl: string // Add zipUrl for Project Landing Page
  readmeContent: string
  difyFileId?: string // Add Dify file ID to track uploaded README
  isUploading: boolean // Add upload progress state
  uploadProgress: number // Add upload progress percentage
}

export type AIGeneratedContent = {
  title: string
  description: string
  marketingCopy: string
  keywords: string[]
  socialPosts: {
    twitter: string
    linkedin: string
  }
  price: number
  currency: string
  category: string
  image_url: string // 保留用于向后兼容
  images: { url: string; alt: string }[] // 新的多图字段
  // 订阅模式相关字段
  pricing_model?: 'one_time' | 'subscription'
  subscription_period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  subscription_prices?: {
    daily?: number
    weekly?: number
    monthly?: number
    yearly?: number
  }
  subscription_duration?: number
}

export type ProductData = UploadData & {
  aiContent: AIGeneratedContent | null
  isGenerating: boolean
}

export function ProductUploadFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [productData, setProductData] = useState<ProductData>({
    uploadType: null,
    files: [],
    githubUrl: '',
    videoUrl: '',
    zipUrl: '',
    readmeContent: '',
    difyFileId: undefined,
    isUploading: false,
    uploadProgress: 0,
    aiContent: null,
    isGenerating: false
  })
  
  const [workflowResult, setWorkflowResult] = useState<Record<string, unknown> | null>(null)

  const updateProductData = (updates: Partial<ProductData>) => {
    setProductData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const steps = [
    { number: 1, title: 'Upload Content', description: 'Select your project files or links' },
    { number: 2, title: 'AI Generation', description: 'Generate content with AI' },
    { number: 3, title: 'Preview & Edit', description: 'Review and customize your product' },
    { number: 4, title: 'Publish', description: 'Confirm and publish to platform' }
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Progress Steps */}
      <div className="px-8 py-6 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold
                ${currentStep >= step.number 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-500'
                }
              `}>
                {step.number}
              </div>
              <div className="ml-3">
                <div className={`font-medium ${
                  currentStep >= step.number ? 'text-primary' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                <div className="text-sm text-gray-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-16 h-1 mx-6 rounded
                  ${currentStep > step.number ? 'bg-primary' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-8">
        {currentStep === 1 && (
          <FileUploadStepWithPDF 
            data={productData}
            onUpdate={updateProductData}
            onNext={nextStep}
          />
        )}
        
        {currentStep === 2 && (
          <AIGenerationStep 
            data={productData}
            onUpdate={updateProductData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}
        
        {currentStep === 3 && (
          <PreviewStep 
            data={productData}
            onUpdate={updateProductData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}
        
        {currentStep === 4 && !workflowResult && (
          <PublishStep 
            data={productData}
            onPrev={prevStep}
            onNext={() => {}} // PublishStep handles its own completion
            onWorkflowComplete={setWorkflowResult}
          />
        )}
        
        {currentStep === 4 && workflowResult && (
          <ResultsStep 
            data={productData}
            workflowResult={workflowResult}
            onRestart={() => {
              // Reset all state to start over
              setProductData({
                uploadType: null,
                files: [],
                githubUrl: '',
                videoUrl: '',
                zipUrl: '',
                readmeContent: '',
                difyFileId: undefined,
                isUploading: false,
                uploadProgress: 0,
                aiContent: null,
                isGenerating: false
              })
              setWorkflowResult(null)
              setCurrentStep(1)
            }}
          />
        )}
      </div>
    </div>
  )
}