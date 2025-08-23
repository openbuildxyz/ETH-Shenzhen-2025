'use client'

import { useState } from 'react'
import { Plus, X, Edit3 } from 'lucide-react'

interface ImageItem {
  url: string
  alt: string
}

interface MultiImageEditorProps {
  images: ImageItem[]
  onChange: (images: ImageItem[]) => void
  isEditing: boolean
  onEditToggle: () => void
}

export function MultiImageEditor({ images, onChange, isEditing, onEditToggle }: MultiImageEditorProps) {
  const [newImageUrl, setNewImageUrl] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingUrl, setEditingUrl] = useState('')

  const addImage = () => {
    if (newImageUrl.trim()) {
      const newImage: ImageItem = {
        url: newImageUrl.trim(),
        alt: `Product Image ${images.length + 1}`
      }
      onChange([...images, newImage])
      setNewImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const startEditImage = (index: number) => {
    setEditingIndex(index)
    setEditingUrl(images[index].url)
  }

  const saveEditImage = () => {
    if (editingIndex !== null && editingUrl.trim()) {
      const newImages = [...images]
      newImages[editingIndex] = {
        ...newImages[editingIndex],
        url: editingUrl.trim()
      }
      onChange(newImages)
      setEditingIndex(null)
      setEditingUrl('')
    }
  }

  const cancelEditImage = () => {
    setEditingIndex(null)
    setEditingUrl('')
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">Product Images ({images.length})</h4>
        {!isEditing && (
          <button
            onClick={onEditToggle}
            className="text-primary hover:text-blue-600 text-sm font-medium"
          >
            Edit
          </button>
        )}
      </div>

      {!isEditing ? (
        // 显示模式
        <div className="space-y-2">
          {images.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img 
                    src={image.url} 
                    alt={image.alt}
                    className="w-full h-20 rounded object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4'
                    }}
                  />
                  <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No images uploaded</p>
          )}
        </div>
      ) : (
        // 编辑模式
        <div className="space-y-4">
          {/* 现有图片列表 */}
          <div className="space-y-2">
            {images.map((image, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 border rounded">
                <img 
                  src={image.url} 
                  alt={image.alt}
                  className="w-12 h-12 rounded object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://avatars.githubusercontent.com/u/190834534?s=200&v=4'
                  }}
                />
                
                {editingIndex === index ? (
                  <div className="flex-1 flex space-x-2">
                    <input
                      type="url"
                      value={editingUrl}
                      onChange={(e) => setEditingUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      onClick={saveEditImage}
                      className="px-2 py-1 bg-primary text-white rounded text-sm hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditImage}
                      className="px-2 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 break-all">{image.url}</p>
                      <p className="text-xs text-gray-500">Image {index + 1}</p>
                    </div>
                    <button
                      onClick={() => startEditImage(index)}
                      className="p-1 text-gray-500 hover:text-primary"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeImage(index)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* 添加新图片 */}
          <div className="border-t pt-3">
            <div className="flex space-x-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/new-image.jpg"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addImage()
                  }
                }}
              />
              <button
                onClick={addImage}
                disabled={!newImageUrl.trim()}
                className="px-3 py-2 bg-primary text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* 编辑完成按钮 */}
          <div className="flex justify-end pt-2 border-t">
            <button
              onClick={onEditToggle}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Done Editing
            </button>
          </div>
        </div>
      )}
    </div>
  )
}