import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, DollarSign, User, Eye, AlertTriangle } from "lucide-react"
import { type Oath, OathStatus } from "@/lib/types"
import Link from "next/link"

interface OathCardProps {
  oath: Oath
}

export function OathCard({ oath }: OathCardProps) {
  const getStatusColor = (status: OathStatus) => {
    switch (status) {
      case OathStatus.ACTIVE:
        return "bg-blue-100 text-blue-800"
      case OathStatus.COMPLETED:
        return "bg-green-100 text-green-800"
      case OathStatus.FAILED:
        return "bg-red-100 text-red-800"
      case OathStatus.DISPUTED:
        return "bg-yellow-100 text-yellow-800"
      case OathStatus.PENDING:
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: OathStatus) => {
    switch (status) {
      case OathStatus.ACTIVE:
        return "进行中"
      case OathStatus.COMPLETED:
        return "已完成"
      case OathStatus.FAILED:
        return "已失败"
      case OathStatus.DISPUTED:
        return "争议中"
      case OathStatus.PENDING:
        return "待验证"
      default:
        return "未知"
    }
  }

  const getCategoryText = (category: string) => {
    const categoryMap: Record<string, string> = {
      project_commitment: "项目承诺",
      service_delivery: "服务交付",
      business_promise: "商业承诺",
      personal_goal: "个人目标",
      community_service: "社区服务",
      other: "其他",
    }
    return categoryMap[category] || category
  }

  const daysRemaining = Math.ceil((oath.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const totalDays = Math.ceil((oath.expiresAt.getTime() - oath.createdAt.getTime()) / (1000 * 60 * 60 * 24))
  const progress = Math.max(0, Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100))

  return (
    <Card className="oath-shadow hover:oath-shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={getStatusColor(oath.status)}>{getStatusText(oath.status)}</Badge>
              <Badge variant="outline">{getCategoryText(oath.category)}</Badge>
            </div>
            <CardTitle className="text-lg leading-tight">{oath.title}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">{oath.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 创建者信息 */}
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <User className="h-4 w-4" />
          <span>{oath.creator}</span>
          <span className="text-slate-400">•</span>
          <span>
            {oath.creatorAddress.slice(0, 6)}...{oath.creatorAddress.slice(-4)}
          </span>
        </div>

        {/* 抵押信息 */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-slate-600">
            <DollarSign className="h-4 w-4" />
            <span>抵押: ${oath.collateralAmount + oath.swearAmount}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600">
            <Clock className="h-4 w-4" />
            <span>{daysRemaining > 0 ? `${daysRemaining}天后到期` : "已到期"}</span>
          </div>
        </div>

        {/* 进度条 */}
        {oath.status === OathStatus.ACTIVE && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>进度</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* 标签 */}
        {oath.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {oath.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {oath.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{oath.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex space-x-2 pt-2">
          <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
            <Link href={`/oaths/${oath.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              查看详情
            </Link>
          </Button>
          {oath.status === OathStatus.ACTIVE && (
            <Button variant="outline" size="sm">
              <AlertTriangle className="h-4 w-4 mr-1" />
              举报
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
