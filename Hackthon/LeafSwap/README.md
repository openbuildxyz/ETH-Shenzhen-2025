项目概述：

**xFi**赛道

Leafswap通过在流动性池的不同生命周期进行保护，创新性地缓解初始流动性抢跑攻击和三明治攻击的影响，其内置的MEV Guard是完全在链上运行的独立原生模块可接入到现有的DEX平台

核心功能：它通过在流动性池的不同生命周期进行保护，有效缓解初始流动性抢跑攻击和三明治攻击的影响。
**针对初始流动性抢跑攻击**

* **保护期设置：**根据不同链的不同的区块时间，设置持续不同区块数量的初始流动性保护期，

**通常持续数百个区块**。

* **随机性检查**：引入随机性检查，根据上个区块尝试执行的交易数量动态调节概率，未通过检查的交易会被中断而非 Revert，确保所有交易具有均等执行机会。

* **交易数量限制**：每个区块当前流动性池只能有一笔可执行交易，后续交易将会被中断，以减少女巫攻击的影响。

* **交易规模控制**：每笔交易代币最大数量不得超过总流动性池储备总量的 1%，防止代币供应被垄断。

* **保护期解除**：初始流动性保护期结束后，上述所有限制自动解除。


**针对三明治攻击**

* **Anti-MEV 开关**：开启后，它会强制当前交易成为当前区块中此交易对的最终可执行交易，并 Revert 当前区块该交易对的后续所有交易，攻击者无法完成后置交易，直接破坏三明治攻击的形成条件，同时也使闪电贷无法用于此类攻击，从而提高攻击者的资金成本。。

* **交易规模检查**：为避免滥用，协议对 Anti-MEV 交易的规模进行检查，只有代币输出数量超过一定阈值（例如，总流动资金池储备的 0.5%，可调整）的交易才可通过，防止协议被 DDOS 攻击导致不可用。

* **MEV 手续费**：对每笔 Anti-MEV 交易收取额外 MEV 手续费，以减少非必要的使用，同时增加 LPs 的做市收益。


代码仓库地址：https://github.com/Beavnvvv/Leaf-Mev

团队成员 List：

Beavn：[Beavnvvv · GitHub](https://github.com/Beavnvvv)

Dawn：[Dawn · GitHub](https://github.com/DawnBlackA)

Young：[Young-coding-co · GitHub](https://github.com/Young-coding-co)

历史获奖说明：无

Deck (PPT) 地址：https://www.kdocs.cn/l/cuUAcU6ynqN3

Demo：https://youtu.be/g02t9zM6078?si=DFrJZniF67zhOOqJ  https://youtu.be/EII3N7i0dPc?si=SgXlIhXNIdV0MYoR