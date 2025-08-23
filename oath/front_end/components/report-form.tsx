"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Plus, X, FileText, Image, LinkIcon, Hash } from "lucide-react"
import { ReportType, type ReportEvidence } from "@/lib/types"

interface ReportFormProps {
  oathId?: string
  oathTitle?: string
  onSubmit?: (reportData: any) => void
}

export function ReportForm({ oathId, oathTitle, onSubmit }: ReportFormProps) {
  const [reportType, setReportType] = useState<ReportType | "">("")
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [evidence, setEvidence] = useState<Omit<ReportEvidence, "id" | "submittedAt">[]>([])
  const [newEvidence, setNewEvidence] = useState({
    type: "text" as const,
    content: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reportTypeOptions = [
    {
      value: ReportType.OATH_VIOLATION,
      label: "誓言违约",
      description: "誓言创建者未按承诺完成任务",
    },
    {
      value: ReportType.FALSE_EVIDENCE,
      label: "虚假证据",
      description: "提交的完成证据存在造假",
    },
    {
      value: ReportType.SPAM_OATH,
      label: "垃圾誓言",
      description: "无意义或恶意创建的誓言",
    },
    {
      value: ReportType.FRAUDULENT_BEHAVIOR,
      label: "欺诈行为",
      description: "故意欺骗或误导其他用户",
    },
    {
      value: ReportType.SYSTEM_ABUSE,
      label: "系统滥用",
      description: "滥用平台功能或规则漏洞",
    },
    {
      value: ReportType.OTHER,
      label: "其他",
      description: "其他需要关注的问题",
    },
  ]

  const addEvidence = () => {
    if (!newEvidence.content.trim()) return

    setEvidence((prev) => [
      ...prev,
      {
        type: newEvidence.type,
        content: newEvidence.content.trim(),
        description: newEvidence.description.trim() || undefined,
      },
    ])

    setNewEvidence({
      type: "text",
      content: "",
      description: "",
    })
  }

  const removeEvidence = (index: number) => {
    setEvidence((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reportType || !reason.trim() || !description.trim()) {
      alert("请填写所有必填字段")
      return
    }

    setIsSubmitting(true)

    try {
      const reportData = {
        oathId,
        reportType,
        reason: reason.trim(),
        description: description.trim(),
        evidence,
      }

      // TODO: 调用API提交举报
      console.log("提交举报:", reportData)

      onSubmit?.(reportData)

      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 2000))

      alert("举报提交成功！我们会尽快审核您的举报。")

      // 重置表单
      setReportType("")
      setReason("")
      setDescription("")
      setEvidence([])
    } catch (error) {
      console.error("提交举报失败:", error)
      alert("提交失败，请重试")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="h-4 w-4" />
      case "image":
        return <Image className="h-4 w-4" />
      case "link":
        return <LinkIcon className="h-4 w-4" />
      case "transaction":
        return <Hash className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <Card className="oath-shadow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <span>提交举报</span>
        </CardTitle>
        <CardDescription>{oathTitle ? `举报誓言: ${oathTitle}` : "举报违规行为，维护平台秩序"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 举报类型 */}
          <div>
            <Label htmlFor="reportType">举报类型 *</Label>
            <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="选择举报类型" />
              </SelectTrigger>
              <SelectContent>
                {reportTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-slate-500">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 举报原因 */}
          <div>
            <Label htmlFor="reason">举报原因 *</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="简要说明举报原因"
              className="mt-1"
            />
          </div>

          {/* 详细描述 */}
          <div>
            <Label htmlFor="description">详细描述 *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="详细描述违规行为，包括时间、具体情况等..."
              rows={4}
              className="mt-1"
            />
          </div>

          {/* 证据提交 */}
          <div className="space-y-4">
            <Label>支持证据</Label>

            {/* 现有证据列表 */}
            {evidence.length > 0 && (
              <div className="space-y-2">
                {evidence.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      {getEvidenceIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {item.type === "text"
                            ? "文字"
                            : item.type === "image"
                              ? "图片"
                              : item.type === "link"
                                ? "链接"
                                : "交易"}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-900 break-words">{item.content}</p>
                      {item.description && <p className="text-xs text-slate-500 mt-1">{item.description}</p>}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEvidence(index)}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* 添加新证据 */}
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex space-x-3">
                <Select
                  value={newEvidence.type}
                  onValueChange={(value) => setNewEvidence((prev) => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">文字</SelectItem>
                    <SelectItem value="image">图片</SelectItem>
                    <SelectItem value="link">链接</SelectItem>
                    <SelectItem value="transaction">交易</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  value={newEvidence.content}
                  onChange={(e) => setNewEvidence((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder={
                    newEvidence.type === "text"
                      ? "输入文字证据"
                      : newEvidence.type === "image"
                        ? "图片描述或链接"
                        : newEvidence.type === "link"
                          ? "相关链接"
                          : "交易哈希"
                  }
                  className="flex-1"
                />

                <Button type="button" variant="outline" onClick={addEvidence} disabled={!newEvidence.content.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Input
                value={newEvidence.description}
                onChange={(e) => setNewEvidence((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="证据说明（可选）"
                className="text-sm"
              />
            </div>
          </div>

          {/* 警告信息 */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              请确保举报内容真实有效。恶意举报或虚假举报可能会影响您的信用分数。成功举报违规行为将获得奖励。
            </AlertDescription>
          </Alert>

          {/* 提交按钮 */}
          <Button
            type="submit"
            disabled={!reportType || !reason.trim() || !description.trim() || isSubmitting}
            className="w-full oath-gradient text-white hover:opacity-90"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <AlertTriangle className="mr-2 h-5 w-5 animate-pulse" />
                提交中...
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-5 w-5" />
                提交举报
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
