import { generateText, generateObject } from "ai"
import { openai } from "@ai-sdk/openai"

// AI客户端配置
const aiClient = openai({
  baseURL: "https://globalai.vip/v1/",
  apiKey: process.env.OPENAI_API_KEY || "",
})

// 誓言分类结果接口
export interface OathClassification {
  category: string
  riskLevel: "low" | "medium" | "high"
  credibilityScore: number
  reasoning: string
  suggestedTags: string[]
  verificationMethods: string[]
}

// 誓言验证结果接口
export interface OathVerification {
  status: "completed" | "failed" | "disputed" | "insufficient_evidence"
  confidence: number
  reasoning: string
  evidenceAnalysis: {
    textEvidence: string
    imageEvidence?: string
    signatureEvidence?: string
    overallScore: number
  }
  recommendations: string[]
}

/**
 * AI分类誓言
 */
export async function classifyOath(
  title: string,
  description: string,
  category: string,
  tags: string[],
): Promise<OathClassification> {
  try {
    const result = await generateObject({
      model: aiClient("gpt-4o"),
      schema: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "誓言的具体分类",
          },
          riskLevel: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "风险等级评估",
          },
          credibilityScore: {
            type: "number",
            minimum: 0,
            maximum: 100,
            description: "可信度评分(0-100)",
          },
          reasoning: {
            type: "string",
            description: "分类和评分的详细理由",
          },
          suggestedTags: {
            type: "array",
            items: { type: "string" },
            description: "建议的标签",
          },
          verificationMethods: {
            type: "array",
            items: { type: "string" },
            description: "建议的验证方法",
          },
        },
        required: ["category", "riskLevel", "credibilityScore", "reasoning", "suggestedTags", "verificationMethods"],
      },
      prompt: `
作为誓言平台的AI分类专家，请对以下誓言进行专业分析和分类：

标题: ${title}
描述: ${description}
用户选择的类别: ${category}
用户标签: ${tags.join(", ")}

请从以下维度进行分析：

1. 分类准确性：验证用户选择的类别是否准确，如有必要请重新分类
2. 风险评估：评估这个誓言的履约风险（考虑复杂度、时间跨度、外部依赖等）
3. 可信度评分：基于描述的具体性、可验证性、合理性给出评分
4. 验证方法：建议最适合的验证方式（文字报告、图片证据、多签确认、第三方验证等）

分类标准：
- 项目承诺(project_commitment): Web3项目、软件开发、长期维护承诺
- 服务交付(service_delivery): 外卖配送、快递服务、即时服务
- 商业承诺(business_promise): 企业合作、商业协议、B2B服务
- 个人目标(personal_goal): 学习计划、健身目标、个人成长
- 社区服务(community_service): 公益活动、志愿服务、社区贡献
- 其他(other): 不属于以上类别的承诺

请提供专业、客观的分析结果。
      `,
    })

    return result.object
  } catch (error) {
    console.error("AI分类失败:", error)
    // 返回默认分类结果
    return {
      category: category,
      riskLevel: "medium",
      credibilityScore: 50,
      reasoning: "AI分类服务暂时不可用，使用默认评估",
      suggestedTags: tags,
      verificationMethods: ["文字报告", "图片证据"],
    }
  }
}

/**
 * AI验证誓言完成情况
 */
export async function verifyOathCompletion(
  oathTitle: string,
  oathDescription: string,
  textEvidence: string,
  imageEvidence?: string,
  signatureEvidence?: string,
  additionalContext?: string,
): Promise<OathVerification> {
  try {
    const result = await generateObject({
      model: aiClient("gpt-4o"),
      schema: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["completed", "failed", "disputed", "insufficient_evidence"],
            description: "验证结果状态",
          },
          confidence: {
            type: "number",
            minimum: 0,
            maximum: 100,
            description: "验证结果的置信度",
          },
          reasoning: {
            type: "string",
            description: "详细的验证理由和分析",
          },
          evidenceAnalysis: {
            type: "object",
            properties: {
              textEvidence: {
                type: "string",
                description: "文字证据分析",
              },
              imageEvidence: {
                type: "string",
                description: "图片证据分析（如有）",
              },
              signatureEvidence: {
                type: "string",
                description: "签名证据分析（如有）",
              },
              overallScore: {
                type: "number",
                minimum: 0,
                maximum: 100,
                description: "证据综合评分",
              },
            },
            required: ["textEvidence", "overallScore"],
          },
          recommendations: {
            type: "array",
            items: { type: "string" },
            description: "给仲裁员的建议",
          },
        },
        required: ["status", "confidence", "reasoning", "evidenceAnalysis", "recommendations"],
      },
      prompt: `
作为誓言平台的AI验证专家，请对以下誓言完成情况进行专业验证：

原始誓言:
标题: ${oathTitle}
描述: ${oathDescription}

提交的证据:
文字证据: ${textEvidence}
${imageEvidence ? `图片证据描述: ${imageEvidence}` : ""}
${signatureEvidence ? `签名证据: ${signatureEvidence}` : ""}
${additionalContext ? `额外信息: ${additionalContext}` : ""}

请从以下维度进行验证分析：

1. 完成度评估：证据是否充分证明誓言已完成
2. 证据可信度：提供的证据是否真实可靠
3. 时间合规性：是否在规定时间内完成
4. 质量标准：完成质量是否符合原始承诺

验证标准：
- completed: 有充分证据证明誓言已按要求完成
- failed: 明确证据显示誓言未完成或违约
- disputed: 证据存在争议，需要人工仲裁
- insufficient_evidence: 证据不足，无法做出判断

请提供客观、专业的验证结果，为人工仲裁员提供参考。
      `,
    })

    return result.object
  } catch (error) {
    console.error("AI验证失败:", error)
    // 返回默认验证结果
    return {
      status: "insufficient_evidence",
      confidence: 0,
      reasoning: "AI验证服务暂时不可用，建议人工仲裁",
      evidenceAnalysis: {
        textEvidence: "无法分析文字证据",
        overallScore: 0,
      },
      recommendations: ["建议人工仲裁员详细审查所有证据", "等待AI服务恢复后重新验证"],
    }
  }
}

/**
 * AI生成仲裁建议
 */
export async function generateArbitrationAdvice(
  oathDetails: string,
  evidenceList: string[],
  disputeReason: string,
): Promise<string> {
  try {
    const result = await generateText({
      model: aiClient("gpt-4o"),
      prompt: `
作为专业的区块链仲裁顾问，请为以下争议案例提供仲裁建议：

誓言详情: ${oathDetails}
证据列表: ${evidenceList.join("; ")}
争议原因: ${disputeReason}

请提供：
1. 案例分析
2. 证据评估
3. 仲裁建议
4. 风险提示

请保持客观、专业，为仲裁员提供有价值的参考意见。
      `,
    })

    return result.text
  } catch (error) {
    console.error("AI仲裁建议生成失败:", error)
    return "AI仲裁建议服务暂时不可用，请仲裁员根据经验和证据进行判断。"
  }
}
