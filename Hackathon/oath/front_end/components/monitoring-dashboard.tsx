import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Eye, Clock, TrendingUp, Shield, Target } from "lucide-react"
import type { MonitoringAlert, Report } from "@/lib/types"

interface MonitoringDashboardProps {
  alerts: MonitoringAlert[]
  recentReports: Report[]
  stats: {
    totalReports: number
    pendingReports: number
    resolvedReports: number
    rewardsPaid: number
  }
}

export function MonitoringDashboard({ alerts, recentReports, stats }: MonitoringDashboardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "critical":
        return "紧急"
      case "high":
        return "高"
      case "medium":
        return "中"
      case "low":
        return "低"
      default:
        return "未知"
    }
  }

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "under_review":
        return "bg-blue-100 text-blue-800"
      case "verified":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "resolved":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getReportStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "待审核"
      case "under_review":
        return "审核中"
      case "verified":
        return "已验证"
      case "rejected":
        return "已拒绝"
      case "resolved":
        return "已解决"
      default:
        return "未知"
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "刚刚"
    if (diffInHours < 24) return `${diffInHours}小时前`
    return `${Math.floor(diffInHours / 24)}天前`
  }

  const resolutionRate = stats.totalReports > 0 ? (stats.resolvedReports / stats.totalReports) * 100 : 0

  return (
    <div className="space-y-6">
      {/* 统计概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="oath-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.totalReports}</div>
                <div className="text-sm text-slate-500">总举报数</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="oath-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.pendingReports}</div>
                <div className="text-sm text-slate-500">待处理</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="oath-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-slate-900">{Math.round(resolutionRate)}%</div>
                <div className="text-sm text-slate-500">解决率</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="oath-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-slate-900">${stats.rewardsPaid}</div>
                <div className="text-sm text-slate-500">奖励发放</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 系统警报 */}
        <Card className="oath-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <span>系统警报</span>
            </CardTitle>
            <CardDescription>需要关注的系统异常和可疑活动</CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-green-300 mx-auto mb-4" />
                <p className="text-slate-500">系统运行正常，暂无警报</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${alert.acknowledged ? "bg-slate-50" : "bg-white"}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(alert.severity)}>{getSeverityText(alert.severity)}</Badge>
                        {alert.acknowledged && <Badge variant="outline">已确认</Badge>}
                      </div>
                      <span className="text-xs text-slate-500">{formatTimeAgo(alert.createdAt)}</span>
                    </div>
                    <h4 className="font-medium text-slate-900 mb-1">{alert.title}</h4>
                    <p className="text-sm text-slate-600">{alert.description}</p>
                    {!alert.acknowledged && (
                      <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                        确认处理
                      </Button>
                    )}
                  </div>
                ))}
                {alerts.length > 5 && (
                  <Button variant="outline" className="w-full bg-transparent">
                    查看全部警报 ({alerts.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 最近举报 */}
        <Card className="oath-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-6 w-6 text-blue-600" />
              <span>最近举报</span>
            </CardTitle>
            <CardDescription>社区成员提交的最新举报</CardDescription>
          </CardHeader>
          <CardContent>
            {recentReports.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">暂无新举报</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentReports.slice(0, 5).map((report) => (
                  <div key={report.id} className="p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getReportStatusColor(report.status)}>
                          {getReportStatusText(report.status)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {report.reportType.replace("_", " ")}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-500">{formatTimeAgo(report.createdAt)}</span>
                    </div>
                    <h4 className="font-medium text-slate-900 mb-1">{report.reason}</h4>
                    <p className="text-sm text-slate-600 line-clamp-2">{report.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500">
                        举报人: {report.reporterAddress.slice(0, 6)}...{report.reporterAddress.slice(-4)}
                      </span>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        查看
                      </Button>
                    </div>
                  </div>
                ))}
                {recentReports.length > 5 && (
                  <Button variant="outline" className="w-full bg-transparent">
                    查看全部举报 ({recentReports.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 处理进度 */}
      <Card className="oath-shadow">
        <CardHeader>
          <CardTitle>处理进度统计</CardTitle>
          <CardDescription>举报处理效率和质量指标</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>举报解决率</span>
              <span className="font-medium">{Math.round(resolutionRate)}%</span>
            </div>
            <Progress value={resolutionRate} className="h-2" />
          </div>

          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{stats.pendingReports}</div>
              <div className="text-sm text-slate-500">待处理举报</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {stats.totalReports > 0 ? Math.round((stats.resolvedReports / stats.totalReports) * 100) : 0}%
              </div>
              <div className="text-sm text-slate-500">本月解决率</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">18小时</div>
              <div className="text-sm text-slate-500">平均处理时间</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
