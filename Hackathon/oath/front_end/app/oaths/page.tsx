"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { OathCard } from "@/components/oath-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter } from "lucide-react"
import { type Oath, OathStatus, OathCategory } from "@/lib/types"
import Link from "next/link"

// 模拟数据
const mockOaths: Oath[] = [
  {
    id: "1",
    title: "维护DeFi项目2年不跑路",
    description:
      "承诺我们的DeFi协议在未来2年内持续维护更新，不会放弃项目或进行rug pull。我们将每月发布进度报告，保持与社区的透明沟通。",
    category: OathCategory.PROJECT_COMMITMENT,
    creator: "DeFi Protocol Team",
    creatorAddress: "0x1234567890123456789012345678901234567890",
    collateralAmount: 50000,
    swearAmount: 25000,
    duration: 730,
    status: OathStatus.ACTIVE,
    createdAt: new Date("2024-01-15"),
    expiresAt: new Date("2026-01-15"),
    tags: ["DeFi", "长期承诺", "项目维护"],
    aiClassification: "高风险项目承诺",
  },
  {
    id: "2",
    title: "准时配送外卖订单",
    description: "承诺在30分钟内将热腾腾的外卖送达客户手中，如有延误将主动赔偿。",
    category: OathCategory.SERVICE_DELIVERY,
    creator: "外卖小哥张三",
    creatorAddress: "0x2345678901234567890123456789012345678901",
    collateralAmount: 20,
    swearAmount: 10,
    duration: 1,
    status: OathStatus.COMPLETED,
    createdAt: new Date("2024-12-01"),
    expiresAt: new Date("2024-12-02"),
    completedAt: new Date("2024-12-01"),
    tags: ["外卖", "配送", "服务"],
    aiClassification: "日常服务承诺",
  },
  {
    id: "3",
    title: "完成智能合约安全审计",
    description: "承诺在15天内完成客户智能合约的全面安全审计，提供详细的漏洞报告和修复建议。",
    category: OathCategory.BUSINESS_PROMISE,
    creator: "安全审计公司",
    creatorAddress: "0x3456789012345678901234567890123456789012",
    collateralAmount: 5000,
    swearAmount: 2500,
    duration: 15,
    status: OathStatus.ACTIVE,
    createdAt: new Date("2024-12-10"),
    expiresAt: new Date("2024-12-25"),
    tags: ["安全审计", "智能合约", "专业服务"],
    aiClassification: "专业服务承诺",
  },
]

export default function OathsPage() {
  const [oaths, setOaths] = useState<Oath[]>([])
  const [filteredOaths, setFilteredOaths] = useState<Oath[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setOaths(mockOaths)
      setFilteredOaths(mockOaths)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = oaths

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(
        (oath) =>
          oath.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          oath.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          oath.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // 状态过滤
    if (statusFilter !== "all") {
      filtered = filtered.filter((oath) => oath.status === statusFilter)
    }

    // 类别过滤
    if (categoryFilter !== "all") {
      filtered = filtered.filter((oath) => oath.category === categoryFilter)
    }

    setFilteredOaths(filtered)
  }, [oaths, searchTerm, statusFilter, categoryFilter])

  const getStatusCount = (status: OathStatus) => {
    return oaths.filter((oath) => oath.status === status).length
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">加载誓言列表中...</p>
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
        {/* 页面标题和操作 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-slate-900 mb-2">誓言广场</h1>
            <p className="text-slate-600">浏览所有公开的誓言，见证承诺的力量</p>
          </div>
          <Button asChild className="mt-4 md:mt-0 oath-gradient text-white hover:opacity-90">
            <Link href="/oaths/create">
              <Plus className="h-5 w-5 mr-2" />
              创建誓言
            </Link>
          </Button>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-white rounded-lg oath-shadow">
            <div className="text-2xl font-bold text-blue-600">{oaths.length}</div>
            <div className="text-sm text-slate-500">总誓言数</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg oath-shadow">
            <div className="text-2xl font-bold text-green-600">{getStatusCount(OathStatus.ACTIVE)}</div>
            <div className="text-sm text-slate-500">进行中</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg oath-shadow">
            <div className="text-2xl font-bold text-amber-600">{getStatusCount(OathStatus.COMPLETED)}</div>
            <div className="text-sm text-slate-500">已完成</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg oath-shadow">
            <div className="text-2xl font-bold text-slate-600">
              ${oaths.reduce((sum, oath) => sum + oath.collateralAmount + oath.swearAmount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">总抵押额</div>
          </div>
        </div>

        {/* 搜索和过滤 */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="搜索誓言标题、描述或标签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="状态筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value={OathStatus.ACTIVE}>进行中</SelectItem>
              <SelectItem value={OathStatus.COMPLETED}>已完成</SelectItem>
              <SelectItem value={OathStatus.FAILED}>已失败</SelectItem>
              <SelectItem value={OathStatus.DISPUTED}>争议中</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="类别筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类别</SelectItem>
              <SelectItem value={OathCategory.PROJECT_COMMITMENT}>项目承诺</SelectItem>
              <SelectItem value={OathCategory.SERVICE_DELIVERY}>服务交付</SelectItem>
              <SelectItem value={OathCategory.BUSINESS_PROMISE}>商业承诺</SelectItem>
              <SelectItem value={OathCategory.PERSONAL_GOAL}>个人目标</SelectItem>
              <SelectItem value={OathCategory.COMMUNITY_SERVICE}>社区服务</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 活跃过滤器显示 */}
        {(searchTerm || statusFilter !== "all" || categoryFilter !== "all") && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchTerm && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchTerm("")}>
                搜索: {searchTerm} ×
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setStatusFilter("all")}>
                状态: {statusFilter} ×
              </Badge>
            )}
            {categoryFilter !== "all" && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setCategoryFilter("all")}>
                类别: {categoryFilter} ×
              </Badge>
            )}
          </div>
        )}

        {/* 誓言列表 */}
        {filteredOaths.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">没有找到匹配的誓言</h3>
            <p className="text-slate-500 mb-4">尝试调整搜索条件或创建新的誓言</p>
            <Button asChild variant="outline">
              <Link href="/oaths/create">创建第一个誓言</Link>
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOaths.map((oath) => (
              <OathCard key={oath.id} oath={oath} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
