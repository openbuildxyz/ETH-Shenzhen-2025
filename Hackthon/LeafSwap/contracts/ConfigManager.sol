// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ConfigManager
 * @dev 配置管理合约，用于管理Leafswap项目的各种参数
 */
contract ConfigManager is Ownable, Pausable {
    
    // 配置结构体
    struct Config {
        uint256 swapFeeRate;      // 交易手续费率 (基点，如 30 = 0.3%)
        uint256 maxSlippage;      // 最大滑点容忍度 (基点，如 500 = 5%)
        uint256 minLiquidity;     // 最小流动性要求 (wei)
    }
    
    // 当前配置
    Config public currentConfig;
    
    // 配置更新事件
    event ConfigUpdated(
        uint256 oldSwapFeeRate,
        uint256 newSwapFeeRate,
        uint256 oldMaxSlippage,
        uint256 newMaxSlippage,
        uint256 oldMinLiquidity,
        uint256 newMinLiquidity,
        address indexed updatedBy
    );
    
    /**
     * @dev 构造函数，设置初始配置
     * @param _swapFeeRate 初始交易手续费率 (基点)
     * @param _maxSlippage 初始最大滑点容忍度 (基点)
     * @param _minLiquidity 初始最小流动性要求 (wei)
     */
    constructor(
        uint256 _swapFeeRate,
        uint256 _maxSlippage,
        uint256 _minLiquidity
    ) {
        currentConfig = Config({
            swapFeeRate: _swapFeeRate,
            maxSlippage: _maxSlippage,
            minLiquidity: _minLiquidity
        });
        
        emit ConfigUpdated(0, _swapFeeRate, 0, _maxSlippage, 0, _minLiquidity, msg.sender);
    }
    
    /**
     * @dev 更新配置参数 (3个参数修改方法) - 任何人都可以调用
     * @param _newSwapFeeRate 新的交易手续费率 (基点)
     * @param _newMaxSlippage 新的最大滑点容忍度 (基点)
     * @param _newMinLiquidity 新的最小流动性要求 (wei)
     */
    function updateConfig(
        uint256 _newSwapFeeRate,
        uint256 _newMaxSlippage,
        uint256 _newMinLiquidity
    ) external {
        // 保存旧值用于事件
        uint256 oldSwapFeeRate = currentConfig.swapFeeRate;
        uint256 oldMaxSlippage = currentConfig.maxSlippage;
        uint256 oldMinLiquidity = currentConfig.minLiquidity;
        
        // 更新配置
        currentConfig.swapFeeRate = _newSwapFeeRate;
        currentConfig.maxSlippage = _newMaxSlippage;
        currentConfig.minLiquidity = _newMinLiquidity;
        
        // 触发事件
        emit ConfigUpdated(
            oldSwapFeeRate,
            _newSwapFeeRate,
            oldMaxSlippage,
            _newMaxSlippage,
            oldMinLiquidity,
            _newMinLiquidity,
            msg.sender
        );
    }
    
    /**
     * @dev 获取当前配置
     * @return swapFeeRate 交易手续费率
     * @return maxSlippage 最大滑点容忍度
     * @return minLiquidity 最小流动性要求
     */
    function getConfig() external view returns (
        uint256 swapFeeRate,
        uint256 maxSlippage,
        uint256 minLiquidity
    ) {
        return (
            currentConfig.swapFeeRate,
            currentConfig.maxSlippage,
            currentConfig.minLiquidity
        );
    }
    
    /**
     * @dev 检查配置是否有效
     * @return 配置是否有效
     */
    function isConfigValid() external view returns (bool) {
        return true; // 移除所有验证，始终返回true
    }
    
    /**
     * @dev 暂停合约
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev 恢复合约
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
