'use client'

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ShieldCheck, Calendar, Award, Users, ExternalLink } from "lucide-react"
import { GLBDiamondModel } from "@/components/glb-diamond-model"
import { DiamondCase } from "@/components/diamond-case-card"
import { diamondCases } from "@/lib/diamond-cases-data"

export default function DiamondCaseDetailPage() {
  const { id } = useParams()
  const [diamondCase, setDiamondCase] = useState<DiamondCase | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedCases, setRelatedCases] = useState<DiamondCase[]>([])

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      const foundCase = diamondCases.find((c) => c.id === id)
      setDiamondCase(foundCase || null)
      
      // 获取相关案例（同类别的其他案例）
      if (foundCase) {
        const related = diamondCases
          .filter((c) => c.id !== id && c.category === foundCase.category)
          .slice(0, 3)
        setRelatedCases(related)
      }
      
      setLoading(false)
    }, 1000)
  }, [id])

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const getCreditLevel = (creditValue: number) => {
    if (creditValue >= 10000) return "传奇"
    if (creditValue >= 5000) return "史诗"
    if (creditValue >= 1000) return "稀有"
    return "普通"
  }

  const getCreditLevelColor = (creditValue: number) => {
    if (creditValue >= 10000) return "bg-purple-100 text-purple-800 border-purple-200"
    if (creditValue >= 5000) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    if (creditValue >= 1000) return "bg-blue-100 text-blue-800 border-blue-200"
    return "bg-green-100 text-green-800 border-green-200"
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">加载案例详情中...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!diamondCase) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Link href="/diamond-cases" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回案例列表
          </Link>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-amber-500 text-6xl mb-4">404</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">找不到案例</h2>
              <p className="text-slate-600 mb-6">无法找到ID为 {id} 的案例</p>
              <Button asChild>
                <Link href="/diamond-cases">返回案例列表</Link>
              </Button>
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
        <Link href="/diamond-cases" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回案例列表
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* 钻石展示区 */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-0">
                <div className="h-[400px] w-full">
                  <GLBDiamondModel
                    modelPath={diamondCase.modelPath}
                    size={300}
                    brightness={80}
                    backgroundColor={diamondCase.backgroundColor}
                    lightColor={diamondCase.lightColor}
                    rotationSpeed={diamondCase.rotationSpeed ? diamondCase.rotationSpeed / 2 : 0.005}
                    interactive={true}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">信用信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">信用等级</span>
                    <Badge className={getCreditLevelColor(diamondCase.creditValue)}>
                      {getCreditLevel(diamondCase.creditValue)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">信用值</span>
                    <span className="font-bold text-green-600">{diamondCase.creditValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">背书数量</span>
                    <span className="font-medium">{diamondCase.endorseCount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">创建时间</span>
                    <span className="text-sm">{formatDate(diamondCase.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Button className="w-full">
                <ShieldCheck className="h-4 w-4 mr-2" />
                信任背书
              </Button>
            </div>
          </div>

          {/* 案例详情 */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{diamondCase.category}</Badge>
                  <Badge className={getCreditLevelColor(diamondCase.creditValue)}>
                    {getCreditLevel(diamondCase.creditValue)}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{diamondCase.title}</CardTitle>
                <CardDescription>创建于 {formatDate(diamondCase.createdAt)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-slate-800 mb-2">案例描述</h3>
                    <p className="text-slate-700 whitespace-pre-line">{diamondCase.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-slate-800 mb-2">标签</h3>
                    <div className="flex flex-wrap gap-2">
                      {diamondCase.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-slate-800 mb-2">去中心化社会价值</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-slate-50">
                        <CardContent className="p-4 flex items-start space-x-3">
                          <Award className="h-5 w-5 text-amber-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-slate-800">信任机制</h4>
                            <p className="text-sm text-slate-600">通过誓言和抵押建立的信任，无需中心化机构背书</p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-slate-50">
                        <CardContent className="p-4 flex items-start space-x-3">
                          <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-slate-800">社区协作</h4>
                            <p className="text-sm text-slate-600">促进个体之间直接协作，降低协作成本和门槛</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {relatedCases.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">相关案例</CardTitle>
                  <CardDescription>与"{diamondCase.category}"相关的其他案例</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {relatedCases.map((relatedCase) => (
                      <Link key={relatedCase.id} href={`/diamond-cases/${relatedCase.id}`}>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                              <div className="h-6 w-6" style={{ backgroundColor: relatedCase.backgroundColor }}></div>
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-800">{relatedCase.title}</h4>
                              <p className="text-xs text-slate-500">信用值: {relatedCase.creditValue.toLocaleString()}</p>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-slate-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
