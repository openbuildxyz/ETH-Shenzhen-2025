import { toast } from 'sonner'

const getEtherscanUrl = (address: string) => {
  return `https://sepolia.etherscan.io/tx/${address}`
}

export const showEtherscanTx = (message: string, address: string) => {
  const url = getEtherscanUrl(address)

  toast.success(message, {
    position: 'top-right',
    duration: 10000,
    action: {
      label: 'View on Etherscan',
      onClick: () => window.open(url, '_blank'),
    },
  })
}
