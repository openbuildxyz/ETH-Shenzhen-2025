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
import { Slider } from "@/components/ui/slider"
import { AlertCircle, Shield, Clock, DollarSign, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { OathCategory } from "@/lib/types"

interface OathFormData {
  title: string
  description: string
  category: OathCategory | ""
  collateralAmount: number
  swearAmount: number
  duration: number
  tags: string[]
}

export function OathForm() {
  const [formData, setFormData] = useState<OathFormData>({
    title: "",
    description: "",
    category: "",
    collateralAmount: 100,
    swearAmount: 50,
    duration: 30,
    tags: [],
  })

  const [tagInput, setTagInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categoryOptions = [
    { value: OathCategory.PROJECT_COMMITMENT, label: "项目承诺", description: "Web3项目维护、更新承诺" },
    { value: OathCategory.SERVICE_DELIVERY, label: "服务交付", description: "外卖配送、服务提供等" },
    { value: OathCategory.BUSINESS_PROMISE, label: "商业承诺", description: "企业间合作、商业协议" },
    { value: OathCategory.PERSONAL_GOAL, label: "个人目标", description: "个人成长、学习目标等" },
    { value: OathCategory.COMMUNITY_SERVICE, label: "社区服务", description: "社区贡献、公益活动" },
    { value: OathCategory.OTHER, label: "其他", description: "其他类型的承诺" },
  ]

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: 调用智能合约创建誓言
      console.log("Creating oath:", formData)

      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 重置表单
      setFormData({
        title: "",
        description: "",
        category: "",
        collateralAmount: 100,
        swearAmount: 50,
        duration: 30,
        tags: [],
      })

      alert("誓言创建成功！正在等待AI分类和验证...")
    } catch (error) {
      console.error("Error creating oath:", error)
      alert("创建失败，请重试")
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalCollateral = formData.collateralAmount + formData.swearAmount
  const isFormValid = formData.title && formData.description && formData.category

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="oath-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span>创建新誓言</span>
          </CardTitle>
          <CardDescription>通过超额抵押创建可信的承诺，完成后获得信用NFT</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">誓言标题 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="简洁明确地描述您的承诺"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">详细描述 *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="详细说明您要完成的事情、时间节点、验证方式等"
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category">誓言类别 *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value as OathCategory }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="选择誓言类别" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
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
            </div>

            {/* 抵押设置 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <Label className="text-base font-semibold">抵押设置</Label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="collateral">稳定币抵押 (USDT)</Label>
                  <div className="mt-2">
                    <Slider
                      value={[formData.collateralAmount]}
                      onValueChange={([value]) => setFormData((prev) => ({ ...prev, collateralAmount: value }))}
                      max={1000}
                      min={10}
                      step={10}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>$10</span>
                      <span className="font-medium">${formData.collateralAmount}</span>
                      <span>$1000</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="swear">SWEAR代币抵押</Label>
                  <div className="mt-2">
                    <Slider
                      value={[formData.swearAmount]}
                      onValueChange={([value]) => setFormData((prev) => ({ ...prev, swearAmount: value }))}
                      max={200}
                      min={10}
                      step={5}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>10 SWEAR</span>
                      <span className="font-medium">{formData.swearAmount} SWEAR</span>
                      <span>200 SWEAR</span>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  总抵押价值: <strong>${totalCollateral}</strong> (超额抵押确保承诺可信度)
                </AlertDescription>
              </Alert>
            </div>

            {/* 时间设置 */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <Label className="text-base font-semibold">完成期限</Label>
              </div>
              <div>
                <Slider
                  value={[formData.duration]}
                  onValueChange={([value]) => setFormData((prev) => ({ ...prev, duration: value }))}
                  max={365}
                  min={1}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-slate-500">
                  <span>1天</span>
                  <span className="font-medium">{formData.duration}天</span>
                  <span>365天</span>
                </div>
              </div>
            </div>

            {/* 标签 */}
            <div>
              <Label htmlFor="tags">标签 (便于分类和搜索)</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="添加标签"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  添加
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* 提交按钮 */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full oath-gradient text-white hover:opacity-90"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                    创建中...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    创建誓言
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
