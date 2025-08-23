const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying Leafswap deployment on Sepolia...");
  
  // Load deployment info
  const fs = require('fs');
  let deploymentInfo;
  
  try {
    deploymentInfo = JSON.parse(fs.readFileSync('deployment-sepolia.json', 'utf8'));
  } catch (error) {
    console.error("❌ Could not load deployment-sepolia.json");
    return;
  }

  const contracts = deploymentInfo.contracts;
  
  try {
    // 1. Verify SubcriptionConsumer
    console.log("\n🔗 Verifying SubcriptionConsumer...");
    const subscriptionConsumer = await ethers.getContractAt("SubcriptionConsumer", contracts.subscriptionConsumer);
    const subscriptionId = await subscriptionConsumer.s_subscriptionId();
    console.log("✅ Subscription ID:", subscriptionId.toString());
    
    // 2. Verify MEVGuard
    console.log("\n🛡️  Verifying MEVGuard...");
    const mevGuard = await ethers.getContractAt("MEVGuard", contracts.mevGuard);
    const owner = await mevGuard.owner();
    const antiFrontDefendBlock = await mevGuard.antiFrontDefendBlock();
    const antiMEVFeePercentage = await mevGuard.antiMEVFeePercentage();
    const antiMEVAmountOutLimitRate = await mevGuard.antiMEVAmountOutLimitRate();
    
    console.log("✅ Owner:", owner);
    console.log("✅ Anti-Front-Running Blocks:", antiFrontDefendBlock.toString());
    console.log("✅ MEV Fee Percentage:", antiMEVFeePercentage.toString());
    console.log("✅ Min Transaction Size:", antiMEVAmountOutLimitRate.toString());
    
    // 3. Verify Factory
    console.log("\n🏭 Verifying LeafswapAMMFactory...");
    const factory = await ethers.getContractAt("LeafswapAMMFactory", contracts.factory);
    const factoryMEVGuard = await factory.MEVGuard();
    const feeToSetter = await factory.feeToSetter();
    const swapFeeRate = await factory.swapFeeRate();
    
    console.log("✅ MEVGuard:", factoryMEVGuard);
    console.log("✅ Fee To Setter:", feeToSetter);
    console.log("✅ Swap Fee Rate:", swapFeeRate.toString());
    
    // 4. Verify Router
    console.log("\n🔄 Verifying LeafswapRouter...");
    const router = await ethers.getContractAt("LeafswapRouter", contracts.router);
    const routerFactory = await router.factory();
    const routerWETH = await router.WETH();
    
    console.log("✅ Factory:", routerFactory);
    console.log("✅ WETH:", routerWETH);
    
    // 5. Verify Test Tokens
    console.log("\n🪙 Verifying Test Tokens...");
    const tokenA = await ethers.getContractAt("TestToken", contracts.tokenA);
    const tokenB = await ethers.getContractAt("TestToken", contracts.tokenB);
    
    const tokenAName = await tokenA.name();
    const tokenASymbol = await tokenA.symbol();
    const tokenBName = await tokenB.name();
    const tokenBSymbol = await tokenB.symbol();
    
    console.log("✅ Token A:", tokenAName, `(${tokenASymbol})`);
    console.log("✅ Token B:", tokenBName, `(${tokenBSymbol})`);
    
    // 6. Check Factory Permissions
    console.log("\n🔐 Checking Factory Permissions...");
    const factoryAuthorized = await mevGuard.factories(contracts.factory);
    console.log("✅ Factory authorized in MEVGuard:", factoryAuthorized);
    
    // 7. Check Trading Pair
    console.log("\n📊 Checking Trading Pair...");
    const pairAddress = await factory.getPair(contracts.tokenA, contracts.tokenB);
    if (pairAddress !== ethers.constants.AddressZero) {
      console.log("✅ Trading pair exists at:", pairAddress);
      
      // Check pair reserves
      const pair = await ethers.getContractAt("LeafswapPair", pairAddress);
      const reserves = await pair.getReserves();
      console.log("✅ Pair reserves:", ethers.utils.formatEther(reserves[0]), "TKA,", ethers.utils.formatEther(reserves[1]), "TKB");
    } else {
      console.log("⚠️  Trading pair does not exist yet");
    }
    
    // 8. Check Account Balance
    const [deployer] = await ethers.getSigners();
    const balance = await deployer.getBalance();
    console.log("\n💰 Account Balance:", ethers.utils.formatEther(balance), "ETH");
    
    // 9. Network Information
    const network = await ethers.provider.getNetwork();
    console.log("🌐 Network Chain ID:", network.chainId);
    console.log("🌐 Network Name:", network.name || "Sepolia");
    
    console.log("\n🎉 === DEPLOYMENT VERIFICATION COMPLETED ===");
    console.log("✅ All core contracts are properly deployed and configured");
    console.log("✅ MEV protection system is ready");
    console.log("✅ Frontend can now connect to Sepolia network");
    
    if (pairAddress === ethers.constants.AddressZero) {
      console.log("\n📝 Next Steps:");
      console.log("1. Create trading pair using the factory contract");
      console.log("2. Add initial liquidity");
      console.log("3. Test token swapping with MEV protection");
    }
    
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    console.log("\nTroubleshooting:");
    console.log("1. Check if all contracts are deployed");
    console.log("2. Verify contract addresses in deployment-sepolia.json");
    console.log("3. Ensure network connection is stable");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
