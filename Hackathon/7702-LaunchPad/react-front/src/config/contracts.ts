import { Address } from 'viem'

// 合约地址配置 - 在实际部署时需要替换为真实地址
export const CONTRACT_ADDRESSES = {
  // Sepolia 测试网地址
  sepolia: {
    recordContractPlatform: '0x0000000000000000000000000000000000000000' as Address,
    recoveryLogic: '0x0000000000000000000000000000000000000000' as Address,
    subscriptionLogic: '0x0000000000000000000000000000000000000000' as Address,
    batchTxLogic: '0x0000000000000000000000000000000000000000' as Address,
    usdc: '0xBb4ca8a90058073e0c47EA221db534962eebB9A1' as Address, // Sepolia USDC
  },
  // 本地开发网络地址
  hardhat: {
    recordContractPlatform: '0x0000000000000000000000000000000000000000' as Address,
    recoveryLogic: '0x0000000000000000000000000000000000000000' as Address,
    subscriptionLogic: '0x0000000000000000000000000000000000000000' as Address,
    batchTxLogic: '0x0000000000000000000000000000000000000000' as Address,
    usdc: '0x0000000000000000000000000000000000000000' as Address,
  },
} as const

// RecordContractPlatform 合约 ABI
export const RECORD_CONTRACT_PLATFORM_ABI = [
  {
    inputs: [
      { name: 'child', type: 'address' },
      { name: 'role', type: 'string' }
    ],
    name: 'addChild',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'child', type: 'address' }],
    name: 'removeChild',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'getChildren',
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'childEOA', type: 'address' },
          { name: 'role', type: 'string' }
        ]
      }
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'role', type: 'string' }
    ],
    name: 'getChildByRole',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'getChildrenCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'child', type: 'address' }
    ],
    name: 'isChildOf',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// RecoveryLogic 合约 ABI
export const RECOVERY_LOGIC_ABI = [
  {
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_usdc', type: 'address' }
    ],
    name: 'init',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getOwner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'recoverer', type: 'address' }],
    name: 'addRecoverer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'recoverer', type: 'address' }],
    name: 'removeRecoverer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'recover',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getRecoverers',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'addr', type: 'address' }],
    name: 'isRecoverer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getUSDCAllowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getOwnerUSDCBalance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// SubscriptionLogic 合约 ABI
export const SUBSCRIPTION_LOGIC_ABI = [
  {
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'init',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getOwner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_token', type: 'address' },
      { name: '_provider', type: 'address' },
      { name: '_cycle', type: 'uint256' },
      { name: '_amount', type: 'uint256' }
    ],
    name: 'setSubscription',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_cycle', type: 'uint256' },
      { name: '_amount', type: 'uint256' }
    ],
    name: 'updateSubscription',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_amount', type: 'uint256' }],
    name: 'deductMoney',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'periods', type: 'uint256' }],
    name: 'deductMultiplePeriods',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pauseSubscription',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'resumeSubscription',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'cancelSubscription',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'newProvider', type: 'address' }],
    name: 'changeProvider',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'canDeduct',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'timeUntilNextPayment',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getSubscriptionInfo',
    outputs: [
      { name: '_token', type: 'address' },
      { name: '_provider', type: 'address' },
      { name: '_cycle', type: 'uint256' },
      { name: '_amount', type: 'uint256' },
      { name: '_nextPaymentTime', type: 'uint256' },
      { name: '_isActive', type: 'bool' },
      { name: '_totalPayments', type: 'uint256' },
      { name: '_totalAmountPaid', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTokenAllowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getOwnerTokenBalance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'estimatePayablePeriods',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// ERC20 代币 ABI (简化版)
export const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
