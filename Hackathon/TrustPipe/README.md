# TrustPipe

## TrustPipe 项目说明

- 项目简介
  - 通过该机制扩充现有 Oracle 的能力 捕获目前 Oracle 没有捕获的数据并 feed 到链上
  - 解决 ZK 所不能解决的 Where is the data comes from 的问题（ZK 只能证明计算的完整性，但无法证明计算时其输入的来源）
- 项目所选赛道(只能选一个)
  - **Open-Source Tools / Infrastructure**: 开源工具或基础设施类项目赛道，工具、协议、框架等均可，本赛道由 GCC 特别支持！

- 核心功能（4-5 条关键核心要点）
  - 最小 App attest 功能实现（前身在 eth黄山已完成最小 POC，未获奖，属于IOS客户端部分的组件 https://github.com/HaroldGin931/ETH-Huangshan 其代码在 7月份时开始 coding）
  - 利用 Passkey
  - 实现 App attest 证书解析工具
    - 验证证书链
    - 验证叶子证书字段合法
  - 保存证书所认证的 enclave key
  - 全流程的最小 demo （从手机到中间件到链上）
- 代码仓库地址
  - 中间件 证书解析器 https://github.com/TrustPipe/AppleATSCertParser
  - IOS 端 demo TBD
  - 合约 TBD
- 团队成员（Harold、https://github.com/HaroldGin931）
- 历史获奖说明：在后续的其他生态黑客松中有获奖 (300U)，使用了在 eth 黄山的 App attest 的 IOS 部分代码，但获奖原因为前端使用 iphone 读取护照 NFC 芯片 以及使用本地人脸对比功能确认读取护照的人确实是该护照的持有人 但本次黑客松的方向聚焦于后端/中间件 是属于证书解析的部分
- Deck (PPT) 写完代码上传
- 项目演示（录屏 或 可页面的在线访问地址均可）

**项目演示和 Deck 可选填写，但二者必须选其一, 其他必填**

## 截止时间

提交截止时间：**2024 年 8 月 23 日 23:59:59**

提交后仍可更新代码及相关信息

## Demo 演示时间

**2024 年 8 月 24 日 14:00-18:00**

可演示的项目（不符合标准的项目将被剔除，请知悉）及演示顺序会提前半个小时在群里公布

## 更多问题

关于本次 Hackathon 的详细评审规则及更多问题可以访问：[ETH Shenzhen 2025 Hackathon Handbook](https://docs.google.com/document/d/1RZ0ElTzTV8TTvnsx93vUU4WNGWSkmrSgvtJnvUddvyE/edit?tab=t.0)

## 如何提交？

参照 GitHub PR 标准：[How to make your first pull request on GitHub](https://www.freecodecamp.org/news/how-to-make-your-first-pull-request-on-github-3/)
