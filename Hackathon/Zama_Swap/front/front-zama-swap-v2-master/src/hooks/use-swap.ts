import { fheSwapAddress } from '@/lib/contract'
import { showEtherscanTx } from '@/lib/etherscan'
import { encryptValue, type EncryptedData } from '@/lib/fhe/encrypt'
import { userDecrypt } from '@/lib/fhe/user-decrypt'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'
import { useBalance } from './use-balance'
import { useWriterContract } from './use-writer-contract'

export interface SwapData {
  from: TokenData
  to: TokenData
}

export interface TokenData {
  ticker: string
  address: string
}

export const useSwap = () => {
  const [inputAmount, setInputAmount] = useState<string>('')
  const [outputAmount, setOutputAmount] = useState<string>('')
  const [minOutAmount, setMinOutAmount] = useState<string>('')
  const [encryptedOutputAmount, setEncryptedOutputAmount] = useState('')
  const [encryptedMinOutAmount, setEncryptedMinOutAmount] = useState('')

  const [inputToken, setInputToken] = useState<TokenData>({
    ticker: '',
    address: '',
  })
  const [outputToken, setOutputToken] = useState<TokenData>({
    ticker: '',
    address: '',
  })

  const [encryptedExpectedOut, setEncryptedExpectedOut] =
    useState<EncryptedData>()
  const [encryptedMinOut, setEncryptedMinOut] = useState<EncryptedData>()
  const [encryptedSwapAmount, setEncryptedSwapAmount] =
    useState<EncryptedData>()

  const change = () => {
    setInputToken(outputToken)
    setOutputToken(inputToken)
    setIsAuthorized(false)
    setIsCalculate(false)
    setInputAmount('')
    setOutputAmount('')
    setMinOutAmount('')
    setEncryptedOutputAmount('')
    setEncryptedMinOutAmount('')
  }

  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isCalculate, setIsCalculate] = useState(false)

  useEffect(() => {
    setIsAuthorized(false)
    setIsCalculate(false)
    setOutputAmount('')
    setMinOutAmount('')
    setEncryptedOutputAmount('')
    setEncryptedMinOutAmount('')
  }, [inputAmount])

  const { isConnected, address } = useAccount()
  const { fheSwapContract, tokenAContract, tokenBContract, signer } =
    useWriterContract()

  const { encryptedBalance } = useBalance()

  const { mutate: authorize } = useMutation({
    mutationKey: ['authorizeSelf'],
    mutationFn: async () => {
      if (inputAmount === '0' || isNaN(Number(inputAmount))) {
        throw new Error('Please enter a valid amount.')
      } else if (inputAmount === '') {
        throw new Error('Please enter the amount to be authorized.')
      } else if (outputToken.address === '') {
        throw new Error('Please select the token to be bought.')
      }

      let auth: { hash: string }
      switch (inputToken.ticker) {
        case 'TokenA':
          const aliceBeforeSwapForAuth =
            await tokenAContract?.confidentialBalanceOf(address)
          auth = await tokenAContract?.authorizeSelf(aliceBeforeSwapForAuth)
          break
        case 'TokenB':
          const bobBeforeSwapForAuth =
            await tokenBContract?.confidentialBalanceOf(address)
          auth = await tokenBContract?.authorizeSelf(bobBeforeSwapForAuth)
          break
        default:
          throw new Error('Invalid token.')
      }

      const swapAmount = ethers.parseUnits(inputAmount, 6)

      const encryptedSwapAmount = await encryptValue(
        fheSwapAddress,
        address,
        swapAmount
      )
      setEncryptedSwapAmount(encryptedSwapAmount)
      const amountOut = await fheSwapContract?.getAmountOut(
        encryptedSwapAmount.encryptedValue,
        encryptedSwapAmount.proof,
        inputToken.address
      )

      return {
        auth: auth?.hash || '',
        amountOut: amountOut.hash,
      }
    },
    onSuccess: data => {
      showEtherscanTx('authorizeSelf success', data.auth)
      showEtherscanTx('getAmountOut success', data.amountOut)
      setIsAuthorized(true)
    },
    onError: error => {
      toast.error(error.message)
    },
  })

  const { mutate: decryptAlgo } = useMutation({
    mutationKey: ['getAmountOut'],
    mutationFn: async () => {
      const numerator = await fheSwapContract?.getEncryptedNumerator()
      const denominator = await fheSwapContract?.getEncryptedDenominator()
      const decryptedNumerator = await userDecrypt(
        ethers.hexlify(numerator),
        fheSwapAddress,
        signer as unknown as ethers.Wallet
      )
      const decryptedDenominator = await userDecrypt(
        ethers.hexlify(denominator),
        fheSwapAddress,
        signer as unknown as ethers.Wallet
      )

      const expectOut =
        (decryptedNumerator as bigint) / (decryptedDenominator as bigint)
      setOutputAmount(ethers.formatUnits(expectOut, 6))

      const minOut = (expectOut * 99n) / 100n
      setMinOutAmount(ethers.formatUnits(minOut, 6))

      const encryptedExpectedOut = await encryptValue(
        fheSwapAddress,
        address,
        expectOut
      )

      const encryptedMinOut = await encryptValue(
        fheSwapAddress,
        address,
        minOut
      )

      setEncryptedExpectedOut(encryptedExpectedOut)
      setEncryptedOutputAmount(
        ethers.hexlify(encryptedExpectedOut.encryptedValue)
      )
      setEncryptedMinOut(encryptedMinOut)
      setEncryptedMinOutAmount(ethers.hexlify(encryptedMinOut.encryptedValue))
    },
    onSuccess: () => {
      toast.success('Calculate Purchase Success')
      setIsCalculate(true)
    },
    onError: () => {
      toast.error('Calculate Purchase Failed')
    },
  })

  const queryClient = useQueryClient()
  const { mutate: swap } = useMutation({
    mutationKey: ['swap'],
    mutationFn: async () => {
      if (!encryptedSwapAmount || !encryptedExpectedOut || !encryptedMinOut) {
        throw new Error('Please calculate the sale first.')
      }

      let auth: { hash: string }
      switch (inputToken.ticker) {
        case 'TokenA':
          const aliceBeforeSwapForAuth =
            await tokenAContract?.confidentialBalanceOf(address)
          auth = await tokenAContract?.authorizeSelf(aliceBeforeSwapForAuth)
          break
        case 'TokenB':
          const bobBeforeSwapForAuth =
            await tokenBContract?.confidentialBalanceOf(address)
          auth = await tokenBContract?.authorizeSelf(bobBeforeSwapForAuth)
          break
        default:
          throw new Error('Invalid token.')
      }

      const swapTx = await fheSwapContract?.swap(
        encryptedSwapAmount?.encryptedValue,
        encryptedSwapAmount?.proof,
        encryptedExpectedOut?.encryptedValue,
        encryptedExpectedOut?.proof,
        encryptedMinOut?.encryptedValue,
        encryptedMinOut?.proof,
        inputToken.address,
        address
      )
      return {
        swapTx: swapTx.hash,
        auth: auth?.hash || '',
      }
    },
    onSuccess: data => {
      showEtherscanTx('swap success', data.swapTx)
      showEtherscanTx('authorizeSelf success', data.auth)
      queryClient.invalidateQueries({ queryKey: ['decryptBalanceA'] })
      queryClient.invalidateQueries({ queryKey: ['decryptBalanceB'] })
    },
    onError: error => {
      toast.error(error.message)
    },
  })

  return {
    isAuthorized,
    isCalculate,
    inputAmount,
    setInputAmount,
    authorize,
    change,
    decryptAlgo,
    encryptedExpectedOut,
    encryptedMinOut,
    inputToken,
    setInputToken,
    outputToken,
    setOutputToken,
    outputAmount,
    setOutputAmount,
    minOutAmount,
    encryptedOutputAmount,
    encryptedMinOutAmount,
    swap,
  }
}
