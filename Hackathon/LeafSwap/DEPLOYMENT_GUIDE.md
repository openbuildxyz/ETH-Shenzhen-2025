# 🌐 在线部署指南

## 🚀 免费托管选项

### 选项1: Vercel (推荐)

**优点:**
- 完全免费
- 自动部署
- 自定义域名
- 全球CDN
- 优秀的性能

**部署步骤:**

1. **安装Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **登录Vercel:**
   ```bash
   vercel login
   ```

3. **部署项目:**
   ```bash
   vercel --prod
   ```

4. **自定义域名:**
   - 在Vercel控制台添加自定义域名
   - 配置DNS记录

### 选项2: Netlify

**优点:**
- 完全免费
- 拖拽部署
- 自定义域名
- 表单处理

**部署步骤:**

1. **通过GitHub部署:**
   - 访问 [netlify.com](https://netlify.com)
   - 连接GitHub账户
   - 选择 `Beavnvvv/Leaf-Mev` 仓库
   - 设置构建目录为 `frontend`
   - 点击部署

2. **通过拖拽部署:**
   - 将 `frontend` 文件夹压缩
   - 拖拽到Netlify部署区域

### 选项3: GitHub Pages

**优点:**
- 完全免费
- 与GitHub集成
- 自定义域名

**部署步骤:**

1. **创建GitHub Pages分支:**
   ```bash
   git checkout -b gh-pages
   git push origin gh-pages
   ```

2. **配置GitHub Pages:**
   - 在仓库设置中启用GitHub Pages
   - 选择 `gh-pages` 分支作为源

## 🎯 推荐部署流程

### 使用Vercel (最简单)

```bash
# 1. 确保在项目根目录
cd /Users/qiubeavn/ethshenzhen

# 2. 安装Vercel CLI
npm install -g vercel

# 3. 登录Vercel
vercel login

# 4. 部署到生产环境
vercel --prod

# 5. 按照提示操作
# - 选择项目名称: leafswap-mev
# - 确认部署目录: frontend
# - 等待部署完成
```

### 自定义域名设置

1. **购买域名** (可选):
   - 推荐: Namecheap, GoDaddy, 阿里云
   - 价格: $10-15/年

2. **配置DNS:**
   - 添加CNAME记录指向Vercel/Netlify域名
   - 等待DNS传播 (通常几分钟到几小时)

3. **在托管平台添加域名:**
   - Vercel: 项目设置 → Domains
   - Netlify: 域名管理 → 添加自定义域名

## 🔧 部署前检查

### 1. 检查前端文件
```bash
# 确保前端文件完整
ls -la frontend/
```

### 2. 测试本地运行
```bash
# 启动本地服务器测试
cd frontend && python3 -m http.server 8000
# 访问 http://localhost:8000 确认正常
```

### 3. 检查配置文件
- `frontend/config.js` - 包含Sepolia合约地址
- `frontend/index.html` - 主页面
- `frontend/app-final.js` - 主要逻辑

## 🌍 部署后配置

### 1. 环境变量 (如果需要)
- 在Vercel/Netlify控制台添加环境变量
- 例如: `NODE_ENV=production`

### 2. 安全设置
- 启用HTTPS (自动)
- 配置安全头 (已在配置文件中)

### 3. 性能优化
- 启用压缩
- 配置缓存策略
- 启用CDN

## 📱 移动端优化

### 1. 响应式设计
- 确保在移动设备上正常显示
- 测试不同屏幕尺寸

### 2. PWA支持 (可选)
- 添加Service Worker
- 配置manifest.json
- 启用离线功能

## 🔍 部署后测试

### 1. 功能测试
- [ ] 钱包连接
- [ ] 网络切换
- [ ] MEV保护开关
- [ ] 合约交互

### 2. 性能测试
- [ ] 页面加载速度
- [ ] 移动端性能
- [ ] 网络请求

### 3. 兼容性测试
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] 移动浏览器

## 🆘 常见问题

### 1. 部署失败
- 检查文件路径
- 确认配置文件正确
- 查看部署日志

### 2. 页面空白
- 检查JavaScript错误
- 确认CDN资源加载
- 验证合约地址

### 3. 钱包连接失败
- 确认网络配置
- 检查RPC URL
- 验证合约地址

## 📞 支持

如果遇到问题:
1. 查看部署平台文档
2. 检查浏览器控制台错误
3. 验证网络连接
4. 确认合约状态

---

**选择Vercel是最简单的方式，几分钟就能完成部署！** 🚀
