import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, DollarSign, Users, AlertTriangle, Eye, Brain, Gavel } from "lucide-react"
import { type ArbitrationCase, ArbitrationStatus, ArbitrationPriority } from "@/lib/types"
import Link from "next/link"

interface ArbitratorCaseCardProps {
  case: ArbitrationCase
}

export function ArbitratorCaseCard({ case: arbitrationCase }: ArbitratorCaseCardProps) {
  const getStatusColor = (status: ArbitrationStatus) => {
    switch (status) {
      case ArbitrationStatus.PENDING:
        return "bg-gray-100 text-gray-800"
      case ArbitrationStatus.ASSIGNED:
        return "bg-blue-100 text-blue-800"
      case ArbitrationStatus.IN_REVIEW:
        return "bg-yellow-100 text-yellow-800"
      case ArbitrationStatus.VOTING:
        return "bg-purple-100 text-purple-800"
      case ArbitrationStatus.RESOLVED:
        return "bg-green-100 text-green-800"
      case ArbitrationStatus.APPEALED:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: ArbitrationStatus) => {
    switch (status) {
      case ArbitrationStatus.PENDING:
        return "待分配"
      case ArbitrationStatus.ASSIGNED:
        return "已分配"
      case ArbitrationStatus.IN_REVIEW:
        return "审理中"
      case ArbitrationStatus.VOTING:
        return "投票中"
      case ArbitrationStatus.RESOLVED:
        return "已解决"
      case ArbitrationStatus.APPEALED:
        return "已上诉"
      default:
        return "未知状态"
    }
  }

  const getPriorityColor = (priority: ArbitrationPriority) => {
    switch (priority) {
      case ArbitrationPriority.LOW:
        return "bg-green-100 text-green-800"
      case ArbitrationPriority.MEDIUM:
        return "bg-yellow-100 text-yellow-800"
      case ArbitrationPriority.HIGH:
        return "bg-orange-100 text-orange-800"
      case ArbitrationPriority.URGENT:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityText = (priority: ArbitrationPriority) => {
    switch (priority) {
      case ArbitrationPriority.LOW:
        return "低优先级"
      case ArbitrationPriority.MEDIUM:
        return "中优先级"
      case ArbitrationPriority.HIGH:
        return "高优先级"
      case ArbitrationPriority.URGENT:
        return "紧急"
      default:
        return "未知优先级"
    }
  }

  const hoursAgo = Math.floor((Date.now() - arbitrationCase.createdAt.getTime()) / (1000 * 60 * 60))
  const progressPercentage = (arbitrationCase.decisions.length / arbitrationCase.requiredArbitrators) * 100

  return (
    <Card className="oath-shadow hover:oath-shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={getStatusColor(arbitrationCase.status)}>{getStatusText(arbitrationCase.status)}</Badge>
              <Badge className={getPriorityColor(arbitrationCase.priority)}>
                {getPriorityText(arbitrationCase.priority)}
              </Badge>
              {arbitrationCase.aiVerification && (
                <Badge variant="outline" className="text-purple-600 border-purple-200">
                  <Brain className="h-3 w-3 mr-1" />
                  AI已分析
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg leading-tight">案例 #{arbitrationCase.id.slice(0, 8)}</CardTitle>
            <CardDescription className="mt-1">誓言: {arbitrationCase.oath.title}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 争议信息 */}
        <div className="p-3 bg-red-50 rounded-lg border border-red-100">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">争议原因</p>
              <p className="text-sm text-red-700 mt-1">{arbitrationCase.disputeReason}</p>
            </div>
          </div>
        </div>

        {/* 基本信息 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-slate-600">
            <Clock className="h-4 w-4" />
            <span>{hoursAgo}小时前创建</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600">
            <DollarSign className="h-4 w-4" />
            <span>奖励池: ${arbitrationCase.rewardPool}</span>
          </div>
        </div>

        {/* 仲裁进度 */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-slate-600" />
              <span>仲裁进度</span>
            </div>
            <span className="font-medium">
              {arbitrationCase.decisions.length}/{arbitrationCase.requiredArbitrators}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* 证据统计 */}
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>证据数量: {arbitrationCase.evidence.length}</span>
          <span>
            举报人: {arbitrationCase.reportedBy.slice(0, 6)}...{arbitrationCase.reportedBy.slice(-4)}
          </span>
        </div>

        {/* AI分析摘要 */}
        {arbitrationCase.aiVerification && (
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">AI初步分析</span>
              <Badge variant="outline" className="text-xs">
                {arbitrationCase.aiVerification.confidence}% 置信度
              </Badge>
            </div>
            <p className="text-sm text-purple-700">
              状态:{" "}
              {arbitrationCase.aiVerification.status === "completed"
                ? "建议完成"
                : arbitrationCase.aiVerification.status === "failed"
                  ? "建议失败"
                  : "需要进一步审查"}
            </p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex space-x-2 pt-2">
          <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
            <Link href={`/arbitrate/cases/${arbitrationCase.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              查看详情
            </Link>
          </Button>
          {arbitrationCase.status === ArbitrationStatus.ASSIGNED && (
            <Button asChild size="sm" className="flex-1 oath-gradient text-white hover:opacity-90">
              <Link href={`/arbitrate/cases/${arbitrationCase.id}`}>
                <Gavel className="h-4 w-4 mr-1" />
                开始仲裁
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
