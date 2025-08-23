import { useBalance } from '@/hooks/use-balance'
import { useSwap } from '@/hooks/use-swap'
import { formatAddress } from '@/lib/format'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { RefreshCw, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import TokenInput from './token-input'
import TokenSelectorModal from './token-selector-modal'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'

const Swap = () => {
  const { isConnected } = useAccount()

  const [isModalOpenSell, setIsModalOpenSell] = useState(false)
  const [isModalOpenBuy, setIsModalOpenBuy] = useState(false)
  const {
    change,
    isAuthorized,
    authorize,
    decryptAlgo,
    isCalculate,
    swap,
    inputAmount,
    setInputAmount,
    inputToken,
    setInputToken,
    outputToken,
    setOutputToken,
    outputAmount,
    encryptedOutputAmount,
    minOutAmount,
    encryptedMinOutAmount,
  } = useSwap()

  const {
    balanceA,
    balanceB,
    encryptedBalance,
    decryptBalanceA,
    isEncryptingA,
    decryptBalanceB,
    isEncryptingB,
  } = useBalance()

  return (
    <div className='px-10'>
      <div className='space-y-5 relative'>
        <TokenInput
          type='sell'
          openModal={() => setIsModalOpenSell(true)}
          disabledInput={inputToken.address === ''}
          onSelectToken={setInputToken}
          token={inputToken}
          value={inputAmount}
          onChange={value => setInputAmount(value)}
          wallet={
            <div className='self-end flex items-center gap-2'>
              <Wallet />
              <Dialog>
                <DialogTrigger asChild>
                  <span className='cursor-pointer hover:text-primary transition-colors duration-200'>
                    {formatAddress(
                      encryptedBalance?.[
                        inputToken.ticker as 'TokenA' | 'TokenB'
                      ] || ''
                    )}
                  </span>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Balance</DialogTitle>
                    <DialogDescription className='text-xl break-all'>
                      {(inputToken.ticker === 'TokenA' ? balanceA : balanceB) ||
                        encryptedBalance?.[
                          inputToken.ticker as 'TokenA' | 'TokenB'
                        ]}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      className='bg-amber-500 text-white text-xl'
                      onClick={() => {
                        if (inputToken.ticker === 'TokenA') {
                          decryptBalanceA()
                        } else {
                          decryptBalanceB()
                        }
                      }}
                      disabled={
                        isEncryptingA ||
                        !encryptedBalance?.[
                          inputToken.ticker as 'TokenA' | 'TokenB'
                        ]
                      }
                    >
                      {isEncryptingA ? 'Encrypting...' : 'Encrypt'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          }
        ></TokenInput>
        <TokenInput
          disabledInput
          type='buy'
          openModal={() => setIsModalOpenBuy(true)}
          token={outputToken}
          onSelectToken={setOutputToken}
          output={{
            encryptedValue: encryptedMinOutAmount,
            decryptedValue: minOutAmount,
          }}
          estimatedOutput={{
            encryptedValue: encryptedOutputAmount,
            decryptedValue: outputAmount,
          }}
          wallet={
            <div className='self-end flex items-center gap-2'>
              <Wallet />
              <Dialog>
                <DialogTrigger asChild>
                  <span className='cursor-pointer hover:text-primary transition-colors duration-200'>
                    {formatAddress(
                      encryptedBalance?.[
                        outputToken.ticker as 'TokenA' | 'TokenB'
                      ]
                    )}
                  </span>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Balance</DialogTitle>
                    <DialogDescription className='text-xl break-all'>
                      {(outputToken.ticker === 'TokenA'
                        ? balanceA
                        : balanceB) ||
                        encryptedBalance?.[
                          outputToken.ticker as 'TokenA' | 'TokenB'
                        ]}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      className='bg-amber-500 text-white text-xl'
                      onClick={() => {
                        if (outputToken.ticker === 'TokenA') {
                          decryptBalanceA()
                        } else {
                          decryptBalanceB()
                        }
                      }}
                      disabled={
                        isEncryptingB ||
                        !encryptedBalance?.[
                          outputToken.ticker as 'TokenA' | 'TokenB'
                        ]
                      }
                    >
                      {isEncryptingB ? 'Encrypting...' : 'Encrypt'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          }
        ></TokenInput>
        <div className='absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2'>
          <div className='relative'>
            <Button
              className='w-14 h-14 rounded-lg text-white  bg-secondary hover:bg-gray-300 hover:scale-110 hover:text-black'
              onClick={() => change()}
            >
              <RefreshCw className='size-7  mx-auto' />
            </Button>
          </div>
        </div>
      </div>
      <TokenSelectorModal
        type={'sell'}
        isOpen={isModalOpenSell}
        setIsOpen={setIsModalOpenSell}
        setToken={setInputToken}
        inputToken={inputToken}
        outputToken={outputToken}
      />

      <TokenSelectorModal
        type={'buy'}
        isOpen={isModalOpenBuy}
        setIsOpen={setIsModalOpenBuy}
        setToken={setOutputToken}
        inputToken={inputToken}
        outputToken={outputToken}
      />
      <div className='flex justify-center items-center'>
        {isConnected ? (
          isAuthorized ? (
            isCalculate ? (
              <Button
                className='w-full rounded-full h-14 mt-2 text-xl'
                onClick={() => swap()}
              >
                Swap
              </Button>
            ) : (
              <Button
                className='w-full rounded-full h-14 mt-2 text-xl'
                onClick={() => decryptAlgo()}
              >
                Calculate the purchase(Two Signatures)
              </Button>
            )
          ) : (
            <Button
              className='w-full rounded-full h-14 mt-2 text-xl'
              onClick={() => authorize()}
            >
              Authorize {inputToken.ticker || '--'} & Calculate the sale
            </Button>
          )
        ) : (
          <ConnectButton />
        )}
      </div>
    </div>
  )
}

export default Swap
