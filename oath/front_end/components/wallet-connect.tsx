"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useWeb3 } from "@/hooks/use-web3"
import { Wallet, Coins, Trophy, RefreshCw, LogOut } from "lucide-react"
import { useState } from "react"

export function WalletConnect() {
  const { isConnected, account, isConnecting, error, balances, creditScore, connect, disconnect, refreshBalances } =
    useWeb3()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshBalances()
    setIsRefreshing(false)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto oath-shadow">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-blue-100">
              <Wallet className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-xl">连接钱包</CardTitle>
          <CardDescription>连接您的Web3钱包开始使用誓言平台</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <Button
            onClick={connect}
            disabled={isConnecting}
            className="w-full oath-gradient text-white hover:opacity-90"
            size="lg"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                连接中...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                连接MetaMask
              </>
            )}
          </Button>
          <p className="text-xs text-slate-500 text-center">请确保已安装MetaMask钱包扩展</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto oath-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-green-100">
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">钱包已连接</CardTitle>
              <CardDescription className="font-mono text-sm">{formatAddress(account!)}</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={disconnect} className="text-slate-500 hover:text-slate-700">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 信用分数 */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            <span className="font-medium text-slate-700">信用分数</span>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            {creditScore}
          </Badge>
        </div>

        <Separator />

        {/* 代币余额 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-slate-700 flex items-center">
              <Coins className="mr-2 h-4 w-4" />
              代币余额
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-slate-500 hover:text-slate-700"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {balances ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded bg-slate-50">
                <span className="text-sm font-medium text-slate-600">USDC</span>
                <span className="text-sm font-mono">{Number.parseFloat(balances.usdc).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-50">
                <span className="text-sm font-medium text-slate-600">SWEAR</span>
                <span className="text-sm font-mono">{Number.parseFloat(balances.swear).toFixed(4)}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-slate-400" />
              <p className="text-sm text-slate-500 mt-2">加载余额中...</p>
            </div>
          )}
        </div>

        <Separator />

        <div className="text-xs text-slate-500 text-center">确保您在正确的网络上进行交易</div>
      </CardContent>
    </Card>
  )
}
