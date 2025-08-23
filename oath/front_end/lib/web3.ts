// Web3连接和合约交互逻辑
import { ethers } from "ethers"
import {
  OATH_CONTRACT_ABI,
  OATH_CONTRACT_ADDRESS,
  ERC20_ABI,
  USDC_TOKEN_ADDRESS,
  SWEAR_TOKEN_ADDRESS,
} from "./contracts"
import type { TokenBalance, TransactionResult } from "./contracts"

declare global {
  interface Window {
    ethereum?: any
  }
}

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.JsonRpcSigner | null = null
  private oathContract: ethers.Contract | null = null
  private usdcContract: ethers.Contract | null = null
  private swearContract: ethers.Contract | null = null

  async connect(): Promise<string | null> {
    if (!window.ethereum) {
      throw new Error("请安装MetaMask钱包")
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" })
      this.provider = new ethers.BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()

      // 初始化合约实例
      this.oathContract = new ethers.Contract(OATH_CONTRACT_ADDRESS, OATH_CONTRACT_ABI, this.signer)
      this.usdcContract = new ethers.Contract(USDC_TOKEN_ADDRESS, ERC20_ABI, this.signer)
      this.swearContract = new ethers.Contract(SWEAR_TOKEN_ADDRESS, ERC20_ABI, this.signer)

      const address = await this.signer.getAddress()
      return address
    } catch (error) {
      console.error("连接钱包失败:", error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    this.provider = null
    this.signer = null
    this.oathContract = null
    this.usdcContract = null
    this.swearContract = null
  }

  async getAccount(): Promise<string | null> {
    if (!this.signer) return null
    try {
      return await this.signer.getAddress()
    } catch {
      return null
    }
  }

  async getTokenBalances(address: string): Promise<TokenBalance> {
    if (!this.usdcContract || !this.swearContract) {
      throw new Error("合约未初始化")
    }

    try {
      const [usdcBalance, swearBalance] = await Promise.all([
        this.usdcContract.balanceOf(address),
        this.swearContract.balanceOf(address),
      ])

      return {
        usdc: ethers.formatUnits(usdcBalance, 6), // USDC 6位小数
        swear: ethers.formatUnits(swearBalance, 18), // SWEAR 18位小数
      }
    } catch (error) {
      console.error("获取代币余额失败:", error)
      throw error
    }
  }

  async createOath(
    content: string,
    category: number,
    usdcAmount: string,
    swearAmount: string,
    deadline: number,
  ): Promise<TransactionResult> {
    if (!this.oathContract || !this.usdcContract || !this.swearContract) {
      throw new Error("合约未初始化")
    }

    try {
      // 转换金额格式
      const usdcAmountWei = ethers.parseUnits(usdcAmount, 6)
      const swearAmountWei = ethers.parseUnits(swearAmount, 18)

      // 检查并批准代币转账
      const usdcAllowance = await this.usdcContract.allowance(await this.signer!.getAddress(), OATH_CONTRACT_ADDRESS)
      const swearAllowance = await this.swearContract.allowance(await this.signer!.getAddress(), OATH_CONTRACT_ADDRESS)

      // 批准USDC转账
      if (usdcAllowance < usdcAmountWei) {
        const approveTx = await this.usdcContract.approve(OATH_CONTRACT_ADDRESS, usdcAmountWei)
        await approveTx.wait()
      }

      // 批准SWEAR转账
      if (swearAllowance < swearAmountWei) {
        const approveTx = await this.swearContract.approve(OATH_CONTRACT_ADDRESS, swearAmountWei)
        await approveTx.wait()
      }

      // 创建誓言
      const tx = await this.oathContract.createOath(content, category, usdcAmountWei, swearAmountWei, deadline)

      const receipt = await tx.wait()
      return {
        hash: receipt.hash,
        success: true,
      }
    } catch (error: any) {
      console.error("创建誓言失败:", error)
      return {
        hash: "",
        success: false,
        error: error.message || "交易失败",
      }
    }
  }

  async completeOath(oathId: string): Promise<TransactionResult> {
    if (!this.oathContract) {
      throw new Error("合约未初始化")
    }

    try {
      const tx = await this.oathContract.completeOath(oathId)
      const receipt = await tx.wait()

      return {
        hash: receipt.hash,
        success: true,
      }
    } catch (error: any) {
      console.error("完成誓言失败:", error)
      return {
        hash: "",
        success: false,
        error: error.message || "交易失败",
      }
    }
  }

  async reportViolation(oathId: string, evidence: string): Promise<TransactionResult> {
    if (!this.oathContract) {
      throw new Error("合约未初始化")
    }

    try {
      const tx = await this.oathContract.reportViolation(oathId, evidence)
      const receipt = await tx.wait()

      return {
        hash: receipt.hash,
        success: true,
      }
    } catch (error: any) {
      console.error("举报违约失败:", error)
      return {
        hash: "",
        success: false,
        error: error.message || "交易失败",
      }
    }
  }

  async arbitrate(oathId: string, decision: boolean): Promise<TransactionResult> {
    if (!this.oathContract) {
      throw new Error("合约未初始化")
    }

    try {
      const tx = await this.oathContract.arbitrate(oathId, decision)
      const receipt = await tx.wait()

      return {
        hash: receipt.hash,
        success: true,
      }
    } catch (error: any) {
      console.error("仲裁失败:", error)
      return {
        hash: "",
        success: false,
        error: error.message || "交易失败",
      }
    }
  }

  async getCreditScore(address: string): Promise<number> {
    if (!this.oathContract) {
      throw new Error("合约未初始化")
    }

    try {
      const score = await this.oathContract.getCreditScore(address)
      return Number(score)
    } catch (error) {
      console.error("获取信用分数失败:", error)
      return 0
    }
  }

  async getUserOaths(address: string): Promise<string[]> {
    if (!this.oathContract) {
      throw new Error("合约未初始化")
    }

    try {
      const oathIds = await this.oathContract.getUserOaths(address)
      return oathIds.map((id: any) => id.toString())
    } catch (error) {
      console.error("获取用户誓言失败:", error)
      return []
    }
  }
}

// 单例实例
export const web3Service = new Web3Service()
