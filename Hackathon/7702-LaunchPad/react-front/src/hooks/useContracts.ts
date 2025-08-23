import { useWallet } from '../contexts/WalletContext'
import { CONTRACT_ADDRESSES } from '../config/contracts'

export const useContracts = () => {
  const { address, chainId } = useWallet()

  // 根据链ID获取合约地址
  const getContractAddresses = () => {
    switch (chainId) {
      case 11155111: // Sepolia
        return CONTRACT_ADDRESSES.sepolia
      case 31337: // Hardhat
        return CONTRACT_ADDRESSES.hardhat
      default:
        return CONTRACT_ADDRESSES.sepolia
    }
  }

  const contracts = getContractAddresses()

  return {
    isConnected: !!address,
    userAddress: address,
    chainId: chainId || 11155111, // 默认为 Sepolia
    contracts,
    recoveryLogicAddress: contracts.recoveryLogic,
    subscriptionLogicAddress: contracts.subscriptionLogic,
    usdcAddress: contracts.usdc,
  }
}
