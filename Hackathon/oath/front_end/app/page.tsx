import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Gavel, Trophy, Users, Lock, CheckCircle, ArrowRight } from "lucide-react"

export default function HomePage() {
  const features = [
    {
      icon: Shield,
      title: "超额抵押誓言",
      description: "通过抵押稳定币和SWEAR代币来发起誓言，确保承诺的可信度",
      color: "text-blue-600",
    },
    {
      icon: Gavel,
      title: "AI智能仲裁",
      description: "结合人工智能和人工仲裁，公正高效地验证誓言完成情况",
      color: "text-amber-600",
    },
    {
      icon: Trophy,
      title: "信用NFT积累",
      description: "完成誓言获得NFT证书，积累链上信用记录，降低未来成本",
      color: "text-green-600",
    },
    {
      icon: Users,
      title: "社区监督",
      description: "去中心化的举报和监督机制，确保平台的公正性和透明度",
      color: "text-purple-600",
    },
  ]

  const stats = [
    { label: "总誓言数", value: "0", icon: Shield },
    { label: "完成率", value: "0%", icon: CheckCircle },
    { label: "总抵押额", value: "$0", icon: Lock },
    { label: "活跃用户", value: "0", icon: Users },
  ]

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-900 to-amber-600 bg-clip-text text-transparent">
              构建去中心化社会的
              <br />
              信任基石
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              通过誓言积累信用，让承诺变得可验证、可量化、可复用。
              <br />
              在区块链上建立真正的信任机制，减少交易摩擦，促进诚信社会。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-900 to-teal-700 text-white hover:opacity-90">
                立即发起誓言
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-200 text-blue-900 hover:bg-blue-50 bg-transparent"
              >
                了解更多
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6">
                    <Icon className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                    <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-slate-500">{stat.label}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold mb-4 text-slate-900">平台核心功能</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              通过创新的区块链技术和智能合约，构建可信的去中心化信用体系
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className="shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-slate-100">
                        <Icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold mb-4 text-slate-900">应用场景</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              从Web3项目到日常生活，誓言平台可以应用于各种需要信任的场景
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-blue-100 text-blue-800">Web3项目</Badge>
                <CardTitle>项目方承诺</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  项目方通过超额抵押承诺项目维护期限，获得用户信任，完成后获得信用NFT
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-green-100 text-green-800">生活服务</Badge>
                <CardTitle>外卖配送</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  外卖员抵押少量资金承诺准时配送，通过多签验证完成，积累配送信用
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-purple-100 text-purple-800">商业合作</Badge>
                <CardTitle>商业承诺</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  企业间合作承诺，通过智能合约和仲裁机制确保履约，建立商业信用
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-900 to-teal-700 text-white">
        <div className="container mx-auto text-center">
          <h2 className="font-serif text-4xl font-bold mb-6">开始构建您的链上信用</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            加入誓言平台，通过承诺和履约建立可信的数字身份， 在去中心化世界中获得更多机会和信任。
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-blue-900 hover:bg-blue-50">
            立即开始
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900 text-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-900 to-teal-700">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-serif text-xl font-bold">Oath</span>
            </div>
            <div className="text-slate-400 text-sm">© 2025 Oath Platform. 构建去中心化社会的信任基石.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
