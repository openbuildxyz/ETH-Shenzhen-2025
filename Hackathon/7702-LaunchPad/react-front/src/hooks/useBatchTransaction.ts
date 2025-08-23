import type { Address } from 'viem'
import { parseEther, createPublicClient, http } from 'viem'
import { sepolia, hardhat } from 'viem/chains'
import { useWallet } from '../contexts/WalletContext'
import { useContracts } from './useContracts'
import { useState } from 'react'

export interface BatchTransactionItem {
  recipient: Address
  amount: string
  data?: `0x${string}`
}

// BatchTxLogic 合约的 Call 结构体接口
export interface MulticallItem {
  target: Address
  data: `0x${string}`
}

// BatchTxLogic 合约 ABI
const BATCH_TX_LOGIC_ABI = [
  {
    name: 'multicall',
    type: 'function',
    inputs: [
      {
        name: 'calls',
        type: 'tuple[]',
        components: [
          { name: 'target', type: 'address' },
          { name: 'data', type: 'bytes' }
        ]
      }
    ],
    outputs: [
      { name: 'results', type: 'bytes[]' }
    ],
    stateMutability: 'payable',
  },
  {
    name: 'batchTransferFrom',
    type: 'function',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'recipients', type: 'address[]' },
      { name: 'amounts', type: 'uint256[]' }
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'init',
    type: 'function',
    inputs: [
      { name: '_owner', type: 'address' }
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'getOwner',
    type: 'function',
    inputs: [],
    outputs: [
      { name: '', type: 'address' }
    ],
    stateMutability: 'view',
  }
] as const

export const useBatchTransaction = () => {
  const { userAddress, chainId } = useContracts()
  const { walletClient } = useWallet()
  const [isPending, setIsPending] = useState(false)

  // 简单的批量转账（直接发送ETH）- 保持向后兼容
  const executeBatchTransfer = async (transactions: BatchTransactionItem[]) => {
    if (!userAddress) throw new Error('钱包未连接')
    
    // 这里实现批量转账逻辑
    // 在实际应用中，可能需要使用多调用合约或者循环执行
    const results = []
    
    for (const tx of transactions) {
      try {
        // 使用原生ETH转账
        if (!walletClient) throw new Error('钱包客户端未连接')
        const chain = chainId === 31337 ? hardhat : sepolia
        const result = await walletClient.sendTransaction({
          to: tx.recipient,
          value: parseEther(tx.amount),
          account: userAddress,
          chain,
        })
        results.push({ success: true, hash: result, recipient: tx.recipient })
      } catch (error) {
        console.error(`转账到 ${tx.recipient} 失败:`, error)
        results.push({ success: false, error, recipient: tx.recipient })
      }
    }
    
    return results
  }

  // 使用 BatchTxLogic 合约的 multicall 方法执行批量交易
  const executeMulticall = async (
    batchTxLogicAddress: Address,
    calls: MulticallItem[],
    totalValue?: bigint,
    onStatusUpdate?: (status: string) => void
  ) => {
    if (!userAddress) throw new Error('钱包未连接')
    if (!walletClient) throw new Error('钱包客户端未连接')
    if (calls.length === 0) throw new Error('调用列表不能为空')
    
    setIsPending(true)
    try {
      onStatusUpdate?.('正在执行批量交易...')
      const chain = chainId === 31337 ? hardhat : sepolia
      const hash = await walletClient.writeContract({
        address: batchTxLogicAddress,
        abi: BATCH_TX_LOGIC_ABI,
        functionName: 'multicall',
        args: [calls as any], // 临时类型断言，因为 wagmi 的类型推断问题
        value: totalValue || 0n,
        account: userAddress,
        chain,
      })
      
      if (hash) {
        onStatusUpdate?.('等待交易确认...')
        const publicClient = createPublicClient({
          chain: chain,
          transport: http()
        })
        
        await publicClient.waitForTransactionReceipt({ hash })
        onStatusUpdate?.('交易已确认，批量交易执行成功')
      }
      
      return {
        success: true,
        hash,
        callCount: calls.length
      }
    } catch (error) {
      console.error('Multicall 执行失败:', error)
      onStatusUpdate?.('批量交易执行失败')
      throw error
    } finally {
      setIsPending(false)
    }
  }

  // 使用 BatchTxLogic 合约执行批量 ETH 转账
  const executeBatchEthTransfer = async (
    batchTxLogicAddress: Address,
    transactions: BatchTransactionItem[]
  ) => {
    if (!userAddress) throw new Error('钱包未连接')
    if (transactions.length === 0) throw new Error('交易列表不能为空')
    
    // 构建 multicall 调用数据
    const calls: MulticallItem[] = transactions.map(tx => ({
      target: tx.recipient,
      data: '0x' // ETH 转账使用空数据
    }))
    
    // 计算总转账金额
    const totalValue = transactions.reduce(
      (sum, tx) => sum + parseEther(tx.amount),
      0n
    )
    
    try {
      const result = await executeMulticall(batchTxLogicAddress, calls, totalValue)
      
      return {
        success: true,
        hash: result.hash,
        transactions: transactions.map(tx => ({
          recipient: tx.recipient,
          amount: tx.amount,
          success: true
        }))
      }
    } catch (error) {
      console.error('批量 ETH 转账失败:', error)
      return {
        success: false,
        error,
        transactions: transactions.map(tx => ({
          recipient: tx.recipient,
          amount: tx.amount,
          success: false,
          error
        }))
      }
    }
  }

  // 使用 BatchTxLogic 合约执行批量 ERC20 代币转账
  const executeBatchTokenTransfer = async (
    batchTxLogicAddress: Address,
    tokenAddress: Address,
    transactions: BatchTransactionItem[],
    onStatusUpdate?: (status: string) => void
  ) => {
    if (!userAddress) throw new Error('钱包未连接')
    if (!walletClient) throw new Error('钱包客户端未连接')
    if (transactions.length === 0) throw new Error('交易列表不能为空')
    
    // 提取接收者地址和金额数组
    const recipients = transactions.map(tx => tx.recipient)
    const amounts = transactions.map(tx => parseEther(tx.amount))
    
    setIsPending(true)
    try {
      onStatusUpdate?.('正在执行批量代币转账...')
      const chain = chainId === 31337 ? hardhat : sepolia
      const hash = await walletClient.writeContract({
        address: batchTxLogicAddress,
        abi: BATCH_TX_LOGIC_ABI,
        functionName: 'batchTransferFrom',
        args: [tokenAddress, recipients, amounts],
        account: userAddress,
        chain,
      })
      
      if (hash) {
        onStatusUpdate?.('等待交易确认...')
        const publicClient = createPublicClient({
          chain: chain,
          transport: http()
        })
        
        await publicClient.waitForTransactionReceipt({ hash })
        onStatusUpdate?.('交易已确认，批量代币转账成功')
      }
      
      return {
        success: true,
        hash,
        transactions: transactions.map(tx => ({
          recipient: tx.recipient,
          amount: tx.amount,
          success: true
        }))
      }
    } catch (error) {
      console.error('批量 ERC20 转账失败:', error)
      onStatusUpdate?.('批量代币转账失败')
      return {
        success: false,
        error,
        transactions: transactions.map(tx => ({
          recipient: tx.recipient,
          amount: tx.amount,
          success: false,
          error
        }))
      }
    } finally {
      setIsPending(false)
    }
  }

  // 原始的单个 ERC20 代币转账方法（保持向后兼容）
  const executeSingleTokenTransfer = async (
    tokenAddress: Address,
    transactions: BatchTransactionItem[]
  ) => {
    if (!userAddress) throw new Error('钱包未连接')
    
    const results = []
    
    for (const tx of transactions) {
      try {
        if (!walletClient) throw new Error('钱包客户端未连接')
        const chain = chainId === 31337 ? hardhat : sepolia
        const result = await walletClient.writeContract({
          address: tokenAddress,
          abi: [{
            name: 'transfer',
            type: 'function',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ],
            outputs: [{ name: '', type: 'bool' }],
            stateMutability: 'nonpayable',
          }],
          functionName: 'transfer',
          args: [tx.recipient, parseEther(tx.amount)],
          account: userAddress,
          chain,
        })
        
        results.push({ success: true, hash: result, recipient: tx.recipient })
      } catch (error) {
        console.error(`代币转账到 ${tx.recipient} 失败:`, error)
        results.push({ success: false, error, recipient: tx.recipient })
      }
    }
    
    return results
  }

  // 估算批量交易的Gas费用
  const estimateBatchGas = async (transactions: BatchTransactionItem[]) => {
    // TODO: 实现Gas估算逻辑
    // 这需要调用eth_estimateGas来估算每笔交易的Gas使用量
    const estimatedGasPerTx = 21000n // 基础转账Gas
    const totalGas = estimatedGasPerTx * BigInt(transactions.length)
    
    return {
      totalGas,
      estimatedGasPerTx,
      transactionCount: transactions.length,
    }
  }

  return {
    // 新的 BatchTxLogic 合约方法
    executeMulticall,
    executeBatchEthTransfer,
    executeBatchTokenTransfer,
    
    // 向后兼容的原始方法
    executeBatchTransfer,
    executeSingleTokenTransfer,
    estimateBatchGas,
    
    // 状态
    isPending,
    
    // 常量
    BATCH_TX_LOGIC_ABI,
  }
}
