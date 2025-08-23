# Subscription Consumer 合约说明

本项目包含两个随机数生成合约，用于MEV保护系统中的随机性需求。

## 合约概述

### 1. SimpleSubscriptionConsumer.sol
- **用途**: 测试和开发环境
- **特点**: 使用链上伪随机数，立即返回结果
- **优势**: 无需外部依赖，快速响应
- **劣势**: 随机性不够安全，不适合生产环境

### 2. SubcriptionConsumer.sol (Chainlink VRF)
- **用途**: 生产环境
- **特点**: 使用Chainlink VRF提供安全的随机数
- **优势**: 真正的随机性，抗操纵
- **劣势**: 需要Chainlink订阅和LINK代币

## 安装和配置

### 1. 安装依赖
```bash
npm install @chainlink/contracts
```

### 2. 编译合约
```bash
npx hardhat compile
```

## 使用方法

### SimpleSubscriptionConsumer (测试环境)

```javascript
// 部署
const SimpleSubscriptionConsumer = await ethers.getContractFactory("SimpleSubscriptionConsumer");
const consumer = await SimpleSubscriptionConsumer.deploy();

// 请求随机数
const tx = await consumer.requestRandomWords(false);
await tx.wait();

// 获取结果
const requestStatus = await consumer.getRequestStatus(1);
console.log("Random words:", requestStatus.randomWords);
```

### SubcriptionConsumer (生产环境)

#### 1. 设置Chainlink订阅
1. 访问 [Chainlink VRF Subscription Manager](https://vrf.chain.link/)
2. 创建新订阅
3. 充值LINK代币
4. 记录订阅ID

#### 2. 部署合约
```javascript
const subscriptionId = "30867384965334728711427918226381771937390809014305130314753698149523927636152"; // 真实订阅ID
const SubcriptionConsumer = await ethers.getContractFactory("SubcriptionConsumer");
const consumer = await SubcriptionConsumer.deploy(subscriptionId);
```

#### 3. 使用合约
```javascript
// 请求随机数（使用LINK支付）
const tx1 = await consumer.requestRandomWords(false);
await tx1.wait();

// 请求随机数（使用原生代币支付）
const tx2 = await consumer.requestRandomWords(true);
await tx2.wait();

// 检查状态（可能需要等待Chainlink网络响应）
const requestStatus = await consumer.getRequestStatus(requestId);
```

## 网络配置

### Sepolia测试网
- **VRF Coordinator**: `0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B`
- **Key Hash**: `0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae`

### 以太坊主网
- **VRF Coordinator**: `0x271682DEB8C4E0901D1a1550aD2e64D568E69909`
- **Key Hash**: `0x8af398995b04c28e9951adb9721ef74c74f93e6a478f39e7e0777be13527e7ef`

## 测试

运行测试套件：
```bash
npx hardhat test test/SubscriptionConsumer.test.js
```

## 部署脚本

### 本地测试部署
```bash
npx hardhat run scripts/deploy-subscription-consumer.js --network localhost
```

### Sepolia测试网部署
```bash
npx hardhat run scripts/deploy-subscription-consumer.js --network sepolia
```

## 安全注意事项

1. **SimpleSubscriptionConsumer**: 仅用于测试，不要在生产环境中使用
2. **SubcriptionConsumer**: 确保订阅有足够的LINK余额
3. **权限控制**: 只有合约所有者可以请求随机数
4. **网络选择**: 确保在正确的网络上部署和使用

## 故障排除

### 常见问题

1. **"Transaction reverted without a reason string"**
   - 检查订阅ID是否正确
   - 确认订阅有足够的LINK余额
   - 验证网络配置

2. **"Only callable by owner"**
   - 确保使用正确的账户调用函数
   - 检查合约所有权

3. **导入错误**
   - 确认已安装 `@chainlink/contracts`
   - 检查导入路径是否正确

### 调试技巧

1. 使用Hardhat控制台进行交互式调试
2. 检查事件日志了解请求状态
3. 监控Chainlink VRF订阅状态

## 集成到MEVGuard

在MEVGuard合约中，你可以选择使用哪个随机数源：

```solidity
// 使用SimpleSubscriptionConsumer（测试）
ISimpleSubscriptionConsumer simpleConsumer;

// 使用SubcriptionConsumer（生产）
ISubcriptionConsumer chainlinkConsumer;

function getRandomNumber() internal returns (uint256) {
    // 根据环境选择不同的随机数源
    if (useChainlink) {
        // 使用Chainlink VRF
        uint256 requestId = chainlinkConsumer.requestRandomWords(false);
        (bool fulfilled, uint256[] memory randomWords) = chainlinkConsumer.getRequestStatus(requestId);
        return randomWords[0];
    } else {
        // 使用简单随机数（仅测试）
        uint256 requestId = simpleConsumer.requestRandomWords(false);
        (bool fulfilled, uint256[] memory randomWords) = simpleConsumer.getRequestStatus(requestId);
        return randomWords[0];
    }
}
```

## 许可证

本项目使用GPL-3.0许可证。
