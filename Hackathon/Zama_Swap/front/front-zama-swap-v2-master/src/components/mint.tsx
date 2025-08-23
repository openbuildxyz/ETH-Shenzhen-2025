import { useDeployerContract } from '@/hooks/use-deployer-contract'
import { useFheEncrypt } from '@/hooks/use-fhe-encrypt'
import { tokenAAddress, tokenBAddress } from '@/lib/contract'
import { showEtherscanTx } from '@/lib/etherscan'
import { formatAddress } from '@/lib/format'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'
import { Button } from './ui/button'
import { Input } from './ui/input'

const Mint = () => {
  const [tokenAAmount, setTokenAAmount] = useState('100')
  const [tokenBAmount, setTokenBAmount] = useState('50')

  const { isConnected, address } = useAccount()
  const { tokenAContract, tokenBContract, ownerAddress } = useDeployerContract()

  const {
    data: encryptedTokenA,
    mutate: encryptA,
    isPending: isEncryptingA,
  } = useFheEncrypt('tokenA')
  const {
    data: encryptedTokenB,
    mutate: encryptB,
    isPending: isEncryptingB,
  } = useFheEncrypt('tokenB')

  const handleMintTokenA = async () => {
    if (!encryptedTokenA) {
      toast.error('Please encrypt tokenA first')
      return
    }

    try {
      const tx = await tokenAContract?.mint(
        address,
        encryptedTokenA?.encryptedValue,
        encryptedTokenA?.proof
      )
      showEtherscanTx('mint TokenA', tx.hash)
    } catch (error) {
      toast.error('mint error')
    }
  }

  const handleMintTokenB = async () => {
    if (!encryptedTokenB) {
      toast.error('Please encrypt tokenB first')
      return
    }

    try {
      const tx = await tokenBContract?.mint(
        address,
        encryptedTokenB?.encryptedValue,
        encryptedTokenB?.proof
      )
      showEtherscanTx('mint TokenB', tx.hash)
    } catch (error) {
      toast.error('mint error')
    }
  }

  if (!isConnected) {
    return <div>Please connect your wallet</div>
  }

  return (
    <div className='px-10 w-full space-y-6'>
      <div className='space-y-4 w-full'>
        <h2 className='text-left w-full text-xl font-bold'>
          Crypto Token Mint
        </h2>
        <div className='w-full bg-secondary rounded-md p-4 space-y-2'>
          <p className=' text-lg font-bold text-blue-500'>TokenA</p>
          <div className='flex flex-col gap-2 justify-between items-center'>
            <div className='w-full'>
              <p className=' text-white'>Address:</p>
              <Input
                disabled
                value={formatAddress(tokenAAddress)}
                type='text'
                className='h-10  border-amber-500/50 w-full rounded-md p-1 focus:outline-none  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-neutral-400 '
                placeholder='0x...'
              />
            </div>
            <div className='w-full'>
              <p className=' text-white'>Amount:</p>
              <Input
                type='text'
                value={tokenAAmount}
                className='h-10  border-amber-500/50 w-full rounded-md p-1  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-neutral-400 '
                placeholder='0'
                onChange={e => setTokenAAmount(e.target.value)}
              />
            </div>
            <div className='flex flex-row gap-2 justify-between items-center w-full'>
              <Button
                disabled={!ownerAddress || isEncryptingA}
                className='w-1/2 bg-amber-500 text-white rounded-md p-2 '
                onClick={() =>
                  encryptA({
                    userAddress: ownerAddress as `0x${string}`,
                    contractAddress: tokenAAddress,
                    amount: tokenAAmount,
                  })
                }
              >
                ENCRYPT
              </Button>
              <Button
                disabled={!encryptedTokenA}
                className='w-1/2  text-white rounded-md p-2 '
                onClick={handleMintTokenA}
              >
                MINT
              </Button>
            </div>
          </div>
        </div>
        <div className='w-full bg-secondary rounded-md p-4 space-y-2'>
          <p className=' text-lg font-bold text-blue-500'>TokenB</p>
          <div className='flex flex-col gap-2 justify-between items-center'>
            <div className='w-full'>
              <p className=' text-white'>Address:</p>
              <Input
                disabled
                type='text'
                className='h-10  border-amber-500/50 w-full rounded-md p-1 focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-neutral-400 '
                placeholder='0x...'
                value={formatAddress(tokenBAddress)}
              />
            </div>
            <div className='w-full'>
              <p className=' text-white'>Amount:</p>
              <Input
                type='text'
                value={tokenBAmount}
                className='h-10  border-amber-500/50 w-full rounded-md p-1 focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-neutral-400 '
                placeholder='0'
                onChange={e => setTokenBAmount(e.target.value)}
              />
            </div>
            <div className='flex flex-row gap-2 justify-between items-center w-full'>
              <Button
                disabled={!ownerAddress || isEncryptingB}
                className='w-1/2   bg-amber-500 text-white rounded-md p-2 '
                onClick={() =>
                  encryptB({
                    userAddress: ownerAddress as `0x${string}`,
                    contractAddress: tokenBAddress,
                    amount: tokenBAmount,
                  })
                }
              >
                ENCRYPT
              </Button>
              <Button
                disabled={!encryptedTokenB}
                className='w-1/2  text-white rounded-md p-2 '
                onClick={handleMintTokenB}
              >
                MINT
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Mint
