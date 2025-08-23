import type { Address } from 'viem'
import { createPublicClient, http, encodeFunctionData } from 'viem'
import { sepolia, hardhat } from 'viem/chains'
import { useWallet } from '../contexts/WalletContext'
import { RECOVERY_LOGIC_ABI } from '../config/contracts'
import { useContracts } from './useContracts'
import { useState, useCallback } from 'react'

export const useRecoveryLogic = (recoveryEOA?: Address) => {
  const { userAddress, chainId } = useContracts()
  const { walletClient } = useWallet()
  const [isPending, setIsPending] = useState(false)
  const [whitelist, setWhitelist] = useState<Address[]>([])

  // 获取公共客户端
  const getPublicClient = () => {
    const chain = chainId === 31337 ? hardhat : sepolia
    return createPublicClient({
      chain,
      transport: chainId === 31337 ? http('http://127.0.0.1:8545') : http(),
    })
  }

  // 添加恢复者
  const addRecoverer = async (account: Address, onStatusUpdate?: (status: string) => void) => {
    if (!recoveryEOA) throw new Error('恢复EOA地址未设置')
    if (!walletClient) throw new Error('钱包未连接')
    if (!userAddress) throw new Error('用户地址未设置')
    
    setIsPending(true)
    try {
      onStatusUpdate?.('正在添加白名单地址...')
      const chain = chainId === 31337 ? hardhat : sepolia
      const data = encodeFunctionData({
        abi: RECOVERY_LOGIC_ABI,
        functionName: 'addRecoverer',
        args: [account],
      })
      
      const hash = await walletClient.sendTransaction({
        to: recoveryEOA,
        data,
        account: userAddress,
        chain,
      })
      
      if (hash) {
        onStatusUpdate?.('等待交易确认...')
        const publicClient = getPublicClient()
        await publicClient.waitForTransactionReceipt({ hash })
        onStatusUpdate?.('交易已确认，白名单地址添加成功')
      }
      
      return hash
    } catch (error) {
      onStatusUpdate?.('添加白名单地址失败')
      throw error
    } finally {
      setIsPending(false)
    }
  }

  // 移除恢复者
  const removeRecoverer = async (account: Address, onStatusUpdate?: (status: string) => void) => {
    if (!recoveryEOA) throw new Error('恢复EOA地址未设置')
    if (!walletClient) throw new Error('钱包未连接')
    if (!userAddress) throw new Error('用户地址未设置')
    
    setIsPending(true)
    try {
      onStatusUpdate?.('正在移除白名单地址...')
      const chain = chainId === 31337 ? hardhat : sepolia
      const data = encodeFunctionData({
        abi: RECOVERY_LOGIC_ABI,
        functionName: 'removeRecoverer',
        args: [account],
      })
      
      const hash = await walletClient.sendTransaction({
        to: recoveryEOA,
        data,
        account: userAddress,
        chain,
      })
      
      if (hash) {
        onStatusUpdate?.('等待交易确认...')
        const publicClient = getPublicClient()
        await publicClient.waitForTransactionReceipt({ hash })
        onStatusUpdate?.('交易已确认，白名单地址移除成功')
      }
      
      return hash
    } catch (error) {
      onStatusUpdate?.('移除白名单地址失败')
      throw error
    } finally {
      setIsPending(false)
    }
  }

  // 初始化合约
  const init = async (owner: Address, usdcAddress: Address) => {
    if (!recoveryEOA) throw new Error('恢复EOA地址未设置')
    if (!walletClient) throw new Error('钱包未连接')
    if (!userAddress) throw new Error('用户地址未设置')
    
    setIsPending(true)
    try {
      const chain = chainId === 31337 ? hardhat : sepolia
      const data = encodeFunctionData({
        abi: RECOVERY_LOGIC_ABI,
        functionName: 'init',
        args: [owner, usdcAddress],
      })
      
      const hash = await walletClient.sendTransaction({
        to: recoveryEOA,
        data,
        account: userAddress,
        chain,
      })
      return hash
    } finally {
      setIsPending(false)
    }
  }

  // 执行恢复操作
  const recover = async (newOwner: Address, usdcAmount: string, onStatusUpdate?: (status: string) => void) => {
    if (!recoveryEOA) throw new Error('恢复EOA地址未设置')
    if (!walletClient) throw new Error('钱包未连接')
    if (!userAddress) throw new Error('用户地址未设置')
    console.log('usdcAmount', usdcAmount)
    setIsPending(true)
    try {
      onStatusUpdate?.('正在执行资产恢复...')
      const chain = chainId === 31337 ? hardhat : sepolia
      const data = encodeFunctionData({
        abi: RECOVERY_LOGIC_ABI,
        functionName: 'recover',
        args: [newOwner, BigInt(usdcAmount)],
      })
      
      const hash = await walletClient.sendTransaction({
        to: recoveryEOA,
        data,
        account: userAddress,
        chain,
      })
      
      if (hash) {
        onStatusUpdate?.('等待交易确认...')
        const publicClient = getPublicClient()
        await publicClient.waitForTransactionReceipt({ hash })
        onStatusUpdate?.('交易已确认，资产恢复执行成功')
      }
      
      return hash
    } catch (error) {
      onStatusUpdate?.('资产恢复失败')
      throw error
    } finally {
      setIsPending(false)
    }
  }

  // 检查是否为恢复者
  const isRecoverer = async (account: Address): Promise<boolean> => {
    if (!recoveryEOA) return false
    
    try {
      const publicClient = getPublicClient()
      const result = await publicClient.readContract({
        address: recoveryEOA,
        abi: RECOVERY_LOGIC_ABI,
        functionName: 'isRecoverer',
        args: [account],
      })
      return result as boolean
    } catch (error) {
      console.error('Failed to check recoverer status:', error)
      return false
    }
  }

  // 获取合约所有者
  const getOwner = useCallback(async (): Promise<Address | null> => {
    if (!recoveryEOA) return null
    
    try {
      const publicClient = getPublicClient()
      const result = await publicClient.readContract({
        address: recoveryEOA,
        abi: RECOVERY_LOGIC_ABI,
        functionName: 'getOwner',
      })
      return result as Address
    } catch (error) {
      console.error('Failed to get owner:', error)
      return null
    }
  }, [recoveryEOA, chainId])

  // 获取恢复者列表
  const getRecoverers = useCallback(async (): Promise<Address[]> => {
    if (!recoveryEOA) return []
    
    try {
      const publicClient = getPublicClient()
      const result = await publicClient.readContract({
        address: recoveryEOA,
        abi: RECOVERY_LOGIC_ABI,
        functionName: 'getRecoverers',
      })
      const addresses = result as Address[]
      setWhitelist(addresses)
      return addresses
    } catch (error) {
      console.error('Failed to get recoverers:', error)
      return []
    }
  }, [recoveryEOA, chainId])

  // 获取USDC授权额度
  const getUSDCAllowance = useCallback(async (): Promise<string> => {
    if (!recoveryEOA) return '0'
    
    try {
      const publicClient = getPublicClient()
      const result = await publicClient.readContract({
        address: recoveryEOA,
        abi: RECOVERY_LOGIC_ABI,
        functionName: 'getUSDCAllowance',
      })
      return (result as bigint).toString()
    } catch (error) {
      console.error('Failed to get USDC allowance:', error)
      return '0'
    }
  }, [recoveryEOA, chainId])

  // 获取所有者USDC余额
  const getOwnerUSDCBalance = useCallback(async (): Promise<string> => {
    if (!recoveryEOA) return '0'
    
    try {
      const publicClient = getPublicClient()
      const result = await publicClient.readContract({
        address: recoveryEOA,
        abi: RECOVERY_LOGIC_ABI,
        functionName: 'getOwnerUSDCBalance',
      })
      return (result as bigint).toString()
    } catch (error) {
      console.error('Failed to get owner USDC balance:', error)
      return '0'
    }
  }, [recoveryEOA, chainId])

  return {
    init,
    addRecoverer,
    removeRecoverer,
    recover,
    isRecoverer,
    getOwner,
    getRecoverers,
    getUSDCAllowance,
    getOwnerUSDCBalance,
    isPending,
    whitelist: whitelist, // 保持向后兼容，实际为recoverers
  }
}
