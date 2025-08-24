# EOP Protocol (Ethereum of Passkey)

## 项目概述

EOP (Ethereum of Passkey) 是一个开创性的去中心化身份验证协议，旨在将 Web2 的无缝用户体验与 Web3 的强大安全性相结合。通过利用 Passkey 技术（如 Face ID, Touch ID），EOP 允许用户在任何 EVM 兼容的区块链上，无需助记词或密码，即可轻松创建和管理钱包。

本项目通过 NFC 卡片作为物理世界的"钥匙"，来触发和管理链上资产，为物理世界和数字世界的交互提供了全新的范式。EOP 协议具有高度的可移植性，可以轻松部署到任何 EVM 兼容链上。

## 项目所选赛道

**Open-Source Tools / Infrastructure**: 开源工具或基础设施类项目赛道

## 核心功能

- **多样化的钱包创建方式**: 支持 NFC 实体卡片创建、Passkey (iOS/Android) 一键创建、以及传统 Web3 方式创建钱包，降低用户进入 Web3 的门槛
- **物理世界与数字资产无缝连接**: 用户只需将 NFC 卡片贴近设备，即可自动生成安全的 EVM 兼容钱包，实现物理世界与数字资产的桥接
- **高安全性私钥管理**: 采用 AES-256-GCM 算法加密存储私钥，不明文落库，确保用户资产安全
- **跨链兼容性**: 协议具有高度可移植性，可轻松部署到任何 EVM 兼容链上（Ethereum, Polygon, Arbitrum 等）
- **NFT Minting 功能**: 用户成功创建钱包后可 Mint 独特的小猫 NFT 作为纪念，开启 Web3 之旅

## 代码仓库地址

https://github.com/eth-abstrct/EOP-protocol

## 团队成员 List

- **Alex** - Github: https://github.com/0xAlexWu
- **clearsky** - Github: https://github.com/ctianming
- **Ivy** - Github: https://github.com/YuChanGongzhu


## 历史获奖说明
本套项目逻辑曾在AdventureX上参加过injecive hackathon上获得过一等奖。但此次是全新的项目，专为 ETH Shenzhen 2025 Hackathon 开发。

## 技术栈

- **后端框架**: NestJS + TypeScript
- **数据库**: PostgreSQL + Prisma ORM  
- **区块链**: EVM-compatible Blockchains + ethers.js
- **加密**: AES-256-GCM 私钥加密存储
- **部署**: Docker + Docker Compose + Nginx
- **前端**: Next.js + React + TailwindCSS

## 项目演示

- **在线访问网址**: 通过 `http://43.132.124.10:3001/welcome` 可以查看完整的项目交互
- **核心功能演示**: 
  - NFC 卡片注册和钱包生成
  - 用户名管理和个人资料
  - 钱包统计信息查看
