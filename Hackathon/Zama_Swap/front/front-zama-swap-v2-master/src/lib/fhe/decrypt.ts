import { getFheInstance } from './instance'

export const decryptValue = async (encryptedBytes: string): Promise<number> => {
  const fhe = getFheInstance()

  try {
    if (
      typeof encryptedBytes === 'string' &&
      encryptedBytes.startsWith('0x') &&
      encryptedBytes.length === 66
    ) {
      const values = await fhe.publicDecrypt([encryptedBytes])
      return Number(values[encryptedBytes])
    } else {
      throw new Error('Invalid ciphertext handle')
    }
  } catch (error: any) {
    if (
      error?.message?.includes('Failed to fetch') ||
      error?.message?.includes('NetworkError')
    ) {
      throw new Error(
        'Decryption service is temporarily unavailable. Please try again later.'
      )
    }
    throw error
  }
}
