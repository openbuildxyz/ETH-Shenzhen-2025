import { Navigation } from "@/components/navigation"
import { OathForm } from "@/components/oath-form"

export default function CreateOathPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-slate-900 mb-2">创建新誓言</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            通过超额抵押创建可信的承诺，AI将对您的誓言进行分类和初步验证，完成后您将获得珍贵的信用NFT
          </p>
        </div>

        <OathForm />
      </div>
    </div>
  )
}
