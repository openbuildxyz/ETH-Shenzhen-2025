import { tokenAAddress, tokenBAddress } from '@/lib/contract'
import { userDecrypt } from '@/lib/fhe/user-decrypt'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'
import { useWriterContract } from './use-writer-contract'

export const useBalance = () => {
  const { isConnected, address } = useAccount()
  const { tokenAContract, tokenBContract, signer } = useWriterContract()

  const { data: encryptedBalance, refetch } = useQuery({
    queryKey: ['balance'],
    queryFn: async () => {
      const tokenABalance = await tokenAContract?.confidentialBalanceOf(address)
      const tokenBBalance = await tokenBContract?.confidentialBalanceOf(address)
      return {
        TokenA: tokenABalance,
        TokenB: tokenBBalance,
      }
    },
    enabled: isConnected || !!signer,
    refetchInterval: 5_000, //5s
  })

  const {
    data: balanceA,
    mutate: decryptBalanceA,
    isPending: isEncryptingA,
  } = useMutation({
    mutationKey: ['decryptBalanceA'],
    mutationFn: async () => {
      const result = await userDecrypt(
        encryptedBalance?.TokenA,
        tokenAAddress,
        signer as ethers.Wallet
      )
      const value = ethers.formatUnits(result, 6)

      return value
    },
    onSuccess: data => {
      toast.success('Decrypt Success')
    },
    onError: () => {
      toast.error('Decrypt Failed')
    },
    gcTime: 0,
  })
  const {
    data: balanceB,
    mutate: decryptBalanceB,
    isPending: isEncryptingB,
  } = useMutation({
    mutationKey: ['decryptBalanceB'],
    mutationFn: async () => {
      const result = await userDecrypt(
        encryptedBalance?.TokenB,
        tokenBAddress,
        signer as ethers.Wallet
      )
      const value = ethers.formatUnits(result, 6)
      return value
    },
    onSuccess: () => {
      toast.success('Decrypt Success')
    },
    onError: () => {
      toast.error('Decrypt Failed')
    },
    gcTime: 0,
  })

  return {
    encryptedBalance,
    refetch,
    balanceA,
    balanceB,
    decryptBalanceA,
    decryptBalanceB,
    isEncryptingA,
    isEncryptingB,
  }
}
