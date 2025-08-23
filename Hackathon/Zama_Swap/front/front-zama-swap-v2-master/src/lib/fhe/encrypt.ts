import { ethers } from 'ethers'
import { getFheInstance } from './instance'

export interface EncryptedData {
  encryptedValue: Uint8Array
  proof: Uint8Array
}

export const encryptValue = async (
  contractAddress: string,
  userAddress: `0x${string}` | undefined,
  value: number | bigint
): Promise<EncryptedData> => {
  try {
    if (typeof value !== 'number' && typeof value !== 'bigint') {
      throw new Error('value must be a number or a bigint')
    }
    if (!userAddress) {
      throw new Error('user address is required')
    }
    if (!contractAddress) {
      throw new Error('contract address is required')
    }
    const fhe = getFheInstance()

    const contractAddressChecksum = ethers.getAddress(contractAddress)
    const userAddressChecksum = ethers.getAddress(userAddress)

    const ciphertext = await fhe.createEncryptedInput(
      contractAddressChecksum,
      userAddressChecksum
    )
    ciphertext.add64(value)

    const { handles, inputProof } = await ciphertext.encrypt()

    return {
      encryptedValue: handles[0],
      proof: inputProof,
    }
  } catch (error: any) {
    throw new Error(`encrypt failed: ${error.message}`)
  }
}

export const encryptMultipleValues = async (
  contractAddress: string,
  userAddress: `0x${string}` | undefined,
  values: number[] | bigint[]
): Promise<EncryptedData[]> => {
  const results: EncryptedData[] = []
  for (const value of values) {
    const encrypted = await encryptValue(contractAddress, userAddress, value)
    results.push(encrypted)
  }

  return results
}
