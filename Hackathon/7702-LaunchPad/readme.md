# EIP-7702 多重委托架构设计与实现指南

## 项目概述

本项目基于EIP-7702标准，实现了一个**主控EOA + 多子EOA**的多重委托架构，突破单个EOA只能委托一个合约的限制，实现不同功能的隔离和组合。

### 核心架构

* **主控EOA**：拥有私钥，负责发起操作和管理子EOA
* **子EOA**：通过EIP-7702升级为智能账户，执行特定功能，私钥已丢弃
* **RecordContractPlatform**：记录主控EOA与子EOA的映射关系和功能标签

---

## 操作流程解析

### 1. 初始化阶段

#### 1.1 生成子EOA账户
```
用户操作 → 点击前端"添加x功能"按钮 → 随机生成EOA私钥 → 立刻私钥签名授权给对应的合约 → 发送类型4（7702）升级交易 → 成功后立即丢弃私钥
```

#### 1.2 EIP-7702授权升级
```
前端调用 eth_signAuthorization（viem - signAuthorization） → 子EOA签名授权对应功能的逻辑合约 → 通过钱包（json-RPC）发送类型4（7702）升级交易升级为智能账户 → 丢弃私钥
```

#### 1.3 注册到记录平台
```
主控EOA 通过钱包（json-RPC）→ RecordContractPlatform.addChild() → 记录子EOA地址和功能标签
```

### 2. 运行阶段

#### 2.1 查询子账户信息
```
前端 → RecordContractPlatform.getChildren() → 获取所有子EOA信息 → 展示功能列表
```

#### 2.2 执行功能调用
```
用户选择功能 → 前端构造交易 → 发送到对应子EOA → 执行智能合约逻辑
```

---

## 前端与合约交互详细定义

### 前端职责与接口

#### A. 账户管理模块

**1. 生成子EOA**
```javascript
// 生成新的EOA地址对
async function generateChildEOA() {
    const wallet = ethers.Wallet.createRandom();
    return {
        address: wallet.address,
        privateKey: wallet.privateKey // 升级后需要安全销毁
    };
}
```

**2. EIP-7702授权签名**
```javascript
// 调用钱包进行授权签名
async function signAuthorization(childAddress, logicContractAddress) {
    const authorization = {
        chainId: await provider.getNetwork().chainId,
        address: logicContractAddress,
        nonce: await provider.getTransactionCount(childAddress)
    };
    
    return await wallet.signAuthorization(authorization);
}
```

**3. 升级子EOA**
```javascript
// 发送EIP-7702升级交易
async function upgradeChildEOA(childAddress, logicContractAddress, authorization) {
    const tx = {
        type: 4, // EIP-7702交易类型
        to: childAddress,
        authorizationList: [authorization],
        data: "0x", // 空数据，仅升级
    };
    
    return await mainEOA.sendTransaction(tx);
}
```

#### B. 合约交互模块

**1. 注册子EOA到记录平台**
```javascript
async function registerChildEOA(childAddress, role) {
    const recordPlatform = new ethers.Contract(
        RECORD_PLATFORM_ADDRESS, 
        RecordContractPlatformABI, 
        mainEOASigner
    );
    
    return await recordPlatform.addChild(childAddress, role);
}
```

**2. 查询子EOA列表**
```javascript
async function getChildEOAs(ownerAddress) {
    const recordPlatform = new ethers.Contract(
        RECORD_PLATFORM_ADDRESS, 
        RecordContractPlatformABI, 
        provider
    );
    
    return await recordPlatform.getChildren(ownerAddress);
}
```

**3. 调用子EOA功能**
```javascript
async function callChildEOAFunction(childAddress, functionData) {
    // 直接向子EOA地址发送交易，会触发delegatecall到逻辑合约
    const tx = {
        to: childAddress,
        data: functionData,
        value: ethers.parseEther("0") // 根据需要设置
    };
    
    return await mainEOASigner.sendTransaction(tx);
}
```

#### C. 用户界面组件

**1. 主控账户信息展示**
```javascript
// 展示主控EOA地址、余额等基本信息
function MainAccountInfo({ address, balance }) {
    return (
        <div className="main-account">
            <h3>主控账户</h3>
            <p>地址: {address}</p>
            <p>余额: {balance} ETH</p>
        </div>
    );
}
```

**2. 子账户列表展示**
```javascript
// 展示所有子EOA及其功能标签
function ChildAccountsList({ children, onCallFunction }) {
    return (
        <div className="child-accounts">
            <h3>功能账户列表</h3>
            {children.map(child => (
                <div key={child.childEOA} className="child-account">
                    <p>地址: {child.childEOA}</p>
                    <p>功能: {child.role}</p>
                    <button onClick={() => onCallFunction(child)}>
                        执行{child.role}
                    </button>
                </div>
            ))}
        </div>
    );
}
```

---

## 合约端设计与接口

### RecordContractPlatform合约

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RecordContractPlatform {
    struct Child {
        address childEOA;
        string role;
        uint256 createdAt;
    }
    
    // 主控EOA -> 子EOA数组的映射
    mapping(address => Child[]) public children;
    
    // 事件定义
    event ChildAdded(address indexed owner, address indexed childEOA, string role);
    event ChildRemoved(address indexed owner, address indexed childEOA);
    
    // 添加子EOA记录
    function addChild(address childEOA, string memory role) external {
        require(childEOA != address(0), "Invalid child address");
        require(bytes(role).length > 0, "Role cannot be empty");
        
        children[msg.sender].push(Child({
            childEOA: childEOA,
            role: role,
            createdAt: block.timestamp
        }));
        
        emit ChildAdded(msg.sender, childEOA, role);
    }
    
    // 查询子EOA列表
    function getChildren(address owner) external view returns (Child[] memory) {
        return children[owner];
    }
    
    // 获取子EOA数量
    function getChildrenCount(address owner) external view returns (uint256) {
        return children[owner].length;
    }
    
    // 移除子EOA记录（可选功能）
    function removeChild(address childEOA) external {
        Child[] storage ownerChildren = children[msg.sender];
        
        for (uint256 i = 0; i < ownerChildren.length; i++) {
            if (ownerChildren[i].childEOA == childEOA) {
                // 将最后一个元素移到当前位置，然后删除最后一个
                ownerChildren[i] = ownerChildren[ownerChildren.length - 1];
                ownerChildren.pop();
                
                emit ChildRemoved(msg.sender, childEOA);
                break;
            }
        }
    }
}
```

### 逻辑合约示例

#### 1. 批量交易逻辑合约
```solidity
contract BatchTxLogic {
    address public immutable owner;
    
    constructor(address _owner) {
        owner = _owner;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }
    
    function batchTransfer(
        address[] calldata recipients, 
        uint256[] calldata amounts
    ) external payable onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            payable(recipients[i]).transfer(amounts[i]);
        }
    }
}
```

#### 2. 账户恢复逻辑合约
```solidity
contract RecoveryLogic {
    address public immutable owner;
    mapping(address => uint256) public recoveryRequests;
    uint256 public constant RECOVERY_DELAY = 7 days;
    
    constructor(address _owner) {
        owner = _owner;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }
    
    function initiateRecovery(address newOwner) external onlyOwner {
        recoveryRequests[newOwner] = block.timestamp + RECOVERY_DELAY;
    }
    
    function executeRecovery(address newOwner) external {
        require(
            recoveryRequests[newOwner] > 0 && 
            block.timestamp >= recoveryRequests[newOwner], 
            "Recovery not ready"
        );
        
        // 转移所有资产到新地址
        payable(newOwner).transfer(address(this).balance);
    }
}
```

#### 3. 订阅续费逻辑合约
```solidity
contract SubscriptionLogic {
    address public immutable owner;
    
    struct Subscription {
        address service;
        uint256 amount;
        uint256 interval;
        uint256 nextPayment;
        bool active;
    }
    
    mapping(uint256 => Subscription) public subscriptions;
    uint256 public subscriptionCount;
    
    constructor(address _owner) {
        owner = _owner;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }
    
    function createSubscription(
        address service, 
        uint256 amount, 
        uint256 interval
    ) external onlyOwner {
        subscriptions[subscriptionCount] = Subscription({
            service: service,
            amount: amount,
            interval: interval,
            nextPayment: block.timestamp + interval,
            active: true
        });
        subscriptionCount++;
    }
    
    function executePayment(uint256 subscriptionId) external {
        Subscription storage sub = subscriptions[subscriptionId];
        require(sub.active, "Subscription not active");
        require(block.timestamp >= sub.nextPayment, "Payment not due");
        
        payable(sub.service).transfer(sub.amount);
        sub.nextPayment = block.timestamp + sub.interval;
    }
}
```

---

## 完整交互流程示例

### 场景：创建批量交易功能的子EOA

#### 1. 前端操作序列
```javascript
async function setupBatchTxChild() {
    // 步骤1: 生成子EOA
    const childEOA = await generateChildEOA();
    console.log("生成子EOA:", childEOA.address);
    
    // 步骤2: 部署或获取批量交易逻辑合约地址
    const batchTxLogicAddress = "0x..."; // 预部署的合约地址
    
    // 步骤3: 创建授权签名
    const childSigner = new ethers.Wallet(childEOA.privateKey, provider);
    const authorization = await signAuthorization(
        childEOA.address, 
        batchTxLogicAddress
    );
    
    // 步骤4: 执行EIP-7702升级
    await upgradeChildEOA(childEOA.address, batchTxLogicAddress, authorization);
    
    // 步骤5: 安全销毁私钥
    // 注意：实际应用中需要安全的内存清理
    childEOA.privateKey = null;
    
    // 步骤6: 注册到记录平台
    await registerChildEOA(childEOA.address, "batchTx");
    
    console.log("批量交易子EOA设置完成");
}
```

#### 2. 使用批量交易功能
```javascript
async function executeBatchTransfer(recipients, amounts) {
    // 步骤1: 查询批量交易子EOA地址
    const calls = [
    {
        to: '0x0000000000000000000000000000000000000111' as `0x${string}`,
        value: parseEther('0.00001')
    },
    {
        to: '0x0000000000000000000000000000000000000222' as `0x${string}`,
        value: parseEther('0.00001')
    }
    ];

    const result = await walletClient.sendCalls({
        account: wallet.address as `0x${string}`,
        calls,
        experimental_fallback: true // 启用兼容性回退
    });
    
    
    console.log("批量转账交易已发送:", result);
    return tx;
}
```

---

## 安全注意事项

### 1. 私钥管理安全
* **立即销毁**：子EOA升级后必须立即安全销毁私钥
* **提醒警告**：明确告知用户子EOA私钥已丢弃，请放心使用

### 2. 权限控制安全
* **Owner验证**：所有逻辑合约必须验证调用者为主控EOA
* **访问控制**：RecordContractPlatform只允许主控EOA管理自己的记录
* **状态保护**：子EOA的关键状态变量应设为immutable或有严格的修改控制

### 3. 升级安全
* **一次性升级**：子EOA升级后不可更改，需要新功能时创建新子EOA
* **逻辑合约审计**：确保所有逻辑合约经过充分测试和审计
* **授权验证**：确认EIP-7702授权签名的有效性

### 4. 资产安全
* **余额监控**：定期检查各子EOA的余额状态
* **恢复机制**：实现紧急资产恢复功能
* **多签保护**：对于高价值操作考虑添加多重签名保护

---

## 总结

本架构通过**主控EOA + 多子EOA + 记录合约**的设计，成功实现了EIP-7702的多重委托功能，解决了单个EOA只能委托一个合约的限制。前端负责用户交互和签名操作，合约端提供功能逻辑和状态管理，两者通过明确定义的接口进行交互，构建了一个安全、灵活、可扩展的智能账户管理系统。