"use client"

import { useState, useEffect, useCallback } from "react"
import { web3Service } from "@/lib/web3"
import type { TokenBalance } from "@/lib/contracts"

interface Web3State {
  isConnected: boolean
  account: string | null
  isConnecting: boolean
  error: string | null
  balances: TokenBalance | null
  creditScore: number
}

export function useWeb3() {
  const [state, setState] = useState<Web3State>({
    isConnected: false,
    account: null,
    isConnecting: false,
    error: null,
    balances: null,
    creditScore: 0,
  })

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }))

    try {
      const account = await web3Service.connect()
      if (account) {
        const [balances, creditScore] = await Promise.all([
          web3Service.getTokenBalances(account),
          web3Service.getCreditScore(account),
        ])

        setState((prev) => ({
          ...prev,
          isConnected: true,
          account,
          balances,
          creditScore,
          isConnecting: false,
        }))
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || "连接失败",
        isConnecting: false,
      }))
    }
  }, [])

  const disconnect = useCallback(async () => {
    await web3Service.disconnect()
    setState({
      isConnected: false,
      account: null,
      isConnecting: false,
      error: null,
      balances: null,
      creditScore: 0,
    })
  }, [])

  const refreshBalances = useCallback(async () => {
    if (state.account) {
      try {
        const [balances, creditScore] = await Promise.all([
          web3Service.getTokenBalances(state.account),
          web3Service.getCreditScore(state.account),
        ])
        setState((prev) => ({ ...prev, balances, creditScore }))
      } catch (error) {
        console.error("刷新余额失败:", error)
      }
    }
  }, [state.account])

  // 检查钱包连接状态
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const account = await web3Service.getAccount()
        if (account) {
          const [balances, creditScore] = await Promise.all([
            web3Service.getTokenBalances(account),
            web3Service.getCreditScore(account),
          ])
          setState((prev) => ({
            ...prev,
            isConnected: true,
            account,
            balances,
            creditScore,
          }))
        }
      } catch (error) {
        console.error("检查连接状态失败:", error)
      }
    }

    checkConnection()
  }, [])

  // 监听账户变化
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else if (accounts[0] !== state.account) {
          connect()
        }
      }

      const handleChainChanged = () => {
        window.location.reload()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [state.account, connect, disconnect])

  return {
    ...state,
    connect,
    disconnect,
    refreshBalances,
    web3Service,
  }
}
