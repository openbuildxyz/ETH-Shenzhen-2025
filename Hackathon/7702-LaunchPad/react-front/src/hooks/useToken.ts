import type { Address } from 'viem'
import { parseEther, createPublicClient, http } from 'viem'
import { sepolia, hardhat } from 'viem/chains'
import { useWallet } from '../contexts/WalletContext'
import { ERC20_ABI } from '../config/contracts'
import { useContracts } from './useContracts'
import { useState } from 'react'

export const useToken = () => {
  const { usdcAddress, userAddress, chainId } = useContracts()
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

  // 授权代币
  const approve = async (spender: Address, amount: string) => {
    if (!usdcAddress) throw new Error('代币地址未设置')
    if (!walletClient) throw new Error('钱包未连接')
    if (!userAddress) throw new Error('用户地址未设置')
    
    setIsPending(true)
     try {
       const chain = chainId === 31337 ? hardhat : sepolia
       const hash = await walletClient.writeContract({
         address: usdcAddress,
         abi: ERC20_ABI,
         functionName: 'approve',
         args: [spender, parseEther(amount)],
         account: userAddress,
         chain,
       })
       return hash
     } finally {
       setIsPending(false)
     }
  }

  // 获取授权额度
  const getAllowance = async (spender: Address): Promise<bigint> => {
    if (!usdcAddress || !userAddress) return BigInt(0)
    
    try {
      const publicClient = getPublicClient()
      const result = await publicClient.readContract({
        address: usdcAddress,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [userAddress, spender],
      })
      return result as bigint
    } catch (error) {
      console.error('Failed to get allowance:', error)
      return BigInt(0)
    }
  }

  // 获取余额
  const getBalance = async (account?: Address): Promise<bigint> => {
    const targetAccount = account || userAddress
    if (!usdcAddress || !targetAccount) return BigInt(0)
    
    try {
      const publicClient = getPublicClient()
      const result = await publicClient.readContract({
        address: usdcAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [targetAccount],
      })
      return result as bigint
    } catch (error) {
      console.error('Failed to get balance:', error)
      return BigInt(0)
    }
  }

  return {
    approve,
    getAllowance,
    getBalance,
    isPending,
  }
}
