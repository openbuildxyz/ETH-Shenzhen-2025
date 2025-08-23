// 智能合约接口定义和ABI
export const OATH_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_OATH_CONTRACT_ADDRESS || ""
export const SWEAR_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_SWEAR_TOKEN_ADDRESS || ""
export const USDC_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS || ""

// 简化的ABI定义（实际项目中需要完整的ABI）
export const OATH_CONTRACT_ABI = [
  {
    inputs: [
      { name: "content", type: "string" },
      { name: "category", type: "uint8" },
      { name: "usdcAmount", type: "uint256" },
      { name: "swearAmount", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
    name: "createOath",
    outputs: [{ name: "oathId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "oathId", type: "uint256" }],
    name: "completeOath",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "oathId", type: "uint256" },
      { name: "evidence", type: "string" },
    ],
    name: "reportViolation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "oathId", type: "uint256" },
      { name: "decision", type: "bool" },
    ],
    name: "arbitrate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getCreditScore",
    outputs: [{ name: "score", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserOaths",
    outputs: [{ name: "oathIds", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
] as const

export const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const

// 合约交互类型定义
export interface OathData {
  id: string
  creator: string
  content: string
  category: number
  usdcAmount: string
  swearAmount: string
  deadline: number
  status: "active" | "completed" | "violated" | "disputed"
  createdAt: number
}

export interface TokenBalance {
  usdc: string
  swear: string
}

export interface TransactionResult {
  hash: string
  success: boolean
  error?: string
}
