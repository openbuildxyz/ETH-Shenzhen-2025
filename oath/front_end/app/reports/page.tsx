"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Eye, Award, TrendingUp } from "lucide-react"
import { ReportStatus, ReportType, AlertType, type Report, type MonitoringAlert } from "@/lib/types"

// 模拟监控警报数据
const mockAlerts: MonitoringAlert[] = [
  {
    id: "alert-1",
    type: AlertType.HIGH_VALUE_DISPUTE,
    title: "高价值争议案例",
    description: "发现一个涉及$50,000抵押金的争议案例，需要优先处理",
    oathId: "oath-001",
    severity: "high",
    createdAt: new Date("2024-12-12T10:30:00"),
    acknowledged: false,
  },
  {
    id: "alert-2",
    type: AlertType.SUSPICIOUS_ACTIVITY,
    title: "可疑活动检测",
    description: "检测到同一用户短时间内创建多个相似誓言",
    severity: "medium",
    createdAt: new Date("2024-12-12T09:15:00"),
    acknowledged: false,
  },
  {
    id: "alert-3",
    type: AlertType.OATH_EXPIRING,
    title: "誓言即将到期",
    description: "5个高价值誓言将在24小时内到期，需要关注完成情况",
    severity: "low",
    createdAt: new Date("2024-12-12T08:00:00"),
    acknowledged: true,
    acknowledgedBy: "0xmoderator1",
    acknowledgedAt: new Date("2024-12-12T08:30:00"),
  },
]

// 模拟举报数据
const mockReports: Report[] = [
  {
    id: "report-1",
    oathId: "oath-001",
    oath: {
      id: "oath-001",
      title: "维护DeFi项目2年不跑路",
      description: "承诺维护DeFi协议2年",
      category: "project_commitment" as any,
      creator: "DeFi Team",
      creatorAddress: "0x1234567890123456789012345678901234567890",
      collateralAmount: 50000,
      swearAmount: 25000,
      duration: 730,
      status: "disputed" as any,
      createdAt: new Date("2024-01-15"),
      expiresAt: new Date("2026-01-15"),
      tags: ["DeFi", "项目维护"],
    },
    reporterAddress: "0xreporter1234567890123456789012345678901234",
    reporterName: "社区监督员",
    reportType: ReportType.OATH_VIOLATION,
    reason: "项目方长期未更新代码",
    description: "该DeFi项目已经3个月没有任何代码更新，GitHub仓库显示最后提交时间为3个月前，疑似已放弃维护。",
    evidence: [
      {
        id: "evidence-1",
        type: "link",
        content: "https://github.com/defi-project/contracts",
        description: "项目GitHub仓库，显示长期未更新",
        submittedAt: new Date("2024-12-10"),
      },
    ],
    status: ReportStatus.UNDER_REVIEW,
    priority: "high" as any,
    createdAt: new Date("2024-12-10"),
    updatedAt: new Date("2024-12-11"),
    rewardAmount: 500,
  },
  {
    id: "report-2",
    oathId: "oath-002",
    oath: {
      id: "oath-002",
      title: "完成智能合约安全审计",
      description: "15天内完成安全审计",
      category: "business_promise" as any,
      creator: "审计公司",
      creatorAddress: "0x2345678901234567890123456789012345678901",
      collateralAmount: 5000,
      swearAmount: 2500,
      duration: 15,
      status: "completed" as any,
      createdAt: new Date("2024-12-01"),
      expiresAt: new Date("2024-12-16"),
      tags: ["安全审计", "智能合约"],
    },
    reporterAddress: "0xclient1234567890123456789012345678901234567",
    reportType: ReportType.FALSE_EVIDENCE,
    reason: "提交的审计报告质量不达标",
    description: "审计报告存在多处遗漏，未发现明显的安全漏洞，质量远低于行业标准。",
    evidence: [
      {
        id: "evidence-2",
        type: "text",
        content: "审计报告只有5页，缺少详细的漏洞分析和修复建议",
        submittedAt: new Date("2024-12-11"),
      },
    ],
    status: ReportStatus.VERIFIED,
    priority: "medium" as any,
    createdAt: new Date("2024-12-11"),
    updatedAt: new Date("2024-12-12"),
    reviewedBy: "0xmoderator1",
    reviewedAt: new Date("2024-12-12"),
    resolution: "举报属实，已启动仲裁程序",
    rewardAmount: 200,
    rewardClaimed: true,
  },
]

const mockStats = {
  totalReports: 45,
  pendingReports: 8,
  resolvedReports: 37,
  rewardsPaid: 2450,
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([])
  const [stats, setStats] = useState(mockStats)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setReports(mockReports)
      setAlerts(mockAlerts)
      setLoading(false)
    }, 1000)
  }, [])

  const handleReportSubmit = (reportData: any) => {
    console.log("新举报提交:", reportData)
    // TODO: 处理举报提交
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">加载监督系统中...</p>
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
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-slate-900 mb-2">举报监督中心</h1>
          <p className="text-slate-600">维护平台秩序，保护用户权益</p>
        </div>

        {/* 功能标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>监控面板</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>提交举报</span>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>奖励系统</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>举报历史</span>
            </TabsTrigger>
          </TabsList>

          {/* 监控面板 */}
          <TabsContent value="dashboard">
            {/* 监控面板内容 */}
          </TabsContent>

          {/* 提交举报 */}
          <TabsContent value="report">
            {/* 提交举报内容 */}
          </TabsContent>

          {/* 奖励系统 */}
          <TabsContent value="rewards">
            {/* 奖励系统内容 */}
          </TabsContent>

          {/* 举报历史 */}
          <TabsContent value="history">
            {/* 举报历史内容 */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
