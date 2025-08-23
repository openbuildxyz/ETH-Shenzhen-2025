// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

/**
 * @title IMEVGuard
 * @dev MEV 防护接口（用于防止三明治攻击、抢跑等 MEV 行为）
 */
interface IMEVGuard {
    /// @dev 执行详情结构体，用于记录某笔交易是否已经执行及其编号
    struct ExecutionDetail {
        bool isExecuted;        // 是否已执行
        uint248 requestNum;     // 请求编号（用于跟踪、去重等）
    }

    /**
     * @notice 防御机制主入口
     * @param antiMEV 是否启用防 MEV
     * @param reserve0 交易对的第一个储备金
     * @param reserve1 交易对的第二个储备金
     * @param amount0Out 要输出的 token0 数量
     * @param amount1Out 要输出的 token1 数量
     * @return 是否允许继续执行交易
     */
    function defend(
        bool antiMEV,
        uint256 reserve0,
        uint256 reserve1,
        uint256 amount0Out,
        uint256 amount1Out
    ) external returns (bool);

    /// @notice 获取防抢跑的最小区块间隔
    function antiFrontDefendBlock() external view returns (uint256);

    /// @notice 获取防 MEV 的手续费百分比（用于对 MEV 用户增加交易成本）
    function antiMEVFeePercentage() external view returns (uint256);

    /// @notice 获取防 MEV 的最大输出比率（限制每笔交易的最大滑点/输出上限）
    function antiMEVAmountOutLimitRate() external view returns (uint256);

    /// @notice 获取当前设置的原始接收地址（用来校验 tx.origin 或原始交易意图）
    function originTo() external view returns (address);

    /// @notice 获取当前原始接收地址的 getter（可能为兼容性设计）
    function getOriginTo() external view returns (address);

    /// @notice 设置原始接收地址（例如指定某个可信合约为唯一的调用来源）
    function setOriginTo(address originTo) external;

    /**
     * @notice 设置某个工厂地址是否启用 MEV 防护逻辑
     * @param factory 工厂合约地址（例如 DEX 工厂）
     * @param status 是否启用防护（true 启用，false 关闭）
     */
    function setFactoryStatus(address factory, bool status) external;

    /**
     * @notice 设置某个交易对的抢跑防御区块数（每个 pair 可单独配置）
     * @param pair 交易对地址
     * @param antiFrontDefendBlockEdge 设置该交易对的抢跑保护窗口
     */
    function setAntiFrontDefendBlockEdge(address pair, uint256 antiFrontDefendBlockEdge) external;
    
    /// @notice 获取某个交易对的防抢跑边界区块
    /// @param pair 交易对地址
    /// @return 防抢跑边界区块号
    function antiFrontDefendBlockEdges(address pair) external view returns (uint256);

    /// @notice 设置统一的全局抢跑防御区块数（适用于未设置个性化配置的交易对）
    function setAntiFrontDefendBlock(uint256 antiFrontDefendBlock) external;

    /// @notice 设置防 MEV 的手续费百分比（例如 5% 可设置为 500，表示 5%）
    function setAntiMEVFeePercentage(uint256 antiMEVFeePercentage) external;

    /// @notice 设置每笔交易允许的最大 amountOut 限制比率（防止滑点过大）
    function setAntiMEVAmountOutLimitRate(uint256 antiMEVAmountOutLimitRate) external;

    // User MEV protection management
    /// @notice 检查用户是否启用了MEV保护
    function isUserMEVEnabled(address user) external view returns (bool);
    
    /// @notice 设置用户的MEV保护状态
    function setUserMEVEnabled(address user, bool enabled) external;

    /// @dev 抛出错误：当前区块不允许操作（如过于频繁）
    error BlockLimit();

    /// @dev 抛出错误：调用者无权限执行此操作
    error PermissionDenied();

    /// @dev 抛出错误：交易规模太小，不符合执行条件（用于过滤掉 MEV 探测或 spam）
    error TransactionSizeTooSmall();
}