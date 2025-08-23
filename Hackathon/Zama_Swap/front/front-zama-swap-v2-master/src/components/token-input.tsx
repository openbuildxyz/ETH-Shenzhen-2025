'use client'

import type { TokenData } from '@/hooks/use-swap'
import { cn } from '@/lib/utils'
import { ChevronDown, Eye, EyeClosed, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/button'

interface TokenInputProps {
  type: 'sell' | 'buy'
  openModal: () => void
  value?: string
  onChange?: (value: string) => void
  className?: string
  encryptedBalance?: string
  disabledInput?: boolean
  inputRight?: React.ReactNode
  output?: {
    encryptedValue: string
    decryptedValue: string
  }
  estimatedOutput?: {
    encryptedValue: string
    decryptedValue: string
  }
  onSelectToken?: (token: TokenData) => void
  token?: TokenData
  encrypt?: () => void
  isEncrypting?: boolean
  wallet?: React.ReactNode
}
//TODO 图片未替换成功
export default function TokenInput({
  inputRight,
  openModal,
  className,
  value,
  onChange,
  disabledInput,
  encryptedBalance,
  type,
  output,
  estimatedOutput,
  token,
  onSelectToken,
  encrypt,
  isEncrypting,
  wallet,
}: TokenInputProps) {
  const [isShowOutput, setIsShowOutput] = useState(false)

  return (
    <div
      className={cn(
        'group relative shadow-lg flex flex-col bg-gray-300 items-start justify-between rounded-2xl p-6  border border-white/50',
        className
      )}
    >
      <div className='w-full relative'>
        <p className='text-xl font-semibold text-black tracking-wide text-left mb-3 group-hover:text-primary-600 transition-colors duration-300'>
          {type.toUpperCase()}
        </p>
        <div className='flex items-center justify-between'>
          {type === 'buy' ? (
            <>
              <input
                className='font-mono w-full text-4xl font-bold text-neutral-500 focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-neutral-400 focus:text-primary-700 transition-colors duration-200'
                placeholder='0'
                value={
                  isShowOutput ? output?.decryptedValue : output?.encryptedValue
                }
                disabled={true}
              />
              {token?.address && output?.decryptedValue && (
                <Button
                  size='icon'
                  variant='outline'
                  className='bg-secondary-foreground text-black'
                  onClick={() => setIsShowOutput(!isShowOutput)}
                >
                  {isShowOutput ? <Eye /> : <EyeClosed />}
                </Button>
              )}
            </>
          ) : (
            <input
              className='font-mono w-full text-4xl font-bold text-neutral-900 focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-neutral-400 focus:text-primary-700 transition-colors duration-200'
              placeholder='0'
              value={value}
              disabled={disabledInput}
              onChange={e => {
                onChange?.(e.target.value)
              }}
            />
          )}
          <div>{inputRight}</div>
        </div>
      </div>
      <div className='w-full gap-2 text-gray-500 flex flex-col items-center justify-between'>
        {type === 'buy' ? (
          <span className='text-left w-full  text-sm  truncate '>
            Estimated Output:
            {isShowOutput
              ? estimatedOutput?.decryptedValue
              : estimatedOutput?.encryptedValue}
          </span>
        ) : (
          <span className='text-left w-full text-sm '>
            Estimated Receive: Mini Amount (1.00% slippage)
          </span>
        )}
        {wallet}
      </div>

      <div className='cursor-pointer absolute top-4 right-4 bg-primary rounded-md px-2  flex items-center justify-center z-10'>
        <span
          className='text-lg text-black'
          onClick={() => {
            openModal()
          }}
        >
          {token?.ticker || 'Select Token'}
        </span>

        {token?.ticker ? (
          <Button
            size='icon'
            onClick={() => {
              onSelectToken?.({ ticker: '', address: '' })
            }}
          >
            <X className='size-5' />
          </Button>
        ) : (
          <Button
            onClick={() => {
              openModal()
            }}
            size='icon'
          >
            <ChevronDown className='size-5 ' />
          </Button>
        )}
      </div>
    </div>
  )
}
