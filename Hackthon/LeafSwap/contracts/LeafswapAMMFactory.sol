// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import "./interfaces/Mev/ILeafswapAMMFactory.sol";
import "./LeafswapPair.sol";
import "./Mev/MEVGuard.sol";

/**
 * @title LeafswapAMMFactory
 * @dev 增强版工厂合约，集成MEV保护功能
 */
contract LeafswapAMMFactory is ILeafAMMFactory {
    // 基础配置
    address public override feeTo;
    address public feeToSetter;
    address public override pairImplementation;
    address public override MEVGuard;
    
    // 交易手续费率（万分比，例如500表示5%）
    uint256 public override swapFeeRate;
    
    // 交易对管理
    mapping(address => mapping(address => address)) public override getPair;
    address[] public override allPairs;
    
    // 事件
    event MEVGuardUpdated(address indexed oldGuard, address indexed newGuard);
    event SwapFeeRateUpdated(uint256 oldRate, uint256 newRate);
    event FeeToUpdated(address indexed oldFeeTo, address indexed newFeeTo);
    
    // 错误定义
    error Forbidden();
    error InvalidFeeRate();
    
    /**
     * @dev 构造函数
     * @param _feeToSetter 手续费接收地址设置者
     * @param _swapFeeRate 交易手续费率（万分比）
     * @param _mevGuard MEV保护合约地址
     */
    constructor(
        address _feeToSetter,
        uint256 _swapFeeRate,
        address _mevGuard
    ) {
        if (_feeToSetter == address(0)) revert ILeafAMMFactory.ZeroAddress();
        if (_swapFeeRate > 1000) revert InvalidFeeRate(); // 最大10%
        if (_mevGuard == address(0)) revert ILeafAMMFactory.ZeroAddress();
        
        feeToSetter = _feeToSetter;
        swapFeeRate = _swapFeeRate;
        MEVGuard = _mevGuard;
        pairImplementation = address(0); // 将在部署后设置
    }
    
    /**
     * @dev 获取交易对数量
     */
    function allPairsLength() external view override returns (uint256) {
        return allPairs.length;
    }
    
    /**
     * @dev 创建交易对
     * @param tokenA 代币A地址
     * @param tokenB 代币B地址
     * @return pair 新创建的交易对地址
     */
    function createPair(
        address tokenA,
        address tokenB
    ) external override returns (address pair) {
        if (tokenA == tokenB) revert ILeafAMMFactory.IdenticalAddresses();
        if (tokenA == address(0) || tokenB == address(0)) revert ILeafAMMFactory.ZeroAddress();
        
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        
        if (getPair[token0][token1] != address(0)) revert ILeafAMMFactory.PairExists();
        
        // 使用CREATE2创建交易对，包含构造函数参数
        bytes memory bytecode = type(LeafswapPair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        
        assembly {
            pair := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        
        // 初始化交易对
        LeafswapPair(pair).initialize(token0, token1);
        
        // 设置MEV保护
        if (MEVGuard != address(0)) {
            // 通知MEVGuard设置防抢跑区块边界
            IMEVGuard(MEVGuard).setAntiFrontDefendBlockEdge(pair, block.number);
        }
        
        // 更新状态
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);
        
        emit PairCreated(token0, token1, pair, allPairs.length);
    }
    
    /**
     * @dev 设置手续费接收地址
     * @param _feeTo 新的手续费接收地址
     */
    function setFeeTo(address _feeTo) external override {
        if (msg.sender != feeToSetter) revert Forbidden();
        address oldFeeTo = feeTo;
        feeTo = _feeTo;
        emit FeeToUpdated(oldFeeTo, _feeTo);
    }
    
    /**
     * @dev 设置MEV保护合约
     * @param _mevGuard 新的MEV保护合约地址
     */
    function setMEVGuard(address _mevGuard) external override {
        if (msg.sender != feeToSetter) revert Forbidden();
        if (_mevGuard == address(0)) revert ILeafAMMFactory.ZeroAddress();
        
        address oldGuard = MEVGuard;
        MEVGuard = _mevGuard;
        
        // 通知新的MEVGuard设置所有现有交易对的权限
        for (uint256 i = 0; i < allPairs.length; i++) {
            IMEVGuard(_mevGuard).setFactoryStatus(allPairs[i], true);
        }
        
        emit MEVGuardUpdated(oldGuard, _mevGuard);
    }
    
    /**
     * @dev 设置交易手续费率
     * @param _swapFeeRate 新的手续费率（万分比）
     */
    function setSwapFeeRate(uint256 _swapFeeRate) external {
        if (msg.sender != feeToSetter) revert Forbidden();
        if (_swapFeeRate > 1000) revert InvalidFeeRate(); // 最大10%
        
        uint256 oldRate = swapFeeRate;
        swapFeeRate = _swapFeeRate;
        emit SwapFeeRateUpdated(oldRate, _swapFeeRate);
    }
    
    /**
     * @dev 设置手续费设置者
     * @param _feeToSetter 新的手续费设置者地址
     */
    function setFeeToSetter(address _feeToSetter) external {
        if (msg.sender != feeToSetter) revert Forbidden();
        if (_feeToSetter == address(0)) revert ILeafAMMFactory.ZeroAddress();
        feeToSetter = _feeToSetter;
    }
    
    /**
     * @dev 设置交易对实现合约地址
     * @param _pairImplementation 新的交易对实现合约地址
     */
    function setPairImplementation(address _pairImplementation) external {
        if (msg.sender != feeToSetter) revert Forbidden();
        if (_pairImplementation == address(0)) revert ILeafAMMFactory.ZeroAddress();
        pairImplementation = _pairImplementation;
    }
    
    /**
     * @dev 获取所有交易对
     * @param start 起始索引
     * @param end 结束索引
     * @return pairs 交易对地址数组
     */
    function getPairs(uint256 start, uint256 end) external view returns (address[] memory pairs) {
        if (end >= allPairs.length) end = allPairs.length - 1;
        if (start > end) return new address[](0);
        
        pairs = new address[](end - start + 1);
        for (uint256 i = start; i <= end; i++) {
            pairs[i - start] = allPairs[i];
        }
    }
}
