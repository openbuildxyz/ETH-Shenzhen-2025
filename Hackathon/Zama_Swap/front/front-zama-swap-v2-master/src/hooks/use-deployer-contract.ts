import {
  getFheSwapContract,
  getTokenAContract,
  getTokenBContract,
} from '@/lib/contract'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

export const useDeployerContract = () => {
  const [ownerWallet, setOwnerWallet] = useState<ethers.Wallet | null>(null)
  const { isConnected } = useAccount()
  const [tokenAContract, setTokenAContract] = useState<ethers.Contract | null>(
    null
  )
  const [tokenBContract, setTokenBContract] = useState<ethers.Contract | null>(
    null
  )
  const [fheSwapContract, setFheSwapContract] =
    useState<ethers.Contract | null>(null)

  const ownerAddress = import.meta.env.VITE_OWNER_ADDRESS!
  const ownerMnemonic = import.meta.env.VITE_OWNER_MNEMONIC_PHRASE!
  useEffect(() => {
    if (isConnected) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const ownerWallet = ethers.Wallet.fromPhrase(ownerMnemonic, provider)
      setOwnerWallet(ownerWallet as unknown as ethers.Wallet)

      const tokenA = getTokenAContract(ownerWallet)
      setTokenAContract(tokenA as any)

      const tokenB = getTokenBContract(ownerWallet)
      setTokenBContract(tokenB as any)

      const fheSwap = getFheSwapContract(ownerWallet)
      setFheSwapContract(fheSwap as any)
    }
  }, [isConnected])

  return {
    tokenAContract,
    tokenBContract,
    fheSwapContract,
    ownerAddress,
    ownerWallet,
  }
}
