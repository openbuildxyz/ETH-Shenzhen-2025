# ModuleHub DApp 前端

基于 ERC-7702 账户抽象的智能合约管理平台，支持资产恢复和订阅服务功能。

## 🚀 功能特性

### 💼 钱包连接
- 支持 MetaMask、OKX Wallet 等主流钱包
- 实时显示钱包状态、余额和网络信息
- 一键连接/断开钱包

### 📦 批量交易模块
- **批量转账**: 一次性执行多个ETH转账交易
- **CSV导入**: 支持从CSV文件批量导入交易数据
- **交易验证**: 实时验证地址和金额有效性
- **执行状态**: 详细显示每笔交易的执行结果
- **Gas估算**: 预估批量交易的总Gas费用

### 🔐 资产恢复模块
- **白名单管理**: 添加/移除受信任的恢复地址
- **资产恢复**: 白名单用户可执行资产转移操作
- **权限控制**: 只有主控 EOA 可管理白名单
- **安全提示**: 操作前的安全确认和提醒

### 💳 订阅服务模块
- **订阅设置**: 配置服务商、扣费周期和金额
- **自动扣费**: 服务商可执行周期性自动扣费
- **订阅管理**: 查看订阅状态和扣费记录
- **时间控制**: 精确的扣费时间控制

## 🛠️ 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite
- **样式框架**: TailwindCSS
- **区块链交互**: Viem + Wagmi
- **钱包连接**: WalletConnect
- **路由管理**: React Router
- **状态管理**: TanStack Query

## 📁 项目结构

```
src/
├── components/          # 通用组件
│   ├── Layout.tsx      # 主布局组件
│   ├── Sidebar.tsx     # 侧边导航栏
│   └── WalletConnect.tsx # 钱包连接组件
├── pages/              # 页面组件
│   ├── Dashboard.tsx   # 控制面板
│   ├── BatchTransaction.tsx # 批量交易页面
│   ├── RecoveryLogic.tsx # 资产恢复页面
│   └── SubscriptionLogic.tsx # 订阅服务页面
├── hooks/              # 自定义 Hooks
│   ├── useContracts.ts # 合约配置
│   ├── useBatchTransaction.ts # 批量交易逻辑
│   ├── useRecoveryLogic.ts # 资产恢复逻辑
│   ├── useSubscriptionLogic.ts # 订阅服务逻辑
│   └── useToken.ts     # 代币操作
├── config/             # 配置文件
│   ├── wagmi.ts        # Wagmi 配置
│   └── contracts.ts    # 合约 ABI 和地址
├── types/              # TypeScript 类型定义
├── utils/              # 工具函数
└── App.tsx             # 主应用组件
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置相关参数：

```bash
cp .env.example .env
```

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动

### 4. 构建生产版本

```bash
npm run build
```

## 🔧 配置说明

### 合约地址配置

在 `src/config/contracts.ts` 中配置合约地址：

```typescript
export const CONTRACT_ADDRESSES = {
  sepolia: {
    recoveryLogic: '0x...',
    subscriptionLogic: '0x...',
    token: '0x...',
  },
  // ...
}
```

### 网络配置

在 `src/config/wagmi.ts` 中配置支持的网络：

```typescript
export const config = createConfig({
  chains: [sepolia, hardhat],
  // ...
})
```

## 📖 使用指南

### 批量交易流程

1. **连接钱包**
2. **添加交易项目**（手动输入或CSV导入）
3. **验证交易数据**（地址、金额、描述）
4. **执行批量交易**
5. **查看执行结果**和交易哈希

### 资产恢复流程

1. **连接主控 EOA 钱包**
2. **授权 ERC20 代币**给 RecoveryLogic 合约
3. **添加白名单地址**（受信任的恢复账户）
4. **白名单用户执行恢复操作**，将资产转移到指定地址

### 订阅服务流程

1. **连接主控 EOA 钱包**
2. **授权 ERC20 代币**给 SubscriptionLogic 合约
3. **设置订阅参数**（服务商地址、扣费周期、金额）
4. **服务商周期性执行扣费**操作

## 🔒 安全注意事项

- ⚠️ **谨慎管理白名单**：只添加完全信任的地址
- ⚠️ **确认操作参数**：转账金额和地址务必仔细检查
- ⚠️ **网络环境**：确保在正确的网络环境下操作
- ⚠️ **私钥安全**：妥善保管钱包私钥，不要泄露

## 🌐 支持的网络

- **Sepolia 测试网** (Chain ID: 11155111)
- **Hardhat 本地网络** (Chain ID: 31337)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目基于 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🐛 问题反馈

如果您发现任何问题或有功能建议，请在 [Issues](../../issues) 中提出。

---

**注意**: 这是一个实验性项目，基于 ERC-7702 账户抽象标准。请在生产环境使用前进行充分测试。
