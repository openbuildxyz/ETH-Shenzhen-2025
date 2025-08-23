import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Award, Target, Star } from "lucide-react"

interface CreditDisplayProps {
  creditScore: number
  completedOaths: number
  totalStaked: number
  nftCount: number
  rank?: string
  nextLevelScore?: number
}

export function CreditDisplay({
  creditScore,
  completedOaths,
  totalStaked,
  nftCount,
  rank = "新手",
  nextLevelScore = 1000,
}: CreditDisplayProps) {
  const getCreditLevel = (score: number) => {
    if (score >= 10000) return { level: "传奇", color: "bg-purple-100 text-purple-800", icon: "👑" }
    if (score >= 5000) return { level: "大师", color: "bg-yellow-100 text-yellow-800", icon: "🏆" }
    if (score >= 2000) return { level: "专家", color: "bg-blue-100 text-blue-800", icon: "⭐" }
    if (score >= 500) return { level: "熟练", color: "bg-green-100 text-green-800", icon: "✨" }
    return { level: "新手", color: "bg-gray-100 text-gray-800", icon: "🌱" }
  }

  const creditLevel = getCreditLevel(creditScore)
  const progressToNext = nextLevelScore ? Math.min((creditScore / nextLevelScore) * 100, 100) : 100

  return (
    <div className="space-y-6">
      {/* 主要信用展示 */}
      <Card className="oath-shadow">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full oath-gradient flex items-center justify-center mb-4">
            <span className="text-3xl">{creditLevel.icon}</span>
          </div>
          <CardTitle className="text-2xl font-bold">{creditScore.toLocaleString()}</CardTitle>
          <CardDescription>信用分数</CardDescription>
          <Badge className={creditLevel.color}>{creditLevel.level}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 升级进度 */}
          {nextLevelScore && creditScore < nextLevelScore && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>升级进度</span>
                <span className="font-medium">
                  {creditScore}/{nextLevelScore}
                </span>
              </div>
              <Progress value={progressToNext} className="h-2" />
              <p className="text-xs text-slate-500 mt-1">还需 {nextLevelScore - creditScore} 分升级</p>
            </div>
          )}

          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{completedOaths}</div>
              <div className="text-xs text-slate-500">完成誓言</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">${totalStaked.toLocaleString()}</div>
              <div className="text-xs text-slate-500">累计抵押</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{nftCount}</div>
              <div className="text-xs text-slate-500">拥有NFT</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 详细统计 */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="oath-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>信用趋势</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">本月增长</span>
                <Badge className="bg-green-100 text-green-800">+{Math.floor(creditScore * 0.1)}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">成功率</span>
                <span className="font-medium">
                  {completedOaths > 0 ? Math.floor((completedOaths / (completedOaths + 1)) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">平均完成时间</span>
                <span className="font-medium">12天</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="oath-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-600" />
              <span>成就徽章</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">首次完成</p>
                  <p className="text-xs text-slate-500">完成第一个誓言</p>
                </div>
              </div>
              {completedOaths >= 5 && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Star className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">连续完成</p>
                    <p className="text-xs text-slate-500">连续完成5个誓言</p>
                  </div>
                </div>
              )}
              {nftCount >= 3 && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Award className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">收藏家</p>
                    <p className="text-xs text-slate-500">拥有3个以上NFT</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
