'use client'

import { useRef, useState } from 'react'
import { ProductData } from './ProductUploadFlow'
import { FileText, Globe, Github, Video, CheckCircle } from 'lucide-react'
import { uploadFileToDify } from '@/lib/dify'

interface FileUploadStepProps {
  data: ProductData
  onUpdate: (updates: Partial<ProductData>) => void
  onNext: () => void
}

export function FileUploadStep({ data, onUpdate, onNext }: FileUploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [readmeUploaded, setReadmeUploaded] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFiles = async (fileList: File[]) => {
    const file = fileList[0]
    if (!file) return

    // Determine upload type based on file extension
    const uploadType = file.name.endsWith('.zip') ? 'zip' : 'readme'
    onUpdate({ files: fileList, uploadType })

    // If it's a README file, read content and upload to Dify
    if (uploadType === 'readme') {
      // Start upload with progress
      onUpdate({ isUploading: true, uploadProgress: 0 })
      
      // Read file content for Gemini AI (no Dify upload needed)
      const reader = new FileReader()
      reader.onload = (e) => {
        const readmeContent = e.target?.result as string
        
        // Simulate progress for user feedback
        let currentProgress = 0
        const progressInterval = setInterval(() => {
          currentProgress = Math.min(currentProgress + 25, 100)
          onUpdate({ uploadProgress: currentProgress })
          
          if (currentProgress >= 100) {
            clearInterval(progressInterval)
            onUpdate({ 
              readmeContent: readmeContent, // Save README content for Gemini AI
              isUploading: false, 
              uploadProgress: 100 
            })
            setReadmeUploaded(true)
          }
        }, 200)
      }
      
      reader.readAsText(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const canProceed = data.uploadType && (
    (data.uploadType === 'readme') && data.files.length > 0 ||
    (data.uploadType === 'zip') && data.zipUrl ||
    data.uploadType === 'github' && data.githubUrl ||
    data.uploadType === 'video' && data.videoUrl
  )

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Project</h2>
        <p className="text-gray-600">Choose how you want to share your project content</p>
      </div>

      {/* Upload Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* README Upload */}
        <div 
          className={`
            border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all
            ${data.uploadType === 'readme' 
              ? 'border-primary bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${dragActive ? 'border-primary bg-blue-50' : ''}
          `}
          onClick={() => {
            onUpdate({ uploadType: 'readme' })
            if (!readmeUploaded) {
              fileInputRef.current?.click()
            }
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <div className="mb-4">
              <FileText className="w-12 h-12 mx-auto text-gray-400" />
            </div>
            <h3 className="font-semibold mb-2">README File</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload your project&apos;s README.md file
            </p>
            
            {/* Upload Progress */}
            {data.isUploading && data.uploadType === 'readme' && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${data.uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">Uploading... {data.uploadProgress}%</p>
              </div>
            )}
            
            {/* Upload Complete */}
            {readmeUploaded && data.files.length > 0 && (
              <div className="text-sm text-primary font-medium flex items-center justify-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>{data.files[0].name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Landing Page URL */}
        <div 
          className={`
            border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all
            ${data.uploadType === 'zip' 
              ? 'border-primary bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
          onClick={() => onUpdate({ uploadType: 'zip' })}
        >
          <div className="text-center">
            <div className="mb-4">
              <Globe className="w-12 h-12 mx-auto text-gray-400" />
            </div>
            <h3 className="font-semibold mb-2">Project Landing Page</h3>
            <p className="text-sm text-gray-600 mb-4">
              Link to your project landing page
            </p>
          </div>
        </div>

        {/* GitHub Link */}
        <div 
          className={`
            border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all
            ${data.uploadType === 'github' 
              ? 'border-primary bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
          onClick={() => onUpdate({ uploadType: 'github' })}
        >
          <div className="text-center">
            <div className="mb-4">
              <Github className="w-12 h-12 mx-auto text-gray-400" />
            </div>
            <h3 className="font-semibold mb-2">GitHub Repository</h3>
            <p className="text-sm text-gray-600 mb-4">
              Link to your GitHub repository
            </p>
          </div>
        </div>

        {/* Video Link */}
        <div 
          className={`
            border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all
            ${data.uploadType === 'video' 
              ? 'border-primary bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
          onClick={() => onUpdate({ uploadType: 'video' })}
        >
          <div className="text-center">
            <div className="mb-4">
              <Video className="w-12 h-12 mx-auto text-gray-400" />
            </div>
            <h3 className="font-semibold mb-2">Demo Video</h3>
            <p className="text-sm text-gray-600 mb-4">
              Link to your project demo video
            </p>
            <span className="text-xs text-gray-500"></span>
          </div>
        </div>
      </div>

      {/* URL Inputs for ZIP/GitHub/Video */}
      {data.uploadType === 'zip' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Landing Page URL
          </label>
          <input
            type="url"
            value={data.zipUrl}
            onChange={(e) => onUpdate({ zipUrl: e.target.value })}
            placeholder="https://your-project-landing-page.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      )}
      
      {data.uploadType === 'github' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Repository URL
          </label>
          <input
            type="url"
            value={data.githubUrl}
            onChange={(e) => onUpdate({ githubUrl: e.target.value })}
            placeholder="https://github.com/username/repository"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      )}

      {data.uploadType === 'video' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video URL
          </label>
          <input
            type="url"
            value={data.videoUrl}
            onChange={(e) => onUpdate({ videoUrl: e.target.value })}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".md,.zip"
        onChange={handleFileInput}
        multiple
      />

      {/* Next Button */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`
            px-8 py-3 rounded-lg font-medium transition-all
            ${canProceed
              ? 'bg-primary text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Generate AI Content →
        </button>
      </div>
    </div>
  )
}