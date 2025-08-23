import { type NextRequest, NextResponse } from "next/server"
import { verifyOathCompletion } from "@/lib/ai"

export async function POST(request: NextRequest) {
  try {
    const { oathTitle, oathDescription, textEvidence, imageEvidence, signatureEvidence, additionalContext } =
      await request.json()

    if (!oathTitle || !oathDescription || !textEvidence) {
      return NextResponse.json({ error: "誓言信息和文字证据不能为空" }, { status: 400 })
    }

    const verification = await verifyOathCompletion(
      oathTitle,
      oathDescription,
      textEvidence,
      imageEvidence,
      signatureEvidence,
      additionalContext,
    )

    return NextResponse.json({
      success: true,
      data: verification,
    })
  } catch (error) {
    console.error("AI验证API错误:", error)
    return NextResponse.json({ error: "AI验证服务暂时不可用" }, { status: 500 })
  }
}
