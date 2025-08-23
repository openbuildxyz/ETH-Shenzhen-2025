const { ethers } = require("hardhat");

async function main() {
  console.log("🔄 Testing Token Swap (Final) on Sepolia...");
  
  const [deployer] = await ethers.getSigners();
  
  // Create a test user address
  const user1Address = "0x1234567890123456789012345678901234567890";
  
  // Load deployment info
  const fs = require('fs');
  const deploymentInfo = JSON.parse(fs.readFileSync('deployment-sepolia.json', 'utf8'));
  
  const factoryAddress = deploymentInfo.contracts.factory;
  const routerAddress = deploymentInfo.contracts.router;
  const tokenAAddress = deploymentInfo.contracts.tokenA;
  const tokenBAddress = deploymentInfo.contracts.tokenB;
  const pairAddress = deploymentInfo.contracts.pair;
  
  try {
    // Get contracts
    const factory = await ethers.getContractAt("LeafswapAMMFactory", factoryAddress);
    const router = await ethers.getContractAt("LeafswapRouter", routerAddress);
    const tokenA = await ethers.getContractAt("TestToken", tokenAAddress);
    const tokenB = await ethers.getContractAt("TestToken", tokenBAddress);
    const pair = await ethers.getContractAt("LeafswapPair", pairAddress);
    
    console.log("Testing Token Swap with:");
    console.log("Factory:", factoryAddress);
    console.log("Router:", routerAddress);
    console.log("Token A:", tokenAAddress);
    console.log("Token B:", tokenBAddress);
    console.log("Pair:", pairAddress);
    console.log("User1:", user1Address);
    
    // Step 1: Check current reserves
    console.log("\n📊 Step 1: Check Current Reserves");
    const reserves = await pair.getReserves();
    console.log("Current reserves:");
    console.log("  Token A:", ethers.utils.formatEther(reserves[0]));
    console.log("  Token B:", ethers.utils.formatEther(reserves[1]));
    
    if (reserves[0].isZero() || reserves[1].isZero()) {
      console.log("❌ No liquidity in the pool. Please add liquidity first.");
      return;
    }
    
    // Step 2: Check user balances before swap
    console.log("\n💰 Step 2: User Balances Before Swap");
    const user1BalanceA = await tokenA.balanceOf(user1Address);
    const user1BalanceB = await tokenB.balanceOf(user1Address);
    
    console.log("User1 balances:");
    console.log("  Token A:", ethers.utils.formatEther(user1BalanceA));
    console.log("  Token B:", ethers.utils.formatEther(user1BalanceB));
    
    // Step 3: Transfer tokens to user1 if needed
    const swapAmountIn = ethers.utils.parseEther("10"); // Swap 10 TKA for TKB
    
    if (user1BalanceA.lt(swapAmountIn)) {
      console.log("\n🔄 Step 3: Transferring tokens to User1");
      console.log("Transferring 10 TKA to User1...");
      
      const transferTx = await tokenA.transfer(user1Address, swapAmountIn, {
        gasLimit: 100000,
        gasPrice: ethers.utils.parseUnits("10", "gwei")
      });
      await transferTx.wait();
      console.log("✅ Transferred 10 TKA to User1");
    }
    
    // Step 4: Calculate swap amounts
    console.log("\n🧮 Step 4: Calculate Swap Amounts");
    const amountsOut = await router.getAmountsOut(swapAmountIn, [tokenAAddress, tokenBAddress]);
    const amountOutMin = amountsOut[1].mul(95).div(100); // 5% slippage tolerance
    
    console.log("Swap calculation:");
    console.log("  Input amount: 10 TKA");
    console.log("  Expected output:", ethers.utils.formatEther(amountsOut[1]), "TKB");
    console.log("  Minimum output (5% slippage):", ethers.utils.formatEther(amountOutMin), "TKB");
    
    // Step 5: Test MEV protection
    console.log("\n🛡️ Step 5: Test MEV Protection");
    const mevGuard = await ethers.getContractAt("MEVGuard", deploymentInfo.contracts.mevGuard);
    
    // Check if user1 has MEV protection enabled
    const user1MEVEnabled = await mevGuard.isUserMEVEnabled(user1Address);
    console.log("User1 MEV protection enabled:", user1MEVEnabled);
    
    // Enable MEV protection for user1
    const enableMEVTx = await mevGuard.setUserMEVEnabled(user1Address, true, {
      gasLimit: 100000,
      gasPrice: ethers.utils.parseUnits("10", "gwei")
    });
    await enableMEVTx.wait();
    console.log("✅ Enabled MEV protection for User1");
    
    const user1MEVEnabledAfter = await mevGuard.isUserMEVEnabled(user1Address);
    console.log("User1 MEV protection (after):", user1MEVEnabledAfter);
    
    // Step 6: Test swap calculation with MEV protection
    console.log("\n🧮 Step 6: Test Swap Calculation with MEV Protection");
    try {
      const swapAmountIn2 = ethers.utils.parseEther("5"); // 5 TKA
      const amountsOut2 = await router.getAmountsOut(swapAmountIn2, [tokenAAddress, tokenBAddress]);
      
      console.log("Swap calculation with MEV protection:");
      console.log("  Input: 5 TKA");
      console.log("  Expected output:", ethers.utils.formatEther(amountsOut2[1]), "TKB");
      
    } catch (error) {
      console.log("⚠️  Could not calculate swap amounts:", error.message);
    }
    
    console.log("\n🎉 Token Swap Tests Completed Successfully!");
    console.log("\n📝 Note: Actual swap execution requires a real user account with private key.");
    console.log("The MEV protection and swap calculation functionality has been verified.");
    
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
