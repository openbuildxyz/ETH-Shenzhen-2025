import { useFheEncrypt } from '@/hooks/use-fhe-encrypt'
import { useLiquidity } from '@/hooks/use-liquidity'
import { usePermission } from '@/hooks/use-permission'
import { fheSwapAddress } from '@/lib/contract'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from './ui/button'
import { Input } from './ui/input'

const AddLiquidity = () => {
  const [tokenAAmount, setTokenAAmount] = useState('100')
  const [tokenBAmount, setTokenBAmount] = useState('50')

  const [lpAmount, setLpAmount] = useState('20')

  const { address } = useAccount()
  const { permissionStatus, setPermission, isSettingPermission } =
    usePermission()

  const {
    data: encryptedTokenA,
    mutate: encryptTokenA,
    isPending: isEncryptingTokenA,
  } = useFheEncrypt('tokenA')
  const {
    data: encryptedTokenB,
    mutate: encryptTokenB,
    isPending: isEncryptingTokenB,
  } = useFheEncrypt('tokenB')

  const {
    data: encryptedLpAmount,
    mutate: encryptLpAmount,
    isPending: isEncryptingLpAmount,
  } = useFheEncrypt('lpAmount')

  const {
    addLiquidity,
    isAddingLiquidity,
    removeLiquidity,
    isRemovingLiquidity,
  } = useLiquidity()

  if (!permissionStatus) {
    return (
      <div className='px-10 w-full space-y-6'>
        <h2 className='text-left w-full text-xl font-bold'>
          Please set permission first &nbsp;
          <span className='text-sm text-gray-500'>(default: 1 hour)</span>
        </h2>
        <div className='w-full bg-secondary rounded-md p-4 space-y-2'>
          <p className=' text-gray-500'>
            This operation will request{' '}
            <span className='text-red-500'>two wallet signatures</span>, one
            for&nbsp;
            <b className='text-blue-500'>TokenA</b>
            &nbsp;and one for&nbsp;
            <b className='text-blue-500'>TokenB</b>
            &nbsp;. Authorization must be granted for these tokens before
            proceeding with subsequent actions.
          </p>
        </div>
        <Button
          disabled={isSettingPermission}
          className='w-full text-lg bg-blue-500  text-white rounded-md h-12'
          onClick={() => setPermission()}
        >
          {isSettingPermission ? 'Setting...' : 'Set Permission'}
        </Button>
      </div>
    )
  }

  return (
    <div className='px-10 w-full space-y-6'>
      <div className='space-y-4 w-full'>
        <h2 className='text-left w-full text-xl font-bold'>Add Liquidity</h2>
        <div className=' w-full bg-secondary rounded-md p-4 space-y-4 flex flex-col items-center'>
          <div className='flex flex-row justify-between items-center gap-4 w-full'>
            <div className='space-x-2 flex-1 flex flex-row items-center'>
              <span className='text-white'>TokenA:</span>
              <Input
                className='w-30 border-amber-500/50  rounded-md p-1 focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-neutral-400 '
                placeholder='0'
                value={tokenAAmount}
                onChange={e => setTokenAAmount(e.target.value)}
              />
            </div>
            <div className='space-x-2 flex-1 flex flex-row items-center'>
              <span className=' text-white '>TokenB:</span>
              <Input
                className='w-30 border-amber-500/50  rounded-md p-1  bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-neutral-400 '
                placeholder='0'
                value={tokenBAmount}
                onChange={e => setTokenBAmount(e.target.value)}
              />
            </div>
          </div>
          <Button
            disabled={isEncryptingTokenA || isEncryptingTokenB}
            className='w-full bg-amber-500  text-white rounded-md h-12'
            onClick={() => {
              encryptTokenA({
                userAddress: address as `0x${string}`,
                contractAddress: fheSwapAddress,
                amount: tokenAAmount,
              })
              encryptTokenB({
                userAddress: address as `0x${string}`,
                contractAddress: fheSwapAddress,
                amount: tokenBAmount,
              })
            }}
          >
            ENCRYPT TokenA & TokenB
          </Button>
          <div className='flex flex-row gap-2 justify-between items-center w-full'>
            <Button
              disabled={
                isAddingLiquidity || !encryptedTokenA || !encryptedTokenB
              }
              className='w-full bg-blue-500  text-white rounded-md h-12'
              onClick={() => {
                addLiquidity({
                  encryptedTokenA: encryptedTokenA!,
                  encryptedTokenB: encryptedTokenB!,
                })
              }}
            >
              Add Liquidity
            </Button>
          </div>
        </div>
      </div>
      <div className='space-y-4 w-full'>
        <h2 className='text-left w-full text-xl font-bold'>Remove Liquidity</h2>
        <div className='w-full bg-secondary rounded-md p-4 space-y-4'>
          <div className='space-x-2 flex-1 flex flex-row items-center justify-between'>
            <span className='text-white'>LP Amount:</span>
            <Input
              className='w-30 border-amber-500/50  rounded-md p-1 focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-neutral-400 '
              placeholder='0'
              value={lpAmount}
              onChange={e => setLpAmount(e.target.value)}
            />
          </div>
          <Button
            disabled={isEncryptingLpAmount}
            className='w-full bg-amber-500  text-white rounded-md h-12'
            onClick={() => {
              encryptLpAmount({
                userAddress: address as `0x${string}`,
                contractAddress: fheSwapAddress,
                amount: lpAmount,
              })
            }}
          >
            ENCRYPT LP Amount
          </Button>
          <Button
            disabled={isRemovingLiquidity || !encryptedLpAmount}
            className='w-full bg-red-500 text-white rounded-md h-12'
            onClick={() => {
              removeLiquidity(encryptedLpAmount!)
            }}
          >
            Remove Liquidity
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AddLiquidity
