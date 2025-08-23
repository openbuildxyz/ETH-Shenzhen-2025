'use client'

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Filter, Sparkles } from "lucide-react"
import { DiamondCaseCard, DiamondCase } from "@/components/diamond-case-card"

// 创建案例数据
const diamondCases: DiamondCase[] = [
  // 誓言项目自己的案例 - 使用the_best_big_diamond.glb
  {
    id: "oath-platform",
    title: "誓言平台 - 链上信用的缔造者",
    description: "誓言平台通过区块链技术构建去中心化的信用体系，让人们通过发誓这一举动建立信任。平台支持超额抵押机制，并通过信用钻石NFT展示和传递信任，实现链上原生的信用体系。",
    modelPath: "/resouce/diamond/the_best_big_diamond.glb",
    creditValue: 50000,
    category: "平台项目",
    tags: ["区块链", "信用体系", "去中心化", "誓言", "信任"],
    backgroundColor: "#081730",
    lightColor: "#4d7cfe",
    rotationSpeed: 0.005,
    createdAt: new Date("2023-10-01"),
    endorseCount: 1258
  },
  
  // 为现有的3个案例选择合适的模型
  // 案例1: DeFi项目维护大师 - 使用brilliand_diamond.glb
  {
    id: "defi-master",
    title: "DeFi项目维护大师",
    description: "成功维护DeFi项目2年，展现了卓越的项目管理能力和技术实力。通过誓言承诺长期维护，确保项目的安全性和稳定性，获得了社区的高度信任。",
    modelPath: "/resouce/diamond/brilliand_diamond.glb",
    creditValue: 15000,
    category: "项目承诺",
    tags: ["DeFi", "项目维护", "技术", "长期承诺"],
    backgroundColor: "#1a0b2e",
    lightColor: "#9333ea",
    rotationSpeed: 0.01,
    createdAt: new Date("2024-01-20"),
    endorseCount: 347
  },
  
  // 案例2: 安全审计专家 - 使用faceted_diamond_or_brilliant.glb
  {
    id: "audit-expert",
    title: "安全审计专家",
    description: "高质量完成智能合约安全审计，保障了项目的安全性。通过专业的安全审计技能和经验，帮助多个项目识别并修复潜在的安全漏洞，建立了良好的专业信誉。",
    modelPath: "/resouce/diamond/faceted_diamond_or_brilliant.glb",
    creditValue: 2500,
    category: "商业承诺",
    tags: ["安全审计", "智能合约", "漏洞检测", "专业服务"],
    backgroundColor: "#001e3c",
    lightColor: "#3b82f6",
    rotationSpeed: 0.015,
    createdAt: new Date("2024-12-01"),
    endorseCount: 89
  },
  
  // 案例3: 配送服务之星 - 使用green_diamond.glb
  {
    id: "delivery-star",
    title: "配送服务之星",
    description: "连续30天准时完成外卖配送，获得客户一致好评。通过誓言承诺高质量的配送服务，并通过实际行动兑现承诺，建立了良好的服务信誉。",
    modelPath: "/resouce/diamond/green_diamond.glb",
    creditValue: 500,
    category: "服务交付",
    tags: ["外卖配送", "准时", "服务质量", "客户满意度"],
    backgroundColor: "#052e16",
    lightColor: "#22c55e",
    rotationSpeed: 0.02,
    createdAt: new Date("2024-11-15"),
    endorseCount: 42
  },
  
  // 其他代表性案例
  // 案例4: 去中心化公证服务 - 使用diamond_blue_multi-faceted.glb
  {
    id: "decentralized-notary",
    title: "去中心化公证服务",
    description: "提供去中心化的公证服务，通过区块链技术确保文件的真实性和时间戳。替代传统公证处，提供更高效、透明的公证服务，降低了公证成本和时间。",
    modelPath: "/resouce/diamond/diamond_blue_multi-faceted.glb",
    creditValue: 8000,
    category: "公共服务",
    tags: ["公证", "区块链", "文件认证", "去中心化政务"],
    backgroundColor: "#0c4a6e",
    lightColor: "#0ea5e9",
    rotationSpeed: 0.008,
    createdAt: new Date("2024-05-15"),
    endorseCount: 203
  },
  
  // 案例5: 身份证办理专家 - 使用blue_colored_realistic_diamond_model.glb
  {
    id: "id-service-expert",
    title: "身份证办理专家",
    description: "提供高效的身份证办理服务，替代传统行政大厅。通过誓言承诺专业、高效的服务，帮助人们更便捷地办理身份证相关业务，节省时间和精力。",
    modelPath: "/resouce/diamond/blue_colored_realistic_diamond_model.glb",
    creditValue: 3500,
    category: "公共服务",
    tags: ["身份证", "政务服务", "高效办理", "去中心化政务"],
    backgroundColor: "#172554",
    lightColor: "#3b82f6",
    rotationSpeed: 0.01,
    createdAt: new Date("2024-06-20"),
    endorseCount: 156
  },
  
  // 案例6: 去中心化婚姻登记 - 使用rough_diamond_ring.glb
  {
    id: "decentralized-marriage",
    title: "去中心化婚姻登记",
    description: "提供基于区块链的婚姻登记服务，让婚姻契约更加透明和可靠。通过智能合约记录婚姻状态，提供更灵活、更现代的婚姻关系管理方式。",
    modelPath: "/resouce/diamond/rough_diamond_ring.glb",
    creditValue: 7500,
    category: "婚姻服务",
    tags: ["婚姻", "区块链", "智能合约", "去中心化"],
    backgroundColor: "#831843",
    lightColor: "#ec4899",
    rotationSpeed: 0.007,
    createdAt: new Date("2024-02-14"),
    endorseCount: 289
  },
  
  // 案例7: 社区医疗服务 - 使用diamond_green.glb
  {
    id: "community-healthcare",
    title: "社区医疗服务",
    description: "提供社区基础医疗服务，包括健康咨询、基础诊断和用药指导。通过誓言承诺专业的医疗服务，让更多人能够便捷地获得基础医疗帮助。",
    modelPath: "/resouce/diamond/diamond_green.glb",
    creditValue: 6000,
    category: "医疗服务",
    tags: ["医疗", "社区服务", "健康咨询", "基础诊断"],
    backgroundColor: "#064e3b",
    lightColor: "#10b981",
    rotationSpeed: 0.009,
    createdAt: new Date("2024-03-10"),
    endorseCount: 178
  },
  
  // 案例8: 教育辅导专家 - 使用diamond_ordinary.glb
  {
    id: "education-tutor",
    title: "教育辅导专家",
    description: "提供高质量的教育辅导服务，帮助学生提高学习成绩和能力。通过誓言承诺专业、耐心的教学，建立了良好的教育信誉。",
    modelPath: "/resouce/diamond/diamond_ordinary.glb",
    creditValue: 2800,
    category: "教育服务",
    tags: ["教育", "辅导", "学习提升", "知识传递"],
    backgroundColor: "#0f172a",
    lightColor: "#6366f1",
    rotationSpeed: 0.012,
    createdAt: new Date("2024-04-05"),
    endorseCount: 92
  },
  
  // 案例9: 环保项目倡导者 - 使用diamond_rock.glb
  {
    id: "environmental-advocate",
    title: "环保项目倡导者",
    description: "发起并维护环保项目，促进社区可持续发展。通过誓言承诺长期投入环保事业，组织社区活动，提高环保意识，实现更绿色的生活方式。",
    modelPath: "/resouce/diamond/diamond_rock.glb",
    creditValue: 4500,
    category: "环保项目",
    tags: ["环保", "可持续发展", "社区活动", "绿色生活"],
    backgroundColor: "#14532d",
    lightColor: "#22c55e",
    rotationSpeed: 0.006,
    createdAt: new Date("2024-04-22"),
    endorseCount: 134
  },
  
  // 案例10: 区块链开发专家 - 使用diamond_simple_but_nice.glb
  {
    id: "blockchain-developer",
    title: "区块链开发专家",
    description: "提供专业的区块链开发服务，包括智能合约编写、DApp开发和区块链集成。通过誓言承诺高质量的开发交付，帮助项目实现区块链技术的应用。",
    modelPath: "/resouce/diamond/diamond_simple_but_nice.glb",
    creditValue: 9000,
    category: "技术服务",
    tags: ["区块链", "开发", "智能合约", "DApp"],
    backgroundColor: "#0f172a",
    lightColor: "#8b5cf6",
    rotationSpeed: 0.01,
    createdAt: new Date("2024-01-05"),
    endorseCount: 215
  },
  
  // 案例11: 社区治理参与者 - 使用diamond_simple_but_nice2.glb
  {
    id: "community-governance",
    title: "社区治理参与者",
    description: "积极参与DAO社区治理，提供建设性意见和方案。通过誓言承诺公正、客观的治理参与，促进社区的健康发展和决策透明度。",
    modelPath: "/resouce/diamond/diamond_simple_but_nice2.glb",
    creditValue: 3200,
    category: "社区治理",
    tags: ["DAO", "治理", "社区决策", "透明度"],
    backgroundColor: "#1e1b4b",
    lightColor: "#818cf8",
    rotationSpeed: 0.011,
    createdAt: new Date("2024-02-28"),
    endorseCount: 87
  },
  
  // 案例12: 去中心化法律咨询 - 使用diamond_simple.glb
  {
    id: "decentralized-legal",
    title: "去中心化法律咨询",
    description: "提供基础的法律咨询服务，帮助人们了解法律知识和权益保护。通过誓言承诺专业、准确的法律建议，降低了法律服务的门槛和成本。",
    modelPath: "/resouce/diamond/diamond_simple.glb",
    creditValue: 5500,
    category: "法律服务",
    tags: ["法律", "咨询", "权益保护", "专业建议"],
    backgroundColor: "#1e293b",
    lightColor: "#f59e0b",
    rotationSpeed: 0.009,
    createdAt: new Date("2024-03-15"),
    endorseCount: 143
  },
  
  // 案例13: 艺术创作者信用 - 使用diamond_simple_3.glb
  {
    id: "art-creator",
    title: "艺术创作者信用",
    description: "承诺原创艺术作品创作，确保作品的真实性和独特性。通过誓言承诺不侵犯他人知识产权，提供真实的艺术创作，建立创作者的信誉。",
    modelPath: "/resouce/diamond/diamond_simple_3.glb",
    creditValue: 2000,
    category: "艺术创作",
    tags: ["艺术", "原创", "创作", "知识产权"],
    backgroundColor: "#422006",
    lightColor: "#f59e0b",
    rotationSpeed: 0.014,
    createdAt: new Date("2024-05-01"),
    endorseCount: 76
  },
  
  // 案例14: 去中心化房产交易 - 使用 5_diamond_combination.glb
  {
    id: "decentralized-realestate",
    title: "去中心化房产交易",
    description: "提供基于区块链的房产交易服务，确保交易的安全性和透明度。通过誓言承诺真实、可靠的房产信息和交易流程，降低了房产交易的风险和成本。",
    modelPath: "/resouce/diamond/5_diamond_combination.glb",
    creditValue: 12000,
    category: "房产服务",
    tags: ["房产", "区块链", "交易", "透明度"],
    backgroundColor: "#0f172a",
    lightColor: "#06b6d4",
    rotationSpeed: 0.008,
    createdAt: new Date("2024-01-10"),
    endorseCount: 267
  },
  
  // 案例15: 社区食品安全监督 - 使用 4_combination_white_diamond.glb
  {
    id: "food-safety",
    title: "社区食品安全监督",
    description: "提供社区食品安全监督服务，确保食品的质量和安全。通过誓言承诺公正、严格的食品安全检查，保障社区居民的健康和安全。",
    modelPath: "/resouce/diamond/4_combination_white_diamond.glb",
    creditValue: 4200,
    category: "安全服务",
    tags: ["食品安全", "社区监督", "健康保障", "质量检查"],
    backgroundColor: "#0f766e",
    lightColor: "#14b8a6",
    rotationSpeed: 0.01,
    createdAt: new Date("2024-04-15"),
    endorseCount: 128
  }
];

export default function DiamondCasesPage() {
  const [cases, setCases] = useState<DiamondCase[]>([])
  const [filteredCases, setFilteredCases] = useState<DiamondCase[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("credit_high")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setCases(diamondCases)
      setFilteredCases(diamondCases)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = cases

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // 类别过滤
    if (categoryFilter !== "all") {
      filtered = filtered.filter((c) => c.category === categoryFilter)
    }

    // 排序
    switch (sortBy) {
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
  }, [cases, searchTerm, categoryFilter, sortBy])

  // 获取所有不重复的类别
  const categories = Array.from(new Set(cases.map(c => c.category)))

  // 处理背书
  const handleEndorse = (caseId: string) => {
    console.log(`为案例 ${caseId} 进行背书`)
    // 这里应该有实际的背书逻辑
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">加载信用钻石案例中...</p>
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
        {/* 页面标题和介绍 */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-bold text-slate-900 mb-4">信用钻石案例库</h1>
          <p className="text-xl text-slate-600 mb-6 max-w-3xl mx-auto">
            探索各种去中心化社会形态下的信用钻石案例，了解人们如何通过誓言建立信任，实现更高效、透明的协作方式。
          </p>
        </div>

        {/* 搜索和过滤 */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="搜索案例名称、描述或标签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          <Select value={sortBy} onValueChange={setSortBy}>
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
        {(searchTerm || categoryFilter !== "all") && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchTerm && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchTerm("")}>
                搜索: {searchTerm} ×
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
                setSearchTerm("")
                setCategoryFilter("all")
              }}
            >
              清除所有筛选
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCases.map((diamondCase) => (
              <DiamondCaseCard 
                key={diamondCase.id} 
                diamondCase={diamondCase} 
                onEndorse={handleEndorse}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
