'use client'

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, ShieldCheck } from "lucide-react"
import type { OathNFT } from "@/lib/types"
import Link from "next/link"
import dynamic from "next/dynamic"

// 动态导入Three.js组件，避免SSR问题
const Diamond3D = dynamic(
  () => import("./diamond-3d").then(mod => mod.Diamond3D),
  { ssr: false }
)

interface CreditDiamondCardProps {
  nft: OathNFT
  onEndorse?: (targetNftId: string, endorserNftId: string, amount: number) => void
  myNfts?: OathNFT[]
}

export function CreditDiamondCard({ nft, onEndorse, myNfts = [] }: CreditDiamondCardProps) {
  const [endorseModalOpen, setEndorseModalOpen] = useState(false)
  const [selectedNftId, setSelectedNftId] = useState<string>("")
  const [endorseAmount, setEndorseAmount] = useState<number>(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
    if (onEndorse && selectedNftId && endorseAmount > 0) {
      onEndorse(nft.tokenId, selectedNftId, endorseAmount)
      setEndorseModalOpen(false)
      setSelectedNftId("")
      setEndorseAmount(0)
    }
  }

  const creditLevel = getCreditLevel(nft.creditValue)
  
  // 根据信用值动态计算钻石的大小和明亮度
  const size = 180 + (creditLevel * 30) // 钻石大小随信用等级增加（显著增大）
  const brightness = 70 + (creditLevel * 15) // 明亮度随信用等级增加（更亮）
  
  // 设置钻石颜色
  const diamondColor = creditLevel >= 4 
    ? "#9333EA" // 传奇 - 紫色
    : creditLevel >= 3 
      ? "#FACC15" // 史诗 - 黄色
      : creditLevel >= 2
        ? "#3B82F6" // 稀有 - 蓝色
        : "#22C55E" // 普通 - 绿色

  return (
    <div className="credit-diamond-card flex flex-col items-center p-4">
      {/* 钻石显示 */}
      <div className="mb-4 cursor-pointer h-[250px] w-[250px] flex items-center justify-center">
        {mounted && (
          <Diamond3D
            color={diamondColor}
            size={size}
            brightness={brightness}
            onClick={() => setEndorseModalOpen(true)}
          />
        )}
      </div>
      
      {/* 信用等级和标题 */}
      <div className="text-center">
        <Badge className={`mb-2 ${
          creditLevel >= 4 ? "bg-purple-100 text-purple-800 border-purple-200" :
          creditLevel >= 3 ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
          creditLevel >= 2 ? "bg-blue-100 text-blue-800 border-blue-200" :
          "bg-green-100 text-green-800 border-green-200"
        }`}>
          {getCreditLevelText(nft.creditValue)}
        </Badge>
        <h3 className="text-sm font-medium line-clamp-2">{nft.metadata.title}</h3>
        <p className="text-xs text-slate-500 mt-1">铸造于 {formatDate(nft.mintedAt)}</p>
      </div>

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
                }`}>{getCreditLevelText(nft.creditValue)}</Badge>
                <span className="font-medium">{nft.metadata.title}</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">信用值: {nft.creditValue}</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="endorsement" className="text-sm font-medium">
                选择用于背书的信用钻石
              </label>
              <Select 
                value={selectedNftId} 
                onValueChange={setSelectedNftId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择您的信用钻石" />
                </SelectTrigger>
                <SelectContent>
                  {myNfts.map((myNft) => (
                    <SelectItem key={myNft.tokenId} value={myNft.tokenId}>
                      {myNft.metadata.title} (信用值: {myNft.creditValue})
                    </SelectItem>
                  ))}
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
                value={endorseAmount || ""}
                onChange={(e) => setEndorseAmount(Number(e.target.value))}
                placeholder="输入您愿意背书的信用量"
              />
              {selectedNftId && (
                <p className="text-xs text-slate-500">
                  可用信用: {myNfts.find(n => n.tokenId === selectedNftId)?.creditValue || 0}
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEndorseModalOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={handleEndorse}
              disabled={!selectedNftId || endorseAmount <= 0 || 
                endorseAmount > (myNfts.find(n => n.tokenId === selectedNftId)?.creditValue || 0)}
              className="ml-2"
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              确认背书
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看详情按钮 */}
      <Button 
        asChild 
        variant="ghost" 
        size="sm" 
        className="mt-2 w-full text-xs"
      >
        <Link href={`/trust-diamond/${nft.tokenId}`}>
          <Eye className="h-3 w-3 mr-1" />
          查看详情
        </Link>
      </Button>
    </div>
  )
}