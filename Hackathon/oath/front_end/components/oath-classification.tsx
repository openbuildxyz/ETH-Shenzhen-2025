"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, RefreshCw, CheckCircle, Target } from "lucide-react"
import type { OathClassification } from "@/lib/ai"

interface OathClassificationProps {
  title: string
  description: string
  category: string
  tags: string[]
  onClassificationComplete?: (result: OathClassification) => void
}

export function OathClassificationComponent({
  title,
  description,
  category,
  tags,
  onClassificationComplete,
}: OathClassificationProps) {
  const [isClassifying, setIsClassifying] = useState(false)
  const [classification, setClassification] = useState<OathClassification | null>(null)
  const [autoClassified, setAutoClassified] = useState(false)

  // 自动分类（当内容变化时）
  useEffect(() => {
    if (title && description && !autoClassified) {
      handleClassification()
      setAutoClassified(true)
    }
  }, [title, description, autoClassified])

  const handleClassification = async () => {
    if (!title || !description) return

    setIsClassifying(true)

    try {
      const response = await fetch("/api/ai/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          category,
          tags,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setClassification(data.data)
        onClassificationComplete?.(data.data)
      } else {
        console.error("分类失败:", data.error)
      }
    } catch (error) {
      console.error("分类请求失败:", error)
    } finally {
      setIsClassifying(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRiskText = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "低风险"
      case "medium":
        return "中等风险"
      case "high":
        return "高风险"
      default:
        return "未知风险"
    }
  }

  if (!title || !description) {
    return null
  }

  return (
    <Card className="oath-shadow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-purple-600" />
          <span>AI智能分类</span>
          {isClassifying && <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />}
        </CardTitle>
        <CardDescription>AI正在分析您的誓言并提供专业建议</CardDescription>
      </CardHeader>
      <CardContent>
        {isClassifying ? (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-600">AI正在分析您的誓言...</p>
          </div>
        ) : classification ? (
          <div className="space-y-4">
            {/* 分类结果 */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900">AI分类结果</h4>
                <p className="text-sm text-slate-600">{classification.category}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getRiskColor(classification.riskLevel)}>
                  {getRiskText(classification.riskLevel)}
                </Badge>
              </div>
            </div>

            {/* 可信度评分 */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span>可信度评分</span>
                </span>
                <span className="font-medium">{classification.credibilityScore}/100</span>
              </div>
              <Progress value={classification.credibilityScore} className="h-2" />
            </div>

            {/* 分析理由 */}
            <div>
              <h4 className="font-medium text-slate-900 mb-2">AI分析</h4>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{classification.reasoning}</p>
            </div>

            {/* 建议标签 */}
            {classification.suggestedTags.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2">建议标签</h4>
                <div className="flex flex-wrap gap-2">
                  {classification.suggestedTags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 验证方法建议 */}
            {classification.verificationMethods.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2">建议验证方法</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  {classification.verificationMethods.map((method, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{method}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 重新分类按钮 */}
            <Button variant="outline" onClick={handleClassification} className="w-full bg-transparent" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              重新分类
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <Button onClick={handleClassification} variant="outline">
              <Brain className="h-4 w-4 mr-2" />
              开始AI分类
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
