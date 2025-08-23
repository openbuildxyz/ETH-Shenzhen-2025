# Sepolia测试网部署指南

## 1. 环境配置

在项目根目录创建 `.env` 文件：

```bash
# Sepolia测试网配置
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
# 或者使用Alchemy: https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# 部署私钥（绝对不要提交到版本控制）
PRIVATE_KEY=your_private_key_here

# Gas报告
REPORT_GAS=true
```

## 2. 获取Sepolia测试网配置

### Infura方式
1. 访问 https://infura.io/
2. 创建账户并创建新项目
3. 选择Sepolia网络
4. 复制项目ID到SEPOLIA_URL

### Alchemy方式
1. 访问 https://www.alchemy.com/
2. 创建账户并创建新应用
3. 选择Sepolia网络
4. 复制API Key到SEPOLIA_URL

## 3. 获取测试网ETH

访问以下水龙头获取Sepolia测试网ETH：
- https://sepoliafaucet.com/
- https://faucet.sepolia.dev/
- https://sepolia-faucet.pk910.de/

## 4. 部署合约

```bash
# 编译合约
npm run compile

# 部署到Sepolia
npm run deploy:sepolia
```

## 5. 更新前端配置

部署完成后，将获得的合约地址更新到 `frontend/app.js` 中的 `CONTRACT_ADDRESSES` 对象：

```javascript
const CONTRACT_ADDRESSES = {
    factory: '0x...',    // 从部署输出复制
    router: '0x...',     // 从部署输出复制
    weth: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9', // Sepolia WETH
    tokenA: '0x...',     // 从部署输出复制
    tokenB: '0x...'      // 从部署输出复制
};
```

## 6. 测试部署

1. 确保MetaMask连接到Sepolia测试网
2. 刷新前端页面
3. 连接钱包
4. 测试添加流动性和交换功能

## 注意事项

- 私钥绝对不要提交到Git
- 确保有足够的Sepolia ETH支付gas费
- 部署后考虑在Etherscan上验证合约
- 测试网上的代币没有实际价值
