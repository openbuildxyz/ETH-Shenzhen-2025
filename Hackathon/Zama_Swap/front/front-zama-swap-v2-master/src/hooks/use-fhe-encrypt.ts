import { encryptValue } from '@/lib/fhe/encrypt'
import { useMutation } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { toast } from 'sonner'

interface EncryptParams {
  userAddress: `0x${string}`
  contractAddress: string
  amount: string
}

export const useFheEncrypt = (key: string) => {
  return useMutation({
    mutationFn: async ({
      userAddress,
      contractAddress,
      amount,
    }: EncryptParams) => {
      const amountBigInt = ethers.parseUnits(amount, 6)
      const encryptedValue = await encryptValue(
        contractAddress,
        userAddress,
        amountBigInt
      )
      return encryptedValue
    },
    mutationKey: ['encrypt', key],
    onSuccess: () => {
      toast.success('Encrypt Success', {
        description: `Encrypt ${key} Success`,
      })
    },
    onError: () => {
      toast.error('Encrypt Failed', {
        description: `Encrypt ${key} Failed`,
      })
    },
  })
}
