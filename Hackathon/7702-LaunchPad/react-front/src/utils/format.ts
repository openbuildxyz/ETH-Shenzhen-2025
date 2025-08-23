import { formatEther, formatUnits } from 'viem'

/**
 * 格式化地址显示
 */
export const formatAddress = (address: string, startLength = 6, endLength = 4): string => {
  if (!address) return ''
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

/**
 * 格式化ETH数量显示
 */
export const formatETH = (value: bigint, decimals = 4): string => {
  const formatted = formatEther(value)
  return parseFloat(formatted).toFixed(decimals)
}

/**
 * 格式化代币数量显示
 */
export const formatToken = (value: bigint, tokenDecimals = 18, displayDecimals = 4): string => {
  const formatted = formatUnits(value, tokenDecimals)
  return parseFloat(formatted).toFixed(displayDecimals)
}

/**
 * 格式化时间戳
 */
export const formatTimestamp = (timestamp: number | bigint, locale = 'zh-CN'): string => {
  const date = new Date(Number(timestamp) * (timestamp.toString().length === 10 ? 1000 : 1))
  return date.toLocaleString(locale)
}

/**
 * 格式化交易哈希显示
 */
export const formatTxHash = (hash: string): string => {
  return formatAddress(hash, 10, 8)
}

/**
 * 格式化时间间隔
 */
export const formatDuration = (seconds: number | bigint): string => {
  const sec = Number(seconds)
  
  if (sec < 60) return `${sec}秒`
  if (sec < 3600) return `${Math.floor(sec / 60)}分钟`
  if (sec < 86400) return `${Math.floor(sec / 3600)}小时`
  if (sec < 2592000) return `${Math.floor(sec / 86400)}天`
  if (sec < 31536000) return `${Math.floor(sec / 2592000)}个月`
  
  return `${Math.floor(sec / 31536000)}年`
}
