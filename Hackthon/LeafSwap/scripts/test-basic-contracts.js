const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Testing Basic Contract Functions on Sepolia...");
  
  const [deployer] = await ethers.getSigners();
  
  // Load deployment info
  const fs = require('fs');
  const deploymentInfo = JSON.parse(fs.readFileSync('deployment-sepolia.json', 'utf8'));
  
  try {
    console.log("Testing basic contract functions...");
    console.log("Deployer:", deployer.address);
    
    // Test 1: Factory contract basic functions
    console.log("\n🏭 Test 1: Factory Contract");
    const factory = await ethers.getContractAt("LeafswapAMMFactory", deploymentInfo.contracts.factory);
    
    const feeToSetter = await factory.feeToSetter();
    const swapFeeRate = await factory.swapFeeRate();
    const mevGuard = await factory.MEVGuard();
    const allPairsLength = await factory.allPairsLength();
    
    console.log("✅ Fee To Setter:", feeToSetter);
    console.log("✅ Swap Fee Rate:", swapFeeRate.toString());
    console.log("✅ MEVGuard:", mevGuard);
    console.log("✅ All Pairs Length:", allPairsLength.toString());
    
    // Test 2: Router contract basic functions
    console.log("\n🔄 Test 2: Router Contract");
    const router = await ethers.getContractAt("LeafswapRouter", deploymentInfo.contracts.router);
    
    const routerFactory = await router.factory();
    const routerWETH = await router.WETH();
    
    console.log("✅ Router Factory:", routerFactory);
    console.log("✅ Router WETH:", routerWETH);
    
    // Test 3: Token contracts basic functions
    console.log("\n🪙 Test 3: Token Contracts");
    const tokenA = await ethers.getContractAt("TestToken", deploymentInfo.contracts.tokenA);
    const tokenB = await ethers.getContractAt("TestToken", deploymentInfo.contracts.tokenB);
    
    const tokenAName = await tokenA.name();
    const tokenASymbol = await tokenA.symbol();
    const tokenADecimals = await tokenA.decimals();
    const tokenATotalSupply = await tokenA.totalSupply();
    
    const tokenBName = await tokenB.name();
    const tokenBSymbol = await tokenB.symbol();
    const tokenBDecimals = await tokenB.decimals();
    const tokenBTotalSupply = await tokenB.totalSupply();
    
    console.log("Token A:");
    console.log("  Name:", tokenAName);
    console.log("  Symbol:", tokenASymbol);
    console.log("  Decimals:", tokenADecimals.toString());
    console.log("  Total Supply:", ethers.utils.formatEther(tokenATotalSupply));
    
    console.log("Token B:");
    console.log("  Name:", tokenBName);
    console.log("  Symbol:", tokenBSymbol);
    console.log("  Decimals:", tokenBDecimals.toString());
    console.log("  Total Supply:", ethers.utils.formatEther(tokenBTotalSupply));
    
    // Test 4: MEVGuard contract basic functions
    console.log("\n🛡️ Test 4: MEVGuard Contract");
    const mevGuardContract = await ethers.getContractAt("MEVGuard", deploymentInfo.contracts.mevGuard);
    
    const owner = await mevGuardContract.owner();
    const antiFrontDefendBlock = await mevGuardContract.antiFrontDefendBlock();
    const antiMEVFeePercentage = await mevGuardContract.antiMEVFeePercentage();
    const antiMEVAmountOutLimitRate = await mevGuardContract.antiMEVAmountOutLimitRate();
    
    console.log("✅ Owner:", owner);
    console.log("✅ Anti-Front-Running Blocks:", antiFrontDefendBlock.toString());
    console.log("✅ MEV Fee Percentage:", antiMEVFeePercentage.toString());
    console.log("✅ Min Transaction Size:", antiMEVAmountOutLimitRate.toString());
    
    // Test 5: Check if trading pair exists
    console.log("\n📊 Test 5: Trading Pair Check");
    const pairAddress = await factory.getPair(deploymentInfo.contracts.tokenA, deploymentInfo.contracts.tokenB);
    
    if (pairAddress !== ethers.constants.AddressZero) {
      console.log("✅ Trading pair exists:", pairAddress);
      
      // Try to get pair info
      try {
        const pair = await ethers.getContractAt("LeafswapPair", pairAddress);
        const reserves = await pair.getReserves();
        console.log("✅ Pair reserves:");
        console.log("  Token A:", ethers.utils.formatEther(reserves[0]));
        console.log("  Token B:", ethers.utils.formatEther(reserves[1]));
      } catch (error) {
        console.log("⚠️  Could not get pair reserves:", error.message);
      }
    } else {
      console.log("⚠️  Trading pair does not exist yet");
    }
    
    // Test 6: Check user balances
    console.log("\n💰 Test 6: User Balances");
    const deployerBalanceA = await tokenA.balanceOf(deployer.address);
    const deployerBalanceB = await tokenB.balanceOf(deployer.address);
    
    console.log("Deployer balances:");
    console.log("  Token A:", ethers.utils.formatEther(deployerBalanceA));
    console.log("  Token B:", ethers.utils.formatEther(deployerBalanceB));
    
    console.log("\n🎉 Basic Contract Tests Completed Successfully!");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
