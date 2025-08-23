import { Navigation } from "@/components/navigation"

export default function LoadingTrustDiamonds() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-pulse">
          <div className="h-10 w-48 bg-slate-200 rounded mx-auto mb-4"></div>
          <div className="h-6 w-96 max-w-full bg-slate-200 rounded mx-auto"></div>
        </div>

        <div className="flex justify-center items-center space-x-8 mb-8 animate-pulse">
          <div className="text-center">
            <div className="h-8 w-12 bg-blue-100 rounded mx-auto mb-2"></div>
            <div className="h-4 w-24 bg-slate-200 rounded mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="h-8 w-24 bg-green-100 rounded mx-auto mb-2"></div>
            <div className="h-4 w-24 bg-slate-200 rounded mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="h-8 w-12 bg-purple-100 rounded mx-auto mb-2"></div>
            <div className="h-4 w-24 bg-slate-200 rounded mx-auto"></div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8 animate-pulse">
          <div className="flex-1">
            <div className="h-10 bg-slate-200 rounded"></div>
          </div>
          <div className="w-full md:w-40">
            <div className="h-10 bg-slate-200 rounded"></div>
          </div>
          <div className="w-full md:w-40">
            <div className="h-10 bg-slate-200 rounded"></div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 animate-pulse">
          <div className="flex items-start">
            <div className="h-5 w-5 bg-blue-300 rounded mr-2 mt-0.5"></div>
            <div>
              <div className="h-5 w-40 bg-blue-200 rounded mb-2"></div>
              <div className="h-4 w-full bg-blue-100 rounded mb-1"></div>
              <div className="h-4 w-3/4 bg-blue-100 rounded"></div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col items-center p-4 animate-pulse">
              <div className="h-32 w-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4"></div>
              <div className="h-5 w-16 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 w-32 bg-slate-200 rounded mb-1"></div>
              <div className="h-3 w-24 bg-slate-100 rounded mb-2"></div>
              <div className="h-8 w-full bg-slate-200 rounded mt-1"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}