// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

// 从 OpenZeppelin 引入可拥有者（Ownable）合约，用于管理合约的所有者权限
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// 引入 IMEVGuard 接口，定义了 defend、setOriginTo、setFactoryStatus 等函数签名
import {IMEVGuard} from "../interfaces/Mev/IMEVGuard.sol";

import {SimpleSubscriptionConsumer} from "./SimpleSubscriptionConsumer.sol";
/**
 * @dev MEV Guard - 防止前端抢跑和 MEV
 */

contract MEVGuard is IMEVGuard, Ownable {
    // RATIO 常量，用于后续计算时设置为 10000，方便以“万分比”方式处理费率等数值
    uint256 public constant RATIO = 10000;

    // antiFrontDefendBlock：在工厂调用 setAntiFrontDefendBlockEdge 时，会用这个值延后开始防前端抢跑的起始区块
    uint256 public antiFrontDefendBlock;

    // antiMEVFeePercentage：反 MEV 模式下收取的手续费百分比（万分比）
    uint256 public antiMEVFeePercentage;

    // antiMEVAmountOutLimitRate：反 MEV 模式下，交易输出量相对于储备量的最低限制比例（万分比）
    uint256 public antiMEVAmountOutLimitRate;

    // originTo：暂存发起地址 to，比如交易对合约调用时可能将 tx.origin 或者 msg.sender 记录到此
    address public originTo;

    // 实例化 SimpleSubscriptionConsumer 合约，用于获取随机数
    SimpleSubscriptionConsumer public subscriptionConsumer;

    // factories：记录哪些工厂（Factory）地址是被允许设置 pair 的
    mapping(address factory => bool) public factories;

    // antiFrontDefendBlockEdges：记录每个交易对（pair）在第多少个区块之后开始允许交易（防止前端抢跑）
    // key：pair 合约地址，value：起始允许交易的区块号
    mapping(address pair => uint256) public antiFrontDefendBlockEdges;

    // executionDetails：记录某个区块的执行详情，包括该区块的请求次数和是否已经执行一次成功
    mapping(uint256 blockNum => ExecutionDetail) private executionDetails;

    // uniqueRequests：记录在某个区块内，某个交易对、某个发起人（origin）是否已经提交过请求
    // 用于保证同一 origin、同一 pair 在同一区块内只能请求一次
    mapping(uint256 blockNum => mapping(address pair => mapping(address origin => bool))) private uniqueRequests;

    // userMEVEnabled：记录每个用户是否启用了MEV保护
    mapping(address user => bool) public userMEVEnabled;

    // 构造函数，初始化合约所有者、antiFrontDefendBlock、antiMEVFeePercentage、antiMEVAmountOutLimitRate
    constructor(
        address _owner,
        uint256 _antiFrontDefendBlock,
        uint256 _antiMEVFeePercentage,
        uint256 _antiMEVAmountOutLimitRate,
        address _subscriptionConsumer
    ) {
        antiFrontDefendBlock = _antiFrontDefendBlock;
        antiMEVFeePercentage = _antiMEVFeePercentage;
        antiMEVAmountOutLimitRate = _antiMEVAmountOutLimitRate;
        subscriptionConsumer = SimpleSubscriptionConsumer(_subscriptionConsumer);
    }

    /**
     * @dev defend 函数为核心防护逻辑，用于在 swap 时被交易对合约调用，
     * 返回是否允许当前交易继续执行。反前端抢跑和反 MEV（矿工可提取价值）的逻辑都在这里。
     *
     * @param antiMEV       布尔值，表示当前是否启用了“反 MEV”模式（通常交易对在最后一个阶段会传 true）
     * @param reserve0      交易对 token0 的储备量
     * @param reserve1      交易对 token1 的储备量
     * @param amount0Out    本次 swap 要输出的 token0 数量
     * @param amount1Out    本次 swap 要输出的 token1 数量
     * @return bool         如果返回 true，则允许 swap 继续，否则拒绝（revert 或直接返回 false）
     */
    function defend(bool antiMEV, uint256 reserve0, uint256 reserve1, uint256 amount0Out, uint256 amount1Out)
        external
        override
        returns (bool)
    {
        // 1. 检查当前调用者 msg.sender（即调用 defend 的交易对合约）是否在 antiFrontDefendBlockEdges 中有配置
        uint256 antiFrontDefendBlockEdge = antiFrontDefendBlockEdges[msg.sender];
        // 如果没有配置（值为 0），则没有权限调用，再返回 PermissionDenied()（通常是 revert）
        require(antiFrontDefendBlockEdge != 0, PermissionDenied());

        // 获取当前区块号
        uint256 currentBlockNum = block.number;

        // 将当前区块的请求计数 +1，并保存在 executionDetails[currentBlockNum].requestNum
        ++executionDetails[currentBlockNum].requestNum;

        // =================== 防前端抢跑逻辑（Anti-Front Running） ===================
        // 如果当前区块号小于该 pair 对应的 antiFrontDefendBlockEdge，说明还在“防前端抢跑”阶段
        if (currentBlockNum < antiFrontDefendBlockEdge) {
            // 2. 检查同一个区块、同一个 pair、同一个 tx.origin 是否已经发起过请求
            if (uniqueRequests[currentBlockNum][msg.sender][tx.origin]) return false;
            // 标记：本区块、当前 pair、当前 tx.origin 已经请求过一次
            uniqueRequests[currentBlockNum][msg.sender][tx.origin] = true;

            // 3. 如果本区块已有任意一次交易已经执行成功，则后续所有交易都拒绝（仅允许“幸运儿”）
            if (executionDetails[currentBlockNum].isExecuted) return false;

            // 4. 限制单笔交易输出量：在防抢跑阶段，最多只能买入 1% 的流动性
            //    要求 amount0Out * 200 <= reserve0（即 amount0Out <= reserve0 / 200），同理对于 amount1Out
            //    200 = 1 / 0.005，1/200 = 0.5% ？ 这里应该是 1% = 1/100，因此乘 200 意味保守一些。
            if (amount0Out * 200 > reserve0 || amount1Out * 200 > reserve1) return false;

            // 5. 构造伪随机数 randomNum，用来决定哪一笔交易能够执行通过
            //    拼接的内容包括 tx.origin, block.coinbase, block.basefee, block.prevrandao, blockhash(prev),
            //    gasleft, 上一区块的请求数 latestExecutionRequestNum, 当前执行请求编号 _currentExecutionRequestNum
            uint256 latestExecutionRequestNum = executionDetails[currentBlockNum - 1].requestNum;
            uint256 randomNum = getRandomNumber();

            // 成功概率 = 1 / denominator；denominator = latestExecutionRequestNum == 0 ? 1 : latestExecutionRequestNum
            uint256 denominator = latestExecutionRequestNum == 0 ? 1 : latestExecutionRequestNum;
            // 只有当 randomNum % denominator == 0 时，将 isExecuted 标记为 true，表示本区块“幸运交易”已出
            if (randomNum % denominator == 0) {
                // 修复：使用赋值操作符 = 而不是比较操作符 ==
                executionDetails[currentBlockNum].isExecuted = true;
            } else {
                // 如果随机数不满足条件，则当前交易直接被拒绝
                return false;
            }
        }
        // =================== 防 MEV 逻辑（Anti-MEV） ===================
        else if (antiMEV) {
            // 如果当前区块已经有一次交易被标记为执行成功，则本笔交易拒绝
            require(!executionDetails[currentBlockNum].isExecuted, BlockLimit());

            // 获取配置的限购比例（万分比），例如 500 表示 5%
            uint256 _antiMEVAmountOutLimitRate = antiMEVAmountOutLimitRate;
            // 要求本次 output 相对于对应储备必须达到最低比例，否则视为交易量太小，拒绝
            // 例如近似意思：amount0Out * 10000 >= reserve0 * 500 （即 amount0Out >= reserve0 * 0.05）
            require(
                amount0Out * RATIO >= reserve0 * _antiMEVAmountOutLimitRate
                    || amount1Out * RATIO >= reserve1 * _antiMEVAmountOutLimitRate,
                TransactionSizeTooSmall()
            );

            // 一旦满足限额条件，则将本区块执行标记为已执行，防止同一区块内同一 pair 再有交易
            executionDetails[currentBlockNum].isExecuted = true;
        }

        // 如果所有检查都通过，则放行，返回 true
        // 注意：这里可以添加MEV手续费收取逻辑
        return true;
    }

    // 获取随机数的函数，使用 SubscriptionConsumer 合约来请求随机数
    function getRandomNumber() internal returns (uint256 randomNumber) {
        // 获取 requestId
        uint256 requestId = subscriptionConsumer.requestRandomWords(false);

        // 获取随机数
        (bool fulfilled, uint256[] memory randomNumbers) = subscriptionConsumer.getRequestStatus(requestId);

        if (!fulfilled || randomNumbers.length == 0) {
            revert("Random number not fulfilled or empty");
        }
        randomNumber = randomNumbers[0];
    }

    // 以下几个函数都是对合约参数或状态进行设置的函数

    /**
     * @dev 设置 originTo，为 transient 记录某地址（可用于中继或跳转）
     */
    function setOriginTo(address _originTo) external override {
        originTo = _originTo;
    }

    function getOriginTo() external view returns (address) {
        return originTo;
    }

    /**
     * @dev 仅合约拥有者可以调用，用于设置哪个 factory 地址是受信任的，是否允许使用 setAntiFrontDefendBlockEdge
     * @param factory 要设置的 factory 合约地址
     * @param status  是否允许
     */
    function setFactoryStatus(address factory, bool status) external override onlyOwner {
        factories[factory] = status;
    }

    /**
     * @dev 供 factory 合约调用，为某个 pair 设置 “antiFrontDefendBlockEdge”。
     * @param pair             要设置的交易对地址
     * @param startBlockNum    factory 调用时的区块号（工厂给出的“起始区块”）
     */
    function setAntiFrontDefendBlockEdge(address pair, uint256 startBlockNum) external override {
        // 只有标记为受信任的 factory 才能调用此函数
        require(factories[msg.sender], PermissionDenied());
        // 计算该 pair 实际的防抢跑边界区块 = startBlockNum + antiFrontDefendBlock
        antiFrontDefendBlockEdges[pair] = startBlockNum + antiFrontDefendBlock;
    }

    /**
     * @dev 仅合约拥有者可以调用，用于修改 antiFrontDefendBlock 参数
     * @param _antiFrontDefendBlock 要设置的新值（区块数）
     */
    function setAntiFrontDefendBlock(uint256 _antiFrontDefendBlock) external override onlyOwner {
        antiFrontDefendBlock = _antiFrontDefendBlock;
    }

    /**
     * @dev 仅合约拥有者可以调用，用于修改 antiMEVFeePercentage（万分比）
     * @param _antiMEVFeePercentage 新的手续费百分比（万分比）
     */
    function setAntiMEVFeePercentage(uint256 _antiMEVFeePercentage) external override onlyOwner {
        antiMEVFeePercentage = _antiMEVFeePercentage;
    }

    /**
     * @dev 仅合约拥有者可以调用，用于修改 antiMEVAmountOutLimitRate（万分比）
     * @param _antiMEVAmountOutLimitRate 新的限额比例（万分比）
     */
    function setAntiMEVAmountOutLimitRate(uint256 _antiMEVAmountOutLimitRate) external override onlyOwner {
        antiMEVAmountOutLimitRate = _antiMEVAmountOutLimitRate;
    }

    /**
     * @dev 检查用户是否启用了MEV保护
     * @param user 要检查的用户地址
     * @return 是否启用了MEV保护
     */
    function isUserMEVEnabled(address user) external view override returns (bool) {
        return userMEVEnabled[user];
    }

    /**
     * @dev 设置用户的MEV保护状态
     * @param user 要设置的用户地址
     * @param enabled 是否启用MEV保护
     */
    function setUserMEVEnabled(address user, bool enabled) external override {
        userMEVEnabled[user] = enabled;
    }
}