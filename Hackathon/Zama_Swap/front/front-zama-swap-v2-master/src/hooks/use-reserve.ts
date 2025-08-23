import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { useWriterContract } from './use-writer-contract'

export const useReserve = () => {
  const { isConnected, address } = useAccount()
  const { fheSwapContract, signer } = useWriterContract()

  const { data: reserve, refetch } = useQuery({
    queryKey: ['reserve'],
    queryFn: async () => {
      const reserveA = await fheSwapContract?.getEncryptedReserve0()
      const reserveB = await fheSwapContract?.getEncryptedReserve1()

      return {
        tokenA: reserveA,
        tokenB: reserveB,
      }
    },
    enabled: isConnected,

    refetchInterval: 5_000,
  })

  return {
    reserve,
    refetch,
  }
}
