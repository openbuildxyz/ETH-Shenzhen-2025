"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { ArbitratorCaseCard } from "@/components/arbitrator-case-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gavel, Users, Clock, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import { type ArbitrationCase, ArbitrationStatus, ArbitrationPriority, OathStatus, OathCategory } from "@/lib/types"
import Link from "next/link"

// 模拟仲裁员数据
const mockArbitratorStats = {
  totalCases: 45,
  activeCases: 8,
  completedCases: 37,
  successRate: 94,
  averageTime: 18, // hours
  reputation: 4.8,
  totalEarnings: 2450,
}

// 模拟案例数据
const mockCases: ArbitrationCase[] = [
  {
    id: "case-001",
    oathId: "oath-001",
    oath: {
      id: "oath-001",
      title: "维护DeFi项目2年不跑路",
      description: "承诺我们的DeFi协议在未来2年内持续维护更新，不会放弃项目或进行rug pull。",
      category: OathCategory.PROJECT_COMMITMENT,
      creator: "DeFi Protocol Team",
      creatorAddress: "0x1234567890123456789012345678901234567890",
      collateralAmount: 50000,
      swearAmount: 25000,
      duration: 730,
      status: OathStatus.DISPUTED,
      createdAt: new Date("2024-01-15"),
      expiresAt: new Date("2026-01-15"),
      tags: ["DeFi", "长期承诺", "项目维护"],
    },
    status: ArbitrationStatus.ASSIGNED,
    priority: ArbitrationPriority.HIGH,
    createdAt: new Date("2024-12-10"),
    assignedArbitrators: ["0xarbitrator1", "0xarbitrator2"],
    requiredArbitrators: 3,
    evidence: [
      {
        id: "evidence-1",
        type: "text",
        content: "项目方已经3个月没有更新代码库",
        submittedBy: "0xreporter1",
        submittedAt: new Date("2024-12-09"),
        verified: false,
      },
    ],
    disputeReason: "项目方长期未更新代码，疑似已放弃项目维护",
    reportedBy: "0xreporter1",
    decisions: [],
    rewardPool: 500,
  },
  {
    id: "case-002",
    oathId: "oath-002",
    oath: {
      id: "oath-002",
      title: "完成智能合约安全审计",
      description: "承诺在15天内完成客户智能合约的全面安全审计，提供详细的漏洞报告和修复建议。",
      category: OathCategory.BUSINESS_PROMISE,
      creator: "安全审计公司",
      creatorAddress: "0x3456789012345678901234567890123456789012",
      collateralAmount: 5000,
      swearAmount: 2500,
      duration: 15,
      status: OathStatus.DISPUTED,
      createdAt: new Date("2024-12-10"),
      expiresAt: new Date("2024-12-25"),
      tags: ["安全审计", "智能合约", "专业服务"],
    },
    status: ArbitrationStatus.IN_REVIEW,
    priority: ArbitrationPriority.MEDIUM,
    createdAt: new Date("2024-12-12"),
    assignedArbitrators: ["0xarbitrator1", "0xarbitrator3"],
    requiredArbitrators: 2,
    evidence: [
      {
        id: "evidence-2",
        type: "text",
        content: "审计报告已提交，但质量不符合行业标准",
        submittedBy: "0xclient1",
        submittedAt: new Date("2024-12-11"),
        verified: false,
      },
    ],
    aiVerification: {
      status: "disputed",
      confidence: 65,
      reasoning: "提交的审计报告存在质量问题，建议人工仲裁详细审查",
      evidenceAnalysis: {
        textEvidence: "客户反馈审计质量不达标，需要专业仲裁员评估",
        overallScore: 45,
      },
      recommendations: ["请专业安全审计仲裁员审查", "对比行业标准评估质量"],
    },
    disputeReason: "审计报告质量不符合预期，存在多处遗漏",
    reportedBy: "0xclient1",
    decisions: [
      {
        id: "decision-1",
        caseId: "case-002",
        arbitratorAddress: "0xarbitrator1",
        decision: "partial",
        reasoning: "审计报告基本完成但质量有待提升",
        evidenceWeight: 70,
        compensationAmount: 1000,
        submittedAt: new Date("2024-12-12"),
        confidence: 75,
      },
    ],
    rewardPool: 200,
  },
]

export default function ArbitratePage() {
  const [cases, setCases] = useState<ArbitrationCase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setCases(mockCases)
      setLoading(false)
    }, 1000)
  }, [])

  const activeCases = cases.filter(
    (c) => c.status === ArbitrationStatus.ASSIGNED || c.status === ArbitrationStatus.IN_REVIEW,
  )
  const pendingCases = cases.filter((c) => c.status === ArbitrationStatus.PENDING)
  const votingCases = cases.filter((c) => c.status === ArbitrationStatus.VOTING)

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">加载仲裁仪表板中...</p>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-slate-900 mb-2">仲裁员仪表板</h1>
            <p className="text-slate-600">公正仲裁，维护平台信任</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Badge className="bg-green-100 text-green-800">信誉评分: {mockArbitratorStats.reputation}/5.0</Badge>
            <Button asChild variant="outline">
              <Link href="/arbitrate/cases">查看所有案例</Link>
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="oath-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Gavel className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">{mockArbitratorStats.activeCases}</div>
                  <div className="text-sm text-slate-500">活跃案例</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="oath-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">{mockArbitratorStats.completedCases}</div>
                  <div className="text-sm text-slate-500">已完成</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="oath-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-amber-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">{mockArbitratorStats.successRate}%</div>
                  <div className="text-sm text-slate-500">成功率</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="oath-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">${mockArbitratorStats.totalEarnings}</div>
                  <div className="text-sm text-slate-500">总收益</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 仲裁员状态 */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="oath-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>仲裁员状态</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>信誉评分</span>
                  <span className="font-medium">{mockArbitratorStats.reputation}/5.0</span>
                </div>
                <Progress value={mockArbitratorStats.reputation * 20} className="h-2" />
              </div>
              <div className="text-sm text-slate-600">
                <p>总案例: {mockArbitratorStats.totalCases}</p>
                <p>平均处理时间: {mockArbitratorStats.averageTime}小时</p>
              </div>
            </CardContent>
          </Card>

          <Card className="oath-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span>待处理案例</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">分配给我</span>
                  <Badge variant="outline">{activeCases.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">等待分配</span>
                  <Badge variant="outline">{pendingCases.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">投票阶段</span>
                  <Badge variant="outline">{votingCases.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="oath-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>紧急案例</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-2xl font-bold text-red-600">
                  {cases.filter((c) => c.priority === ArbitrationPriority.URGENT).length}
                </div>
                <div className="text-sm text-slate-500">需要立即处理</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 活跃案例 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-2xl font-bold text-slate-900">我的活跃案例</h2>
            <Button asChild variant="outline">
              <Link href="/arbitrate/cases">查看全部</Link>
            </Button>
          </div>

          {activeCases.length === 0 ? (
            <Card className="oath-shadow">
              <CardContent className="text-center py-12">
                <Gavel className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">暂无活跃案例</h3>
                <p className="text-slate-500 mb-4">当前没有分配给您的案例</p>
                <Button asChild variant="outline">
                  <Link href="/arbitrate/cases">浏览待分配案例</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {activeCases.slice(0, 4).map((case_) => (
                <ArbitratorCaseCard key={case_.id} case={case_} />
              ))}
            </div>
          )}
        </div>

        {/* 快速操作 */}
        <Card className="oath-shadow">
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>常用的仲裁员功能</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
                <Link href="/arbitrate/cases?status=pending">
                  <div className="text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="font-medium">接受新案例</div>
                    <div className="text-sm text-slate-500">查看待分配案例</div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
                <Link href="/arbitrate/cases?priority=urgent">
                  <div className="text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                    <div className="font-medium">紧急案例</div>
                    <div className="text-sm text-slate-500">处理高优先级案例</div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
                <Link href="/arbitrate/history">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="font-medium">仲裁历史</div>
                    <div className="text-sm text-slate-500">查看历史记录</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
