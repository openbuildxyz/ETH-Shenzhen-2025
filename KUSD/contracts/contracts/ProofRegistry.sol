// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ProofRegistry - Proof Batch Registry for USDK Platform
 * @dev Stores Merkle roots of transaction/yield batches with oracle signatures
 * Features:
 * - Oracle-signed proof publishing
 * - Batch verification with Merkle proofs
 * - Pausable for emergency stops
 * - Support for multiple proof types
 */
contract ProofRegistry is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Batch types
    enum BatchType {
        DEPOSIT,    // 0 - Deposit batches
        YIELD,      // 1 - Yield distribution batches
        TRADE,      // 2 - Trade execution batches
        WITHDRAW    // 3 - Withdrawal batches
    }

    struct Batch {
        bytes32 root;           // Merkle root of the batch
        BatchType batchType;    // Type of the batch
        uint64 startTimestamp;  // Batch period start
        uint64 endTimestamp;    // Batch period end
        string uri;             // IPFS/Arweave URI for detailed data
        address publisher;      // Oracle that published this batch
        uint32 entryCount;      // Number of entries in this batch
        bool verified;          // Whether batch has been verified
    }

    // Storage
    uint256 public nextBatchId;
    mapping(uint256 => Batch) public batches;
    mapping(bytes32 => uint256) public rootToBatchId;
    mapping(BatchType => uint256[]) public batchesByType;
    
    // Events
    event ProofPublished(
        uint256 indexed batchId,
        bytes32 indexed root,
        BatchType indexed batchType,
        uint64 startTimestamp,
        uint64 endTimestamp,
        string uri,
        address publisher,
        uint32 entryCount
    );

    event BatchVerified(uint256 indexed batchId, bytes32 indexed root);
    event BatchRevoked(uint256 indexed batchId, bytes32 indexed root, string reason);

    constructor(address defaultAdmin, address oracle) {
        require(defaultAdmin != address(0), "ProofRegistry: invalid admin address");
        require(oracle != address(0), "ProofRegistry: invalid oracle address");

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(ORACLE_ROLE, oracle);
        _grantRole(PAUSER_ROLE, defaultAdmin);

        nextBatchId = 1; // Start from 1 to avoid confusion with default values
    }

    /**
     * @dev Publish a new proof batch
     * @param root Merkle root of the batch
     * @param batchType Type of the batch (0=DEPOSIT, 1=YIELD, 2=TRADE, 3=WITHDRAW)
     * @param startTimestamp Start timestamp of the batch period
     * @param endTimestamp End timestamp of the batch period
     * @param uri IPFS/Arweave URI containing detailed batch data
     * @param entryCount Number of entries in this batch
     */
    function publishBatch(
        bytes32 root,
        uint8 batchType,
        uint64 startTimestamp,
        uint64 endTimestamp,
        string calldata uri,
        uint32 entryCount
    ) external onlyRole(ORACLE_ROLE) whenNotPaused nonReentrant returns (uint256 batchId) {
        require(root != bytes32(0), "ProofRegistry: invalid root");
        require(batchType <= uint8(BatchType.WITHDRAW), "ProofRegistry: invalid batch type");
        require(startTimestamp < endTimestamp, "ProofRegistry: invalid timestamp range");
        require(endTimestamp <= block.timestamp, "ProofRegistry: end timestamp in future");
        require(entryCount > 0, "ProofRegistry: entry count must be positive");
        require(rootToBatchId[root] == 0, "ProofRegistry: root already exists");

        batchId = nextBatchId++;
        BatchType bType = BatchType(batchType);

        batches[batchId] = Batch({
            root: root,
            batchType: bType,
            startTimestamp: startTimestamp,
            endTimestamp: endTimestamp,
            uri: uri,
            publisher: msg.sender,
            entryCount: entryCount,
            verified: false
        });

        rootToBatchId[root] = batchId;
        batchesByType[bType].push(batchId);

        emit ProofPublished(
            batchId,
            root,
            bType,
            startTimestamp,
            endTimestamp,
            uri,
            msg.sender,
            entryCount
        );
    }

    /**
     * @dev Verify a published batch
     * @param batchId ID of the batch to verify
     */
    function verifyBatch(uint256 batchId) external onlyRole(ORACLE_ROLE) {
        require(batchId > 0 && batchId < nextBatchId, "ProofRegistry: invalid batch ID");
        
        Batch storage batch = batches[batchId];
        require(!batch.verified, "ProofRegistry: batch already verified");

        batch.verified = true;
        emit BatchVerified(batchId, batch.root);
    }

    /**
     * @dev Revoke a batch (in case of errors)
     * @param batchId ID of the batch to revoke
     * @param reason Reason for revocation
     */
    function revokeBatch(
        uint256 batchId,
        string calldata reason
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(batchId > 0 && batchId < nextBatchId, "ProofRegistry: invalid batch ID");
        
        Batch storage batch = batches[batchId];
        require(batch.root != bytes32(0), "ProofRegistry: batch does not exist");

        // Remove from rootToBatchId mapping
        delete rootToBatchId[batch.root];
        
        emit BatchRevoked(batchId, batch.root, reason);
        
        // Clear the batch
        delete batches[batchId];
    }

    /**
     * @dev Verify if a leaf is part of a batch
     * @param batchId ID of the batch
     * @param leaf The leaf to verify
     * @param proof Merkle proof
     */
    function verifyProof(
        uint256 batchId,
        bytes32 leaf,
        bytes32[] calldata proof
    ) external view returns (bool) {
        require(batchId > 0 && batchId < nextBatchId, "ProofRegistry: invalid batch ID");
        
        Batch memory batch = batches[batchId];
        require(batch.root != bytes32(0), "ProofRegistry: batch does not exist");

        return _verifyMerkleProof(proof, batch.root, leaf);
    }

    /**
     * @dev Get batch information
     * @param batchId ID of the batch
     */
    function getBatch(uint256 batchId) external view returns (Batch memory) {
        require(batchId > 0 && batchId < nextBatchId, "ProofRegistry: invalid batch ID");
        return batches[batchId];
    }

    /**
     * @dev Get batch ID by root
     * @param root Merkle root
     */
    function getBatchIdByRoot(bytes32 root) external view returns (uint256) {
        return rootToBatchId[root];
    }

    /**
     * @dev Get batches by type with pagination
     * @param batchType Type of batches to retrieve
     * @param offset Starting offset
     * @param limit Maximum number of batches to return
     */
    function getBatchesByType(
        uint8 batchType,
        uint256 offset,
        uint256 limit
    ) external view returns (uint256[] memory batchIds) {
        require(batchType <= uint8(BatchType.WITHDRAW), "ProofRegistry: invalid batch type");
        require(limit > 0 && limit <= 100, "ProofRegistry: invalid limit");

        BatchType bType = BatchType(batchType);
        uint256[] storage typeBatches = batchesByType[bType];
        
        if (offset >= typeBatches.length) {
            return new uint256[](0);
        }

        uint256 end = offset + limit;
        if (end > typeBatches.length) {
            end = typeBatches.length;
        }

        batchIds = new uint256[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            batchIds[i - offset] = typeBatches[typeBatches.length - 1 - i]; // Return newest first
        }
    }

    /**
     * @dev Get total number of batches by type
     * @param batchType Type of batches
     */
    function getBatchCountByType(uint8 batchType) external view returns (uint256) {
        require(batchType <= uint8(BatchType.WITHDRAW), "ProofRegistry: invalid batch type");
        return batchesByType[BatchType(batchType)].length;
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Internal function to verify Merkle proof
     * @param proof Merkle proof
     * @param root Merkle root
     * @param leaf Leaf to verify
     */
    function _verifyMerkleProof(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf
    ) internal pure returns (bool) {
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        return computedHash == root;
    }

    /**
     * @dev Get the current batch count
     */
    function getBatchCount() external view returns (uint256) {
        return nextBatchId - 1;
    }
}