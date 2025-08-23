"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Shield, Calendar, ArrowLeft, ShieldCheck, AlertTriangle, ExternalLink } from "lucide-react"
import type { OathNFT, Endorsement } from "@/lib/types"
import dynamic from "next/dynamic"

// 动态导入Three.js组件，避免SSR问题
const DiamondDetail3D = dynamic(
  () => import("@/components/diamond-detail-3d").then(mod => mod.DiamondDetail3D),
  { ssr: false }
)

// 模拟NFT数据
const mockNFTs: OathNFT[] = [
  {
    tokenId: "1001",
    oathId: "oath-001",
    creditValue: 15000,
    owner: "0x1234...5678",
    mintedAt: new Date("2024-01-20"),
    metadata: {
      title: "DeFi项目维护大师",
      description: "成功维护DeFi项目2年，展现了卓越的项目管理能力和技术实力",
      image: "/nft/defi-master.png",
      attributes: [
        { trait_type: "类型", value: "项目承诺" },
        { trait_type: "持续时间", value: "730天" },
        { trait_type: "抵押金额", value: "$75,000" },
        { trait_type: "稀有度", value: "传奇" },
        { trait_type: "完成度", value: "100%" },
      ],
      originalOath: {
        content: "我承诺将持续维护和更新该DeFi项目至少2年时间，确保系统安全和稳定运行，并按照社区治理决议实施功能更新。",
        category: "project_commitment",
        collateralAmount: "$75,000",
        deadline: new Date("2025-01-20"),
      },
      completedAt: new Date("2024-01-15"),
    },
    endorsements: [
      {
        id: "end-001",
        endorserNftId: "2001",
        targetNftId: "1001",
        creditAmount: 2000,
        timestamp: new Date("2024-02-10"),
        active: true,
        transactionHash: "0xabc...123",
      },
      {
        id: "end-002",
        endorserNftId: "2002",
        targetNftId: "1001",
        creditAmount: 500,
        timestamp: new Date("2024-03-05"),
        active: true,
        transactionHash: "0xdef...456",
      },
    ],
  },
  {
    tokenId: "1002",
    oathId: "oath-002",
    creditValue: 2500,
    owner: "0x9876...4321",
    mintedAt: new Date("2024-12-01"),
    metadata: {
      title: "安全审计专家",
      description: "高质量完成智能合约安全审计，保障了项目的安全性",
      image: "/nft/audit-expert.png",
      attributes: [
        { trait_type: "类型", value: "商业承诺" },
        { trait_type: "持续时间", value: "15天" },
        { trait_type: "抵押金额", value: "$7,500" },
        { trait_type: "稀有度", value: "稀有" },
        { trait_type: "完成度", value: "100%" },
      ],
      originalOath: {
        content: "我承诺在15天内完成该项目的全面安全审计，并提供详细的安全报告和改进建议。",
        category: "business_agreement",
        collateralAmount: "$7,500",
        deadline: new Date("2024-12-16"),
      },
      completedAt: new Date("2024-12-12"),
    },
    endorsements: [],
  },
  {
    tokenId: "1003",
    oathId: "oath-003",
    creditValue: 500,
    owner: "0xabcd...efgh",
    mintedAt: new Date("2024-11-15"),
    metadata: {
      title: "配送服务之星",
      description: "连续30天准时完成外卖配送，获得客户一致好评",
      image: "/nft/delivery-star.png",
      attributes: [
        { trait_type: "类型", value: "服务交付" },
        { trait_type: "持续时间", value: "30天" },
        { trait_type: "抵押金额", value: "$600" },
        { trait_type: "稀有度", value: "普通" },
        { trait_type: "完成度", value: "100%" },
      ],
      originalOath: {
        content: "我承诺连续30天准时完成外卖配送，确保食品质量和服务态度，获得至少4.8分以上的客户评价。",
        category: "delivery_service",
        collateralAmount: "$600",
        deadline: new Date("2024-12-15"),
      },
      completedAt: new Date("2024-12-15"),
    },
    endorsements: [],
  },
]

// 模拟的NFT持有者数据
const mockOwners: Record<string, { name: string, address: string }> = {
  "2001": { name: "Web3开发者Alex", address: "0x5678...9012" },
  "2002": { name: "社区管理员Sarah", address: "0x3456...7890" },
}

export default function DiamondDetailPage() {
  const { tokenId } = useParams()
  const [nft, setNft] = useState<OathNFT | null>(null)
  const [loading, setLoading] = useState(true)
  const [endorsers, setEndorsers] = useState<Record<string, { name: string, address: string }>>({})
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // 模拟API调用
    setTimeout(() => {
      const foundNft = mockNFTs.find((n) => n.tokenId === tokenId)
      setNft(foundNft || null)
      setEndorsers(mockOwners)
      setLoading(false)
    }, 1000)
  }, [tokenId])

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const getCreditLevel = (creditValue: number) => {
    if (creditValue >= 10000) return "legendary"
    if (creditValue >= 5000) return "epic"
    if (creditValue >= 1000) return "rare"
    return "common"
  }

  const getCreditLevelText = (creditValue: number) => {
    if (creditValue >= 10000) return "传奇"
    if (creditValue >= 5000) return "史诗"
    if (creditValue >= 1000) return "稀有"
    return "普通"
  }

  const getCreditLevelColor = (creditValue: number) => {
    if (creditValue >= 10000) return "bg-purple-100 text-purple-800 border-purple-200"
    if (creditValue >= 5000) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    if (creditValue >= 1000) return "bg-blue-100 text-blue-800 border-blue-200"
    return "bg-green-100 text-green-800 border-green-200"
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">加载信用钻石信息中...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!nft) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Link href="/trust-diamond" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回信用钻石列表
          </Link>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">找不到信用钻石</h2>
              <p className="text-slate-600 mb-6">无法找到ID为 {tokenId} 的信用钻石</p>
              <Button asChild>
                <Link href="/trust-diamond">返回列表</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const creditLevel = getCreditLevel(nft.creditValue)
  const totalEndorsedCredit = (nft.endorsements || []).reduce((sum, e) => sum + e.creditAmount, 0)
  
  // 计算钻石的大小和亮度（显著增大）
  const size = 360 + (creditLevel === "legendary" ? 90 : creditLevel === "epic" ? 60 : creditLevel === "rare" ? 30 : 0)
  const brightness = 80 + (creditLevel === "legendary" ? 40 : creditLevel === "epic" ? 30 : creditLevel === "rare" ? 20 : 0)
  
  // 设置钻石颜色
  const diamondColor = creditLevel === "legendary" 
    ? "#9333EA" // 传奇 - 紫色
    : creditLevel === "epic" 
      ? "#FACC15" // 史诗 - 黄色
      : creditLevel === "rare"
        ? "#3B82F6" // 稀有 - 蓝色
        : "#22C55E" // 普通 - 绿色

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Link href="/trust-diamond" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回信用钻石列表
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* 钻石展示区 */}
          <div className="flex flex-col items-center">
            <div className="mb-6 h-[450px] w-full flex items-center justify-center">
              {isMounted && (
                <DiamondDetail3D
                  color={diamondColor}
                  size={size}
                  brightness={brightness}
                />
              )}
            </div>

            <Badge className={`mb-2 ${getCreditLevelColor(nft.creditValue)}`}>
              {getCreditLevelText(nft.creditValue)}
            </Badge>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">{nft.metadata.title}</h1>
              <p className="text-sm text-slate-500 mt-1">钻石ID: {nft.tokenId}</p>
            </div>

            <div className="w-full space-y-2">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">信用价值</span>
                <span className="font-bold text-blue-700">{nft.creditValue.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">背书信用</span>
                <span className="font-bold text-green-700">{totalEndorsedCredit.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">铸造时间</span>
                <span className="font-medium text-purple-700">{formatDate(nft.mintedAt)}</span>
              </div>
            </div>
          </div>

          {/* 誓言详情 */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>誓言详情</CardTitle>
                <CardDescription>该信用钻石由以下誓言铸造而成</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-slate-800 mb-1">誓言内容</h3>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {nft.metadata.originalOath?.content || nft.metadata.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-500">誓言类型</h3>
                      <p className="font-medium">
                        {nft.metadata.attributes?.find(attr => attr.trait_type === "类型")?.value || 
                          (nft.metadata.originalOath?.category === "project_commitment" ? "项目承诺" :
                          nft.metadata.originalOath?.category === "business_agreement" ? "商业协议" :
                          nft.metadata.originalOath?.category === "delivery_service" ? "配送服务" :
                          "其他")}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-500">抵押金额</h3>
                      <p className="font-medium">
                        {nft.metadata.attributes?.find(attr => attr.trait_type === "抵押金额")?.value || 
                         nft.metadata.originalOath?.collateralAmount || "未知"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-500">截止日期</h3>
                      <p className="font-medium">
                        {nft.metadata.originalOath ? formatDate(nft.metadata.originalOath.deadline) : "未知"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-500">完成日期</h3>
                      <p className="font-medium">
                        {nft.metadata.completedAt ? formatDate(nft.metadata.completedAt) : "未知"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>信任背书</CardTitle>
                <CardDescription>其他誓言持有者对该誓言的背书信息</CardDescription>
              </CardHeader>
              <CardContent>
                {(nft.endorsements?.length || 0) > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>背书者</TableHead>
                        <TableHead>信用量</TableHead>
                        <TableHead>背书时间</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {nft.endorsements?.map((endorsement) => (
                        <TableRow key={endorsement.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {endorsers[endorsement.endorserNftId]?.name || `钻石 #${endorsement.endorserNftId}`}
                              </span>
                              <span className="text-xs text-slate-500">
                                {endorsers[endorsement.endorserNftId]?.address || "地址未知"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-green-600">
                              +{endorsement.creditAmount.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(endorsement.timestamp)}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <ExternalLink className="h-4 w-4" />
                              <span className="sr-only">查看交易</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ShieldCheck className="h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 mb-1">暂无背书</h3>
                    <p className="text-sm text-slate-500 max-w-md">
                      该誓言还没有收到任何背书。其他人可以使用自己的信用钻石为该誓言背书，表示对其信任。
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>属性</CardTitle>
                <CardDescription>该信用钻石的特殊属性</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {nft.metadata.attributes?.map((attr, index) => (
                    <div key={index} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <h3 className="text-xs font-medium text-slate-500 mb-1">{attr.trait_type}</h3>
                      <p className="font-medium text-slate-900">{attr.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
