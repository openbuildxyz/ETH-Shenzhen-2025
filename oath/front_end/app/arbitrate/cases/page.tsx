"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { ArbitratorCaseCard } from "@/components/arbitrator-case-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter } from "lucide-react"
import { type ArbitrationCase, ArbitrationStatus, ArbitrationPriority } from "@/lib/types"

// 使用之前定义的模拟数据
const mockCases: ArbitrationCase[] = [
  // ... 这里应该包含更多案例数据
]

export default function ArbitrationCasesPage() {
  const [cases, setCases] = useState<ArbitrationCase[]>([])
  const [filteredCases, setFilteredCases] = useState<ArbitrationCase[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setCases(mockCases)
      setFilteredCases(mockCases)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = cases

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(
        (case_) =>
          case_.oath.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          case_.disputeReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
          case_.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // 状态过滤
    if (statusFilter !== "all") {
      filtered = filtered.filter((case_) => case_.status === statusFilter)
    }

    // 优先级过滤
    if (priorityFilter !== "all") {
      filtered = filtered.filter((case_) => case_.priority === priorityFilter)
    }

    setFilteredCases(filtered)
  }, [cases, searchTerm, statusFilter, priorityFilter])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">加载案例列表中...</p>
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
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-slate-900 mb-2">仲裁案例</h1>
          <p className="text-slate-600">查看和处理所有仲裁案例</p>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-white rounded-lg oath-shadow">
            <div className="text-2xl font-bold text-blue-600">{cases.length}</div>
            <div className="text-sm text-slate-500">总案例数</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg oath-shadow">
            <div className="text-2xl font-bold text-yellow-600">
              {cases.filter((c) => c.status === ArbitrationStatus.PENDING).length}
            </div>
            <div className="text-sm text-slate-500">待分配</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg oath-shadow">
            <div className="text-2xl font-bold text-green-600">
              {cases.filter((c) => c.status === ArbitrationStatus.IN_REVIEW).length}
            </div>
            <div className="text-sm text-slate-500">审理中</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg oath-shadow">
            <div className="text-2xl font-bold text-red-600">
              {cases.filter((c) => c.priority === ArbitrationPriority.URGENT).length}
            </div>
            <div className="text-sm text-slate-500">紧急案例</div>
          </div>
        </div>

        {/* 搜索和过滤 */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="搜索案例ID、誓言标题或争议原因..."
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
              <SelectItem value={ArbitrationStatus.PENDING}>待分配</SelectItem>
              <SelectItem value={ArbitrationStatus.ASSIGNED}>已分配</SelectItem>
              <SelectItem value={ArbitrationStatus.IN_REVIEW}>审理中</SelectItem>
              <SelectItem value={ArbitrationStatus.VOTING}>投票中</SelectItem>
              <SelectItem value={ArbitrationStatus.RESOLVED}>已解决</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="优先级筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部优先级</SelectItem>
              <SelectItem value={ArbitrationPriority.URGENT}>紧急</SelectItem>
              <SelectItem value={ArbitrationPriority.HIGH}>高优先级</SelectItem>
              <SelectItem value={ArbitrationPriority.MEDIUM}>中优先级</SelectItem>
              <SelectItem value={ArbitrationPriority.LOW}>低优先级</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 活跃过滤器显示 */}
        {(searchTerm || statusFilter !== "all" || priorityFilter !== "all") && (
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
            {priorityFilter !== "all" && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setPriorityFilter("all")}>
                优先级: {priorityFilter} ×
              </Badge>
            )}
          </div>
        )}

        {/* 案例列表 */}
        {filteredCases.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">没有找到匹配的案例</h3>
            <p className="text-slate-500 mb-4">尝试调整搜索条件</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setPriorityFilter("all")
              }}
            >
              清除所有筛选
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((case_) => (
              <ArbitratorCaseCard key={case_.id} case={case_} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
