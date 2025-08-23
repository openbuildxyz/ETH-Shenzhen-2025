import React, { useState, useEffect } from 'react'
import { isAddress, createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { useSubscriptionLogic } from '../hooks/useSubscriptionLogic'
import { useRecordContractPlatform } from '../hooks/useRecordContractPlatform'
import { useWallet } from '../contexts/WalletContext'

const SubscriptionLogic: React.FC = () => {
  const { address, isConnected } = useWallet()
  const [providerAddress, setProviderAddress] = useState('')
  const [period, setPeriod] = useState('')
  const [amount, setAmount] = useState('')
  const [childEOAs, setChildEOAs] = useState<string[]>([])
  const [selectedChildEOA, setSelectedChildEOA] = useState('')
  const [txStatus, setTxStatus] = useState<string>('')

  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null)
  
  // USDC token address on Sepolia
  const USDC_TOKEN_ADDRESS = '0xBb4ca8a90058073e0c47EA221db534962eebB9A1' as `0x${string}`
  
  const {
    setSubscription,
    deductMoney,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    getSubscriptionInfo,
    isPending
  } = useSubscriptionLogic(selectedChildEOA as `0x${string}`)
  
  const {
    children,
    fetchChildren
  } = useRecordContractPlatform()



  // 获取子EOA地址列表
  useEffect(() => {
    const loadChildEOAs = async () => {
      if (address && isConnected) {
        try {
          await fetchChildren(address)
          // 从children中筛选subscription角色的EOA
          const subscriptionEOAs = children
            .filter((child: any) => child.role === 'subscription')
            .map((child: any) => child.childEOA)
          setChildEOAs(subscriptionEOAs)
          if (subscriptionEOAs.length > 0) {
            setSelectedChildEOA(subscriptionEOAs[0])
          }
        } catch (error) {
          console.error('获取子EOA失败:', error)
        }
      }
    }
    
    loadChildEOAs()
  }, [address, isConnected, fetchChildren, children])
  
  // 当选择子EOA后自动获取订阅信息
  useEffect(() => {
    if (selectedChildEOA) {
      fetchSubscriptionInfo()
    }
  }, [selectedChildEOA])
  
  // 获取订阅信息
  const fetchSubscriptionInfo = async () => {
    if (!selectedChildEOA) return
    
    try {
      const info = await getSubscriptionInfo()
      setSubscriptionInfo(info)
    } catch (error) {
      console.error('获取订阅信息失败:', error)
    }
  }

  const handleSetSubscription = async () => {
    if (!isAddress(providerAddress)) {
      alert('请输入有效的服务商地址')
      return
    }
    
    if (!period || parseInt(period) <= 0) {
      alert('请输入有效的扣费周期（秒）')
      return
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('请输入有效的扣费金额')
      return
    }
    
    try {
      setTxStatus('正在设置订阅...')
      const hash = await setSubscription(
        USDC_TOKEN_ADDRESS,
        providerAddress as `0x${string}`,
        BigInt(parseInt(period)),
        BigInt(Math.floor(parseFloat(amount) * 1e6)) // 转换为USDC的6位小数
      )
      
      if (hash) {
        setTxStatus('等待交易确认...')
        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http()
        })
        
        await publicClient.waitForTransactionReceipt({
          hash: hash
        })
        
        setTxStatus('交易已确认，订阅设置成功')
        setProviderAddress('')
        setPeriod('')
        setAmount('')
        // 刷新订阅信息
        await fetchSubscriptionInfo()
        
        setTimeout(() => {
          setTxStatus('')
        }, 2000)
      }
    } catch (error) {
      console.error('设置订阅失败:', error)
      setTxStatus('设置订阅失败')
      alert('设置订阅失败，请重试')
      setTimeout(() => {
        setTxStatus('')
      }, 3000)
    }
  }

  const handleDeductMoney = async () => {
    if (!subscriptionInfo) {
      alert('请先获取订阅信息')
      return
    }
    try {
      setTxStatus('正在执行扣费...')
      const hash = await deductMoney(subscriptionInfo.amount)
      
      if (hash) {
        setTxStatus('等待交易确认...')
        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http()
        })
        
        await publicClient.waitForTransactionReceipt({
          hash: hash
        })
        
        setTxStatus('交易已确认，扣费执行成功')
        // 重新获取订阅信息
        await fetchSubscriptionInfo()
        
        setTimeout(() => {
          setTxStatus('')
        }, 2000)
      }
    } catch (error) {
      console.error('扣费失败:', error)
      setTxStatus('扣费失败')
      setTimeout(() => {
        setTxStatus('')
      }, 3000)
    }
  }
  
  const handlePauseSubscription = async () => {
    try {
      setTxStatus('正在暂停订阅...')
      const hash = await pauseSubscription()
      
      if (hash) {
        setTxStatus('等待交易确认...')
        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http()
        })
        
        await publicClient.waitForTransactionReceipt({
          hash: hash
        })
        
        setTxStatus('交易已确认，订阅已暂停')
        await fetchSubscriptionInfo()
        
        setTimeout(() => {
          setTxStatus('')
        }, 2000)
      }
    } catch (error) {
      console.error('暂停订阅失败:', error)
      setTxStatus('暂停订阅失败')
      alert('暂停订阅失败，请重试')
      setTimeout(() => {
        setTxStatus('')
      }, 3000)
    }
  }
  
  const handleResumeSubscription = async () => {
    try {
      setTxStatus('正在恢复订阅...')
      const hash = await resumeSubscription()
      
      if (hash) {
        setTxStatus('等待交易确认...')
        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http()
        })
        
        await publicClient.waitForTransactionReceipt({
          hash: hash
        })
        
        setTxStatus('交易已确认，订阅已恢复')
        await fetchSubscriptionInfo()
        
        setTimeout(() => {
          setTxStatus('')
        }, 2000)
      }
    } catch (error) {
      console.error('恢复订阅失败:', error)
      setTxStatus('恢复订阅失败')
      alert('恢复订阅失败，请重试')
      setTimeout(() => {
        setTxStatus('')
      }, 3000)
    }
  }
  
  const handleCancelSubscription = async () => {
    try {
      setTxStatus('正在取消订阅...')
      const hash = await cancelSubscription()
      
      if (hash) {
        setTxStatus('等待交易确认...')
        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http()
        })
        
        await publicClient.waitForTransactionReceipt({
          hash: hash
        })
        
        setTxStatus('交易已确认，订阅已取消')
        await fetchSubscriptionInfo()
        
        setTimeout(() => {
          setTxStatus('')
        }, 2000)
      }
    } catch (error) {
      console.error('取消订阅失败:', error)
      setTxStatus('取消订阅失败')
      alert('取消订阅失败，请重试')
      setTimeout(() => {
        setTxStatus('')
      }, 3000)
    }
  }

  const isProvider = () => {
    return subscriptionInfo && address?.toLowerCase() === subscriptionInfo.provider?.toLowerCase()
  }
  
  const canManageSubscription = () => {
    // 主控EOA可以管理订阅（暂停、恢复、取消）
    return subscriptionInfo && address && isConnected
  }
  
  const formatTimestamp = (timestamp: bigint) => {
    // 如果时间戳为0或无效，返回默认文本
    if (!timestamp || timestamp === 0n) {
      return '暂无记录'
    }
    
    const date = new Date(Number(timestamp) * 1000)
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '无效时间'
    }
    
    return date.toLocaleString('zh-CN')
  }
  
  const formatAmount = (amount: bigint) => {
    return (Number(amount) / 1e6).toFixed(2) // USDC 6位小数
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 mb-4">请先连接钱包以使用订阅服务功能</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">订阅服务管理</h1>
        <div className="text-sm text-gray-500">
          设置订阅计划，管理自动扣款
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 子EOA选择 */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">选择子EOA地址</h3>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择子EOA地址
              </label>
              <select
                value={selectedChildEOA}
                onChange={(e) => setSelectedChildEOA(e.target.value)}
                className="input-field w-full"
              >
                <option value="">请选择子EOA地址</option>
                {childEOAs.map((eoa: string, index: number) => (
                  <option key={`${eoa}-${index}`} value={eoa}>
                    {eoa ? `${eoa.slice(0, 10)}...${eoa.slice(-8)}` : eoa}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 订阅设置 */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">订阅设置</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                服务商地址
              </label>
              <input
                type="text"
                value={providerAddress}
                onChange={(e) => setProviderAddress(e.target.value)}
                placeholder="0x..."
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                扣费周期 (秒)
              </label>
              <input
                type="number"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="86400 (1天)"
                min="1"
                className="input-field w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                常用值: 3600 (1小时), 86400 (1天), 604800 (1周), 2592000 (30天)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                单次扣费金额 (USDC)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10.00"
                step="0.01"
                min="0"
                className="input-field w-full"
              />
            </div>

            <button
              onClick={handleSetSubscription}
              disabled={!providerAddress || !period || !amount || !selectedChildEOA || isPending || txStatus !== ''}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? '设置中...' : '设置订阅'}
            </button>
            
            {txStatus && (
              <div className={`mt-2 p-2 rounded text-sm ${
                txStatus.includes('失败') 
                  ? 'bg-red-100 text-red-700' 
                  : txStatus.includes('成功') || txStatus.includes('已确认')
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {txStatus}
              </div>
            )}
          </div>
        </div>

        {/* 订阅状态 */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">当前订阅状态</h3>
          
          <div className="space-y-4">
            {subscriptionInfo ? (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">当前订阅</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    subscriptionInfo.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {subscriptionInfo.isActive ? '激活' : '已停用'}
                  </span>
                </div>
                  
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">服务商:</span>
                    <span className="font-mono">{subscriptionInfo.provider?.slice(0, 10)}...{subscriptionInfo.provider?.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">扣费周期:</span>
                    <span>{Number(subscriptionInfo.period) / 86400}天</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">扣费金额:</span>
                    <span>{formatAmount(subscriptionInfo.amount)} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">上次扣费:</span>
                    <span>{formatTimestamp(subscriptionInfo.lastDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">下次扣费:</span>
                    <span className="text-blue-600">{formatTimestamp(subscriptionInfo.nextDeduction)}</span>
                  </div>
                </div>
                  
                {(isProvider() || canManageSubscription()) && (
                  <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
                    {isProvider() && (
                      <button
                        onClick={handleDeductMoney}
                        disabled={!subscriptionInfo.isActive || isPending || txStatus !== ''}
                        className="btn-primary text-sm w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPending ? '执行中...' : '执行扣费'}
                      </button>
                    )}
                    {canManageSubscription() && (
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={handlePauseSubscription}
                          disabled={!subscriptionInfo.isActive || isPending || txStatus !== ''}
                          className="btn-secondary text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          暂停
                        </button>
                        <button
                          onClick={handleResumeSubscription}
                          disabled={subscriptionInfo.isActive || isPending || txStatus !== ''}
                          className="btn-secondary text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          恢复
                        </button>
                        <button
                          onClick={handleCancelSubscription}
                          disabled={isPending || txStatus !== ''}
                          className="btn-secondary text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          取消
                        </button>
                      </div>
                    )}
                    
                    {txStatus && (
                      <div className={`mt-2 p-2 rounded text-sm ${
                        txStatus.includes('失败') 
                          ? 'bg-red-100 text-red-700' 
                          : txStatus.includes('成功') || txStatus.includes('已确认')
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {txStatus}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">暂无订阅服务</p>
            )}
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">使用说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">用户操作流程:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>连接主控 EOA 钱包</li>
              <li>授权 ERC20 代币给 SubscriptionLogic 合约</li>
              <li>设置服务商地址、扣费周期和金额</li>
              <li>等待服务商执行周期性扣费</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">服务商操作:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>连接服务商钱包地址</li>
              <li>在到达扣费时间后点击"执行扣费"</li>
              <li>系统自动从用户账户扣除设定金额</li>
              <li>更新下次扣费时间</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionLogic
