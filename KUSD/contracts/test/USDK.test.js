const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("USDK Token", function () {
  let usdk;
  let owner, minter, burner, pauser, user1, user2;
  
  const TOKEN_NAME = "USDK Stablecoin";
  const TOKEN_SYMBOL = "USDK";
  const MINT_AMOUNT = ethers.parseUnits("1000", 18);

  beforeEach(async function () {
    [owner, minter, burner, pauser, user1, user2] = await ethers.getSigners();

    const USDK = await ethers.getContractFactory("USDK");
    usdk = await USDK.deploy(
      TOKEN_NAME,
      TOKEN_SYMBOL,
      owner.address,
      minter.address,
      burner.address,
      pauser.address
    );
    await usdk.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await usdk.name()).to.equal(TOKEN_NAME);
      expect(await usdk.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("Should set the correct decimals", async function () {
      expect(await usdk.decimals()).to.equal(18);
    });

    it("Should assign roles correctly", async function () {
      const DEFAULT_ADMIN_ROLE = await usdk.DEFAULT_ADMIN_ROLE();
      const MINTER_ROLE = await usdk.MINTER_ROLE();
      const BURNER_ROLE = await usdk.BURNER_ROLE();
      const PAUSER_ROLE = await usdk.PAUSER_ROLE();

      expect(await usdk.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await usdk.hasRole(MINTER_ROLE, minter.address)).to.be.true;
      expect(await usdk.hasRole(BURNER_ROLE, burner.address)).to.be.true;
      expect(await usdk.hasRole(PAUSER_ROLE, pauser.address)).to.be.true;
    });

    it("Should have zero initial supply", async function () {
      expect(await usdk.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should allow minter to mint tokens", async function () {
      await usdk.connect(minter).mint(user1.address, MINT_AMOUNT);
      
      expect(await usdk.balanceOf(user1.address)).to.equal(MINT_AMOUNT);
      expect(await usdk.totalSupply()).to.equal(MINT_AMOUNT);
    });

    it("Should not allow non-minter to mint tokens", async function () {
      await expect(
        usdk.connect(user1).mint(user2.address, MINT_AMOUNT)
      ).to.be.revertedWithCustomError(usdk, "AccessControlUnauthorizedAccount");
    });

    it("Should not allow minting to blacklisted address", async function () {
      await usdk.connect(owner).blacklist(user1.address);
      
      await expect(
        usdk.connect(minter).mint(user1.address, MINT_AMOUNT)
      ).to.be.revertedWith("USDK: recipient is blacklisted");
    });

    it("Should allow batch minting", async function () {
      const recipients = [user1.address, user2.address];
      const amounts = [MINT_AMOUNT, MINT_AMOUNT];

      await usdk.connect(minter).batchMint(recipients, amounts);

      expect(await usdk.balanceOf(user1.address)).to.equal(MINT_AMOUNT);
      expect(await usdk.balanceOf(user2.address)).to.equal(MINT_AMOUNT);
      expect(await usdk.totalSupply()).to.equal(MINT_AMOUNT * 2n);
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await usdk.connect(minter).mint(user1.address, MINT_AMOUNT);
    });

    it("Should allow burner to burn tokens", async function () {
      await usdk.connect(burner).burn(user1.address, MINT_AMOUNT / 2n);
      
      expect(await usdk.balanceOf(user1.address)).to.equal(MINT_AMOUNT / 2n);
      expect(await usdk.totalSupply()).to.equal(MINT_AMOUNT / 2n);
    });

    it("Should allow user to burn own tokens", async function () {
      await usdk.connect(user1).burn(MINT_AMOUNT / 2n);
      
      expect(await usdk.balanceOf(user1.address)).to.equal(MINT_AMOUNT / 2n);
      expect(await usdk.totalSupply()).to.equal(MINT_AMOUNT / 2n);
    });

    it("Should not allow non-burner to burn other's tokens", async function () {
      await expect(
        usdk.connect(user2).burn(user1.address, MINT_AMOUNT)
      ).to.be.revertedWithCustomError(usdk, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Pausing", function () {
    beforeEach(async function () {
      await usdk.connect(minter).mint(user1.address, MINT_AMOUNT);
    });

    it("Should allow pauser to pause contract", async function () {
      await usdk.connect(pauser).pause();
      expect(await usdk.paused()).to.be.true;
    });

    it("Should prevent transfers when paused", async function () {
      await usdk.connect(pauser).pause();
      
      await expect(
        usdk.connect(user1).transfer(user2.address, MINT_AMOUNT / 2n)
      ).to.be.revertedWithCustomError(usdk, "EnforcedPause");
    });

    it("Should allow pauser to unpause contract", async function () {
      await usdk.connect(pauser).pause();
      await usdk.connect(pauser).unpause();
      
      expect(await usdk.paused()).to.be.false;
    });

    it("Should not allow non-pauser to pause", async function () {
      await expect(
        usdk.connect(user1).pause()
      ).to.be.revertedWithCustomError(usdk, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Blacklisting", function () {
    beforeEach(async function () {
      await usdk.connect(minter).mint(user1.address, MINT_AMOUNT);
      await usdk.connect(minter).mint(user2.address, MINT_AMOUNT);
    });

    it("Should allow blacklisting an address", async function () {
      await usdk.connect(owner).blacklist(user1.address);
      
      expect(await usdk.isBlacklisted(user1.address)).to.be.true;
    });

    it("Should prevent blacklisted address from receiving tokens", async function () {
      await usdk.connect(owner).blacklist(user2.address);
      
      await expect(
        usdk.connect(user1).transfer(user2.address, MINT_AMOUNT / 2n)
      ).to.be.revertedWith("USDK: recipient is blacklisted");
    });

    it("Should prevent blacklisted address from sending tokens", async function () {
      await usdk.connect(owner).blacklist(user1.address);
      
      await expect(
        usdk.connect(user1).transfer(user2.address, MINT_AMOUNT / 2n)
      ).to.be.revertedWith("USDK: sender is blacklisted");
    });

    it("Should allow unblacklisting an address", async function () {
      await usdk.connect(owner).blacklist(user1.address);
      await usdk.connect(owner).unBlacklist(user1.address);
      
      expect(await usdk.isBlacklisted(user1.address)).to.be.false;
      
      // Should be able to transfer now
      await usdk.connect(user1).transfer(user2.address, MINT_AMOUNT / 2n);
      expect(await usdk.balanceOf(user2.address)).to.equal(MINT_AMOUNT + MINT_AMOUNT / 2n);
    });

    it("Should allow destroying blacklisted funds", async function () {
      const initialBalance = await usdk.balanceOf(user1.address);
      await usdk.connect(owner).blacklist(user1.address);
      
      await usdk.connect(owner).destroyBlacklistedFunds(user1.address);
      
      expect(await usdk.balanceOf(user1.address)).to.equal(0);
      expect(await usdk.totalSupply()).to.equal(MINT_AMOUNT * 2n - initialBalance);
    });
  });

  describe("Permit functionality", function () {
    it("Should support ERC20Permit", async function () {
      // Just verify the permit function exists
      expect(await usdk.DOMAIN_SEPARATOR()).to.not.be.undefined;
    });
  });

  describe("Access Control", function () {
    it("Should allow admin to grant roles", async function () {
      const MINTER_ROLE = await usdk.MINTER_ROLE();
      
      await usdk.connect(owner).grantRole(MINTER_ROLE, user1.address);
      
      expect(await usdk.hasRole(MINTER_ROLE, user1.address)).to.be.true;
    });

    it("Should allow admin to revoke roles", async function () {
      const MINTER_ROLE = await usdk.MINTER_ROLE();
      
      await usdk.connect(owner).revokeRole(MINTER_ROLE, minter.address);
      
      expect(await usdk.hasRole(MINTER_ROLE, minter.address)).to.be.false;
    });
  });

  describe("Edge cases", function () {
    it("Should not allow blacklisting zero address", async function () {
      await expect(
        usdk.connect(owner).blacklist(ethers.ZeroAddress)
      ).to.be.revertedWith("USDK: cannot blacklist zero address");
    });

    it("Should not allow double blacklisting", async function () {
      await usdk.connect(owner).blacklist(user1.address);
      
      await expect(
        usdk.connect(owner).blacklist(user1.address)
      ).to.be.revertedWith("USDK: account is already blacklisted");
    });

    it("Should not allow unblacklisting non-blacklisted address", async function () {
      await expect(
        usdk.connect(owner).unBlacklist(user1.address)
      ).to.be.revertedWith("USDK: account is not blacklisted");
    });
  });
});