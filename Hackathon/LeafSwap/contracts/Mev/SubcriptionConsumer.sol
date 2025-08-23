// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

// —— 导入 Chainlink VRF 消费者基类 ——
// VRFConsumerBaseV2Plus 封装了与 Chainlink VRF Coordinator v2.5 的交互：
// · 向 Coordinator 发起随机数请求
// · 验证并接收回调
// · 管理订阅、支付和权限（onlyOwner）等
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";

// —— 导入 Chainlink VRF 请求参数辅助库 ——
// VRFV2PlusClient 提供请求参数结构体和序列化方法：
// · RandomWordsRequest：封装 keyHash、subId、gas 等请求参数
// · ExtraArgsV1：封装额外选项（如 nativePayment）
// · _argsToBytes：将 ExtraArgsV1 按 ABI 编码并打上版本标识
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract SubcriptionConsumer is VRFConsumerBaseV2Plus {
    // 请求发起事件：记录 requestId 与请求的随机数个数
    event RequestSent(uint256 requestId, uint32 numWords);
    // 请求完成事件：记录 requestId 与返回的随机数列表
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    // 存储单次请求状态的结构体：是否已完成、是否存在、返回的随机数
    struct RequestStatus {
        bool fulfilled;
        bool exists;
        uint256[] randomWords;
    }

    // Chainlink 订阅 ID，需在部署时传入并事先充值
    uint256 public s_subscriptionId;

    // —— keyHash（Gas Lane） ——
    // 用于指定 VRFCoordinator 上允许的最高 gas price
    // 不同网络或配置对应不同 keyHash，请参考官方文档
    bytes32 public keyHash = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;

    // 历史请求 ID 列表与最新一次请求 ID
    uint256[] public requestIds;
    uint256 public lastRequestId;

    // 回调时可用的最大 gas（根据 fulfillRandomWords 逻辑复杂度调整）
    uint32 public callbackGasLimit = 1000000;
    // 在 VRFCoordinator 确认随机性前等待的区块数，越高安全性越强但确认时间更长
    uint16 public requestConfirmations = 3;
    // 本次请求要返回的随机数个数，不能超过 Coordinator 配置的最大值（通常 500）
    uint32 public numWords = 2;

    // 映射：requestId => 对应的请求状态
    mapping(uint256 => RequestStatus) public s_requests;

    /**
     * 构造函数：硬编码 VRFCoordinator 地址（此处为 Sepolia 测试网地址）
     * 并初始化 s_subscriptionId
     * @param subscriptionId 已创建并充值的 Chainlink 订阅 ID
     */
    constructor(uint256 subscriptionId)
        VRFConsumerBaseV2Plus(
            0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B // Sepolia Coordinator
        )
    {
        s_subscriptionId = subscriptionId;
    }

    /**
     * 发起随机数请求（只有合约所有者可调用，仅生成一个 requestId）
     * @param enableNativePayment true = 使用原生链上币支付，false = 使用 LINK 支付
     * @return requestId 本次请求的唯一标识
     */
    function requestRandomWords(bool enableNativePayment) external onlyOwner returns (uint256 requestId) {
        // 调用 Coordinator 的 requestRandomWords，并打包所有参数
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash, // gas lane
                subId: s_subscriptionId, // 订阅 ID
                requestConfirmations: requestConfirmations, // 确认区块数
                callbackGasLimit: callbackGasLimit, // 回调可用 gas
                numWords: numWords, // 请求随机数个数
                extraArgs: VRFV2PlusClient._argsToBytes( // 序列化额外参数
                        VRFV2PlusClient.ExtraArgsV1({
                            nativePayment: enableNativePayment // 支付选项
                        })
                    )
            })
        );

        // 在内部状态中登记此请求（初始未完成，无随机数）
        s_requests[requestId] = RequestStatus({randomWords: new uint256[](0), exists: true, fulfilled: false});

        // 更新历史记录并触发事件
        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);
        return requestId;
    }

    /**
     * VRFCoordinator 回调钩子（只有 Chainlink 节点（VRFCoordinator）通过基类里的 rawFulfillRandomWords 才能真正触发它）
     * @param _requestId  原始请求 ID
     * @param _randomWords Coordinator 传回的随机数数组
     */
    function fulfillRandomWords(uint256 _requestId, uint256[] calldata _randomWords) internal override {
        // 仅处理已知的 requestId，防止非法调用
        require(s_requests[_requestId].exists, "request not found");
        // 标记已完成，并存储随机数
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        // 触发完成事件
        emit RequestFulfilled(_requestId, _randomWords);
    }

    /**
     * 外部查询接口：获取指定 requestId 的完成状态和随机数
     * @param _requestId 要查询的 requestId
     * @return fulfilled   是否已回调完成
     * @return randomWords 完成后返回的随机数列表
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
}