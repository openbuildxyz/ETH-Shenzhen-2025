'use client'

import { useRef, useState } from 'react'
import { ProductData } from './ProductUploadFlow'
import { FileText, Globe, Github, Video, CheckCircle, FileIcon, Loader2 } from 'lucide-react'
import { uploadFileToDify } from '@/lib/dify'
import { parsePDF, isPDFFile, cleanPDFText, extractPDFSummary } from '@/lib/pdf-parser'

interface FileUploadStepProps {
  data: ProductData
  onUpdate: (updates: Partial<ProductData>) => void
  onNext: () => void
}

export function FileUploadStepWithPDF({ data, onUpdate, onNext }: FileUploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [readmeUploaded, setReadmeUploaded] = useState(false)
  const [pdfProcessing, setPdfProcessing] = useState(false)
  const [pdfProgress, setPdfProgress] = useState('')
  const [showTextInput, setShowTextInput] = useState(false)
  const [textContent, setTextContent] = useState('')

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

    try {
      // 判断文件类型
      let uploadType: 'readme' | 'pdf' | 'zip'
      let content = ''

      if (isPDFFile(file)) {
        // PDF文件处理
        uploadType = 'readme' // 使用readme类型以启用AI处理
        setPdfProcessing(true)
        setPdfProgress('Parsing PDF file...')
        
        // Parse PDF
        const pdfResult = await parsePDF(file)
        
        setPdfProgress('Extracting document content...')
        content = cleanPDFText(pdfResult.text)
        
        // If content is too long, extract summary
        if (content.length > 5000) {
          setPdfProgress('Generating document summary...')
          const summary = extractPDFSummary(content, 2000)
          content = `# ${pdfResult.title || file.name.replace('.pdf', '')} Document Summary\n\n${summary}\n\n--- Full content extracted, ${pdfResult.numPages} pages ---`
        } else {
          content = `# ${pdfResult.title || file.name.replace('.pdf', '')} Document Content\n\n${content}`
        }
        
        setPdfProgress('PDF processing completed!')
        
      } else if (file.name.endsWith('.zip')) {
        uploadType = 'zip'
      } else {
        // README或其他文本文件
        uploadType = 'readme'
        const text = await file.text()
        content = text
      }

      onUpdate({ files: fileList, uploadType, readmeContent: content })

      // 如果是README类型的文件（包括PDF），尝试上传到Dify
      if (uploadType === 'readme') {
        try {
          onUpdate({ isUploading: true, uploadProgress: 0 })
          
          // 模拟上传进度
          let currentProgress = data.uploadProgress || 0
          const progressInterval = setInterval(() => {
            currentProgress = Math.min(currentProgress + 10, 90)
            onUpdate({ uploadProgress: currentProgress })
          }, 200)

          // 创建文本文件用于上传（将PDF内容转换为文本文件）
          const textFile = new File([content], file.name.replace('.pdf', '.txt'), {
            type: 'text/plain'
          })

          const result = await uploadFileToDify(textFile, 'user')
          clearInterval(progressInterval)
          
          onUpdate({ 
            difyFileId: result.id,
            isUploading: false,
            uploadProgress: 100
          })
          
          setReadmeUploaded(true)
          
        } catch (error) {
          console.error('Failed to upload to Dify:', error)
          onUpdate({ isUploading: false, uploadProgress: 0 })
          // 即使Dify上传失败，也可以继续使用本地内容
          setReadmeUploaded(true)
        }
      }

    } catch (error) {
      console.error('File processing failed:', error)
      
      // Show friendly error message for PDF parsing issues
      if (isPDFFile(file) && error instanceof Error) {
        const errorMessage = error.message.includes('worker') || error.message.includes('fetch') 
          ? 'PDF parsing is temporarily unavailable. Please copy PDF content to a .txt or .md file, or use text format documents.'
          : error.message
        
        alert(`PDF processing failed: ${errorMessage}`)
      } else {
        alert(`File processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } finally {
      setPdfProcessing(false)
      setPdfProgress('')
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const uploadOptions = [
    {
      id: 'readme',
      title: 'README / PDF Document',
      description: 'Upload README.md file or PDF document for AI analysis',
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      acceptedFiles: '.md,.txt,.pdf',
      fileTypes: 'Markdown, Text, or PDF files'
    },
    {
      id: 'zip',
      title: 'Project Package',
      description: 'Upload a ZIP file containing your complete project',
      icon: FileIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50', 
      borderColor: 'border-purple-200',
      acceptedFiles: '.zip',
      fileTypes: 'ZIP archives'
    },
    {
      id: 'github',
      title: 'GitHub Repository',
      description: 'Import directly from your GitHub repository',
      icon: Github,
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      id: 'video',
      title: 'Video Demo',
      description: 'Add a video demonstration or tutorial',
      icon: Video,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ]

  const canProceed = data.uploadType !== null && (
    (data.uploadType === 'readme' && data.files.length > 0) ||
    (data.uploadType === 'zip' && data.files.length > 0) ||
    (data.uploadType === 'github' && data.githubUrl.trim() !== '') ||
    (data.uploadType === 'video' && data.videoUrl.trim() !== '')
  )

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Content</h2>
        <p className="text-gray-600">Choose how you&apos;d like to share your project with the world</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {uploadOptions.map((option) => (
          <div
            key={option.id}
            className={`
              relative cursor-pointer p-6 rounded-xl border-2 transition-all
              ${data.uploadType === option.id 
                ? `${option.borderColor} ${option.bgColor} ring-2 ring-blue-500 ring-opacity-20` 
                : 'border-gray-200 hover:border-gray-300 bg-white'
              }
            `}
            onClick={() => {
              if (option.id === 'readme' || option.id === 'zip') {
                onUpdate({ uploadType: option.id as 'readme' | 'zip', githubUrl: '', videoUrl: '' })
                setTimeout(() => handleUploadClick(), 100)
              } else {
                onUpdate({ uploadType: option.id as 'github' | 'video', files: [] })
              }
            }}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${option.bgColor}`}>
                <option.icon className={`w-6 h-6 ${option.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{option.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                {option.fileTypes && (
                  <p className="text-xs text-gray-500 mt-2">Accepts: {option.fileTypes}</p>
                )}
              </div>
              {data.uploadType === option.id && (
                <CheckCircle className="w-5 h-5 text-blue-500" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* File Upload Area */}
      {(data.uploadType === 'readme' || data.uploadType === 'zip') && (
        <div
          className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-colors
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${data.files.length > 0 ? 'bg-[#f9fafc] border-gray-300' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileInput}
            accept={data.uploadType === 'readme' ? '.md,.txt,.pdf' : '.zip'}
            multiple={false}
          />
          
          {pdfProcessing ? (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-500" />
              <div>
                <p className="text-lg font-medium text-gray-900">Processing PDF...</p>
                <p className="text-sm text-gray-600">{pdfProgress}</p>
              </div>
            </div>
          ) : data.files.length > 0 ? (
            <div className="space-y-4">
              <CheckCircle className="w-12 h-12 mx-auto text-blue-500" />
              <div>
                <p className="text-lg font-medium text-blue-700">
                  {data.files[0].name} uploaded successfully
                </p>
                <p className="text-sm text-gray-600">
                  {isPDFFile(data.files[0]) ? 'PDF content extracted and ready for AI analysis' : 'Ready for AI analysis'}
                </p>
                {data.readmeContent && (
                  <p className="text-xs text-gray-500 mt-2">
                    Content length: {data.readmeContent.length} characters
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                {data.uploadType === 'readme' ? (
                  <FileText className="w-12 h-12 text-gray-400" />
                ) : (
                  <FileIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {data.uploadType === 'readme' 
                    ? 'Drop your README.md or PDF file here' 
                    : 'Drop your ZIP file here'
                  }
                </p>
                <p className="text-sm text-gray-600">
                  {data.uploadType === 'readme' 
                    ? 'Supports .md, .txt, and .pdf files for AI content generation' 
                    : 'ZIP files will be processed for project analysis'
                  }
                </p>
              </div>
            </div>
          )}
          
          {data.isUploading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${data.uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Uploading... {data.uploadProgress}%</p>
            </div>
          )}
        </div>
      )}

      {/* GitHub URL Input */}
      {data.uploadType === 'github' && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">GitHub Repository URL</label>
          <input
            type="url"
            placeholder="https://github.com/username/repository"
            value={data.githubUrl}
            onChange={(e) => onUpdate({ githubUrl: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500">
            Enter the complete URL to your public GitHub repository
          </p>
        </div>
      )}

      {/* Video URL Input */}
      {data.uploadType === 'video' && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Video URL</label>
          <input
            type="url"
            placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
            value={data.videoUrl}
            onChange={(e) => onUpdate({ videoUrl: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500">
            YouTube, Vimeo, or other video platform links supported
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-end">
        {canProceed && (
          <button
            onClick={onNext}
            className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Next: Generate Content →
          </button>
        )}
      </div>
    </div>
  )
}