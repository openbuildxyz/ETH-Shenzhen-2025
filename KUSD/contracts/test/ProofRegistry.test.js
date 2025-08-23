const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProofRegistry", function () {
  let proofRegistry;
  let owner, oracle, user1, user2;
  
  const BatchType = {
    DEPOSIT: 0,
    YIELD: 1,
    TRADE: 2,
    WITHDRAW: 3
  };

  beforeEach(async function () {
    [owner, oracle, user1, user2] = await ethers.getSigners();

    const ProofRegistry = await ethers.getContractFactory("ProofRegistry");
    proofRegistry = await ProofRegistry.deploy(owner.address, oracle.address);
    await proofRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set correct roles", async function () {
      const DEFAULT_ADMIN_ROLE = await proofRegistry.DEFAULT_ADMIN_ROLE();
      const ORACLE_ROLE = await proofRegistry.ORACLE_ROLE();
      const PAUSER_ROLE = await proofRegistry.PAUSER_ROLE();

      expect(await proofRegistry.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await proofRegistry.hasRole(ORACLE_ROLE, oracle.address)).to.be.true;
      expect(await proofRegistry.hasRole(PAUSER_ROLE, owner.address)).to.be.true;
    });

    it("Should start with nextBatchId = 1", async function () {
      expect(await proofRegistry.nextBatchId()).to.equal(1);
      expect(await proofRegistry.getBatchCount()).to.equal(0);
    });

    it("Should not allow zero address as admin or oracle", async function () {
      const ProofRegistry = await ethers.getContractFactory("ProofRegistry");
      
      await expect(
        ProofRegistry.deploy(ethers.ZeroAddress, oracle.address)
      ).to.be.revertedWith("ProofRegistry: invalid admin address");
      
      await expect(
        ProofRegistry.deploy(owner.address, ethers.ZeroAddress)
      ).to.be.revertedWith("ProofRegistry: invalid oracle address");
    });
  });

  describe("Publishing Batches", function () {
    const merkleRoot = "0x1234567890123456789012345678901234567890123456789012345678901234";
    const startTimestamp = Math.floor(Date.now() / 1000) - 86400; // 1 day ago
    const endTimestamp = Math.floor(Date.now() / 1000) - 3600;    // 1 hour ago
    const uri = "ipfs://QmTest123";
    const entryCount = 100;

    it("Should allow oracle to publish batch", async function () {
      const tx = await proofRegistry.connect(oracle).publishBatch(
        merkleRoot,
        BatchType.DEPOSIT,
        startTimestamp,
        endTimestamp,
        uri,
        entryCount
      );

      await expect(tx)
        .to.emit(proofRegistry, "ProofPublished")
        .withArgs(1, merkleRoot, BatchType.DEPOSIT, startTimestamp, endTimestamp, uri, oracle.address, entryCount);

      expect(await proofRegistry.getBatchCount()).to.equal(1);
    });

    it("Should not allow non-oracle to publish batch", async function () {
      await expect(
        proofRegistry.connect(user1).publishBatch(
          merkleRoot,
          BatchType.DEPOSIT,
          startTimestamp,
          endTimestamp,
          uri,
          entryCount
        )
      ).to.be.revertedWithCustomError(proofRegistry, "AccessControlUnauthorizedAccount");
    });

    it("Should not allow invalid parameters", async function () {
      // Invalid root
      await expect(
        proofRegistry.connect(oracle).publishBatch(
          ethers.ZeroHash,
          BatchType.DEPOSIT,
          startTimestamp,
          endTimestamp,
          uri,
          entryCount
        )
      ).to.be.revertedWith("ProofRegistry: invalid root");

      // Invalid batch type
      await expect(
        proofRegistry.connect(oracle).publishBatch(
          merkleRoot,
          5, // Invalid batch type
          startTimestamp,
          endTimestamp,
          uri,
          entryCount
        )
      ).to.be.revertedWith("ProofRegistry: invalid batch type");

      // Invalid timestamp range
      await expect(
        proofRegistry.connect(oracle).publishBatch(
          merkleRoot,
          BatchType.DEPOSIT,
          endTimestamp,
          startTimestamp, // end before start
          uri,
          entryCount
        )
      ).to.be.revertedWith("ProofRegistry: invalid timestamp range");

      // Future end timestamp
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600;
      await expect(
        proofRegistry.connect(oracle).publishBatch(
          merkleRoot,
          BatchType.DEPOSIT,
          startTimestamp,
          futureTimestamp,
          uri,
          entryCount
        )
      ).to.be.revertedWith("ProofRegistry: end timestamp in future");

      // Zero entry count
      await expect(
        proofRegistry.connect(oracle).publishBatch(
          merkleRoot,
          BatchType.DEPOSIT,
          startTimestamp,
          endTimestamp,
          uri,
          0
        )
      ).to.be.revertedWith("ProofRegistry: entry count must be positive");
    });

    it("Should not allow duplicate roots", async function () {
      await proofRegistry.connect(oracle).publishBatch(
        merkleRoot,
        BatchType.DEPOSIT,
        startTimestamp,
        endTimestamp,
        uri,
        entryCount
      );

      await expect(
        proofRegistry.connect(oracle).publishBatch(
          merkleRoot,
          BatchType.YIELD,
          startTimestamp,
          endTimestamp,
          uri,
          entryCount
        )
      ).to.be.revertedWith("ProofRegistry: root already exists");
    });

    it("Should store batch data correctly", async function () {
      await proofRegistry.connect(oracle).publishBatch(
        merkleRoot,
        BatchType.YIELD,
        startTimestamp,
        endTimestamp,
        uri,
        entryCount
      );

      const batch = await proofRegistry.getBatch(1);
      expect(batch.root).to.equal(merkleRoot);
      expect(batch.batchType).to.equal(BatchType.YIELD);
      expect(batch.startTimestamp).to.equal(startTimestamp);
      expect(batch.endTimestamp).to.equal(endTimestamp);
      expect(batch.uri).to.equal(uri);
      expect(batch.publisher).to.equal(oracle.address);
      expect(batch.entryCount).to.equal(entryCount);
      expect(batch.verified).to.be.false;

      expect(await proofRegistry.getBatchIdByRoot(merkleRoot)).to.equal(1);
    });
  });

  describe("Batch Verification", function () {
    const merkleRoot = "0x1234567890123456789012345678901234567890123456789012345678901234";
    const startTimestamp = Math.floor(Date.now() / 1000) - 86400;
    const endTimestamp = Math.floor(Date.now() / 1000) - 3600;
    const uri = "ipfs://QmTest123";
    const entryCount = 100;

    beforeEach(async function () {
      await proofRegistry.connect(oracle).publishBatch(
        merkleRoot,
        BatchType.DEPOSIT,
        startTimestamp,
        endTimestamp,
        uri,
        entryCount
      );
    });

    it("Should allow oracle to verify batch", async function () {
      const tx = await proofRegistry.connect(oracle).verifyBatch(1);
      
      await expect(tx)
        .to.emit(proofRegistry, "BatchVerified")
        .withArgs(1, merkleRoot);

      const batch = await proofRegistry.getBatch(1);
      expect(batch.verified).to.be.true;
    });

    it("Should not allow non-oracle to verify batch", async function () {
      await expect(
        proofRegistry.connect(user1).verifyBatch(1)
      ).to.be.revertedWithCustomError(proofRegistry, "AccessControlUnauthorizedAccount");
    });

    it("Should not allow verifying invalid batch ID", async function () {
      await expect(
        proofRegistry.connect(oracle).verifyBatch(0)
      ).to.be.revertedWith("ProofRegistry: invalid batch ID");

      await expect(
        proofRegistry.connect(oracle).verifyBatch(999)
      ).to.be.revertedWith("ProofRegistry: invalid batch ID");
    });

    it("Should not allow double verification", async function () {
      await proofRegistry.connect(oracle).verifyBatch(1);
      
      await expect(
        proofRegistry.connect(oracle).verifyBatch(1)
      ).to.be.revertedWith("ProofRegistry: batch already verified");
    });
  });

  describe("Batch Revocation", function () {
    const merkleRoot = "0x1234567890123456789012345678901234567890123456789012345678901234";
    const startTimestamp = Math.floor(Date.now() / 1000) - 86400;
    const endTimestamp = Math.floor(Date.now() / 1000) - 3600;
    const uri = "ipfs://QmTest123";
    const entryCount = 100;

    beforeEach(async function () {
      await proofRegistry.connect(oracle).publishBatch(
        merkleRoot,
        BatchType.DEPOSIT,
        startTimestamp,
        endTimestamp,
        uri,
        entryCount
      );
    });

    it("Should allow admin to revoke batch", async function () {
      const reason = "Invalid data detected";
      
      const tx = await proofRegistry.connect(owner).revokeBatch(1, reason);
      
      await expect(tx)
        .to.emit(proofRegistry, "BatchRevoked")
        .withArgs(1, merkleRoot, reason);

      // Batch should be deleted
      await expect(proofRegistry.getBatch(1)).to.be.reverted;
      expect(await proofRegistry.getBatchIdByRoot(merkleRoot)).to.equal(0);
    });

    it("Should not allow non-admin to revoke batch", async function () {
      await expect(
        proofRegistry.connect(user1).revokeBatch(1, "reason")
      ).to.be.revertedWithCustomError(proofRegistry, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Merkle Proof Verification", function () {
    // Simple test data for Merkle proof
    const leaf1 = ethers.keccak256(ethers.toUtf8Bytes("data1"));
    const leaf2 = ethers.keccak256(ethers.toUtf8Bytes("data2"));
    const merkleRoot = ethers.keccak256(ethers.concat([leaf1, leaf2]));

    const startTimestamp = Math.floor(Date.now() / 1000) - 86400;
    const endTimestamp = Math.floor(Date.now() / 1000) - 3600;

    beforeEach(async function () {
      await proofRegistry.connect(oracle).publishBatch(
        merkleRoot,
        BatchType.DEPOSIT,
        startTimestamp,
        endTimestamp,
        "ipfs://test",
        2
      );
    });

    it("Should verify valid proof", async function () {
      const proof = [leaf2]; // Proof for leaf1
      const isValid = await proofRegistry.verifyProof(1, leaf1, proof);
      expect(isValid).to.be.true;
    });

    it("Should reject invalid proof", async function () {
      const invalidProof = [ethers.keccak256(ethers.toUtf8Bytes("invalid"))];
      const isValid = await proofRegistry.verifyProof(1, leaf1, invalidProof);
      expect(isValid).to.be.false;
    });

    it("Should handle empty proof for single leaf tree", async function () {
      const singleLeaf = ethers.keccak256(ethers.toUtf8Bytes("single"));
      
      await proofRegistry.connect(oracle).publishBatch(
        singleLeaf,
        BatchType.YIELD,
        startTimestamp,
        endTimestamp,
        "ipfs://single",
        1
      );

      const isValid = await proofRegistry.verifyProof(2, singleLeaf, []);
      expect(isValid).to.be.true;
    });
  });

  describe("Batch Queries", function () {
    beforeEach(async function () {
      const startTimestamp = Math.floor(Date.now() / 1000) - 86400;
      const endTimestamp = Math.floor(Date.now() / 1000) - 3600;

      // Publish batches of different types
      await proofRegistry.connect(oracle).publishBatch(
        ethers.keccak256(ethers.toUtf8Bytes("deposit1")),
        BatchType.DEPOSIT,
        startTimestamp,
        endTimestamp,
        "ipfs://deposit1",
        10
      );

      await proofRegistry.connect(oracle).publishBatch(
        ethers.keccak256(ethers.toUtf8Bytes("yield1")),
        BatchType.YIELD,
        startTimestamp,
        endTimestamp,
        "ipfs://yield1",
        20
      );

      await proofRegistry.connect(oracle).publishBatch(
        ethers.keccak256(ethers.toUtf8Bytes("deposit2")),
        BatchType.DEPOSIT,
        startTimestamp,
        endTimestamp,
        "ipfs://deposit2",
        15
      );
    });

    it("Should return batches by type", async function () {
      const depositBatches = await proofRegistry.getBatchesByType(BatchType.DEPOSIT, 0, 10);
      expect(depositBatches.length).to.equal(2);
      expect(depositBatches[0]).to.equal(3); // Newest first
      expect(depositBatches[1]).to.equal(1);

      const yieldBatches = await proofRegistry.getBatchesByType(BatchType.YIELD, 0, 10);
      expect(yieldBatches.length).to.equal(1);
      expect(yieldBatches[0]).to.equal(2);
    });

    it("Should return correct batch count by type", async function () {
      expect(await proofRegistry.getBatchCountByType(BatchType.DEPOSIT)).to.equal(2);
      expect(await proofRegistry.getBatchCountByType(BatchType.YIELD)).to.equal(1);
      expect(await proofRegistry.getBatchCountByType(BatchType.TRADE)).to.equal(0);
      expect(await proofRegistry.getBatchCountByType(BatchType.WITHDRAW)).to.equal(0);
    });

    it("Should handle pagination correctly", async function () {
      const page1 = await proofRegistry.getBatchesByType(BatchType.DEPOSIT, 0, 1);
      expect(page1.length).to.equal(1);
      expect(page1[0]).to.equal(3); // Newest

      const page2 = await proofRegistry.getBatchesByType(BatchType.DEPOSIT, 1, 1);
      expect(page2.length).to.equal(1);
      expect(page2[0]).to.equal(1); // Older
    });

    it("Should handle out of bounds pagination", async function () {
      const emptyResult = await proofRegistry.getBatchesByType(BatchType.DEPOSIT, 10, 5);
      expect(emptyResult.length).to.equal(0);
    });

    it("Should enforce pagination limits", async function () {
      await expect(
        proofRegistry.getBatchesByType(BatchType.DEPOSIT, 0, 0)
      ).to.be.revertedWith("ProofRegistry: invalid limit");

      await expect(
        proofRegistry.getBatchesByType(BatchType.DEPOSIT, 0, 101)
      ).to.be.revertedWith("ProofRegistry: invalid limit");
    });
  });

  describe("Pausing", function () {
    it("Should allow pauser to pause contract", async function () {
      await proofRegistry.connect(owner).pause();
      expect(await proofRegistry.paused()).to.be.true;
    });

    it("Should prevent publishing when paused", async function () {
      await proofRegistry.connect(owner).pause();

      await expect(
        proofRegistry.connect(oracle).publishBatch(
          ethers.keccak256(ethers.toUtf8Bytes("test")),
          BatchType.DEPOSIT,
          Math.floor(Date.now() / 1000) - 86400,
          Math.floor(Date.now() / 1000) - 3600,
          "ipfs://test",
          1
        )
      ).to.be.revertedWithCustomError(proofRegistry, "EnforcedPause");
    });

    it("Should allow unpausing", async function () {
      await proofRegistry.connect(owner).pause();
      await proofRegistry.connect(owner).unpause();
      
      expect(await proofRegistry.paused()).to.be.false;
    });
  });
});