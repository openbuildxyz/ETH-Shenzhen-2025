import React, { useState, useEffect } from 'react'
import { formatEther, createWalletClient, http, encodeFunctionData, parseEther, createPublicClient } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { useWallet } from '../contexts/WalletContext'
import { sepolia } from 'viem/chains'

// ERC20 ABI for approve function
const erc20Abi = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  }
] as const
// BatchTxLogic 合约 ABI - init 方法
const logicCommonAbi = [
  {
    name: 'init',
    type: 'function',
    inputs: [
      { name: '_owner', type: 'address' }
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  }
] as const

// RecoveryLogic 合约 ABI - init 方法（需要额外的 USDC 地址参数）
const recoveryLogicAbi = [
  {
    name: 'init',
    type: 'function',
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_usdc', type: 'address' }
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  }
] as const

// RecordContractPlatform 合约 ABI
const recordContractPlatformAbi = [
  {
    name: 'addChild',
    type: 'function',
    inputs: [
      { name: 'child', type: 'address' },
      { name: 'role', type: 'string' }
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'removeChild',
    type: 'function',
    inputs: [
      { name: 'child', type: 'address' }
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'getChildren',
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' }
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'childEOA', type: 'address' },
          { name: 'role', type: 'string' }
        ]
      }
    ],
    stateMutability: 'view',
  }
] as const

// 子账户类型定义
interface ChildEOA {
  childEOA: string
  role: string
}

const Dashboard: React.FC = () => {
  const { address, isConnected, connector, balance, walletClient } = useWallet()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [txStatus, setTxStatus] = useState<string>('')
  // const [createdChildEOA, setCreatedChildEOA] = useState<string>('')
  const [addedFunctions, setAddedFunctions] = useState<ChildEOA[]>([])

  const contractAddresses = {
    batchTxLogic: '0x908a02cF059Aa8935FD461AC0dB9E2EA3a708fDd' as const,
    recoveryLogic: '0x2854A6E23D749a574495F95E7AdE46361A3BEFe3' as const,
    subscriptionLogic: '0xab08f7fc2deef48EE044786D0Eb67FAc544D0374' as const,
    usdc: '0xBb4ca8a90058073e0c47EA221db534962eebB9A1' as const,
    recordContractPlatform: '0xB1Db2211cB3bFAe1fB676104cA21f236F832435D' as const,
  }

  // 查询已添加的功能
  const queryAddedFunctions = async () => {
    if (!address || !isConnected) {
      setAddedFunctions([])
      return
    }

    try {
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http()
      })

      const result = await publicClient.readContract({
        address: contractAddresses.recordContractPlatform,
        abi: recordContractPlatformAbi,
        functionName: 'getChildren',
        args: [address]
      }) as ChildEOA[]

      setAddedFunctions(result || [])
    } catch (error) {
      console.error('查询已添加功能失败:', error)
      setAddedFunctions([])
    }
  }

  // 当钱包连接状态或地址变化时查询功能
  useEffect(() => {
    queryAddedFunctions()
  }, [address, isConnected])

  // 通用功能添加处理函数
  const handleAddFunction = async (functionType: 'batchTx' | 'recovery' | 'subscription') => {
    if (!walletClient || !address) {
      setTxStatus('请先连接钱包')
      return
    }

    const functionNames = {
      batchTx: '批量交易',
      recovery: '资产恢复',
      subscription: '订阅服务'
    }

    const contractMap = {
      batchTx: contractAddresses.batchTxLogic,
      recovery: contractAddresses.recoveryLogic,
      subscription: contractAddresses.subscriptionLogic
    }

    setIsProcessing(true)
    setTxStatus(`开始处理${functionNames[functionType]}...`)

    try {
      // 1. 生成随机私钥
      setTxStatus('1/7: 生成随机私钥...')
      const randomPrivateKey = generatePrivateKey()
      
      // 2. 创建随机钱包
      setTxStatus('2/7: 创建随机钱包...')
      const randomAccount = privateKeyToAccount(randomPrivateKey)
      const randomWalletClient = createWalletClient({
        account: randomAccount,
        chain: sepolia,
        transport: http()
      })
      const capabilities = await walletClient.getCapabilities({
        account: address,
      });
      console.log('capabilities', capabilities);
      
      // 保存创建的子EOA地址
      // setCreatedChildEOA(randomAccount.address)

      // 3. 使用随机钱包对对应逻辑合约进行授权
      setTxStatus('3/7: 签署授权...')
      const authorization = await randomWalletClient.signAuthorization({
        account: randomAccount,
        contractAddress: contractMap[functionType],
        executor: 'self', // 当EOA自己执行交易时需要设置此参数
      })

      // 4. 向随机账户发送0.0002 ETH
      setTxStatus('4/7: 向随机账户发送0.0002 ETH...')
      const ethTransferHash = await walletClient.sendTransaction({
        account: address,
        chain: sepolia,
        to: randomAccount.address,
        value: parseEther('0.0002')
      })
      console.log('ETH转账交易哈希:', ethTransferHash)

      // 4.1. 等待ETH转账交易确认
      setTxStatus('4.1/7: 等待ETH转账交易确认...')
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http()
      })
      const ethTransferReceipt = await publicClient.waitForTransactionReceipt({
        hash: ethTransferHash
      })
      console.log('ETH转账交易已确认:', ethTransferReceipt)

      // 5. 发送EIP-7702升级交易
      setTxStatus('5/7: 发送EIP-7702升级交易...')
      let initData
      if (functionType === 'recovery') {
        // RecoveryLogic 需要额外的 USDC 地址参数
        initData = encodeFunctionData({
          abi: recoveryLogicAbi,
          functionName: 'init',
          args: [address, contractAddresses.usdc] // owner 和 USDC 地址
        })
      } else {
        // 其他逻辑合约只需要 owner 参数
        initData = encodeFunctionData({
          abi: logicCommonAbi,
          functionName: 'init',
          args: [address] // 使用当前用户地址作为owner
        })
      }
      
      const upgradeHash = await randomWalletClient.sendTransaction({
        authorizationList: [authorization],
        data: initData,
        to: randomAccount.address,
      })
      // 5.1. 等待EIP-7702升级交易确认
      setTxStatus('5.1/7: 等待EIP-7702升级交易确认...')
      const upgradeReceipt = await publicClient.waitForTransactionReceipt({
        hash: upgradeHash
      })
      console.log('升级交易已确认:', upgradeReceipt)

      // 6-7. 批量发送USDC授权和记录子EOA交易
      setTxStatus('6-7/7: 批量发送USDC授权和记录子EOA交易...')
      
      // 准备批量调用的参数
      const calls = [
        // 第6步: USDC授权交易
        {
          to: contractAddresses.usdc,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [randomAccount.address, 1000000000000000000n]
          }),
        },
        // 第7步: 记录子EOA到平台合约
        {
          to: contractAddresses.recordContractPlatform,
          data: encodeFunctionData({
            abi: recordContractPlatformAbi,
            functionName: 'addChild',
            args: [randomAccount.address, functionType] // 子账户地址和功能标签
          }),
        }
      ]
      
      // 使用sendCalls批量发送交易
      const batchResult = await walletClient.sendCalls({
        account: address,
        chain: sepolia,
        calls: calls,
        experimental_fallback: true // 启用兼容性回退
      })
      
      console.log('批量交易ID:', batchResult.id)
      console.log('批量交易能力:', batchResult.capabilities)
      

      setTxStatus(`✅ ${functionNames[functionType]}功能添加完成！\nETH转账: ${ethTransferHash}\n升级交易: ${upgradeHash}\n批量交易ID: ${batchResult.id}`)
      
      // 重新查询已添加的功能
      setTimeout(() => {
        queryAddedFunctions()
      }, 2000) // 等待2秒后查询，确保交易已确认
    } catch (error) {
      console.error(`${functionNames[functionType]}功能添加失败:`, error)
      setTxStatus(`❌ ${functionNames[functionType]}功能添加失败: ${error instanceof Error ? error.message : '未知错误'}`)
      // 清除子EOA状态，因为交易失败
      // setCreatedChildEOA('')
    } finally {
      setIsProcessing(false)
    }
  }

  // 批量交易处理函数
  const handleBatchTransaction = async () => {
    await handleAddFunction('batchTx')
  }

  // 资产恢复处理函数
  const handleRecoveryLogic = async () => {
    await handleAddFunction('recovery')
  }

  // 订阅服务处理函数
  const handleSubscriptionLogic = async () => {
    await handleAddFunction('subscription')
  }

  // 移除子账户功能
  const handleRemoveChild = async (childAddress: string) => {
    if (!walletClient || !address) {
      setTxStatus('请先连接钱包')
      return
    }

    if (!confirm(`确定要移除子账户 ${childAddress} 吗？此操作不可撤销。`)) {
      return
    }

    setIsProcessing(true)
    setTxStatus('正在移除子账户...')

    try {
      const hash = await walletClient.writeContract({
         account: address,
         address: contractAddresses.recordContractPlatform,
         abi: recordContractPlatformAbi,
         functionName: 'removeChild',
         args: [childAddress as `0x${string}`]
       } as any)

      setTxStatus(`✅ 移除成功！\n交易哈希: ${hash}`)
      
      // 重新查询已添加的功能
      setTimeout(() => {
        queryAddedFunctions()
      }, 2000) // 等待2秒后查询，确保交易已确认
    } catch (error) {
      console.error('移除子账户失败:', error)
      setTxStatus(`❌ 移除失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">控制面板</h1>
        <div className="text-sm text-gray-500">
          欢迎使用 ModuleHub
        </div>
      </div>

      {/* 钱包状态卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">钱包状态</h3>
          {isConnected ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">地址:</span>
                <span className="font-mono text-sm">{address?.slice(0, 10)}...{address?.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">钱包:</span>
                <span>{connector?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">余额:</span>
                <span>{balance ? `${parseFloat(formatEther(balance)).toFixed(4)} ETH` : '0.0000 ETH'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">网络:</span>
                <span className="text-green-600">Sepolia</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">请先连接钱包</p>
            </div>
          )}
        </div>

        {/* 合约信息卡片 */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">合约地址</h3>
          <div className="space-y-2">
            <div>
              <span className="text-gray-600">BatchTx Logic:</span>
              <p className="font-mono text-xs text-gray-800 break-all">{contractAddresses.batchTxLogic}</p>
            </div>
            <div>
              <span className="text-gray-600">Record Platform:</span>
              <p className="font-mono text-xs text-gray-800 break-all">{contractAddresses.recordContractPlatform}</p>
            </div>
            <div>
              <span className="text-gray-600">USDC Address:</span>
              <p className="font-mono text-xs text-gray-800 break-all">{contractAddresses.usdc}</p>
            </div>
          </div>
        </div>

        {/* 当前已添加的功能卡片 */}
        <div className="card lg:col-span-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">当前已添加的功能</h3>
          {isConnected ? (
            addedFunctions.length > 0 ? (
              <div className="space-y-3">
                {addedFunctions.map((func, index) => {
                  const getFunctionInfo = (role: string) => {
                    switch (role) {
                      case 'batchTx':
                        return { icon: '📦', name: '批量交易', desc: '一次性执行多个转账交易' }
                      case 'recovery':
                        return { icon: '🔐', name: '资产恢复', desc: '管理白名单，执行资产恢复' }
                      case 'subscription':
                        return { icon: '💳', name: '订阅服务', desc: '设置订阅计划，自动扣款' }
                      default:
                        return { icon: '⚙️', name: role, desc: '自定义功能' }
                    }
                  }
                  const info = getFunctionInfo(func.role)
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{info.icon}</span>
                        <div>
                          <p className="font-medium text-green-800">{info.name}</p>
                          <p className="text-sm text-green-600">{info.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">子EOA地址:</p>
                          <p className="font-mono text-xs text-gray-700">{func.childEOA}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveChild(func.childEOA)}
                          disabled={isProcessing}
                          className="flex items-center justify-center w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="移除此功能"
                        >
                          <span className="text-lg">×</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <span className="text-4xl mb-2 block">🚀</span>
                <p className="text-gray-500 mb-2">暂无已添加的功能</p>
                <p className="text-sm text-gray-400">使用下方快速操作添加功能</p>
              </div>
            )
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">请先连接钱包查看已添加的功能</p>
            </div>
          )}
        </div>
        
        {/* 子EOA信息卡片 */}
        {/* {createdChildEOA && (
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">创建的子EOA</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">子EOA地址:</span>
                <p className="font-mono text-xs text-gray-800 break-all">{createdChildEOA}</p>
              </div>
              <div>
                <span className="text-gray-600">功能标签:</span>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">batchTx</span>
              </div>
              <div>
                <span className="text-gray-600">状态:</span>
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">已注册到平台</span>
              </div>
            </div>
          </div>
        )} */}
      </div>

      {/* EIP-7702 运行逻辑说明 */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">EIP-7702 运行逻辑</h3>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700 mb-4">本项目基于 EIP-7702 多重委托方案，通过以下8个步骤实现EOA到智能账户的升级：<span className="font-medium text-yellow-800">💡 核心优势：通过多重委托方案，一个主控EOA可以管理多个具有不同功能的子EOA，实现功能隔离和安全管理。</span></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">1</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">生成随机私钥</p>
                  <p className="text-xs text-gray-600">创建新的子EOA账户</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">2</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">创建随机钱包</p>
                  <p className="text-xs text-gray-600">基于私钥生成钱包客户端</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">3</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">签署授权</p>
                  <p className="text-xs text-gray-600">对目标逻辑合约进行委托授权</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-medium">4</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">转账ETH（由于目前钱包不支持发送升级交易）</p>
                  <p className="text-xs text-gray-600">向子EOA发送0.0002 ETH作为Gas费</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-medium">5</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">EIP-7702升级</p>
                  <p className="text-xs text-gray-600">执行委托升级，EOA变为智能账户</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center font-medium">6</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">USDC授权</p>
                  <p className="text-xs text-gray-600">批量授权USDC给子EOA使用</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center font-medium">7</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">记录子EOA</p>
                  <p className="text-xs text-gray-600">将子EOA注册到平台合约</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">8</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">丢弃子EOA私钥</p>
                  <p className="text-xs text-gray-600">安全销毁临时私钥，确保资产安全</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">快速操作</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={handleBatchTransaction}
            disabled={!isConnected || isProcessing}
            className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">📦</span>
              <div>
                <p className="font-medium text-blue-600">添加批量交易功能</p>
                <p className="text-sm text-gray-600">使用 EIP-7702 批量交易功能</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={handleRecoveryLogic}
            disabled={!isConnected || isProcessing}
            className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">🔐</span>
              <div>
                <p className="font-medium text-green-600">添加资产恢复功能</p>
                <p className="text-sm text-gray-600">管理白名单，执行资产恢复</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={handleSubscriptionLogic}
            disabled={!isConnected || isProcessing}
            className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">💳</span>
              <div>
                <p className="font-medium text-purple-600">添加订阅服务功能</p>
                <p className="text-sm text-gray-600">设置服务商和扣款周期</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 交易状态显示 */}
      {txStatus && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">交易状态</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{txStatus}</pre>
            {isProcessing && (
              <div className="mt-3 flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-blue-600">处理中...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 创新功能预览 */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">创新功能预览 <span className="text-sm text-gray-500">(开发中)</span></h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* DeFi 自动化策略 */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-left opacity-60">
            <div className="flex items-center space-x-3">
              <span className="text-xl">🤖</span>
              <div>
                <p className="font-medium text-gray-600">DeFi 自动化策略</p>
                <p className="text-sm text-gray-500">自动执行 DeFi 策略，如定投、止盈止损</p>
              </div>
            </div>
          </div>

          {/* 多签钱包治理 */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-left opacity-60">
            <div className="flex items-center space-x-3">
              <span className="text-xl">🏛️</span>
              <div>
                <p className="font-medium text-gray-600">多签钱包治理</p>
                <p className="text-sm text-gray-500">基于 EIP-7702 的去中心化多签治理</p>
              </div>
            </div>
          </div>

          {/* 智能遗产继承 */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-left opacity-60">
            <div className="flex items-center space-x-3">
              <span className="text-xl">🏺</span>
              <div>
                <p className="font-medium text-gray-600">智能遗产继承</p>
                <p className="text-sm text-gray-500">时间锁定的资产继承机制</p>
              </div>
            </div>
          </div>

          {/* 跨链资产桥接 */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-left opacity-60">
            <div className="flex items-center space-x-3">
              <span className="text-xl">🌉</span>
              <div>
                <p className="font-medium text-gray-600">跨链资产桥接</p>
                <p className="text-sm text-gray-500">一键跨链转账和流动性管理</p>
              </div>
            </div>
          </div>

          {/* AI 驱动交易助手 */}
           <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-left opacity-60">
             <div className="flex items-center space-x-3">
               <span className="text-xl">🧠</span>
               <div>
                 <p className="font-medium text-gray-600">AI 驱动交易助手</p>
                 <p className="text-sm text-gray-500">基于 AI 的智能交易决策和风险管理</p>
               </div>
             </div>
           </div>

           {/* 社交恢复钱包 */}
           <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-left opacity-60">
             <div className="flex items-center space-x-3">
               <span className="text-xl">👥</span>
               <div>
                 <p className="font-medium text-gray-600">社交恢复钱包</p>
                 <p className="text-sm text-gray-500">通过朋友网络进行账户恢复验证</p>
               </div>
             </div>
           </div>

           {/* 链上身份认证 */}
           <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-left opacity-60">
             <div className="flex items-center space-x-3">
               <span className="text-xl">🆔</span>
               <div>
                 <p className="font-medium text-gray-600">链上身份认证</p>
                 <p className="text-sm text-gray-500">去中心化身份验证和信誉系统</p>
               </div>
             </div>
           </div>

           {/* 智能合约保险 */}
           <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-left opacity-60">
             <div className="flex items-center space-x-3">
               <span className="text-xl">🛡️</span>
               <div>
                 <p className="font-medium text-gray-600">智能合约保险</p>
                 <p className="text-sm text-gray-500">自动化风险评估和保险理赔</p>
               </div>
             </div>
           </div>

           {/* 碳足迹追踪 */}
           <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-left opacity-60">
             <div className="flex items-center space-x-3">
               <span className="text-xl">🌱</span>
               <div>
                 <p className="font-medium text-gray-600">碳足迹追踪</p>
                 <p className="text-sm text-gray-500">区块链碳排放监控和碳信用交易</p>
               </div>
             </div>
           </div>
         </div>
       </div>
    </div>
  )
}

export default Dashboard
