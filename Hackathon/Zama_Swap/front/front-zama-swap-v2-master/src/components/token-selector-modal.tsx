'use client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TOKENS } from '@/constants/tokens'
import type { TokenData } from '@/hooks/use-swap'
import { formatAddress } from '@/lib/format'
import { Search } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import { toast } from 'sonner'

interface TokenSelectorModalProps {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  type: 'sell' | 'buy'
  setToken: Dispatch<SetStateAction<TokenData>>
  inputToken: TokenData
  outputToken: TokenData
}

export default function TokenSelectorModal({
  isOpen,
  setIsOpen,
  setToken,
  type,
  inputToken,
  outputToken,
}: TokenSelectorModalProps) {
  const handleTokenClick = (selectedToken: (typeof TOKENS)[number]) => {
    if (
      selectedToken.address === inputToken.address ||
      selectedToken.address === outputToken.address
    ) {
      toast.error('You cannot selected the same token')
      return
    }

    setToken({
      address: selectedToken.address,
      ticker: selectedToken.ticker,
    })
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className='rounded-2xl  p-0 text-white max-w-sm md:max-w-lg'>
        <DialogHeader className='p-4 pb-2'>
          <DialogTitle className='flex items-center justify-between text-2xl font-normal'>
            Select Token
          </DialogTitle>
        </DialogHeader>
        <div className='p-4 space-y-4'>
          <div className='px-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
              <Input
                placeholder='Search for Tokens'
                className='w-full rounded-full border-gray-700 bg-gray-800 py-5 pl-10 focus:outline-none !focus:ring-0'
              />
            </div>
          </div>
          <ScrollArea className='h-[300px]'>
            <div className='flex flex-col'>
              {TOKENS.map(token => (
                <button
                  key={token.ticker}
                  className='flex items-center rounded-lg gap-3 px-4 py-3 text-left hover:bg-gray-800 text-base'
                  onClick={() => handleTokenClick(token)}
                >
                  <div className='flex-grow'>
                    <p className='text-lg'>{token.ticker}</p>
                    <p className='text-md text-gray-400'>
                      {token.address && (
                        <span className='ml-2'>
                          address: {formatAddress(token.address)}
                        </span>
                      )}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
