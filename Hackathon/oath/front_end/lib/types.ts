export interface ArbitrationCase {
  id: string
  oathId: string
  oath: Oath
  status: ArbitrationStatus
  priority: ArbitrationPriority
  createdAt: Date
  assignedArbitrators: string[]
  requiredArbitrators: number
  evidence: Evidence[]
  aiVerification?: OathVerification
  aiAdvice?: string
  disputeReason: string
  reportedBy: string
  decisions: ArbitrationDecision[]
  finalDecision?: ArbitrationDecision
  resolvedAt?: Date
  rewardPool: number
}

export enum ArbitrationStatus {
  PENDING = "pending", // 等待分配仲裁员
  ASSIGNED = "assigned", // 已分配仲裁员
  IN_REVIEW = "in_review", // 仲裁中
  VOTING = "voting", // 投票阶段
  RESOLVED = "resolved", // 已解决
  APPEALED = "appealed", // 已上诉
}

export enum ArbitrationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export interface ArbitrationDecision {
  id: string
  caseId: string
  arbitratorAddress: string
  decision: "completed" | "failed" | "partial" | "invalid"
  reasoning: string
  evidenceWeight: number
  compensationAmount?: number
  submittedAt: Date
  confidence: number
}

export interface Arbitrator {
  address: string
  name: string
  reputation: number
  totalCases: number
  successfulCases: number
  averageTime: number // in hours
  specialties: string[]
  stakeAmount: number
  isActive: boolean
  joinedAt: Date
}

// 添加举报和监督相关类型定义
export interface Report {
  id: string
  oathId: string
  oath: Oath
  reporterAddress: string
  reporterName?: string
  reportType: ReportType
  reason: string
  description: string
  evidence: ReportEvidence[]
  status: ReportStatus
  priority: ReportPriority
  createdAt: Date
  updatedAt: Date
  reviewedBy?: string
  reviewedAt?: Date
  resolution?: string
  rewardAmount?: number
  rewardClaimed?: boolean
}

export enum ReportType {
  OATH_VIOLATION = "oath_violation", // 誓言违约
  FALSE_EVIDENCE = "false_evidence", // 虚假证据
  SPAM_OATH = "spam_oath", // 垃圾誓言
  FRAUDULENT_BEHAVIOR = "fraudulent_behavior", // 欺诈行为
  SYSTEM_ABUSE = "system_abuse", // 系统滥用
  OTHER = "other", // 其他
}

export enum ReportStatus {
  PENDING = "pending", // 待审核
  UNDER_REVIEW = "under_review", // 审核中
  VERIFIED = "verified", // 已验证
  REJECTED = "rejected", // 已拒绝
  RESOLVED = "resolved", // 已解决
}

export enum ReportPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface ReportEvidence {
  id: string
  type: "text" | "image" | "link" | "transaction"
  content: string
  description?: string
  submittedAt: Date
}

export interface MonitoringAlert {
  id: string
  type: AlertType
  title: string
  description: string
  oathId?: string
  severity: "low" | "medium" | "high" | "critical"
  createdAt: Date
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
}

export enum AlertType {
  OATH_EXPIRING = "oath_expiring", // 誓言即将到期
  SUSPICIOUS_ACTIVITY = "suspicious_activity", // 可疑活动
  HIGH_VALUE_DISPUTE = "high_value_dispute", // 高价值争议
  REPEATED_VIOLATIONS = "repeated_violations", // 重复违约
  SYSTEM_ANOMALY = "system_anomaly", // 系统异常
}

export interface ReportReward {
  reportId: string
  reporterAddress: string
  amount: number
  reason: string
  claimedAt?: Date
  transactionHash?: string
}

export type OathVerification = {
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

export interface Oath {
  id: string
  creator: string
  content: string
  category: OathCategory
  usdcAmount: string
  swearAmount: string
  totalCollateral: string
  deadline: Date
  status: OathStatus
  createdAt: Date
  completedAt?: Date
  evidence?: Evidence[]
  nftTokenId?: string
  tags: string[]
  isPublic: boolean
  completionProof?: string
  violationReports?: Report[]
}

export enum OathStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  VIOLATED = "violated",
  DISPUTED = "disputed",
  EXPIRED = "expired",
}

export enum OathCategory {
  PROJECT_COMMITMENT = "project_commitment", // 项目承诺
  DELIVERY_SERVICE = "delivery_service", // 配送服务
  BUSINESS_AGREEMENT = "business_agreement", // 商业协议
  PERSONAL_GOAL = "personal_goal", // 个人目标
  COMMUNITY_SERVICE = "community_service", // 社区服务
  EDUCATIONAL = "educational", // 教育相关
  ENVIRONMENTAL = "environmental", // 环保承诺
  CHARITY = "charity", // 慈善活动
  OTHER = "other", // 其他
}

export interface OathNFT {
  tokenId: string
  oathId: string
  creditValue: number
  owner?: string
  metadata: {
    title?: string
    name?: string
    description: string
    image?: string
    attributes: NFTAttribute[]
    completedAt?: Date
    originalOath?: {
      content: string
      category: OathCategory
      collateralAmount: string
      deadline: Date
    }
  }
  mintedAt: Date
  endorsements?: Endorsement[]
}

export interface NFTAttribute {
  trait_type: string
  value: string | number
  display_type?: "number" | "date" | "boost_percentage" | "boost_number"
}

export interface Endorsement {
  id: string
  endorserNftId: string
  targetNftId: string
  creditAmount: number
  timestamp: Date
  active: boolean
  transactionHash?: string
}

export interface Evidence {
  id: string
  oathId: string
  type: "text" | "image" | "signature" | "transaction" | "document"
  content: string
  description?: string
  submittedBy: string
  submittedAt: Date
  verified: boolean
  verificationScore?: number
}
