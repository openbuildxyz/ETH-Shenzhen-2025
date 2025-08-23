import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, ShieldCheck } from "lucide-react"
import type { OathNFT } from "@/lib/types"
import Link from "next/link"

interface CreditDiamondProps {
  nft: OathNFT
  onEndorse?: (targetNftId: string, endorserNftId: string, amount: number) => void
  myNfts?: OathNFT[]
}

export function CreditDiamond({ nft, onEndorse, myNfts = [] }: CreditDiamondProps) {
  const [endorseModalOpen, setEndorseModalOpen] = useState(false)
  const [selectedNftId, setSelectedNftId] = useState<string>("")
  const [endorseAmount, setEndorseAmount] = useState<number>(0)

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
  const size = 120 + (creditLevel * 20) // 钻石大小随信用等级增加
  const brightness = 60 + (creditLevel * 10) // 明亮度随信用等级增加
  
  // 钻石的CSS变量
  const diamondStyle = {
    "--diamond-size": `${size}px`,
    "--diamond-brightness": `${brightness}%`,
    "--diamond-color": creditLevel >= 4 
      ? "linear-gradient(135deg, rgba(147,51,234,0.9), rgba(79,70,229,0.7))" 
      : creditLevel >= 3 
        ? "linear-gradient(135deg, rgba(250,204,21,0.9), rgba(234,179,8,0.7))" 
        : creditLevel >= 2
          ? "linear-gradient(135deg, rgba(59,130,246,0.9), rgba(37,99,235,0.7))"
          : "linear-gradient(135deg, rgba(34,197,94,0.9), rgba(16,185,129,0.7))"
  } as React.CSSProperties

  return (
    <div className="credit-diamond-container relative flex flex-col items-center p-4">
      {/* 钻石形状 */}
      <div 
        className="credit-diamond relative mb-4 cursor-pointer group hover:transform hover:scale-105 transition-all duration-300"
        style={diamondStyle}
        title={nft.metadata.title}
        onClick={() => setEndorseModalOpen(true)}
      >
        <div className="diamond-face diamond-top"></div>
        <div className="diamond-face diamond-bottom"></div>
        <div className="diamond-face diamond-left"></div>
        <div className="diamond-face diamond-right"></div>
        <div className="diamond-face diamond-front"></div>
        <div className="diamond-face diamond-back"></div>
        
        {/* 钻石光芒效果 */}
        <div className="diamond-glow"></div>
        
        {/* 简单信息悬浮显示 */}
        <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center flex-col transition-opacity duration-300 z-10">
          <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
            信用值: {nft.creditValue}
          </span>
        </div>
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
