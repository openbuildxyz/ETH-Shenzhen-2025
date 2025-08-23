"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Gavel, AlertTriangle, CheckCircle, XCircle, Scale } from "lucide-react"
import type { ArbitrationCase, ArbitrationDecision } from "@/lib/types"

interface ArbitrationDecisionProps {
  case: ArbitrationCase
  onDecisionSubmit?: (decision: Partial<ArbitrationDecision>) => void
}

export function ArbitrationDecisionComponent({ case: arbitrationCase, onDecisionSubmit }: ArbitrationDecisionProps) {
  const [decision, setDecision] = useState<"completed" | "failed" | "partial" | "invalid" | "">("")
  const [reasoning, setReasoning] = useState("")
  const [evidenceWeight, setEvidenceWeight] = useState([75])
  const [compensationAmount, setCompensationAmount] = useState(0)
  const [confidence, setConfidence] = useState([80])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!decision || !reasoning.trim()) {
      alert("请选择仲裁结果并填写理由")
      return
    }

    setIsSubmitting(true)

    try {
      const decisionData: Partial<ArbitrationDecision> = {
        caseId: arbitrationCase.id,
        decision: decision as "completed" | "failed" | "partial" | "invalid",
        reasoning: reasoning.trim(),
        evidenceWeight: evidenceWeight[0],
        compensationAmount: decision === "failed" || decision === "partial" ? compensationAmount : undefined,
        confidence: confidence[0],
        submittedAt: new Date(),
      }

      // TODO: 调用智能合约提交仲裁决定
      console.log("提交仲裁决定:", decisionData)

      onDecisionSubmit?.(decisionData)

      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 2000))

      alert("仲裁决定提交成功！")

      // 重置表单
      setDecision("")
      setReasoning("")
      setEvidenceWeight([75])
      setCompensationAmount(0)
      setConfidence([80])
    } catch (error) {
      console.error("提交仲裁决定失败:", error)
      alert("提交失败，请重试")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDecisionIcon = (decisionType: string) => {
    switch (decisionType) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "partial":
        return <Scale className="h-5 w-5 text-yellow-600" />
      case "invalid":
        return <AlertTriangle className="h-5 w-5 text-gray-600" />
      default:
        return <Gavel className="h-5 w-5 text-blue-600" />
    }
  }

  const maxCompensation = arbitrationCase.oath.collateralAmount + arbitrationCase.oath.swearAmount

  return (
    <Card className="oath-shadow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Gavel className="h-6 w-6 text-blue-600" />
          <span>提交仲裁决定</span>
        </CardTitle>
        <CardDescription>基于证据和AI分析，做出公正的仲裁决定</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 案例摘要 */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <h4 className="font-medium text-slate-900 mb-2">案例摘要</h4>
          <div className="text-sm text-slate-600 space-y-1">
            <p>
              <strong>誓言:</strong> {arbitrationCase.oath.title}
            </p>
            <p>
              <strong>抵押金额:</strong> ${arbitrationCase.oath.collateralAmount + arbitrationCase.oath.swearAmount}
            </p>
            <p>
              <strong>争议原因:</strong> {arbitrationCase.disputeReason}
            </p>
            <p>
              <strong>证据数量:</strong> {arbitrationCase.evidence.length}
            </p>
          </div>
        </div>

        {/* AI建议 */}
        {arbitrationCase.aiVerification && (
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <h4 className="font-medium text-purple-800 mb-2">AI分析建议</h4>
            <div className="text-sm text-purple-700 space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-purple-600">
                  {arbitrationCase.aiVerification.status === "completed"
                    ? "建议完成"
                    : arbitrationCase.aiVerification.status === "failed"
                      ? "建议失败"
                      : "需审查"}
                </Badge>
                <span>置信度: {arbitrationCase.aiVerification.confidence}%</span>
              </div>
              <p>{arbitrationCase.aiVerification.reasoning}</p>
            </div>
          </div>
        )}

        {/* 仲裁决定 */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="decision">仲裁结果 *</Label>
            <Select value={decision} onValueChange={(value) => setDecision(value as any)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="选择仲裁结果" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>誓言已完成</span>
                  </div>
                </SelectItem>
                <SelectItem value="failed">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span>誓言未完成</span>
                  </div>
                </SelectItem>
                <SelectItem value="partial">
                  <div className="flex items-center space-x-2">
                    <Scale className="h-4 w-4 text-yellow-600" />
                    <span>部分完成</span>
                  </div>
                </SelectItem>
                <SelectItem value="invalid">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-gray-600" />
                    <span>誓言无效</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reasoning">仲裁理由 *</Label>
            <Textarea
              id="reasoning"
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="详细说明您的仲裁理由，包括对证据的分析和判断依据..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div>
            <Label>证据权重评估</Label>
            <div className="mt-2">
              <Slider
                value={evidenceWeight}
                onValueChange={setEvidenceWeight}
                max={100}
                min={0}
                step={5}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-slate-500">
                <span>证据不足</span>
                <span className="font-medium">{evidenceWeight[0]}%</span>
                <span>证据充分</span>
              </div>
            </div>
          </div>

          <div>
            <Label>决定置信度</Label>
            <div className="mt-2">
              <Slider value={confidence} onValueChange={setConfidence} max={100} min={0} step={5} className="mb-2" />
              <div className="flex justify-between text-sm text-slate-500">
                <span>不确定</span>
                <span className="font-medium">{confidence[0]}%</span>
                <span>非常确定</span>
              </div>
            </div>
          </div>

          {/* 赔偿金额 */}
          {(decision === "failed" || decision === "partial") && (
            <div>
              <Label htmlFor="compensation">赔偿金额 (USD)</Label>
              <div className="mt-2">
                <Slider
                  value={[compensationAmount]}
                  onValueChange={([value]) => setCompensationAmount(value)}
                  max={maxCompensation}
                  min={0}
                  step={10}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-slate-500">
                  <span>$0</span>
                  <span className="font-medium">${compensationAmount}</span>
                  <span>${maxCompensation}</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-1">从抵押金中分配给受影响方的赔偿金额</p>
            </div>
          )}
        </div>

        {/* 决定预览 */}
        {decision && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center space-x-2 mb-2">
              {getDecisionIcon(decision)}
              <h4 className="font-medium text-blue-800">决定预览</h4>
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              <p>
                <strong>结果:</strong>{" "}
                {decision === "completed"
                  ? "誓言已完成，释放抵押金"
                  : decision === "failed"
                    ? "誓言未完成，执行赔偿"
                    : decision === "partial"
                      ? "部分完成，部分赔偿"
                      : "誓言无效，退还抵押金"}
              </p>
              <p>
                <strong>证据权重:</strong> {evidenceWeight[0]}%
              </p>
              <p>
                <strong>置信度:</strong> {confidence[0]}%
              </p>
              {(decision === "failed" || decision === "partial") && (
                <p>
                  <strong>赔偿金额:</strong> ${compensationAmount}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 警告信息 */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            仲裁决定一旦提交将无法撤回，请仔细审查所有证据后再做决定。错误的仲裁可能影响您的仲裁员信誉。
          </AlertDescription>
        </Alert>

        {/* 提交按钮 */}
        <Button
          onClick={handleSubmit}
          disabled={!decision || !reasoning.trim() || isSubmitting}
          className="w-full oath-gradient text-white hover:opacity-90"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Gavel className="mr-2 h-5 w-5 animate-pulse" />
              提交中...
            </>
          ) : (
            <>
              <Gavel className="mr-2 h-5 w-5" />
              提交仲裁决定
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
