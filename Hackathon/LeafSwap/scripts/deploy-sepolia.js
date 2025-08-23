const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Deploying Leafswap with MEV Protection to Sepolia Testnet");
  console.log("Deployer account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // 检查环境变量
  if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY.length !== 64) {
    throw new Error("❌ PRIVATE_KEY not found or invalid in .env file");
  }

  if (!process.env.SEPOLIA_URL) {
    console.log("⚠️  SEPOLIA_URL not found, using default Alchemy URL");
  }

  console.log("\n📋 Deployment Plan:");
  console.log("1. Deploy SubcriptionConsumer (Chainlink VRF)");
  console.log("2. Deploy MEVGuard");
  console.log("3. Deploy LeafswapAMMFactory");
  console.log("4. Deploy LeafswapRouter");
  console.log("5. Deploy Test Tokens");
  console.log("6. Configure contracts");
  console.log("7. Add initial liquidity (optional)");

  let deploymentInfo = {};

  try {
    // Step 1: Deploy SubcriptionConsumer
    console.log("\n🔗 Step 1: Deploying SubcriptionConsumer...");
    const subscriptionId = "30867384965334728711427918226381771937390809014305130314753698149523927636152";
    const SubcriptionConsumer = await ethers.getContractFactory("SubcriptionConsumer");
    const subscriptionConsumer = await SubcriptionConsumer.deploy(subscriptionId, {
      gasLimit: 2000000,
      gasPrice: ethers.utils.parseUnits("20", "gwei")
    });
    await subscriptionConsumer.deployed();
    console.log("✅ SubcriptionConsumer deployed to:", subscriptionConsumer.address);
    deploymentInfo.subscriptionConsumer = subscriptionConsumer.address;

    // Step 2: Deploy MEVGuard
    console.log("\n🛡️  Step 2: Deploying MEVGuard...");
    const MEVGuard = await ethers.getContractFactory("MEVGuard");
    const mevGuard = await MEVGuard.deploy(
      deployer.address, // owner
      100, // antiFrontDefendBlock: 100 blocks protection
      100, // antiMEVFeePercentage: 1% fee
      50,  // antiMEVAmountOutLimitRate: 0.5% min transaction size
      subscriptionConsumer.address, // SubscriptionConsumer
      {
        gasLimit: 3000000,
        gasPrice: ethers.utils.parseUnits("20", "gwei")
      }
    );
    await mevGuard.deployed();
    console.log("✅ MEVGuard deployed to:", mevGuard.address);
    deploymentInfo.mevGuard = mevGuard.address;

    // Step 3: Deploy LeafswapAMMFactory
    console.log("\n🏭 Step 3: Deploying LeafswapAMMFactory...");
    const LeafswapAMMFactory = await ethers.getContractFactory("LeafswapAMMFactory");
    const factory = await LeafswapAMMFactory.deploy(
      deployer.address, // feeToSetter
      30, // swapFeeRate: 0.3%
      mevGuard.address, // MEVGuard
      {
        gasLimit: 4000000,
        gasPrice: ethers.utils.parseUnits("20", "gwei")
      }
    );
    await factory.deployed();
    console.log("✅ LeafswapAMMFactory deployed to:", factory.address);
    deploymentInfo.factory = factory.address;

    // Step 4: Set factory permissions in MEVGuard
    console.log("\n🔐 Step 4: Setting factory permissions...");
    const setFactoryTx = await mevGuard.setFactoryStatus(factory.address, true, {
      gasLimit: 100000,
      gasPrice: ethers.utils.parseUnits("20", "gwei")
    });
    await setFactoryTx.wait();
    console.log("✅ Factory permissions set in MEVGuard");

    // Step 5: Deploy LeafswapRouter
    console.log("\n🔄 Step 5: Deploying LeafswapRouter...");
    const LeafswapRouter = await ethers.getContractFactory("LeafswapRouter");
    // Sepolia WETH address: 0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9
    const router = await LeafswapRouter.deploy(factory.address, "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9", {
      gasLimit: 3000000,
      gasPrice: ethers.utils.parseUnits("20", "gwei")
    });
    await router.deployed();
    console.log("✅ LeafswapRouter deployed to:", router.address);
    deploymentInfo.router = router.address;

    // Step 6: Deploy Test Tokens
    console.log("\n🪙 Step 6: Deploying Test Tokens...");
    const TestToken = await ethers.getContractFactory("TestToken");
    
    const tokenA = await TestToken.deploy("Test Token A", "TKA", {
      gasLimit: 2000000,
      gasPrice: ethers.utils.parseUnits("20", "gwei")
    });
    await tokenA.deployed();
    console.log("✅ Token A (TKA) deployed to:", tokenA.address);
    deploymentInfo.tokenA = tokenA.address;

    const tokenB = await TestToken.deploy("Test Token B", "TKB", {
      gasLimit: 2000000,
      gasPrice: ethers.utils.parseUnits("20", "gwei")
    });
    await tokenB.deployed();
    console.log("✅ Token B (TKB) deployed to:", tokenB.address);
    deploymentInfo.tokenB = tokenB.address;

    // Step 7: Create trading pair (with lower gas limit)
    console.log("\n📊 Step 7: Creating trading pair...");
    try {
      const createPairTx = await factory.createPair(tokenA.address, tokenB.address, {
        gasLimit: 1500000,
        gasPrice: ethers.utils.parseUnits("20", "gwei")
      });
      await createPairTx.wait();
      const pairAddress = await factory.getPair(tokenA.address, tokenB.address);
      console.log("✅ Trading pair created at:", pairAddress);
      deploymentInfo.pair = pairAddress;
    } catch (error) {
      console.log("⚠️  Warning: Could not create trading pair due to gas issues");
      console.log("You can create the pair later using the factory contract");
      deploymentInfo.pair = "Not created yet";
    }

    // Step 8: Verify deployment
    console.log("\n🔍 Step 8: Verifying deployment...");
    
    // Check factory
    const factoryMEVGuard = await factory.MEVGuard();
    console.log("Factory MEVGuard:", factoryMEVGuard);
    
    // Check MEVGuard
    const mevGuardOwner = await mevGuard.owner();
    const mevGuardFactory = await mevGuard.factories(factory.address);
    console.log("MEVGuard owner:", mevGuardOwner);
    console.log("Factory authorized in MEVGuard:", mevGuardFactory);

    // Check remaining balance
    const remainingBalance = await deployer.getBalance();
    console.log("Remaining balance:", ethers.utils.formatEther(remainingBalance), "ETH");

    // Generate deployment summary
    const finalDeploymentInfo = {
      network: "sepolia",
      deployer: deployer.address,
      contracts: {
        subscriptionConsumer: deploymentInfo.subscriptionConsumer,
        mevGuard: deploymentInfo.mevGuard,
        factory: deploymentInfo.factory,
        router: deploymentInfo.router,
        tokenA: deploymentInfo.tokenA,
        tokenB: deploymentInfo.tokenB,
        pair: deploymentInfo.pair,
        weth: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9"
      },
      configuration: {
        subscriptionId: subscriptionId,
        antiFrontDefendBlock: 100,
        antiMEVFeePercentage: 100, // 1%
        antiMEVAmountOutLimitRate: 50, // 0.5%
        swapFeeRate: 30 // 0.3%
      },
      timestamp: new Date().toISOString(),
      explorer: "https://sepolia.etherscan.io",
      remainingBalance: ethers.utils.formatEther(remainingBalance)
    };

    console.log("\n🎉 === DEPLOYMENT COMPLETED SUCCESSFULLY ===");
    console.log("Network: Sepolia Testnet");
    console.log("Deployer:", deployer.address);
    console.log("\n📋 Contract Addresses:");
    console.log("SubcriptionConsumer:", deploymentInfo.subscriptionConsumer);
    console.log("MEVGuard:", deploymentInfo.mevGuard);
    console.log("Factory:", deploymentInfo.factory);
    console.log("Router:", deploymentInfo.router);
    console.log("Token A (TKA):", deploymentInfo.tokenA);
    console.log("Token B (TKB):", deploymentInfo.tokenB);
    console.log("Trading Pair:", deploymentInfo.pair);
    console.log("WETH:", "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9");

    console.log("\n🔗 Explorer Links:");
    console.log("SubcriptionConsumer:", `https://sepolia.etherscan.io/address/${deploymentInfo.subscriptionConsumer}`);
    console.log("MEVGuard:", `https://sepolia.etherscan.io/address/${deploymentInfo.mevGuard}`);
    console.log("Factory:", `https://sepolia.etherscan.io/address/${deploymentInfo.factory}`);
    console.log("Router:", `https://sepolia.etherscan.io/address/${deploymentInfo.router}`);
    console.log("Token A:", `https://sepolia.etherscan.io/address/${deploymentInfo.tokenA}`);
    console.log("Token B:", `https://sepolia.etherscan.io/address/${deploymentInfo.tokenB}`);
    if (deploymentInfo.pair !== "Not created yet") {
      console.log("Pair:", `https://sepolia.etherscan.io/address/${deploymentInfo.pair}`);
    }

    console.log("\n📝 Next Steps:");
    console.log("1. Update frontend/config.js with these contract addresses");
    console.log("2. Test the contracts on Sepolia");
    console.log("3. Verify contracts on Etherscan");
    console.log("4. Test MEV protection features");
    if (deploymentInfo.pair === "Not created yet") {
      console.log("5. Create trading pair manually using the factory contract");
    }

    // Save deployment info to file
    const fs = require('fs');
    fs.writeFileSync('deployment-sepolia.json', JSON.stringify(finalDeploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to: deployment-sepolia.json");

    return finalDeploymentInfo;

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    
    // Save partial deployment info if available
    if (Object.keys(deploymentInfo).length > 0) {
      const fs = require('fs');
      const partialInfo = {
        network: "sepolia",
        deployer: deployer.address,
        contracts: deploymentInfo,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      fs.writeFileSync('deployment-sepolia-partial.json', JSON.stringify(partialInfo, null, 2));
      console.log("💾 Partial deployment info saved to: deployment-sepolia-partial.json");
    }
    
    throw error;
  }
}

main()
  .then((deploymentInfo) => {
    console.log("\n✅ Deployment script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
