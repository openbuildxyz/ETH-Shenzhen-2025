// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ILeafswapFactory.sol";
import "./LeafswapPair.sol";
import "./interfaces/Mev/IMEVGuard.sol";

contract LeafswapFactory is ILeafswapFactory {
    address public feeTo;
    address public feeToSetter;
    address public MEVGuard;
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    constructor(address _feeToSetter, address _mevGuard) {
        feeToSetter = _feeToSetter;
        MEVGuard = _mevGuard;
    }

    function allPairsLength() external view override returns (uint) {
        return allPairs.length;
    }

    function createPair(address tokenA, address tokenB) external override returns (address pair) {
        require(tokenA != tokenB, "Leafswap: IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "Leafswap: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "Leafswap: PAIR_EXISTS");

        bytes memory bytecode = type(LeafswapPair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        LeafswapPair(pair).initialize(token0, token1);
        
        // 设置MEV保护
        if (MEVGuard != address(0)) {
            // 通知MEVGuard设置防抢跑区块边界
            IMEVGuard(MEVGuard).setAntiFrontDefendBlockEdge(pair, block.number);
        }
        
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);
        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    function setFeeTo(address _feeTo) external override {
        require(msg.sender == feeToSetter, "Leafswap: FORBIDDEN");
        feeTo = _feeTo;
    }

    function setFeeToSetter(address _feeToSetter) external override {
        require(msg.sender == feeToSetter, "Leafswap: FORBIDDEN");
        feeToSetter = _feeToSetter;
    }
}
