import { type NextRequest, NextResponse } from "next/server"
import { generateArbitrationAdvice } from "@/lib/ai"

export async function POST(request: NextRequest) {
  try {
    const { oathDetails, evidenceList, disputeReason } = await request.json()

    if (!oathDetails || !disputeReason) {
      return NextResponse.json({ error: "誓言详情和争议原因不能为空" }, { status: 400 })
    }

    const advice = await generateArbitrationAdvice(oathDetails, evidenceList || [], disputeReason)

    return NextResponse.json({
      success: true,
      data: { advice },
    })
  } catch (error) {
    console.error("AI仲裁建议API错误:", error)
    return NextResponse.json({ error: "AI仲裁建议服务暂时不可用" }, { status: 500 })
  }
}
