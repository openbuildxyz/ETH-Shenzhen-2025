import type { Address } from 'viem'
import { createPublicClient, http, encodeFunctionData } from 'viem'
import { sepolia, hardhat } from 'viem/chains'
import { useWallet } from '../contexts/WalletContext'
import { SUBSCRIPTION_LOGIC_ABI } from '../config/contracts'
import { useContracts } from './useContracts'
import { useState, useCallback } from 'react'

export interface SubscriptionInfo {
  provider: Address
  period: bigint
  amount: bigint
  lastDeduction: bigint
  nextDeduction: bigint
  isActive: boolean
  isPaused: boolean
}

export const useSubscriptionLogic = (subscriptionEOA?: Address) => {
  const { userAddress, chainId } = useContracts()
  const { walletClient } = useWallet()
  const [isPending, setIsPending] = useState(false)


  // 获取公共客户端
  const getPublicClient = () => {
    const chain = chainId === 31337 ? hardhat : sepolia
    return createPublicClient({
      chain,
      transport: chainId === 31337 ? http('http://127.0.0.1:8545') : http(),
    })
  }

  // 初始化合约
  const init = async (owner: Address) => {
    if (!subscriptionEOA) throw new Error('订阅EOA地址未设置')
    if (!walletClient) throw new Error('钱包未连接')
    if (!userAddress) throw new Error('用户地址未设置')
    
    setIsPending(true)
    try {
      const chain = chainId === 31337 ? hardhat : sepolia
      const data = encodeFunctionData({
        abi: SUBSCRIPTION_LOGIC_ABI,
        functionName: 'init',
        args: [owner],
      })
      
      const hash = await walletClient.sendTransaction({
        to: subscriptionEOA,
        data,
        account: userAddress,
        chain,
      })
      return hash
    } finally {
      setIsPending(false)
    }
  }

  // 设置订阅
  const setSubscription = async (token: Address, provider: Address, cycle: bigint, amount: bigint, onStatusUpdate?: (status: string) => void) => {
    if (!subscriptionEOA) throw new Error('订阅EOA地址未设置')
    if (!walletClient) throw new Error('钱包未连接')
    if (!userAddress) throw new Error('用户地址未设置')
    
    setIsPending(true)
    try {
      onStatusUpdate?.('正在设置订阅...')
      const chain = chainId === 31337 ? hardhat : sepolia
      const data = encodeFunctionData({
        abi: SUBSCRIPTION_LOGIC_ABI,
        functionName: 'setSubscription',
        args: [token, provider, cycle, amount],
      })
      
      const hash = await walletClient.sendTransaction({
        to: subscriptionEOA,
        data,
        account: userAddress,
        chain,
      })
      
      if (hash) {
        onStatusUpdate?.('等待交易确认...')
        const publicClient = getPublicClient()
        await publicClient.waitForTransactionReceipt({ hash })
        onStatusUpdate?.('交易已确认，订阅设置成功')
      }
      
      return hash
    } catch (error) {
      onStatusUpdate?.('设置订阅失败')
      throw error
    } finally {
      setIsPending(false)
    }
  }

  // 更新订阅
  const updateSubscription = async (cycle: bigint, amount: bigint) => {
    if (!subscriptionEOA) throw new Error('订阅EOA地址未设置')
    if (!walletClient) throw new Error('钱包未连接')
    if (!userAddress) throw new Error('用户地址未设置')
    
    setIsPending(true)
    try {
      const chain = chainId === 31337 ? hardhat : sepolia
      const data = encodeFunctionData({
        abi: SUBSCRIPTION_LOGIC_ABI,
        functionName: 'updateSubscription',
        args: [cycle, amount],
      })
      
      const hash = await walletClient.sendTransaction({
        to: subscriptionEOA,
        data,
        account: userAddress,
        chain,
      })
      return hash
    } finally {
      setIsPending(false)
    }
  }

  // 执行扣费
  const deductMoney = async (amount: bigint, onStatusUpdate?: (status: string) => void) => {
    if (!subscriptionEOA) throw new Error('订阅EOA地址未设置')
    if (!walletClient) throw new Error('钱包未连接')
    if (!userAddress) throw new Error('用户地址未设置')
    
    setIsPending(true)
    try {
      onStatusUpdate?.('正在执行扣费...')
      const chain = chainId === 31337 ? hardhat : sepolia
      const data = encodeFunctionData({
        abi: SUBSCRIPTION_LOGIC_ABI,
        functionName: 'deductMoney',
        args: [amount],
      })
      
      const hash = await walletClient.sendTransaction({
        to: subscriptionEOA,
        data,
        account: userAddress,
        chain,
      })
      
      if (hash) {
        onStatusUpdate?.('等待交易确认...')
        const publicClient = getPublicClient()
        await publicClient.waitForTransactionReceipt({ hash })
        onStatusUpdate?.('交易已确认，扣费执行成功')
      }
      
      return hash
    } catch (error) {
      onStatusUpdate?.('扣费失败')
      throw error
    } finally {
      setIsPending(false)
    }
  }

  // 扣费多个周期
  const deductMultiplePeriods = async (periods: bigint) => {
    if (!subscriptionEOA) throw new Error('订阅EOA地址未设置')
    if (!walletClient) throw new Error('钱包未连接')
    if (!userAddress) throw new Error('用户地址未设置')
    
    setIsPending(true)
    try {
      const chain = chainId === 31337 ? hardhat : sepolia
      const data = encodeFunctionData({
        abi: SUBSCRIPTION_LOGIC_ABI,
        functionName: 'deductMultiplePeriods',
        args: [periods],
      })
      
      const hash = await walletClient.sendTransaction({
        to: subscriptionEOA,
        data,
        account: userAddress,
        chain,
      })
      return hash
    } finally {
      setIsPending(false)
    }
  }

  // 暂停订阅
  const pauseSubscription = async (onStatusUpdate?: (status: string) => void) => {
    if (!subscriptionEOA) throw new Error('订阅EOA地址未设置')
    if (!walletClient) throw new Error('钱包未连接')
    if (!userAddress) throw new Error('用户地址未设置')
    
    setIsPending(true)
    try {
      onStatusUpdate?.('正在暂停订阅...')
      const chain = chainId === 31337 ? hardhat : sepolia
      const data = encodeFunctionData({
        abi: SUBSCRIPTION_LOGIC_ABI,
        functionName: 'pauseSubscription',
        args: [],
      })
      
      const hash = await walletClient.sendTransaction({
        to: subscriptionEOA,
        data,
        account: userAddress,
        chain,
      })
      
      if (hash) {
        onStatusUpdate?.('等待交易确认...')
        const publicClient = getPublicClient()
        await publicClient.waitForTransactionReceipt({ hash })
        onStatusUpdate?.('交易已确认，订阅已暂停')
      }
      
      return hash
    } catch (error) {
      onStatusUpdate?.('暂停订阅失败')
      throw error
    } finally {
      setIsPending(false)
    }
  }

  // 恢复订阅
  const resumeSubscription = async (onStatusUpdate?: (status: string) => void) => {
    if (!subscriptionEOA) throw new Error('订阅EOA地址未设置')
    if (!walletClient) throw new Error('钱包未连接')
    if (!userAddress) throw new Error('用户地址未设置')
    
    setIsPending(true)
    try {
      onStatusUpdate?.('正在恢复订阅...')
      const chain = chainId === 31337 ? hardhat : sepolia
      const data = encodeFunctionData({
        abi: SUBSCRIPTION_LOGIC_ABI,
        functionName: 'resumeSubscription',
        args: [],
      })
      
      const hash = await walletClient.sendTransaction({
        to: subscriptionEOA,
        data,
        account: userAddress,
        chain,
      })
      
      if (hash) {
        onStatusUpdate?.('等待交易确认...')
        const publicClient = getPublicClient()
        await publicClient.waitForTransactionReceipt({ hash })
        onStatusUpdate?.('交易已确认，订阅已恢复')
      }
      
      return hash
    } catch (error) {
      onStatusUpdate?.('恢复订阅失败')
      throw error
    } finally {
      setIsPending(false)
    }
  }

  // 取消订阅
  const cancelSubscription = async (onStatusUpdate?: (status: string) => void) => {
    if (!subscriptionEOA) throw new Error('订阅EOA地址未设置')
    if (!walletClient) throw new Error('钱包未连接')
    if (!userAddress) throw new Error('用户地址未设置')
    
    setIsPending(true)
    try {
      onStatusUpdate?.('正在取消订阅...')
      const chain = chainId === 31337 ? hardhat : sepolia
      const data = encodeFunctionData({
        abi: SUBSCRIPTION_LOGIC_ABI,
        functionName: 'cancelSubscription',
        args: [],
      })
      
      const hash = await walletClient.sendTransaction({
        to: subscriptionEOA,
        data,
        account: userAddress,
        chain,
      })
      
      if (hash) {
        onStatusUpdate?.('等待交易确认...')
        const publicClient = getPublicClient()
        await publicClient.waitForTransactionReceipt({ hash })
        onStatusUpdate?.('交易已确认，订阅已取消')
      }
      
      return hash
    } catch (error) {
      onStatusUpdate?.('取消订阅失败')
      throw error
    } finally {
      setIsPending(false)
    }
  }

  // 更换服务提供商
  const changeProvider = async (newProvider: Address) => {
    if (!subscriptionEOA) throw new Error('订阅EOA地址未设置')
    if (!walletClient) throw new Error('钱包未连接')
    if (!userAddress) throw new Error('用户地址未设置')
    
    setIsPending(true)
    try {
      const chain = chainId === 31337 ? hardhat : sepolia
      const data = encodeFunctionData({
        abi: SUBSCRIPTION_LOGIC_ABI,
        functionName: 'changeProvider',
        args: [newProvider],
      })
      
      const hash = await walletClient.sendTransaction({
        to: subscriptionEOA,
        data,
        account: userAddress,
        chain,
      })
      return hash
    } finally {
      setIsPending(false)
    }
  }

  // 获取合约所有者
  const getOwner = useCallback(async (): Promise<Address | null> => {
    if (!subscriptionEOA) return null
    
    try {
      const publicClient = getPublicClient()
      const result = await publicClient.readContract({
        address: subscriptionEOA,
        abi: SUBSCRIPTION_LOGIC_ABI,
        functionName: 'getOwner',
      })
      return result as Address
    } catch (error) {
      console.error('Failed to get owner:', error)
      return null
    }
  }, [subscriptionEOA, chainId])

  // 检查是否可以扣费
  const canDeduct = useCallback(async (): Promise<boolean> => {
    if (!subscriptionEOA) return false
    
    try {
      const publicClient = getPublicClient()
      const result = await publicClient.readContract({
        address: subscriptionEOA,
        abi: SUBSCRIPTION_LOGIC_ABI,
        functionName: 'canDeduct',
      })
      return result as boolean
    } catch (error) {
      console.error('Failed to check if can deduct:', error)
      return false
    }
  }, [subscriptionEOA, chainId])

  // 获取下次付款时间
  const timeUntilNextPayment = useCallback(async (): Promise<bigint> => {
    if (!subscriptionEOA) return BigInt(0)
    
    try {
      const publicClient = getPublicClient()
      const result = await publicClient.readContract({
        address: subscriptionEOA,
        abi: SUBSCRIPTION_LOGIC_ABI,
        functionName: 'timeUntilNextPayment',
      })
      return result as bigint
    } catch (error) {
      console.error('Failed to get time until next payment:', error)
      return BigInt(0)
    }
  }, [subscriptionEOA, chainId])

  // 获取订阅信息
  const getSubscriptionInfo = useCallback(async (): Promise<SubscriptionInfo | null> => {
    if (!subscriptionEOA) return null
    
    try {
      const publicClient = getPublicClient()
      const result = await publicClient.readContract({
        address: subscriptionEOA,
        abi: SUBSCRIPTION_LOGIC_ABI,
        functionName: 'getSubscriptionInfo',
      })
      const resultArray = result as unknown as readonly [Address, Address, bigint, bigint, bigint, boolean, bigint, bigint]
      const [, provider, cycle, amount, nextPaymentTime, isActive, totalPayments] = resultArray
      
      // 计算上次扣费时间：如果有扣费记录，则为下次扣费时间减去周期
      const lastDeduction = totalPayments > 0n ? nextPaymentTime - cycle : 0n
      
      const info: SubscriptionInfo = {
        provider,
        period: cycle,
        amount,
        lastDeduction,
        nextDeduction: nextPaymentTime,
        isActive,
        isPaused: false // 需要根据实际合约返回值调整
      }
      return info
    } catch (error) {
      console.error('Failed to get subscription info:', error)
      return null
    }
  }, [subscriptionEOA, chainId])

  // 获取代币授权额度
  const getTokenAllowance = useCallback(async (): Promise<string> => {
    if (!subscriptionEOA) return '0'
    
    try {
      const publicClient = getPublicClient()
      const result = await publicClient.readContract({
        address: subscriptionEOA,
        abi: SUBSCRIPTION_LOGIC_ABI,
        functionName: 'getTokenAllowance',
      })
      return (result as bigint).toString()
    } catch (error) {
      console.error('Failed to get token allowance:', error)
      return '0'
    }
  }, [subscriptionEOA, chainId])

  // 获取所有者代币余额
  const getOwnerTokenBalance = useCallback(async (): Promise<string> => {
    if (!subscriptionEOA) return '0'
    
    try {
      const publicClient = getPublicClient()
      const result = await publicClient.readContract({
        address: subscriptionEOA,
        abi: SUBSCRIPTION_LOGIC_ABI,
        functionName: 'getOwnerTokenBalance',
      })
      return (result as bigint).toString()
    } catch (error) {
      console.error('Failed to get owner token balance:', error)
      return '0'
    }
  }, [subscriptionEOA, chainId])

  // 估算可支付周期数
  const estimatePayablePeriods = useCallback(async (): Promise<number> => {
    if (!subscriptionEOA) return 0
    
    try {
      const publicClient = getPublicClient()
      const result = await publicClient.readContract({
        address: subscriptionEOA,
        abi: SUBSCRIPTION_LOGIC_ABI,
        functionName: 'estimatePayablePeriods',
      })
      return Number(result as bigint)
    } catch (error) {
      console.error('Failed to estimate payable periods:', error)
      return 0
    }
  }, [subscriptionEOA, chainId])

  return {
    init,
    setSubscription,
    updateSubscription,
    deductMoney,
    deductMultiplePeriods,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    changeProvider,
    getOwner,
    canDeduct,
    timeUntilNextPayment,
    getSubscriptionInfo,
    getTokenAllowance,
    getOwnerTokenBalance,
    estimatePayablePeriods,
    isPending,
  }
}
