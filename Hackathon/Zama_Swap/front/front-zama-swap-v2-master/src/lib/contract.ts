import { ethers } from 'ethers'
import confidentialToken from '../abi/ConfidentialFungibleTokenMintableBurnable.json'
import fheSwap from '../abi/FHESwap.json'
import tokenA from '../abi/TokenA.json'
import tokenB from '../abi/TokenB.json'

export const tokenAABI = tokenA.abi
export const tokenAAddress = tokenA.address
export const tokenBABI = tokenB.abi
export const tokenBAddress = tokenB.address
export const fheSwapABI = fheSwap.abi
export const fheSwapAddress = fheSwap.address
export const confidentialTokenABI = confidentialToken.abi
export const confidentialTokenAddress = confidentialToken.address

export const getTokenAContract = (runner: ethers.ContractRunner) => {
  return new ethers.Contract(tokenAAddress, tokenAABI, runner)
}
export const getTokenBContract = (runner: ethers.ContractRunner) => {
  return new ethers.Contract(tokenBAddress, tokenBABI, runner)
}
export const getFheSwapContract = (runner: ethers.ContractRunner) => {
  return new ethers.Contract(fheSwapAddress, fheSwapABI, runner)
}
export const getConfidentialTokenContract = (runner: ethers.ContractRunner) => {
  return new ethers.Contract(
    confidentialTokenAddress,
    confidentialTokenABI,
    runner
  )
}
