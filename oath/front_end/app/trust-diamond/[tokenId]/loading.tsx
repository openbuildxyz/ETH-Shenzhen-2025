import { Navigation } from "@/components/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function LoadingDiamondDetail() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Link href="/trust-diamond" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回信用钻石列表
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* 钻石展示区骨架屏 */}
          <div className="flex flex-col items-center animate-pulse">
            <div className="h-52 w-52 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-6"></div>

            <div className="h-6 w-16 bg-blue-100 rounded mb-4"></div>

            <div className="text-center mb-6 space-y-2">
              <div className="h-8 w-48 bg-slate-200 rounded mx-auto"></div>
              <div className="h-4 w-32 bg-slate-100 rounded mx-auto"></div>
            </div>

            <div className="w-full space-y-2">
              <div className="h-14 w-full bg-blue-50 rounded-lg"></div>
              <div className="h-14 w-full bg-green-50 rounded-lg"></div>
              <div className="h-14 w-full bg-purple-50 rounded-lg"></div>
            </div>
          </div>

          {/* 详情区骨架屏 */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border p-6 animate-pulse">
              <div className="h-6 w-24 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 w-48 bg-slate-100 rounded mb-4"></div>
              <div className="space-y-4">
                <div>
                  <div className="h-5 w-24 bg-slate-200 rounded mb-2"></div>
                  <div className="h-24 w-full bg-slate-100 rounded"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i}>
                      <div className="h-4 w-20 bg-slate-100 rounded mb-2"></div>
                      <div className="h-6 w-28 bg-slate-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6 animate-pulse">
              <div className="h-6 w-24 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 w-48 bg-slate-100 rounded mb-4"></div>
              <div className="h-40 w-full bg-slate-100 rounded"></div>
            </div>
            
            <div className="bg-white rounded-lg border p-6 animate-pulse">
              <div className="h-6 w-16 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 w-40 bg-slate-100 rounded mb-4"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}