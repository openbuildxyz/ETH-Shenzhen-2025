"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Brain, FileText, ImageIcon, PenTool, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react"
import type { OathVerification } from "@/lib/ai"

interface AIVerificationProps {
  oathId: string
  oathTitle: string
  oathDescription: string
  onVerificationComplete?: (result: OathVerification) => void
}

export function AIVerification({ oathId, oathTitle, oathDescription, onVerificationComplete }: AIVerificationProps) {
  const [textEvidence, setTextEvidence] = useState("")
  const [imageEvidence, setImageEvidence] = useState("")
  const [signatureEvidence, setSignatureEvidence] = useState("")
  const [additionalContext, setAdditionalContext] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<OathVerification | null>(null)

  const handleVerification = async () => {
    if (!textEvidence.trim()) {
      alert("请提供文字证据")
      return
    }

    setIsVerifying(true)

    try {
      const response = await fetch("/api/ai/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oathTitle,
          oathDescription,
          textEvidence,
          imageEvidence: imageEvidence || undefined,
          signatureEvidence: signatureEvidence || undefined,
          additionalContext: additionalContext || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setVerificationResult(data.data)
        onVerificationComplete?.(data.data)
      } else {
        alert("验证失败: " + data.error)
      }
    } catch (error) {
      console.error("验证请求失败:", error)
      alert("验证请求失败，请重试")
    } finally {
      setIsVerifying(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "disputed":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "已完成"
      case "failed":
        return "未完成"
      case "disputed":
        return "存在争议"
      case "insufficient_evidence":
        return "证据不足"
      default:
        return "未知状态"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "disputed":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="oath-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <span>AI智能验证</span>
          </CardTitle>
          <CardDescription>提交证据让AI初步验证誓言完成情况，结果将作为仲裁参考</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 誓言信息 */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-900 mb-2">待验证誓言</h4>
            <p className="text-sm text-slate-600 mb-1">
              <strong>标题:</strong> {oathTitle}
            </p>
            <p className="text-sm text-slate-600">
              <strong>描述:</strong> {oathDescription}
            </p>
          </div>

          {/* 证据提交 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="textEvidence" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>文字证据 *</span>
              </Label>
              <Textarea
                id="textEvidence"
                value={textEvidence}
                onChange={(e) => setTextEvidence(e.target.value)}
                placeholder="详细描述您如何完成了这个誓言，包括具体的行动、时间、结果等..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="imageEvidence" className="flex items-center space-x-2">
                <ImageIcon className="h-4 w-4" />
                <span>图片证据描述</span>
              </Label>
              <Textarea
                id="imageEvidence"
                value={imageEvidence}
                onChange={(e) => setImageEvidence(e.target.value)}
                placeholder="如果您有图片证据，请描述图片内容（暂不支持直接上传图片）"
                rows={2}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="signatureEvidence" className="flex items-center space-x-2">
                <PenTool className="h-4 w-4" />
                <span>多签签名证据</span>
              </Label>
              <Textarea
                id="signatureEvidence"
                value={signatureEvidence}
                onChange={(e) => setSignatureEvidence(e.target.value)}
                placeholder="如果有多方签名确认，请提供签名哈希或交易ID"
                rows={2}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="additionalContext">补充信息</Label>
              <Textarea
                id="additionalContext"
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="任何其他有助于验证的补充信息"
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          {/* 提交按钮 */}
          <Button
            onClick={handleVerification}
            disabled={!textEvidence.trim() || isVerifying}
            className="w-full"
            size="lg"
          >
            {isVerifying ? (
              <>
                <Brain className="mr-2 h-5 w-5 animate-pulse" />
                AI验证中...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-5 w-5" />
                开始AI验证
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 验证结果 */}
      {verificationResult && (
        <Card className="oath-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(verificationResult.status)}
              <span>AI验证结果</span>
              <Badge className={getStatusColor(verificationResult.status)}>
                {getStatusText(verificationResult.status)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 置信度 */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>AI置信度</span>
                <span className="font-medium">{verificationResult.confidence}%</span>
              </div>
              <Progress value={verificationResult.confidence} className="h-2" />
            </div>

            {/* 分析理由 */}
            <div>
              <h4 className="font-medium text-slate-900 mb-2">分析理由</h4>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{verificationResult.reasoning}</p>
            </div>

            {/* 证据分析 */}
            <div>
              <h4 className="font-medium text-slate-900 mb-2">证据分析</h4>
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>文字证据:</strong>
                  <p className="text-slate-600 mt-1">{verificationResult.evidenceAnalysis.textEvidence}</p>
                </div>
                {verificationResult.evidenceAnalysis.imageEvidence && (
                  <div className="text-sm">
                    <strong>图片证据:</strong>
                    <p className="text-slate-600 mt-1">{verificationResult.evidenceAnalysis.imageEvidence}</p>
                  </div>
                )}
                {verificationResult.evidenceAnalysis.signatureEvidence && (
                  <div className="text-sm">
                    <strong>签名证据:</strong>
                    <p className="text-slate-600 mt-1">{verificationResult.evidenceAnalysis.signatureEvidence}</p>
                  </div>
                )}
                <div className="text-sm">
                  <strong>综合评分:</strong> {verificationResult.evidenceAnalysis.overallScore}/100
                </div>
              </div>
            </div>

            {/* 建议 */}
            {verificationResult.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2">给仲裁员的建议</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  {verificationResult.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 警告信息 */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>AI验证结果仅供参考，最终判决需要人工仲裁员综合考虑所有证据做出决定。</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
