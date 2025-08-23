# Leafswap Frontend - MEV Protection Interface

## 🎯 概述

这是Leafswap的前端界面，集成了完整的MEV保护功能展示和配置管理。用户可以通过直观的界面监控MEV保护状态、调整保护参数，并实时查看保护效果。

## 🚀 快速开始

### 1. 启动前端服务器
```bash
cd frontend
python3 -m http.server 8000
```

### 2. 访问前端界面
打开浏览器访问：`http://localhost:8000`

### 3. 连接钱包
点击"Connect Wallet"按钮连接MetaMask或其他Web3钱包

## 🛡️ MEV保护功能

### 保护状态监控
- **Anti-Front-Running Protection**: 显示防抢跑保护状态
- **Anti-MEV Mode**: 显示三明治攻击防护状态
- **Transaction Limits**: 显示交易规模限制

### 配置管理
- **Protection Duration**: 调整保护期长度（50-500区块）
- **MEV Fee**: 设置MEV手续费率（0.1-5.0%）
- **Min Transaction Size**: 设置最小交易规模（0.1-2.0%）

### 实时分析
- **Blocked Transactions**: 被阻止的交易数量
- **Protection Efficiency**: 保护效率百分比
- **Avg Gas Saved**: 平均节省的Gas费用
- **Last Attack Attempt**: 最后一次攻击尝试时间

## 🔧 配置说明

### 更新合约地址
编辑 `config.js` 文件，更新以下地址：

```javascript
const CONTRACT_ADDRESSES = {
    factory: '0x...',     // LeafswapAMMFactory地址
    router: '0x...',      // LeafswapRouter地址
    weth: '0x...',        // WETH地址
    tokenA: '0x...',      // 测试代币A地址
    tokenB: '0x...',      // 测试代币B地址
    mevGuard: '0x...'     // MEVGuard地址
};
```

### 调整保护参数
在 `config.js` 中修改默认保护设置：

```javascript
const MEV_CONFIG = {
    defaultProtectionDuration: 100,    // 默认保护期
    defaultMevFee: 1.0,               // 默认MEV手续费
    defaultMinTxSize: 0.5             // 默认最小交易规模
};
```

## 📱 界面功能

### Swap标签页
- 代币交换功能
- 实时MEV保护状态显示
- 保护级别指示器
- 保护到期倒计时

### Liquidity标签页
- 添加/移除流动性
- 流动性池管理

### Pools标签页
- 交易对信息展示
- 流动性统计
- 收益率显示

### MEV Protection标签页
- 保护状态概览
- 参数配置界面
- 实时分析数据
- 保护效果统计

## 🔒 安全特性

### 前端保护
- 输入验证和范围检查
- 实时状态更新
- 错误处理和用户提示

### 链上验证
- MEV保护状态检查
- 交易前保护验证
- 配置更新确认

## 🎨 自定义样式

### 修改主题色彩
在 `index.html` 中更新CSS变量：

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #28a745;
    --warning-color: #ffc107;
    --danger-color: #dc3545;
}
```

### 调整布局
- 修改Bootstrap网格系统
- 调整卡片间距和圆角
- 自定义响应式断点

## 📊 数据更新

### 自动更新间隔
- 余额更新：10秒
- MEV状态更新：15秒
- 分析数据更新：30秒
- 区块号更新：5秒

### 手动刷新
- 点击配置更新按钮
- 重新连接钱包
- 页面刷新

## 🐛 故障排除

### 常见问题

1. **钱包连接失败**
   - 检查MetaMask是否安装
   - 确认网络连接正常
   - 检查钱包权限设置

2. **合约调用失败**
   - 验证合约地址是否正确
   - 检查网络是否匹配
   - 确认钱包有足够Gas费

3. **MEV状态不更新**
   - 检查MEVGuard合约地址
   - 确认合约已部署
   - 检查网络连接

### 调试模式
在浏览器控制台中查看详细日志：

```javascript
// 启用详细日志
localStorage.setItem('debug', 'true');

// 查看MEV保护状态
console.log('MEV Config:', mevConfig);
console.log('MEV Guard:', mevGuard);
```

## 🔄 版本更新

### 更新日志
- **v1.0.0**: 基础MEV保护界面
- **v1.1.0**: 添加配置管理功能
- **v1.2.0**: 实时分析数据展示

### 升级步骤
1. 备份当前配置
2. 下载新版本文件
3. 更新合约地址
4. 测试功能完整性

## 🤝 贡献指南

### 开发环境
- Node.js 16+
- 现代浏览器支持
- Web3钱包扩展

### 代码规范
- 使用ES6+语法
- 遵循Bootstrap设计规范
- 添加适当的错误处理
- 包含用户友好的提示

### 提交PR
1. Fork项目仓库
2. 创建功能分支
3. 提交代码更改
4. 创建Pull Request

## 📄 许可证

本项目采用MIT许可证，详见LICENSE文件。

## 📞 支持

如有问题或建议，请通过以下方式联系：

- GitHub Issues: [项目仓库](https://github.com/Beavnvvv/Leaf-Mev)
- 邮箱: [联系邮箱]
- 文档: [项目文档链接]

---

**注意**: 这是一个演示版本，生产环境使用前请进行充分测试和安全审计。
