import { fheSwapAddress } from '@/lib/contract'
import { showEtherscanTx } from '@/lib/etherscan'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'
import { useWriterContract } from './use-writer-contract'

export const usePermission = () => {
  const { isConnected, address } = useAccount()
  const { tokenAContract, tokenBContract } = useWriterContract()

  const {
    data: permissionStatus,
    isLoading: isLoadingPermission,
    refetch: refetchPermission,
  } = useQuery({
    queryKey: ['permissionStatus', address, fheSwapAddress],
    queryFn: () => true,
    enabled: false,
    staleTime: 40 * 60 * 1000,
    gcTime: 40 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  const { mutate: setPermission, isPending: isSettingPermission } = useMutation(
    {
      mutationKey: ['setPermission'],
      mutationFn: async () => {
        if (!isConnected) {
          throw new Error('Please connect your wallet')
        }

        if (!tokenAContract || !tokenBContract) {
          throw new Error('Contracts not available')
        }

        const operatorExpiry = 7200 + Math.floor(Date.now() / 1000) // 7200 seconds
        const [txA, txB] = await Promise.all([
          tokenAContract.setOperator(fheSwapAddress, operatorExpiry),
          tokenBContract.setOperator(fheSwapAddress, operatorExpiry),
        ])

        showEtherscanTx('Approve TokenA', txA?.hash)
        showEtherscanTx('Approve TokenB', txB?.hash)

        return true
      },
      onSuccess: () => {
        toast.success('Permission set successfully')
        refetchPermission()
      },
      onError: error => {
        toast.error('Error setting permission', {
          description: error.message,
        })
      },
      gcTime: 40 * 60 * 1000,
    }
  )

  return {
    permissionStatus: permissionStatus ?? false,
    isLoadingPermission,
    setPermission,
    isSettingPermission,
    refetchPermission,
  }
}
