// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleSubscriptionConsumer
 * @dev 简化的随机数生成器，用于测试MEVGuard
 * 注意：在生产环境中应该使用Chainlink VRF或其他安全的随机数源
 */
contract SimpleSubscriptionConsumer is Ownable {
    // 请求状态结构体
    struct RequestStatus {
        bool fulfilled;
        bool exists;
        uint256[] randomWords;
    }
    
    // 历史请求ID列表
    uint256[] public requestIds;
    uint256 public lastRequestId;
    
    // 请求状态映射
    mapping(uint256 => RequestStatus) public s_requests;
    
    // 事件
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);
    
    constructor() Ownable() {}
    
    /**
     * @dev 请求随机数（只有合约所有者可调用）
     * @param enableNativePayment 是否使用原生代币支付（此版本中忽略）
     * @return requestId 本次请求的唯一标识
     */
    function requestRandomWords(bool enableNativePayment) external onlyOwner returns (uint256 requestId) {
        requestId = ++lastRequestId;
        
        // 生成伪随机数（仅用于测试）
        uint256[] memory randomWords = new uint256[](2);
        randomWords[0] = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            requestId,
            tx.origin
        )));
        randomWords[1] = uint256(keccak256(abi.encodePacked(
            block.number,
            block.coinbase,
            requestId,
            msg.sender
        )));
        
        // 立即标记为已完成
        s_requests[requestId] = RequestStatus({
            randomWords: randomWords,
            exists: true,
            fulfilled: true
        });
        
        requestIds.push(requestId);
        
        emit RequestSent(requestId, 2);
        emit RequestFulfilled(requestId, randomWords);
        
        return requestId;
    }
    
    /**
     * @dev 获取请求状态
     * @param _requestId 请求ID
     * @return fulfilled 是否已完成
     * @return randomWords 随机数数组
     */
    function getRequestStatus(uint256 _requestId)
        external
        view
        returns (bool fulfilled, uint256[] memory randomWords)
    {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomWords);
    }
    
    /**
     * @dev 获取最新的随机数（用于测试）
     * @return 最新的随机数
     */
    function getLatestRandomNumber() external view returns (uint256) {
        if (lastRequestId == 0) return 0;
        return s_requests[lastRequestId].randomWords[0];
    }
}
