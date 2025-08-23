const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy MEVGuard first
  const MEVGuard = await ethers.getContractFactory("MEVGuard");
  const mevGuard = await MEVGuard.deploy(
    deployer.address,
    100, // antiFrontDefendBlock
    100, // antiMEVFeePercentage
    50,  // antiMEVAmountOutLimitRate
    "0x0000000000000000000000000000000000000001" // 模拟的SubscriptionConsumer地址
  );
  await mevGuard.deployed();
  console.log("MEVGuard deployed to:", mevGuard.address);

  // Deploy Factory
  const LeafswapAMMFactory = await ethers.getContractFactory("LeafswapAMMFactory");
  const factory = await LeafswapAMMFactory.deploy(
    deployer.address, // feeToSetter
    30, // swapFeeRate: 0.3%
    mevGuard.address // MEVGuard
  );
  await factory.deployed();
  console.log("LeafswapAMMFactory deployed to:", factory.address);

  // Set factory permissions
  await mevGuard.setFactoryStatus(factory.address, true);
  console.log("Factory permissions set in MEVGuard");

  // Deploy Router
  const LeafswapRouter = await ethers.getContractFactory("LeafswapRouter");
  const router = await LeafswapRouter.deploy(factory.address, "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"); // WETH9 address
  await router.deployed();
  console.log("LeafswapRouter deployed to:", router.address);

  // Deploy WETH9 for local testing
  const WETH9 = await ethers.getContractFactory("WETH9");
  const weth = await WETH9.deploy();
  await weth.deployed();
  console.log("WETH9 deployed to:", weth.address);

  // Deploy test tokens
  const TestToken = await ethers.getContractFactory("TestToken");
  const tokenA = await TestToken.deploy("Token A", "TKA");
  await tokenA.deployed();
  console.log("Token A deployed to:", tokenA.address);

  const tokenB = await TestToken.deploy("Token B", "TKB");
  await tokenB.deployed();
  console.log("Token B deployed to:", tokenB.address);

  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("Factory:", factory.address);
  console.log("Router:", router.address);
  console.log("WETH9:", weth.address);
  console.log("Token A:", tokenA.address);
  console.log("Token B:", tokenB.address);
  console.log("\nTo interact with the contracts:");
  console.log("1. Use the factory to create pairs");
  console.log("2. Use the router for swaps and liquidity operations");
  console.log("3. Approve tokens before adding liquidity or swapping");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
