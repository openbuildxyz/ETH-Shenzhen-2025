"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Trophy, Sparkles, ShieldCheck } from "lucide-react"
import type { OathNFT, Endorsement } from "@/lib/types"
import { DiamondCase } from "@/components/diamond-case-card"
import { diamondCases } from "@/lib/diamond-cases-data"

// 动态导入Three.js组件，避免SSR问题
const CreditDiamondCard = dynamic(
  () => import("@/components/credit-diamond-card").then(mod => mod.CreditDiamondCard),
  { ssr: false, loading: () => <div className="h-[200px] w-full flex items-center justify-center">
    <div className="h-32 w-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg animate-pulse"></div>
  </div> }
)

// 动态导入案例卡片组件
const DiamondCaseCard = dynamic(
  () => import("@/components/diamond-case-card").then(mod => mod.DiamondCaseCard),
  { ssr: false, loading: () => <div className="h-[300px] w-full flex items-center justify-center">
    <div className="h-32 w-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg animate-pulse"></div>
  </div> }
)

// 模拟NFT数据
const mockNFTs: OathNFT[] = [
  {
    tokenId: "1001",
    oathId: "oath-001",
    creditValue: 15000,
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
    },
    endorsements: [],
  },
  {
    tokenId: "1002",
    oathId: "oath-002",
    creditValue: 2500,
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
    },
    endorsements: [],
  },
  {
    tokenId: "1003",
    oathId: "oath-003",
    creditValue: 500,
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
    },
    endorsements: [],
  },
]

// 模拟我的NFT数据（用于背书功能）
const myMockNFTs: OathNFT[] = [
  {
    tokenId: "2001",
    oathId: "oath-my-001",
    creditValue: 5000,
    mintedAt: new Date("2023-10-15"),
    metadata: {
      title: "Web3开发专家",
      description: "成功开发并部署多个Web3应用，确保了项目的安全与稳定",
      image: "/nft/web3-expert.png",
      attributes: [
        { trait_type: "类型", value: "技术承诺" },
        { trait_type: "持续时间", value: "180天" },
        { trait_type: "抵押金额", value: "$20,000" },
        { trait_type: "稀有度", value: "史诗" },
        { trait_type: "完成度", value: "100%" },
      ],
    },
    endorsements: [],
  },
  {
    tokenId: "2002",
    oathId: "oath-my-002",
    creditValue: 1200,
    mintedAt: new Date("2024-05-10"),
    metadata: {
      title: "社区管理者",
      description: "成功管理一个拥有10,000名成员的Web3社区，提供优质的服务和支持",
      image: "/nft/community-manager.png",
      attributes: [
        { trait_type: "类型", value: "社区服务" },
        { trait_type: "持续时间", value: "90天" },
        { trait_type: "抵押金额", value: "$5,000" },
        { trait_type: "稀有度", value: "稀有" },
        { trait_type: "完成度", value: "100%" },
      ],
    },
    endorsements: [],
  },
]

export default function TrustDiamondPage() {
  // 我的钻石状态
  const [nfts, setNfts] = useState<OathNFT[]>([])
  const [myNfts, setMyNfts] = useState<OathNFT[]>([])
  const [filteredNfts, setFilteredNfts] = useState<OathNFT[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [creditFilter, setCreditFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [loading, setLoading] = useState(true)

  // 案例状态
  const [cases, setCases] = useState<DiamondCase[]>([])
  const [filteredCases, setFilteredCases] = useState<DiamondCase[]>([])
  const [caseSearchTerm, setCaseSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [caseSortBy, setCaseSortBy] = useState<string>("credit_high")
  const [activeTab, setActiveTab] = useState("my-diamonds")

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setNfts(mockNFTs)
      setMyNfts(myMockNFTs)
      setFilteredNfts(mockNFTs)
      setCases(diamondCases)
      setFilteredCases(diamondCases)
      setLoading(false)
    }, 1000)
  }, [])

  // 我的钻石过滤逻辑
  useEffect(() => {
    let filtered = nfts

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(
        (nft) =>
          nft.metadata.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nft.metadata.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nft.tokenId.includes(searchTerm),
      )
    }

    // 信用等级过滤
    if (creditFilter !== "all") {
      filtered = filtered.filter((nft) => {
        const level = getCreditLevel(nft.creditValue)
        return level === creditFilter
      })
    }

    // 排序
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => b.mintedAt.getTime() - a.mintedAt.getTime())
        break
      case "oldest":
        filtered.sort((a, b) => a.mintedAt.getTime() - b.mintedAt.getTime())
        break
      case "credit_high":
        filtered.sort((a, b) => b.creditValue - a.creditValue)
        break
      case "credit_low":
        filtered.sort((a, b) => a.creditValue - b.creditValue)
        break
    }

    setFilteredNfts(filtered)
  }, [nfts, searchTerm, creditFilter, sortBy])

  // 案例过滤逻辑
  useEffect(() => {
    let filtered = cases

    // 搜索过滤
    if (caseSearchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(caseSearchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(caseSearchTerm.toLowerCase()) ||
          c.tags.some(tag => tag.toLowerCase().includes(caseSearchTerm.toLowerCase()))
      )
    }

    // 类别过滤
    if (categoryFilter !== "all") {
      filtered = filtered.filter((c) => c.category === categoryFilter)
    }

    // 排序
    switch (caseSortBy) {
      case "newest":
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        break
      case "oldest":
        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        break
      case "credit_high":
        filtered.sort((a, b) => b.creditValue - a.creditValue)
        break
      case "credit_low":
        filtered.sort((a, b) => a.creditValue - b.creditValue)
        break
      case "endorsements":
        filtered.sort((a, b) => (b.endorseCount || 0) - (a.endorseCount || 0))
        break
    }

    setFilteredCases(filtered)
  }, [cases, caseSearchTerm, categoryFilter, caseSortBy])

  const getCreditLevel = (creditValue: number) => {
    if (creditValue >= 10000) return "legendary"
    if (creditValue >= 5000) return "epic"
    if (creditValue >= 1000) return "rare"
    return "common"
  }

  const getCreditLevelText = (level: string) => {
    switch (level) {
      case "legendary":
        return "传奇"
      case "epic":
        return "史诗"
      case "rare":
        return "稀有"
      case "common":
        return "普通"
      default:
        return "全部"
    }
  }

  // 处理NFT背书/抵押
  const handleEndorse = (targetNftId: string, endorserNftId: string, amount: number) => {
    // 更新目标NFT的背书信息
    const updatedNfts = nfts.map((nft) => {
      if (nft.tokenId === targetNftId) {
        const newEndorsement: Endorsement = {
          id: generateId(),
          endorserNftId,
          targetNftId,
          creditAmount: amount,
          timestamp: new Date(),
          active: true,
        }
        
        return {
          ...nft,
          endorsements: [...(nft.endorsements || []), newEndorsement],
          creditValue: nft.creditValue + amount // 增加信用值
        }
      }
      return nft
    })
    
    // 更新我的NFT，减少已背书的信用值
    const updatedMyNfts = myNfts.map((nft) => {
      if (nft.tokenId === endorserNftId) {
        return {
          ...nft,
          creditValue: nft.creditValue - amount
        }
      }
      return nft
    })
    
    setNfts(updatedNfts)
    setMyNfts(updatedMyNfts)
    
    // 这里应该有实际的区块链交易调用
    console.log(`背书成功: NFT ${endorserNftId} 向 NFT ${targetNftId} 背书了 ${amount} 信用值`)
  }

  // 处理案例背书
  const handleCaseEndorse = (caseId: string) => {
    console.log(`为案例 ${caseId} 进行背书`)
    // 这里应该有实际的背书逻辑
  }

  // 获取所有不重复的类别
  const categories = Array.from(new Set(cases.map(c => c.category)))

  const totalValue = nfts.reduce((sum, nft) => sum + nft.creditValue, 0)
  
  // 简单的ID生成方法
  const generateId = () => `id-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">加载信用钻石中...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* 页面标题和统计 */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-bold text-slate-900 mb-4">信用钻石</h1>
          <p className="text-xl text-slate-600 mb-6">展示通过完成誓言获得的珍贵信用钻石</p>

          <div className="flex justify-center items-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{nfts.length}</div>
              <div className="text-sm text-slate-500">信用钻石数量</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">${totalValue.toLocaleString()}</div>
              <div className="text-sm text-slate-500">总信用价值</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {nfts.filter((nft) => getCreditLevel(nft.creditValue) === "legendary").length}
              </div>
              <div className="text-sm text-slate-500">传奇级钻石</div>
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-diamonds">我的信用钻石</TabsTrigger>
            <TabsTrigger value="case-library">信用钻石案例库</TabsTrigger>
          </TabsList>

          {/* 我的信用钻石标签页内容 */}
          <TabsContent value="my-diamonds">
            {/* 搜索和过滤 */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="搜索钻石名称、描述或ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={creditFilter} onValueChange={setCreditFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="信用等级筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部等级</SelectItem>
                  <SelectItem value="legendary">传奇</SelectItem>
                  <SelectItem value="epic">史诗</SelectItem>
                  <SelectItem value="rare">稀有</SelectItem>
                  <SelectItem value="common">普通</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">最新获得</SelectItem>
                  <SelectItem value="oldest">最早获得</SelectItem>
                  <SelectItem value="credit_high">信用从高到低</SelectItem>
                  <SelectItem value="credit_low">信用从低到高</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 活跃过滤器显示 */}
            {(searchTerm || creditFilter !== "all") && (
              <div className="flex flex-wrap gap-2 mb-6">
                {searchTerm && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchTerm("")}>
                    搜索: {searchTerm} ×
                  </Badge>
                )}
                {creditFilter !== "all" && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setCreditFilter("all")}>
                    信用等级: {getCreditLevelText(creditFilter)} ×
                  </Badge>
                )}
              </div>
            )}

            {/* 提示说明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <div className="flex items-start">
                <ShieldCheck className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800">如何使用信用钻石</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    点击任意钻石可以使用您自己的信用钻石进行背书，表示您对该誓言的信任。
                    背书后，您的信用将与目标誓言绑定，共同见证誓言的履行。
                  </p>
                </div>
              </div>
            </div>

            {/* 钻石网格 */}
            {filteredNfts.length === 0 ? (
              <div className="text-center py-12">
                {nfts.length === 0 ? (
                  <>
                    <Trophy className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-slate-900 mb-2">还没有信用钻石</h3>
                    <p className="text-slate-500 mb-6">完成您的第一个誓言来获得珍贵的信用钻石</p>
                    <Button className="oath-gradient text-white hover:opacity-90">
                      <Sparkles className="h-4 w-4 mr-2" />
                      创建誓言
                    </Button>
                  </>
                ) : (
                  <>
                    <Filter className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">没有找到匹配的信用钻石</h3>
                    <p className="text-slate-500 mb-4">尝试调整搜索条件</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("")
                        setCreditFilter("all")
                      }}
                    >
                      清除所有筛选
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredNfts.map((nft) => (
                  <CreditDiamondCard 
                    key={nft.tokenId} 
                    nft={nft} 
                    myNfts={myNfts}
                    onEndorse={handleEndorse}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* 信用钻石案例库标签页内容 */}
          <TabsContent value="case-library">
            {/* 搜索和过滤 */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="搜索案例名称、描述或标签..."
                  value={caseSearchTerm}
                  onChange={(e) => setCaseSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="类别筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类别</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={caseSortBy} onValueChange={setCaseSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_high">信用值从高到低</SelectItem>
                  <SelectItem value="credit_low">信用值从低到高</SelectItem>
                  <SelectItem value="newest">最新创建</SelectItem>
                  <SelectItem value="oldest">最早创建</SelectItem>
                  <SelectItem value="endorsements">背书数量</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 活跃过滤器显示 */}
            {(caseSearchTerm || categoryFilter !== "all") && (
              <div className="flex flex-wrap gap-2 mb-6">
                {caseSearchTerm && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setCaseSearchTerm("")}>
                    搜索: {caseSearchTerm} ×
                  </Badge>
                )}
                {categoryFilter !== "all" && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setCategoryFilter("all")}>
                    类别: {categoryFilter} ×
                  </Badge>
                )}
              </div>
            )}

            {/* 案例网格 */}
            {filteredCases.length === 0 ? (
              <div className="text-center py-12">
                <Filter className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">没有找到匹配的案例</h3>
                <p className="text-slate-500 mb-4">尝试调整搜索条件</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCaseSearchTerm("")
                    setCategoryFilter("all")
                  }}
                >
                  清除所有筛选
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredCases.map((diamondCase) => (
                  <DiamondCaseCard 
                    key={diamondCase.id} 
                    diamondCase={diamondCase} 
                    onEndorse={handleCaseEndorse}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}