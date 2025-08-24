- 项目概述
Zama Swap 是一个基于 FHEVM 的保密 AMM 示例项目，包含智能合约与前端两个部分：
- `contracts/`：使用 Hardhat 编译/部署的 Solidity 合约，结合 `@fhevm/solidity` 与 OpenZeppelin 保密合约接口，实现保密代币铸造/销毁、授权与保密交易撮合（AMM）。
- `front/`：基于 React + Vite 的前端，接入 `@zama-fhe/relayer-sdk` 完成浏览器端 FHE 实例初始化、加密/解密工作流，并通过 `ethers` 与合约交互。

前端主要页面包含 Swap、Liquidity、Mint，分别演示：
- Swap：授权→链上计算分子分母→链下解密计算报价→链上提交期望输出与滑点保护→完成保密交换。
- Liquidity：对 TokenA/TokenB 金额进行加密后，添加/移除流动性。
- Mint：合约所有者对保密代币进行铸造。

ZamaSwap 是一个基于 FHEVM 的保密 AMM 示例，支持在不暴露用户明文余额与交易数量的前提下完成代币交换与流动性管理。
项目由 Solidity 智能合约与 React/Vite 前端组成：前端通过 Zama FHE relayer 完成加解密并用 ethers 交互，合约结合 @fhevm/solidity 实现保密代币、撮合与精细化权限控制。

- 项目所选赛道
  - **xFi**: 金融类应用/协议赛道，交易协议, DeFi, RWA, ReFi 等等任何可以促进金融创新，实现金融普惠的项目都可以报名此赛道。

- 核心功能
- 保密 AMM 交换：在不泄露明文余额与交易数量的前提下完成定价与交换。
- 链上/链下混合计算：链上计算分子分母，链下解密完成除法与滑点，再加密回传，兼顾隐私与可用性。
- 保密流动性管理：支持加密 LP 供应与余额，添加/移除流动性全程保密。
- 细粒度权限与访问控制：`setOperator`、`authorizeSelf` 与 `FHE.allow/allowTransient` 组合，确保最小权限访问。
- 一体化前端体验：内置 FHE 实例初始化、加密/解密工具与交互 UI，面向普通用户可直接使用。

- 代码仓库地址: https://github.com/big-dudu-mosty/ZamaSwap/tree/main/Hackathon/Zama_Swap

- 团队成员 List（名字、Github 地址）
嘟嘟 https://github.com/big-dudu-mosty
yoona https://github.com/yoona333

- 历史获奖说明：无

- Deck (PPT) 地址：https://www.canva.com/design/DAGwarjJT3Q/FSBj7bizCAEd0jFYXOatTQ/edit?
- 项目演示（录屏 或 可页面的在线访问地址均可）：https://drive.google.com/file/d/1BxEff1HMyqsfpWStnQCgi0f7PEYIqeEJ/view?usp=sharing