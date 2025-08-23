import {
  getFheSwapContract,
  getTokenAContract,
  getTokenBContract,
} from '@/lib/contract'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useAccount, useWalletClient } from 'wagmi'

export const useWriterContract = () => {
  const { isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [tokenAContract, setTokenAContract] = useState<ethers.Contract | null>(
    null
  )
  const [tokenBContract, setTokenBContract] = useState<ethers.Contract | null>(
    null
  )
  const [fheSwapContract, setFheSwapContract] =
    useState<ethers.Contract | null>(null)

  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  useEffect(() => {
    if (!walletClient || !isConnected) return
    const provider = new ethers.BrowserProvider(walletClient)
    provider.getSigner().then(signer => {
      setSigner(signer as any)
      const tokenA = getTokenAContract(signer)
      setTokenAContract(tokenA as any)

      const tokenB = getTokenBContract(signer)
      setTokenBContract(tokenB as any)

      const fheSwap = getFheSwapContract(signer)
      setFheSwapContract(fheSwap as any)
    })
  }, [isConnected, walletClient])

  return {
    tokenAContract,
    tokenBContract,
    fheSwapContract,
    signer,
  }
}
