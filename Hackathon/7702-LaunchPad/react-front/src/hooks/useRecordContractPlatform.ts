import type { Address } from 'viem'
import { createPublicClient, http } from 'viem'
import { sepolia, hardhat } from 'viem/chains'
import { useWallet } from '../contexts/WalletContext'
import { RECORD_CONTRACT_PLATFORM_ABI } from '../config/contracts'
import { useContracts } from './useContracts'
import { useState, useCallback } from 'react'

export interface Child {
  childEOA: Address
  role: string
}

export const useRecordContractPlatform = () => {
  const { userAddress, chainId } = useContracts()
  const { walletClient } = useWallet()
  const [isPending, setIsPending] = useState(false)
  const [children, setChildren] = useState<Child[]>([])

  // 获取合约地址
  const getContractAddress = (): Address => {
    switch (chainId) {
      case 11155111: // Sepolia
        return '0xB1Db2211cB3bFAe1fB676104cA21f236F832435D' // 需要替换为实际部署的地址
      case 31337: // Hardhat
        return '0x0000000000000000000000000000000000000000' // 需要替换为实际部署的地址
      default:
        return '0x0000000000000000000000000000000000000000'
    }
  }

  // 获取公共客户端
  const getPublicClient = () => {
    const chain = chainId === 31337 ? hardhat : sepolia
    return createPublicClient({
      chain,
      transport: chainId === 31337 ? http('http://127.0.0.1:8545') : http(),
    })
  }

  // 添加子EOA
  const addChild = async (childAddress: Address, role: string) => {
    const contractAddress = getContractAddress()
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('RecordContractPlatform合约地址未设置')
    }
    if (!walletClient) throw new Error('钱包未连接')
    if (!userAddress) throw new Error('用户地址未设置')
    
    setIsPending(true)
    try {
      const chain = chainId === 31337 ? hardhat : sepolia
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: RECORD_CONTRACT_PLATFORM_ABI,
        functionName: 'addChild',
        args: [childAddress, role],
        account: userAddress,
        chain,
      })
      
      // 添加成功后刷新子EOA列表
      await fetchChildren()
      
      return hash
    } finally {
      setIsPending(false)
    }
  }

  // 移除子EOA
  const removeChild = async (childAddress: Address) => {
    const contractAddress = getContractAddress()
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('RecordContractPlatform合约地址未设置')
    }
    if (!walletClient) throw new Error('钱包未连接')
    if (!userAddress) throw new Error('用户地址未设置')
    
    setIsPending(true)
    try {
      const chain = chainId === 31337 ? hardhat : sepolia
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: RECORD_CONTRACT_PLATFORM_ABI,
        functionName: 'removeChild',
        args: [childAddress],
        account: userAddress,
        chain,
      })
      
      // 移除成功后刷新子EOA列表
      await fetchChildren()
      
      return hash
    } finally {
      setIsPending(false)
    }
  }

  // 获取子EOA列表
  const fetchChildren = useCallback(async (ownerAddress?: Address) => {
    const contractAddress = getContractAddress()
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      console.warn('RecordContractPlatform合约地址未设置')
      return []
    }
    
    const targetAddress = ownerAddress || userAddress
    if (!targetAddress) {
      console.warn('未提供查询地址')
      return []
    }
    
    try {
      const publicClient = getPublicClient()
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: RECORD_CONTRACT_PLATFORM_ABI,
        functionName: 'getChildren',
        args: [targetAddress],
      }) as Child[]
      
      setChildren(result)
      return result
    } catch (error) {
      console.error('获取子EOA列表失败:', error)
      return []
    }
  }, [userAddress, chainId])

  // 根据角色获取子EOA地址
  const getChildByRole = useCallback(async (role: string, ownerAddress?: Address): Promise<Address | null> => {
    const contractAddress = getContractAddress()
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      console.warn('RecordContractPlatform合约地址未设置')
      return null
    }
    
    const targetAddress = ownerAddress || userAddress
    if (!targetAddress) {
      console.warn('未提供查询地址')
      return null
    }
    
    try {
      const publicClient = getPublicClient()
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: RECORD_CONTRACT_PLATFORM_ABI,
        functionName: 'getChildByRole',
        args: [targetAddress, role],
      }) as Address
      
      return result === '0x0000000000000000000000000000000000000000' ? null : result
    } catch (error) {
      console.error('根据角色获取子EOA失败:', error)
      return null
    }
  }, [userAddress, chainId])

  // 获取子EOA数量
  const getChildrenCount = useCallback(async (ownerAddress?: Address): Promise<number> => {
    const contractAddress = getContractAddress()
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      return 0
    }
    
    const targetAddress = ownerAddress || userAddress
    if (!targetAddress) {
      return 0
    }
    
    try {
      const publicClient = getPublicClient()
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: RECORD_CONTRACT_PLATFORM_ABI,
        functionName: 'getChildrenCount',
        args: [targetAddress],
      }) as bigint
      
      return Number(result)
    } catch (error) {
      console.error('获取子EOA数量失败:', error)
      return 0
    }
  }, [userAddress, chainId])

  // 检查是否为子EOA
  const isChildOf = useCallback(async (childAddress: Address, ownerAddress?: Address): Promise<boolean> => {
    const contractAddress = getContractAddress()
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      return false
    }
    
    const targetAddress = ownerAddress || userAddress
    if (!targetAddress) {
      return false
    }
    
    try {
      const publicClient = getPublicClient()
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: RECORD_CONTRACT_PLATFORM_ABI,
        functionName: 'isChildOf',
        args: [targetAddress, childAddress],
      }) as boolean
      
      return result
    } catch (error) {
      console.error('检查子EOA关系失败:', error)
      return false
    }
  }, [userAddress, chainId])

  return {
    isPending,
    children,
    addChild,
    removeChild,
    fetchChildren,
    getChildByRole,
    getChildrenCount,
    isChildOf,
    contractAddress: getContractAddress(),
  }
}