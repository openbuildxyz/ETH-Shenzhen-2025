const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Leafswap", function () {
  let factory, router, weth, tokenA, tokenB, owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy contracts
    // 首先部署MEVGuard
    const MEVGuard = await ethers.getContractFactory("MEVGuard");
    const mevGuard = await MEVGuard.deploy(
        owner.address,
        100, // antiFrontDefendBlock
        100, // antiMEVFeePercentage
        50,  // antiMEVAmountOutLimitRate
        "0x0000000000000000000000000000000000000001" // 模拟的SubscriptionConsumer地址
    );
    
    // 部署新的LeafswapAMMFactory
    const LeafswapAMMFactory = await ethers.getContractFactory("LeafswapAMMFactory");
    factory = await LeafswapAMMFactory.deploy(
        owner.address, // feeToSetter
        30, // swapFeeRate: 0.3%
        mevGuard.address // MEVGuard
    );
    
    // 设置工厂权限
    await mevGuard.setFactoryStatus(factory.address, true);

    const WETH9 = await ethers.getContractFactory("WETH9");
    weth = await WETH9.deploy();

    const LeafswapRouter = await ethers.getContractFactory("LeafswapRouter");
    router = await LeafswapRouter.deploy(factory.address, weth.address);

    const TestToken = await ethers.getContractFactory("TestToken");
    tokenA = await TestToken.deploy("Token A", "TKA");
    tokenB = await TestToken.deploy("Token B", "TKB");

    // Transfer some tokens to users
    await tokenA.transfer(user1.address, ethers.utils.parseEther("1000"));
    await tokenB.transfer(user1.address, ethers.utils.parseEther("1000"));
    await tokenA.transfer(user2.address, ethers.utils.parseEther("1000"));
    await tokenB.transfer(user2.address, ethers.utils.parseEther("1000"));
  });

  describe("Factory", function () {
    it("Should create a pair", async function () {
      await factory.createPair(tokenA.address, tokenB.address);
      const pairAddress = await factory.getPair(tokenA.address, tokenB.address);
      expect(pairAddress).to.not.equal(ethers.constants.AddressZero);
    });

    it("Should not create duplicate pairs", async function () {
      await factory.createPair(tokenA.address, tokenB.address);
      await expect(
        factory.createPair(tokenA.address, tokenB.address)
      ).to.be.revertedWith("PairExists");
    });
  });

  describe("Router", function () {
    beforeEach(async function () {
      await factory.createPair(tokenA.address, tokenB.address);
    });

    it("Should add liquidity", async function () {
      const amountA = ethers.utils.parseEther("100");
      const amountB = ethers.utils.parseEther("100");

      await tokenA.connect(user1).approve(router.address, amountA);
      await tokenB.connect(user1).approve(router.address, amountB);

      await router.connect(user1).addLiquidity(
        tokenA.address,
        tokenB.address,
        amountA,
        amountB,
        0,
        0,
        user1.address,
        Math.floor(Date.now() / 1000) + 300
      );

      const pairAddress = await factory.getPair(tokenA.address, tokenB.address);
      const pair = await ethers.getContractAt("LeafswapPair", pairAddress);
      const balance = await pair.balanceOf(user1.address);
      expect(balance).to.be.gt(0);
    });

    it("Should swap tokens", async function () {
      // First add liquidity
      const amountA = ethers.utils.parseEther("1000");
      const amountB = ethers.utils.parseEther("1000");

      await tokenA.connect(user1).approve(router.address, amountA);
      await tokenB.connect(user1).approve(router.address, amountB);

      await router.connect(user1).addLiquidity(
        tokenA.address,
        tokenB.address,
        amountA,
        amountB,
        0,
        0,
        user1.address,
        Math.floor(Date.now() / 1000) + 300
      );

      // Now swap
      const swapAmount = ethers.utils.parseEther("10");
      await tokenA.connect(user2).approve(router.address, swapAmount);

      const balanceBefore = await tokenB.balanceOf(user2.address);
      
      await router.connect(user2).swapExactTokensForTokens(
        swapAmount,
        0,
        [tokenA.address, tokenB.address],
        user2.address,
        Math.floor(Date.now() / 1000) + 60
      );

      const balanceAfter = await tokenB.balanceOf(user2.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });
  });

  describe("Pair", function () {
    let pair;

    beforeEach(async function () {
      await factory.createPair(tokenA.address, tokenB.address);
      const pairAddress = await factory.getPair(tokenA.address, tokenB.address);
      pair = await ethers.getContractAt("LeafswapPair", pairAddress);
    });

    it("Should have correct token addresses", async function () {
      const token0 = await pair.token0();
      const token1 = await pair.token1();
      expect([token0, token1]).to.include(tokenA.address);
      expect([token0, token1]).to.include(tokenB.address);
    });

    it("Should have correct factory address", async function () {
      const pairFactory = await pair.factory();
      expect(pairFactory).to.equal(factory.address);
    });
  });
});
