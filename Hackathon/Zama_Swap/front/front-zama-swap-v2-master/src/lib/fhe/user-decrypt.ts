import { ethers } from 'ethers'
import { getFheInstance } from './instance'

export const userDecrypt = async (
  encryptedBytes: string,
  address: string,
  signer: ethers.Wallet
) => {
  const instance = getFheInstance()

  try {
    const keypair = instance.generateKeypair()
    const handleContractPairs = [
      {
        handle: encryptedBytes,
        contractAddress: address,
      },
    ]
    const startTimeStamp = Math.floor(Date.now() / 1000).toString()
    const durationDays = '10'
    const contractAddresses = [address]
    const eip712 = instance.createEIP712(
      keypair.publicKey,
      contractAddresses,
      startTimeStamp,
      durationDays
    )

    const signature = await signer.signTypedData(
      eip712.domain,
      {
        UserDecryptRequestVerification:
          eip712.types.UserDecryptRequestVerification,
      },
      eip712.message
    )

    const result = await instance.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature.replace('0x', ''),
      contractAddresses,
      signer.address,
      startTimeStamp,
      durationDays
    )

    const decryptedValue = result[encryptedBytes]
    return decryptedValue
  } catch (error) {
    throw new Error('decrypt failed')
  }
}
