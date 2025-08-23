# USDK Privacy Stablecoin Platform

## 项目概述

USDK 是一个支持多链的隐私稳定币平台，专注于提供透明、安全且合规的数字资产服务。平台通过零知识证明技术实现用户隐私保护，同时通过链上透明度证明确保资金安全。USDK 结合了传统金融的合规要求与去中心化金融的创新优势，为用户提供收益生成、隐私保护和资产管理的一站式解决方案。

## 项目所选赛道

**xFi: 金融类应用/协议赛道** - DeFi 隐私稳定币协议

本项目致力于促进金融创新，通过隐私保护技术和透明度证明机制，实现更安全、更私密的金融服务，推动DeFi的普惠金融发展。

## 核心功能

1. **多链隐私稳定币 (USDK Token)**
   - 基于ERC20标准的隐私稳定币，支持以太坊、Arbitrum、Optimism、Polygon、Base等主流链
   - 角色化权限管理（铸造、销毁、暂停、黑名单）确保合规性和安全性
   - 支持ERC20Permit的无Gas费授权和批量操作

2. **零知识透明度证明系统 (ProofRegistry)**
   - 使用Merkle树结构存储和验证交易批次证明
   - 支持多种证明类型：充值、收益分配、交易执行、提现批次
   - Oracle签名验证确保数据可信度，结合IPFS/Arweave实现去中心化存储

3. **SIWE去中心化身份认证**
   - 基于Sign-In with Ethereum的Web3原生登录方式
   - JWT身份验证和会话管理，支持跨链身份识别
   - 无需传统KYC即可享受合规的隐私金融服务

4. **智能风控和资产管理**
   - 多链钱包地址生成和管理（HD/MPC钱包支持）
   - 实时风险评估和异常交易监控
   - 投资组合管理和APY收益追踪

5. **用户友好的Web3界面**
   - React + TypeScript构建的现代化前端界面
   - 集成Wagmi和RainbowKit的无缝钱包连接体验
   - 响应式设计和流畅的交互动效

## 代码仓库地址

[https://github.com/wiiliamwang9/KUSD](https://github.com/wiiliamwang9/KUSD)

## 团队成员 List

- **Eason** - 项目负责人
  - Github: [https://www.ethshenzhen.org/]
  - 负责智能合约开发、后端架构设计和项目整体规划

- **[William]** - 后端开发者 & 合约开发者
  - Github: [wiiliamwang9]
  - 负责后端开发、合约部署，安全审计

- **[潮潮]** - 前端开发者 & 区块链开发者
  - Github: [coolzeta]
  - 负责多链部署、安全审计和性能优化

 - **[Zeta]** - 前端开发者
  - Github: [coolzeta]
  - 负责Web3前端界面开发和用户体验优化

## 历史获奖说明

本项目为ETH Shenzhen 2025黑客松全新开发项目，此前未参与其他黑客松活动。项目团队成员曾参与多个DeFi协议的开发工作，具备丰富的区块链开发经验。

## Deck (PPT) 地址

- [USDK项目演示PPT](待完善)
- 或在线查看：[https://kusd-frontend-mtdff46kd-zhangx2624-9137s-projects.vercel.app/](https://kusd-frontend-mtdff46kd-zhangx2624-9137s-projects.vercel.app/)

## 项目演示

### 在线演示地址
- **前端界面**: [https://kusd-frontend-mtdff46kd-zhangx2624-9137s-projects.vercel.app/](https://kusd-frontend-mtdff46kd-zhangx2624-9137s-projects.vercel.app/)
- **合约地址 (Sepolia测试网)**:
  - USDK Token: `0xAeE3625b0E6a4FfAc196d4DCB51dCe7568dD6353`
  - ProofRegistry: `0x4699ED32Ab75A7B7f8c74eAE88EF1EB02BFa55da`

### 演示视频
- [https://kusd-frontend-mtdff46kd-zhangx2624-9137s-projects.vercel.app/](https://kusd-frontend-mtdff46kd-zhangx2624-9137s-projects.vercel.app/)

## 技术架构

### 智能合约层
- **Solidity 0.8.20** + **OpenZeppelin v5**
- **Hardhat** 开发框架，支持多网络部署
- **TypeChain** 类型安全的合约交互

### 后端服务
- **Go 1.21** + **Gin** Web框架
- **GORM** + **MySQL 8.0** 数据持久化
- **Redis** 缓存和会话管理

### 前端应用
- **React 19** + **TypeScript** + **Vite**
- **Wagmi v2** + **RainbowKit v2** Web3连接
- **Framer Motion** 动效和交互

### 部署架构
- 支持以太坊、Arbitrum、Optimism、Polygon、Base主网
- Docker容器化部署
- CI/CD自动化测试和部署流程

---

**联系方式**: [5825267@qq.com](5825267@qq.com)  
**项目官网**: [https://kusd-frontend-mtdff46kd-zhangx2624-9137s-projects.vercel.app/](https://kusd-frontend-mtdff46kd-zhangx2624-9137s-projects.vercel.app/)