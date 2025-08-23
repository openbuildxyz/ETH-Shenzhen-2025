import { Address } from 'viem'

// 合约相关类型
export interface ContractAddresses {
  recoveryLogic: Address
  subscriptionLogic: Address
  token: Address
}

// 恢复逻辑相关类型
export interface WhitelistItem {
  address: Address
  isActive: boolean
}

export interface RecoveryParams {
  recipient: Address
  amount: bigint
}

// 订阅逻辑相关类型
export interface SubscriptionParams {
  provider: Address
  period: bigint
  amount: bigint
}

export interface SubscriptionInfo {
  provider: Address
  period: bigint
  amount: bigint
  lastDeduction: bigint
  nextDeduction: bigint
  isActive: boolean
}

// 导航相关类型
export type NavigationItem = {
  id: string
  name: string
  path: string
  icon: string
}

// 钱包状态类型
export interface WalletState {
  isConnected: boolean
  address?: Address
  chainId?: number
  balance?: bigint
}
