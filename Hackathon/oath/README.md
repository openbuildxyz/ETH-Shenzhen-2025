<div align="center">
  <img src="https://raw.githubusercontent.com/user-attachments/assets/81728283-99d0-482a-a926-2139b4f0b240" alt="Oath Protocol Logo" width="150"/>
  <h1>誓言协议 (Oath Protocol)</h1>
  <p><strong>构建 Web3 的信任层。在这里，承诺拥有价值。</strong></p>
  
  <p>
    <a href="#"><img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build Status"></a>
    <a href="#"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License"></a>
    <a href="https://discord.gg/YOUR_DISCORD_INVITE"><img src="https://img.shields.io/discord/YOUR_SERVER_ID?color=7289DA&label=Discord&logo=discord&logoColor=white" alt="Discord"></a>
    <a href="https://twitter.com/YOUR_TWITTER_HANDLE"><img src="https://img.shields.io/twitter/follow/YOUR_TWITTER_HANDLE?style=social&logo=twitter" alt="Twitter"></a>
  </p>
</div>

---

## 目录
- [💔 Web3 的信任危机](#-web3-的信任危机)
- [✨ 我们的解决方案：誓言协议](#-我们的解决方案誓言协议)
- [🚀 核心功能](#-核心功能)
- [⚙️ 工作原理：三步建立信任](#️-工作原理三步建立信任)
- [🛠️ 技术架构](#️-技术架构)
- [▶️ 本地运行指南](#️-本地运行指南)
- [🔭 项目愿景](#-项目愿景)
- [🤝 如何贡献](#-如何贡献)
- [📜 开源许可](#-开源许可)

---

## 💔 Web3 的信任危机

在当前的 Web3 世界，我们都曾经历过：对一个项目充满期待，最终却遭遇项目方跑路 (Rug Pull)、核心承诺从未兑现、或在匿名环境中被欺诈。每年，数十亿美元的用户资产因此蒸发。这不仅仅是金钱的损失，更是对整个去中心化理想的侵蚀。

**核心问题：在一个匿名的、无需许可的世界里，我们如何才能相信一个承诺？**

## ✨ 我们的解决方案：誓言协议

**誓言 (Oath)** 是一个去中心化的信用协议，旨在从根本上解决信任问题。我们通过将经济激励与密码学相结合，把无形的口头承诺，转化为有形的、具有经济后果的、可编程的链上资产。

简单来说：**如果 MakerDAO 是为资产服务的去中心化银行，那么 Oath 就是为“信用”和“承诺”服务的去中心化银行。**

## 🚀 核心功能

1.  **可编程誓言保险库 (Programmable Oath Vaults):**
    为每一个承诺创建独立的智能合约保险库。用户可自定义誓言内容、违约条件、抵押资产与数量，以及赔付受益人，使每个承诺都成为可追踪的链上对象。

2.  **混合式仲裁系统 (Hybrid AI + Human Arbitration):**
    独创的 **75% AI + 25% 人类** 混合仲裁团。AI 节点高效分析链上客观数据，人类专家处理需要常识和情景理解的复杂主观证据，确保裁决的效率、可扩展性与公正性。

3.  **自动化的清算与赔付 (Automated Liquidation & Compensation):**
    一旦仲裁系统做出“违约”裁决，保险库合约将自动触发清算程序，将抵押资产分配给受害者和仲裁员。整个过程无需信任，不可篡改，实现了“代码即法律”的强制执行力。

4.  **协议自保机制 (Protocol-as-a-Guarantor):**
    协议本身将发起一个由协议收入持续注入的“协议保险誓言”。该机制用于赔偿在极罕见情况下因错误仲裁而蒙受损失的用户，实现了协议自身的问责闭环。

5.  **动态链上信用档案 (Dynamic On-Chain Credit Profile):**
    每一次承诺的履行或违约都会被记录在案，为每个地址生成一个动态的、可供其他 DApp 集成的链上信用档案，让信誉首次成为一种可组合的 Web3 原生资产。

## ⚙️ 工作原理：三步建立信任

我们的流程直观且强大，旨在将复杂的信任问题简化为清晰的链上操作。

<div align="center">
  <img src="https://raw.githubusercontent.com/user-attachments/assets/f45a643e-a16f-4d37-8828-09d25575514f" alt="Oath Protocol Workflow" width="800"/>
</div>

1.  **发誓 & 抵押 (Pledge & Stake):**
    -   **谁:** 项目方、DAO 或个人。
    -   **做什么:** 公开发布一个可验证的承诺（例如，“未来12个月，团队钱包不会出售任何代币”），并抵押一笔资金（如 1,000,000 USDC）到独立的誓言保险库中。

2.  **违约 & 仲裁 (Breach & Arbitrate):**
    -   **谁:** 任何社区成员。
    -   **做什么:** 当发现潜在的违约行为时，任何人都可以质押少量代币发起仲裁请求，并提交证据。
    -   **如何裁决:** 混合式仲裁系统启动，AI 节点分析链上交易记录，人类仲裁员审查链下证据（如官方公告、社区截图），共同投票做出裁决。

3.  **清算 & 赔付 (Liquidate & Compensate):**
    -   **谁:** 智能合约。
    -   **做什么:** 如果裁定违约，保险库中的 1,000,000 USDC 将被自动清算。
    -   **资金去向:** 按照预设规则，赔付给代币持有者（受害者）、奖励给成功的仲裁发起人和仲裁员，剩余部分进入协议金库。

## 🛠️ 技术架构

本项目在黑客松期间构建的核心技术栈如下：

-   **智能合约:**
    -   **语言:** Solidity
    -   **框架:** Hardhat / Foundry
    -   **标准:** OpenZeppelin Contracts (for security), ERC721 (for Oath NFTs)
-   **前端:**
    -   **框架:** Next.js / Vite
    -   **库:** React.js, TypeScript
    -   **Web3 连接:** Ethers.js, Wagmi, RainbowKit
-   **后端 & 仲裁:**
    -   **服务器:** Node.js (for evidence submission API)
    -   **去中心化存储:** IPFS/Arweave (for storing arbitration evidence)
    -   **AI 节点 (模拟):** 使用 Python 脚本模拟对链上数据的分析和投票。

## ▶️ 本地运行指南

1.  **克隆仓库:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/oath-protocol.git
    cd oath-protocol
    ```

2.  **安装依赖:**
    ```bash
    # 进入合约目录
    cd packages/hardhat
    npm install
    
    # 进入前端目录
    cd ../react-app
    npm install
    ```

3.  **配置环境变量:**
    -   复制 `.env.example` 文件为 `.env`。
    -   填入你的 RPC URL 和私钥等信息。

4.  **编译和部署合约:**
    ```bash
    # 在 packages/hardhat 目录下
    npx hardhat compile
    npx hardhat run scripts/deploy.js --network localhost
    ```

5.  **启动前端应用:**
    ```bash
    # 在 packages/react-app 目录下
    npm run dev
    ```
    应用将在 `http://localhost:3000` 上运行。

## 🔭 项目愿景

我们的目标远不止于防止跑路。我们致力于构建一个无需许可、可组合、且公平的信任层，使其成为未来所有去中心化应用的基础设施。

未来，一个地址在“誓言协议”上的信用记录，将和它的资产余额一样重要。它将被用于：
-   DeFi 中的无抵押或低抵押借贷。
-   DAO 治理中的投票权重调整。
-   去中心化身份（DID）的核心组成部分。
-   一个更安全、更可靠的元宇宙经济系统。

## 🤝 如何贡献

我们是一个开放的社区，欢迎所有对构建 Web3 信任基础感兴趣的开发者、设计师和研究员加入我们！

-   **报告 Bug:** 在 [GitHub Issues](https://github.com/YOUR_USERNAME/oath-protocol/issues) 中提交问题。
-   **贡献代码:** Fork 本仓库，创建你的功能分支，然后提交 Pull Request。
-   **加入讨论:** 在我们的 [Discord](https://discord.gg/YOUR_DISCORD_INVITE) 中分享你的想法！

## 📜 开源许可

本项目采用 [MIT License](LICENSE) 开源。
