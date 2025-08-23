import React, { useState } from 'react'
import { isAddress, createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { useWallet } from '../contexts/WalletContext'
import { useBatchTransaction, type BatchTransactionItem } from '../hooks/useBatchTransaction'

interface TransactionItem {
  id: string
  recipient: string
  amount: string
  description: string
  isValid: boolean
}

const BatchTransaction: React.FC = () => {
  const { isConnected } = useWallet()
  const { 
    executeBatchTransfer, 
    executeBatchEthTransfer,
    executeBatchTokenTransfer,
    isPending 
  } = useBatchTransaction()
  const [transactions, setTransactions] = useState<TransactionItem[]>([
    { id: '1', recipient: '', amount: '', description: '', isValid: false },
  ])
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResults, setExecutionResults] = useState<any[]>([])
  const [transactionType, setTransactionType] = useState<'eth' | 'token'>('eth')
  const [batchTxLogicAddress, setBatchTxLogicAddress] = useState<string>('')
  const [tokenAddress, setTokenAddress] = useState<string>('')
  const [useBatchTxLogic, setUseBatchTxLogic] = useState<boolean>(true)
  const [txStatus, setTxStatus] = useState<string>('')

  const addTransaction = () => {
    const newId = (transactions.length + 1).toString()
    setTransactions([
      ...transactions,
      { id: newId, recipient: '', amount: '', description: '', isValid: false },
    ])
  }

  const removeTransaction = (id: string) => {
    if (transactions.length > 1) {
      setTransactions(transactions.filter(tx => tx.id !== id))
    }
  }

  const updateTransaction = (id: string, field: keyof TransactionItem, value: string) => {
    setTransactions(transactions.map(tx => {
      if (tx.id === id) {
        const updated = { ...tx, [field]: value }
        // 验证交易有效性
        updated.isValid = isAddress(updated.recipient) && 
                         parseFloat(updated.amount) > 0 && 
                         updated.description.trim() !== ''
        return updated
      }
      return tx
    }))
  }

  const clearAllTransactions = () => {
    setTransactions([
      { id: '1', recipient: '', amount: '', description: '', isValid: false }
    ])
  }

  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim() !== '')
      const csvTransactions: TransactionItem[] = []

      lines.forEach((line, index) => {
        if (index === 0) return // 跳过标题行
        const [recipient, amount, description] = line.split(',').map(item => item.trim())
        if (recipient && amount && description) {
          csvTransactions.push({
            id: (index).toString(),
            recipient,
            amount,
            description,
            isValid: isAddress(recipient) && parseFloat(amount) > 0
          })
        }
      })

      if (csvTransactions.length > 0) {
        setTransactions(csvTransactions)
      }
    }
    reader.readAsText(file)
  }

  const executeAllTransactions = async () => {
    const validTransactions = transactions.filter(tx => tx.isValid)
    if (validTransactions.length === 0) {
      alert('没有有效的交易可执行')
      return
    }

    // 如果使用 BatchTxLogic 合约，需要验证合约地址
    if (useBatchTxLogic && !isAddress(batchTxLogicAddress)) {
      alert('请输入有效的 BatchTxLogic 合约地址')
      return
    }

    // 如果是代币转账，需要验证代币地址
    if (transactionType === 'token' && !isAddress(tokenAddress)) {
      alert('请输入有效的代币合约地址')
      return
    }

    setIsExecuting(true)
    setExecutionResults([])
    setTxStatus('正在执行批量交易...')
    
    try {
      // 创建公共客户端用于等待交易确认
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http()
      })
      
      // 转换为批量交易格式
      const batchTxs: BatchTransactionItem[] = validTransactions.map(tx => ({
        recipient: tx.recipient as `0x${string}`,
        amount: tx.amount,
      }))
      
      let result
      
      if (useBatchTxLogic) {
        // 使用 BatchTxLogic 合约执行批量交易
        if (transactionType === 'eth') {
          result = await executeBatchEthTransfer(
            batchTxLogicAddress as `0x${string}`,
            batchTxs
          )
        } else {
          result = await executeBatchTokenTransfer(
            batchTxLogicAddress as `0x${string}`,
            tokenAddress as `0x${string}`,
            batchTxs
          )
        }
        
        if (result.success && result.hash) {
          setTxStatus('等待交易确认...')
          // 等待交易确认
          await publicClient.waitForTransactionReceipt({ hash: result.hash })
          setTxStatus('交易已确认，批量交易执行成功')
          
          setExecutionResults([{
            success: true,
            hash: result.hash,
            recipient: 'batch',
            transactions: result.transactions
          }])
          alert(`成功执行 ${validTransactions.length} 笔批量交易`)
          clearAllTransactions()
          
          // 延迟2秒后清除状态
          setTimeout(() => {
            setTxStatus('')
          }, 2000)
        } else {
          setTxStatus('批量交易执行失败')
          setExecutionResults([{
            success: false,
            error: result.error,
            recipient: 'batch',
            transactions: result.transactions
          }])
          alert('批量交易执行失败')
        }
      } else {
        // 使用原始方法（向后兼容）
        const results = await executeBatchTransfer(batchTxs)
        setExecutionResults(results)
        
        // 等待所有成功的交易确认
        const successfulTxs = results.filter(r => r.success && r.hash)
        if (successfulTxs.length > 0) {
          setTxStatus('等待交易确认...')
          await Promise.all(
            successfulTxs.map(tx => 
              publicClient.waitForTransactionReceipt({ hash: tx.hash as `0x${string}` })
            )
          )
          setTxStatus('所有交易已确认')
        }
        
        const successCount = results.filter(r => r.success).length
        const failCount = results.filter(r => !r.success).length
        
        if (failCount === 0) {
          alert(`成功执行 ${successCount} 笔交易`)
          clearAllTransactions()
        } else {
          alert(`执行完成：${successCount} 笔成功，${failCount} 笔失败`)
        }
        
        // 延迟2秒后清除状态
        setTimeout(() => {
          setTxStatus('')
        }, 2000)
      }
    } catch (error) {
      console.error('批量交易执行失败:', error)
      setTxStatus('批量交易执行失败')
      alert('批量交易执行失败，请检查网络连接和账户余额')
    } finally {
      setIsExecuting(false)
      // 如果有错误，延迟清除状态
      if (txStatus.includes('失败')) {
        setTimeout(() => {
          setTxStatus('')
        }, 3000)
      }
    }
  }

  const totalAmount = transactions
    .filter(tx => tx.isValid)
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)

  const validTransactionCount = transactions.filter(tx => tx.isValid).length

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 mb-4">请先连接钱包以使用批量交易功能</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">批量交易</h1>
        <div className="text-sm text-gray-500">
          一次性执行多个转账交易
        </div>
      </div>

      {/* 配置区域 */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">批量交易配置</h3>
        
        <div className="space-y-4">
          {/* 交易类型选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              交易类型
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="eth"
                  checked={transactionType === 'eth'}
                  onChange={(e) => setTransactionType(e.target.value as 'eth' | 'token')}
                  className="mr-2"
                />
                ETH 转账
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="token"
                  checked={transactionType === 'token'}
                  onChange={(e) => setTransactionType(e.target.value as 'eth' | 'token')}
                  className="mr-2"
                />
                ERC20 代币转账
              </label>
            </div>
          </div>

          {/* 执行方式选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              执行方式
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={useBatchTxLogic}
                  onChange={() => setUseBatchTxLogic(true)}
                  className="mr-2"
                />
                使用 BatchTxLogic 合约 (推荐)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!useBatchTxLogic}
                  onChange={() => setUseBatchTxLogic(false)}
                  className="mr-2"
                />
                逐个执行交易
              </label>
            </div>
          </div>

          {/* BatchTxLogic 合约地址 */}
          {useBatchTxLogic && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BatchTxLogic 合约地址 *
              </label>
              <input
                type="text"
                value={batchTxLogicAddress}
                onChange={(e) => setBatchTxLogicAddress(e.target.value)}
                placeholder="0x..."
                className={`input-field w-full ${
                  batchTxLogicAddress && !isAddress(batchTxLogicAddress) 
                    ? 'border-red-300 focus:ring-red-500' 
                    : ''
                }`}
              />
              {batchTxLogicAddress && !isAddress(batchTxLogicAddress) && (
                <p className="text-red-600 text-xs mt-1">请输入有效的合约地址</p>
              )}
            </div>
          )}

          {/* 代币合约地址 */}
          {transactionType === 'token' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ERC20 代币合约地址 *
              </label>
              <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="0x..."
                className={`input-field w-full ${
                  tokenAddress && !isAddress(tokenAddress) 
                    ? 'border-red-300 focus:ring-red-500' 
                    : ''
                }`}
              />
              {tokenAddress && !isAddress(tokenAddress) && (
                <p className="text-red-600 text-xs mt-1">请输入有效的代币合约地址</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 操作工具栏 */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={addTransaction}
              className="btn-primary"
            >
              ➕ 添加交易
            </button>
            <button
              onClick={clearAllTransactions}
              className="btn-secondary"
            >
              🗑️ 清空所有
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="btn-secondary cursor-pointer">
              📂 导入CSV
              <input
                type="file"
                accept=".csv"
                onChange={importFromCSV}
                className="hidden"
              />
            </label>
            <div className="text-sm text-gray-600">
              有效交易: {validTransactionCount} | 总金额: {totalAmount.toFixed(4)} {transactionType === 'eth' ? 'ETH' : 'TOKEN'}
            </div>
          </div>
        </div>
      </div>

      {/* 交易列表 */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">交易列表</h3>
        
        <div className="space-y-4">
          {transactions.map((tx, index) => (
            <div
              key={tx.id}
              className={`p-4 border rounded-lg ${
                tx.isValid ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-700">交易 #{index + 1}</span>
                <div className="flex items-center space-x-2">
                  {tx.isValid ? (
                    <span className="text-green-600 text-sm">✅ 有效</span>
                  ) : (
                    <span className="text-red-600 text-sm">❌ 无效</span>
                  )}
                  {transactions.length > 1 && (
                    <button
                      onClick={() => removeTransaction(tx.id)}
                      className="text-red-600 hover:text-red-700 text-sm px-2 py-1 rounded border border-red-200 hover:border-red-300"
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    接收地址 *
                  </label>
                  <input
                    type="text"
                    value={tx.recipient}
                    onChange={(e) => updateTransaction(tx.id, 'recipient', e.target.value)}
                    placeholder="0x..."
                    className={`input-field w-full ${
                      tx.recipient && !isAddress(tx.recipient) 
                        ? 'border-red-300 focus:ring-red-500' 
                        : ''
                    }`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    转账金额 ({transactionType === 'eth' ? 'ETH' : 'TOKEN'}) *
                  </label>
                  <input
                    type="number"
                    value={tx.amount}
                    onChange={(e) => updateTransaction(tx.id, 'amount', e.target.value)}
                    placeholder="0.0"
                    step="0.001"
                    min="0"
                    className={`input-field w-full ${
                      tx.amount && parseFloat(tx.amount) <= 0 
                        ? 'border-red-300 focus:ring-red-500' 
                        : ''
                    }`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    交易描述 *
                  </label>
                  <input
                    type="text"
                    value={tx.description}
                    onChange={(e) => updateTransaction(tx.id, 'description', e.target.value)}
                    placeholder="转账说明"
                    className="input-field w-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 执行批量交易 */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">执行批量交易</h3>
            <p className="text-sm text-gray-600 mt-1">
              将执行 {validTransactionCount} 笔有效交易，总金额 {totalAmount.toFixed(4)} {transactionType === 'eth' ? 'ETH' : 'TOKEN'}
            </p>
            {useBatchTxLogic && (
              <p className="text-sm text-blue-600 mt-1">
                ✨ 使用 BatchTxLogic 合约进行批量执行，Gas 费用更低，执行更高效
              </p>
            )}
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <button
              onClick={executeAllTransactions}
              disabled={
                validTransactionCount === 0 || 
                isExecuting || 
                isPending ||
                (useBatchTxLogic && !isAddress(batchTxLogicAddress)) ||
                (transactionType === 'token' && !isAddress(tokenAddress))
              }
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3"
            >
              {(isExecuting || isPending) ? '执行中...' : `执行 ${validTransactionCount} 笔交易`}
            </button>
            {txStatus && (
              <div className={`text-sm px-3 py-1 rounded ${
                txStatus.includes('失败') ? 'text-red-600 bg-red-50' : 
                txStatus.includes('成功') || txStatus.includes('已确认') ? 'text-green-600 bg-green-50' :
                'text-blue-600 bg-blue-50'
              }`}>
                {txStatus}
              </div>
            )}
          </div>
        </div>
        
        {validTransactionCount > 0 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-600">⚠️</span>
              <div className="text-sm text-yellow-700">
                <p className="font-medium mb-1">执行前请确认:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>账户余额足够支付所有交易（包括Gas费用）</li>
                  <li>所有接收地址都是正确的</li>
                  <li>交易金额和描述都是准确的</li>
                  {useBatchTxLogic ? (
                    <>
                      <li>BatchTxLogic 合约地址正确且已部署</li>
                      {transactionType === 'token' && (
                        <li>代币合约地址正确，且您已授权 BatchTxLogic 合约转移您的代币</li>
                      )}
                      <li>所有交易将在一次区块链交易中执行，Gas 费用更低</li>
                    </>
                  ) : (
                    <li>批量交易将按顺序执行，可能需要较长时间和更多 Gas 费用</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 执行结果 */}
      {executionResults.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">执行结果</h3>
          <div className="space-y-2">
            {executionResults.map((result, index) => (
              <div key={index}>
                {result.recipient === 'batch' ? (
                  // BatchTxLogic 合约执行结果
                  <div
                    className={`p-3 rounded-lg border ${
                      result.success 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        批量交易 ({result.transactions?.length || 0} 笔)
                      </span>
                      <div className="flex items-center space-x-2">
                        {result.success ? (
                          <>
                            <span className="text-green-600 text-sm">✅ 成功</span>
                            {result.hash && (
                              <a
                                href={`https://sepolia.etherscan.io/tx/${result.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-sm underline"
                              >
                                查看交易
                              </a>
                            )}
                          </>
                        ) : (
                          <span className="text-red-600 text-sm">❌ 失败</span>
                        )}
                      </div>
                    </div>
                    
                    {/* 显示每笔子交易 */}
                    {result.transactions && (
                      <div className="space-y-1 mt-2 pl-4 border-l-2 border-gray-200">
                        {result.transactions.map((tx: any, txIndex: number) => (
                          <div key={txIndex} className="text-xs text-gray-600">
                            <span className="font-mono">
                              {tx.recipient.slice(0, 10)}...{tx.recipient.slice(-8)}
                            </span>
                            <span className="mx-2">→</span>
                            <span>{tx.amount} {transactionType === 'eth' ? 'ETH' : 'TOKEN'}</span>
                            {tx.success === false && (
                              <span className="text-red-600 ml-2">❌</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!result.success && result.error && (
                      <p className="text-red-600 text-xs mt-2">
                        错误: {result.error.message || '批量交易失败'}
                      </p>
                    )}
                  </div>
                ) : (
                  // 原始单个交易结果
                  <div
                    className={`p-3 rounded-lg border ${
                      result.success 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">
                        {result.recipient.slice(0, 10)}...{result.recipient.slice(-8)}
                      </span>
                      <div className="flex items-center space-x-2">
                        {result.success ? (
                          <>
                            <span className="text-green-600 text-sm">✅ 成功</span>
                            {result.hash && (
                              <a
                                href={`https://sepolia.etherscan.io/tx/${result.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-sm underline"
                              >
                                查看交易
                              </a>
                            )}
                          </>
                        ) : (
                          <span className="text-red-600 text-sm">❌ 失败</span>
                        )}
                      </div>
                    </div>
                    {!result.success && result.error && (
                      <p className="text-red-600 text-xs mt-1">
                        错误: {result.error.message || '交易失败'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSV 格式说明 */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">CSV 导入格式说明</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">CSV 文件格式（第一行为标题行）:</p>
          <pre className="text-xs bg-white p-3 rounded border font-mono">
{`recipient,amount,description
0x1234567890123456789012345678901234567890,0.1,Payment for services
0x0987654321098765432109876543210987654321,0.05,Refund for order #123`}
          </pre>
          <p className="text-xs text-gray-500 mt-2">
            * recipient: 接收地址（必须是有效的以太坊地址）<br/>
            * amount: 转账金额（ETH，必须大于0）<br/>
            * description: 交易描述（不能为空）
          </p>
        </div>
      </div>
    </div>
  )
}

export default BatchTransaction
