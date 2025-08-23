import { showEtherscanTx } from '@/lib/etherscan'
import type { EncryptedData } from '@/lib/fhe/encrypt'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useWriterContract } from './use-writer-contract'

interface AddLiquidityParams {
  encryptedTokenA: EncryptedData
  encryptedTokenB: EncryptedData
}

export const useLiquidity = () => {
  const { fheSwapContract } = useWriterContract()

  const { mutate: addLiquidity, isPending: isAddingLiquidity } = useMutation({
    mutationKey: ['addLiquidity'],
    mutationFn: async ({
      encryptedTokenA,
      encryptedTokenB,
    }: AddLiquidityParams) => {
      if (!encryptedTokenA || !encryptedTokenB) {
        throw new Error('Encrypted token is not valid')
      }

      const tx = await fheSwapContract?.addLiquidity(
        encryptedTokenA.encryptedValue,
        encryptedTokenA.proof,
        encryptedTokenB.encryptedValue,
        encryptedTokenB.proof
      )
      return tx.hash
    },
    onSuccess: (data: string) => {
      showEtherscanTx('Add Liquidity', data)
    },
    onError: (error: any) => {
      toast.error(error.message)
    },
  })

  const { mutate: removeLiquidity, isPending: isRemovingLiquidity } =
    useMutation({
      mutationKey: ['removeLiquidity'],
      mutationFn: async (encryptedLpAmount: EncryptedData) => {
        if (!encryptedLpAmount) {
          throw new Error('Encrypted lp amount is not valid')
        }

        const tx = await fheSwapContract?.removeLiquidity(
          encryptedLpAmount.encryptedValue,
          encryptedLpAmount.proof
        )
        return tx.hash
      },
      onSuccess: (data: string) => {
        showEtherscanTx('Remove Liquidity', data)
      },
      onError: (error: any) => {
        toast.error(error.message)
      },
    })

  return {
    addLiquidity,
    isAddingLiquidity,
    removeLiquidity,
    isRemovingLiquidity,
  }
}
