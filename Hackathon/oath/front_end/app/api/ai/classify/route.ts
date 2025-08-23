import { type NextRequest, NextResponse } from "next/server"
import { classifyOath } from "@/lib/ai"

export async function POST(request: NextRequest) {
  try {
    const { title, description, category, tags } = await request.json()

    if (!title || !description) {
      return NextResponse.json({ error: "标题和描述不能为空" }, { status: 400 })
    }

    const classification = await classifyOath(title, description, category, tags || [])

    return NextResponse.json({
      success: true,
      data: classification,
    })
  } catch (error) {
    console.error("AI分类API错误:", error)
    return NextResponse.json({ error: "AI分类服务暂时不可用" }, { status: 500 })
  }
}
