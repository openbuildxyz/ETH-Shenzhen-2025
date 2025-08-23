import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Plus, Trophy, AlertTriangle } from "lucide-react"

interface CreditHistoryEntry {
  id: string
  type: "gain" | "loss" | "bonus"
  amount: number
  reason: string
  oathTitle?: string
  timestamp: Date
  details?: string
}

interface CreditHistoryProps {
  entries: CreditHistoryEntry[]
}

export function CreditHistory({ entries }: CreditHistoryProps) {
  const getTypeIcon = (type: string, amount: number) => {
    switch (type) {
      case "gain":
        return amount > 0 ? (
          <TrendingUp className="h-4 w-4 text-green-600" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-600" />
        )
      case "loss":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "bonus":
        return <Trophy className="h-4 w-4 text-yellow-600" />
      default:
        return <Plus className="h-4 w-4 text-blue-600" />
    }
  }

  const getTypeColor = (type: string, amount: number) => {
    switch (type) {
      case "gain":
        return amount > 0 ? "text-green-600" : "text-red-600"
      case "loss":
        return "text-red-600"
      case "bonus":
        return "text-yellow-600"
      default:
        return "text-blue-600"
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "gain":
        return <Badge className="bg-green-100 text-green-800">获得</Badge>
      case "loss":
        return <Badge className="bg-red-100 text-red-800">扣除</Badge>
      case "bonus":
        return <Badge className="bg-yellow-100 text-yellow-800">奖励</Badge>
      default:
        return <Badge variant="outline">其他</Badge>
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "刚刚"
    if (diffInHours < 24) return `${diffInHours}小时前`
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}天前`

    return new Intl.DateTimeFormat("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Card className="oath-shadow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <span>信用历史</span>
        </CardTitle>
        <CardDescription>查看您的信用分数变化记录</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">暂无信用记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-slate-50 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  {getTypeIcon(entry.type, entry.amount)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      {getTypeBadge(entry.type)}
                      <span className="text-sm text-slate-500">{formatDate(entry.timestamp)}</span>
                    </div>
                    <div className={`font-bold ${getTypeColor(entry.type, entry.amount)}`}>
                      {entry.amount > 0 ? "+" : ""}
                      {entry.amount}
                    </div>
                  </div>

                  <p className="text-sm font-medium text-slate-900 mb-1">{entry.reason}</p>

                  {entry.oathTitle && <p className="text-sm text-slate-600 mb-1">相关誓言: {entry.oathTitle}</p>}

                  {entry.details && <p className="text-xs text-slate-500">{entry.details}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
