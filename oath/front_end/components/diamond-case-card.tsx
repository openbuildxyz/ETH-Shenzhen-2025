'use client'

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, ShieldCheck, Info } from "lucide-react"
import Link from "next/link"
import { GLBDiamondModel } from "./glb-diamond-model"

export interface DiamondCase {
  id: string
  title: string
  description: string
  modelPath: string
  creditValue: number
  category: string
  tags: string[]
  backgroundColor?: string
  lightColor?: string
  rotationSpeed?: number
  createdAt: Date
  endorseCount?: number
}

interface DiamondCaseCardProps {
  diamondCase: DiamondCase
  onEndorse?: (caseId: string) => void
  showDetails?: boolean
}

export function DiamondCaseCard({ diamondCase, onEndorse, showDetails = true }: DiamondCaseCardProps) {
  const [endorseModalOpen, setEndorseModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const getCreditLevel = (creditValue: number) => {
    if (creditValue >= 10000) return 4 // 传奇
    if (creditValue >= 5000) return 3 // 史诗
    if (creditValue >= 1000) return 2 // 稀有
    return 1 // 普通
  }

  const getCreditLevelText = (creditValue: number) => {
    if (creditValue >= 10000) return "传奇"
    if (creditValue >= 5000) return "史诗"
    if (creditValue >= 1000) return "稀有"
    return "普通"
  }

  const handleEndorse = () => {
    if (onEndorse) {
      onEndorse(diamondCase.id)
      setEndorseModalOpen(false)
    }
  }

  const creditLevel = getCreditLevel(diamondCase.creditValue)
  
  // 根据信用值动态计算钻石的大小和明亮度
  const size = 250 + (creditLevel * 40) // 钻石大小随信用等级增加（进一步增大）
  const brightness = 80 + (creditLevel * 20) // 明亮度随信用等级增加（更亮）

  return (
    <div className="credit-diamond-case-card flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
      {/* 钻石显示 */}
      <div className="mb-4 cursor-pointer h-[350px] w-[350px] flex items-center justify-center">
        <GLBDiamondModel
          modelPath={diamondCase.modelPath}
          size={size}
          brightness={brightness}
          backgroundColor="transparent"
          lightColor={diamondCase.lightColor}
          rotationSpeed={0.001} // 使用与信用钻石相同的旋转速度
          onClick={() => setDetailsModalOpen(true)}
        />
      </div>
      
      {/* 信用等级和标题 */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge className={`${
            creditLevel >= 4 ? "bg-purple-100 text-purple-800 border-purple-200" :
            creditLevel >= 3 ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
            creditLevel >= 2 ? "bg-blue-100 text-blue-800 border-blue-200" :
            "bg-green-100 text-green-800 border-green-200"
          }`}>
            {getCreditLevelText(diamondCase.creditValue)}
          </Badge>
          <Badge variant="outline">{diamondCase.category}</Badge>
        </div>
        <h3 className="text-lg font-medium line-clamp-2 mb-2">{diamondCase.title}</h3>
        <p className="text-sm text-slate-500 line-clamp-3">{diamondCase.description}</p>
      </div>

      {/* 标签和操作 */}
      <div className="w-full flex flex-col items-center space-y-3">
        <div className="flex flex-wrap gap-1 justify-center">
          {diamondCase.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
          {diamondCase.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">+{diamondCase.tags.length - 3}</Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-4 text-xs text-slate-500">
          {diamondCase.endorseCount !== undefined && (
            <span>{diamondCase.endorseCount} 背书</span>
          )}
          <span>信用值: {diamondCase.creditValue.toLocaleString()}</span>
        </div>

        {showDetails && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs w-full" 
            onClick={() => setDetailsModalOpen(true)}
          >
            <Eye className="h-3 w-3 mr-1" />
            查看详情
          </Button>
        )}
      </div>
      
      {/* 详情对话框 */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <Badge className={`${
                creditLevel >= 4 ? "bg-purple-100 text-purple-800 border-purple-200" :
                creditLevel >= 3 ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                creditLevel >= 2 ? "bg-blue-100 text-blue-800 border-blue-200" :
                "bg-green-100 text-green-800 border-green-200"
              }`}>
                {getCreditLevelText(diamondCase.creditValue)}
              </Badge>
              <Badge variant="outline">{diamondCase.category}</Badge>
            </div>
            <DialogTitle className="text-xl mt-2">{diamondCase.title}</DialogTitle>
            <DialogDescription>
              创建于 {formatDate(diamondCase.createdAt)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="h-[500px] w-full relative my-4 flex items-center justify-center">
            <GLBDiamondModel
              modelPath={diamondCase.modelPath}
              size={size * 2.5}
              brightness={brightness * 1.8}
              backgroundColor="transparent"
              lightColor={diamondCase.lightColor}
              rotationSpeed={0.0005} // 详情页更慢的旋转速度
              interactive={true}
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-slate-800 mb-1">案例描述</h3>
              <p className="text-slate-700">{diamondCase.description}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-slate-800 mb-1">标签</h3>
              <div className="flex flex-wrap gap-2">
                {diamondCase.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-slate-500">信用值</h3>
                <p className="font-medium text-green-600">{diamondCase.creditValue.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500">背书数量</h3>
                <p className="font-medium">{diamondCase.endorseCount || 0}</p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
              关闭
            </Button>
            <Button onClick={() => {
              setDetailsModalOpen(false)
              setEndorseModalOpen(true)
            }}>
              <ShieldCheck className="h-4 w-4 mr-2" />
              信任背书
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 信任背书对话框 */}
      <Dialog open={endorseModalOpen} onOpenChange={setEndorseModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>信任背书</DialogTitle>
            <DialogDescription>
              使用您的信用钻石背书此誓言，表示您对该誓言的信任和支持。
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <h4 className="font-medium mb-2">目标誓言</h4>
              <div className="flex items-center space-x-2">
                <Badge className={`${
                  creditLevel >= 4 ? "bg-purple-100 text-purple-800" :
                  creditLevel >= 3 ? "bg-yellow-100 text-yellow-800" :
                  creditLevel >= 2 ? "bg-blue-100 text-blue-800" :
                  "bg-green-100 text-green-800"
                }`}>{getCreditLevelText(diamondCase.creditValue)}</Badge>
                <span className="font-medium">{diamondCase.title}</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">信用值: {diamondCase.creditValue}</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="endorsement" className="text-sm font-medium">
                选择用于背书的信用钻石
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="选择您的信用钻石" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diamond1">Web3开发专家 (信用值: 5000)</SelectItem>
                  <SelectItem value="diamond2">社区管理者 (信用值: 1200)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                背书信用量
              </label>
              <Input
                id="amount"
                type="number"
                min={1}
                placeholder="输入您愿意背书的信用量"
              />
              <p className="text-xs text-slate-500">
                可用信用: 5000
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEndorseModalOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={handleEndorse}
              className="ml-2"
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              确认背书
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
