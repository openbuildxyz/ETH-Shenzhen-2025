import {
  createInstance,
  initSDK,
  SepoliaConfig,
} from '@zama-fhe/relayer-sdk/bundle'
import { toast } from 'sonner'

let fheInstance: any = null

export const initializeFheInstance = async () => {
  try {
    await initSDK()

    const config = {
      ...SepoliaConfig,
      network: window.ethereum,
    }

    fheInstance = await createInstance(config)
    toast.success('FHE Init Success')
    return fheInstance
  } catch (error) {
    toast.error('FHE Init Failed')
    throw error
  }
}

export const getFheInstance = () => {
  if (!fheInstance) {
    throw new Error('FHE Instance Not Initialized')
  }
  return fheInstance
}
