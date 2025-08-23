import { Navigation } from "@/components/navigation"

export default function LoadingDiamondCases() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-pulse">
          <div className="h-10 w-64 bg-slate-200 rounded mx-auto mb-4"></div>
          <div className="h-6 w-96 max-w-full bg-slate-200 rounded mx-auto"></div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8 animate-pulse">
          <div className="flex-1">
            <div className="h-10 bg-slate-200 rounded"></div>
          </div>
          <div className="w-full md:w-48">
            <div className="h-10 bg-slate-200 rounded"></div>
          </div>
          <div className="w-full md:w-48">
            <div className="h-10 bg-slate-200 rounded"></div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-4 h-[360px] animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="h-6 w-16 bg-purple-100 rounded"></div>
                <div className="h-6 w-24 bg-slate-100 rounded"></div>
              </div>
              <div className="h-6 w-3/4 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 w-full bg-slate-100 rounded mb-4"></div>
              <div className="h-[180px] bg-slate-100 rounded mb-4"></div>
              <div className="flex justify-between">
                <div className="flex gap-1">
                  <div className="h-6 w-16 bg-slate-100 rounded"></div>
                  <div className="h-6 w-16 bg-slate-100 rounded"></div>
                </div>
                <div className="h-6 w-12 bg-slate-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
