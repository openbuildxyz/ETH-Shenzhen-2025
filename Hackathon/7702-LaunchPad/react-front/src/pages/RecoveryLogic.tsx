import React, { useState, useEffect } from 'react'
import { isAddress, createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { useRecoveryLogic } from '../hooks/useRecoveryLogic'
import { useRecordContractPlatform } from '../hooks/useRecordContractPlatform'
import { useWallet } from '../contexts/WalletContext'
import { useContracts } from '../hooks/useContracts'

const RecoveryLogic: React.FC = () => {
  const { address, isConnected } = useWallet()
  const { } = useContracts()
  const [whitelistAddress, setWhitelistAddress] = useState('')
  const [recoveryAddress, setRecoveryAddress] = useState('')
  const [recoveryAmount, setRecoveryAmount] = useState('')
  const [targetChildEOA, setTargetChildEOA] = useState('') // 要恢复的子EOA地址
  const [childEOAs, setChildEOAs] = useState<string[]>([])
  const [selectedChildEOA, setSelectedChildEOA] = useState('')
  const [txStatus, setTxStatus] = useState<string>('')

  
  const {
    addRecoverer,
    removeRecoverer,
    isRecoverer,
    getRecoverers,
    isPending,
    whitelist
  } = useRecoveryLogic(selectedChildEOA as `0x${string}`)
  
  // 用于恢复操作的hook实例，使用targetChildEOA
  const {
    recover,
    isPending: isRecoveryPending
  } = useRecoveryLogic(targetChildEOA as `0x${string}`)
  
  const {
    fetchChildren,
    children
  } = useRecordContractPlatform()

  // 获取子EOA地址列表
  useEffect(() => {
    const fetchChildEOAs = async () => {
      if (address && isConnected) {
        try {
          await fetchChildren(address)
          // 从children中筛选recovery角色的EOA
          // console.log('children', children)
          const recoveryEOAs = children
            .filter(child => child.role === 'recovery')
            .map(child => child.childEOA)
          setChildEOAs(recoveryEOAs)
          if (recoveryEOAs.length > 0) {
            setSelectedChildEOA(recoveryEOAs[0])
          }
        } catch (error) {
          console.error('获取子EOA地址失败:', error)
        }
      }
    }
    fetchChildEOAs()
  }, [address, isConnected, fetchChildren, children])
  


  const handleAddWhitelist = async () => {
    if (!isAddress(whitelistAddress)) {
      alert('请输入有效的地址')
      return
    }
    
    try {
      setTxStatus('正在添加白名单地址...')
      const hash = await addRecoverer(whitelistAddress as `0x${string}`)
      
      if (hash) {
        setTxStatus('等待交易确认...')
        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http()
        })
        
        await publicClient.waitForTransactionReceipt({
          hash: hash
        })
        
        setTxStatus('交易已确认，白名单地址添加成功')
        setWhitelistAddress('')
        // 刷新白名单
        await getRecoverers()
        
        setTimeout(() => {
          setTxStatus('')
        }, 2000)
      }
    } catch (error) {
      console.error('添加白名单失败:', error)
      setTxStatus('添加白名单失败')
      alert('添加白名单失败，请重试')
      setTimeout(() => {
        setTxStatus('')
      }, 3000)
    }
  }

  const handleRemoveWhitelist = async (addressToRemove: string) => {
    try {
      setTxStatus('正在移除白名单地址...')
      const hash = await removeRecoverer(addressToRemove as `0x${string}`)
      
      if (hash) {
        setTxStatus('等待交易确认...')
        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http()
        })
        
        await publicClient.waitForTransactionReceipt({
          hash: hash
        })
        
        setTxStatus('交易已确认，白名单地址移除成功')
        // 刷新白名单
        await getRecoverers()
        
        setTimeout(() => {
          setTxStatus('')
        }, 2000)
      }
    } catch (error) {
      console.error('移除白名单失败:', error)
      setTxStatus('移除白名单失败')
      alert('移除白名单失败，请重试')
      setTimeout(() => {
        setTxStatus('')
      }, 3000)
    }
  }

  const handleRecover = async () => {
    if (!isAddress(targetChildEOA)) {
      alert('请输入有效的子EOA地址')
      return
    }
    
    if (!isAddress(recoveryAddress)) {
      alert('请输入有效的接收地址')
      return
    }
    
    if (!recoveryAmount || parseFloat(recoveryAmount) <= 0) {
      alert('请输入有效的转移金额')
      return
    }
    
    try {
      setTxStatus('正在检查白名单权限...')
      // 检查当前地址是否在白名单中
      const isInWhitelist = await isRecoverer(address as `0x${string}`)
      if (!isInWhitelist) {
        setTxStatus('')
        alert('您的地址不在白名单中，无法执行恢复操作')
        return
      }
      
      setTxStatus('正在执行资产恢复...')
      const hash = await recover(
         recoveryAddress as `0x${string}`,
         BigInt(Math.floor(parseFloat(recoveryAmount) * 1e6 )).toString() // 转换为wei字符串
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
        
        setTxStatus('交易已确认，资产恢复执行成功')
        setTargetChildEOA('')
        setRecoveryAddress('')
        setRecoveryAmount('')
        
        setTimeout(() => {
          setTxStatus('')
        }, 2000)
      }
    } catch (error) {
      console.error('资产恢复失败:', error)
      setTxStatus('资产恢复失败')
      alert('资产恢复失败，请重试')
      setTimeout(() => {
        setTxStatus('')
      }, 3000)
    }
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 mb-4">请先连接钱包以使用资产恢复功能</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">资产恢复管理</h1>
        <div className="text-sm text-gray-500">
          管理白名单地址，执行资产恢复操作
        </div>
      </div>

      {/* 子EOA选择 */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">选择子EOA地址</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择子EOA地址
            </label>
            <select
              value={selectedChildEOA}
              onChange={(e) => setSelectedChildEOA(e.target.value)}
              className="input-field w-full"
              disabled={childEOAs.length === 0}
            >
              <option value="">请选择子EOA地址</option>
              {childEOAs.map((eoa, index) => (
                <option key={index} value={eoa}>
                  {eoa}
                </option>
              ))}
            </select>
            {childEOAs.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                暂无recovery角色的子EOA地址
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 白名单管理 */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">白名单管理</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                添加白名单地址
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={whitelistAddress}
                  onChange={(e) => setWhitelistAddress(e.target.value)}
                  placeholder="0x..."
                  className="input-field flex-1"
                />
                <button
                  onClick={handleAddWhitelist}
                  disabled={!whitelistAddress || !selectedChildEOA || isPending || txStatus !== ''}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? '添加中...' : '添加'}
                </button>
              </div>
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

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">当前白名单</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {whitelist.length > 0 ? (
                  whitelist.map((addr: string, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="font-mono text-sm">{addr.slice(0, 10)}...{addr.slice(-8)}</span>
                      <button
                        onClick={() => handleRemoveWhitelist(addr)}
                        className="text-red-600 hover:text-red-700 text-sm px-2 py-1 rounded border border-red-200 hover:border-red-300"
                      >
                        移除
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">暂无白名单地址</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 资产恢复 */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">执行资产恢复</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                子EOA地址 (要恢复的地址)
              </label>
              <input
                type="text"
                value={targetChildEOA}
                onChange={(e) => setTargetChildEOA(e.target.value)}
                placeholder="0x..."
                className="input-field w-full"
              />
              <p className="text-sm text-gray-500 mt-1">
                输入丢失私钥的子EOA地址
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                接收地址
              </label>
              <input
                type="text"
                value={recoveryAddress}
                onChange={(e) => setRecoveryAddress(e.target.value)}
                placeholder="0x..."
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                转移金额 (USDC)
              </label>
              <input
                type="number"
                value={recoveryAmount}
                onChange={(e) => setRecoveryAmount(e.target.value)}
                placeholder="0.0"
                step="0.01"
                min="0"
                className="input-field w-full"
              />
            </div>

            <button
              onClick={handleRecover}
              disabled={!targetChildEOA || !recoveryAddress || !recoveryAmount  || isPending || isRecoveryPending || txStatus !== ''}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isPending || isRecoveryPending) ? '执行中...' : '执行恢复'}
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

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <span className="text-yellow-600">⚠️</span>
                <div className="text-sm text-yellow-700">
                  <p className="font-medium mb-1">重要提示:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>只有白名单地址才能执行资产恢复</li>
                    <li>请输入正确的子EOA地址（丢失私钥的地址）</li>
                    <li>请确认接收地址和金额无误</li>
                    <li>操作不可逆，请谨慎操作</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 操作记录 */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">最近操作记录</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  地址
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-500" colSpan={5}>
                  暂无操作记录
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default RecoveryLogic
