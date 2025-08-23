const { ethers } = require("hardhat");

async function main() {
  console.log("🔄 Testing Token Swap on Sepolia...");
  
  const [deployer, user1] = await ethers.getSigners();
  
  // Load deployment info
  const fs = require('fs');
  const deploymentInfo = JSON.parse(fs.readFileSync('deployment-sepolia.json', 'utf8'));
  
  const factoryAddress = deploymentInfo.contracts.factory;
  const routerAddress = deploymentInfo.contracts.router;
  const tokenAAddress = deploymentInfo.contracts.tokenA;
  const tokenBAddress = deploymentInfo.contracts.tokenB;
  
  try {
    // Get contracts
    const factory = await ethers.getContractAt("LeafswapAMMFactory", factoryAddress);
    const router = await ethers.getContractAt("LeafswapRouter", routerAddress);
    const tokenA = await ethers.getContractAt("TestToken", tokenAAddress);
    const tokenB = await ethers.getContractAt("TestToken", tokenBAddress);
    
    console.log("Testing Token Swap with:");
    console.log("Factory:", factoryAddress);
    console.log("Router:", routerAddress);
    console.log("Token A:", tokenAAddress);
    console.log("Token B:", tokenBAddress);
    
    // Test 1: Check trading pair
    console.log("\n📊 Test 1: Trading Pair Check");
    const pairAddress = await factory.getPair(tokenAAddress, tokenBAddress);
    
    if (pairAddress === ethers.constants.AddressZero) {
      console.log("❌ Trading pair does not exist. Please create it first.");
      return;
    }
    
    console.log("✅ Trading pair exists:", pairAddress);
    const pair = await ethers.getContractAt("LeafswapPair", pairAddress);
    
    // Test 2: Check reserves
    console.log("\n📊 Test 2: Current Reserves");
    const reserves = await pair.getReserves();
    console.log("Current reserves:");
    console.log("  Token A:", ethers.utils.formatEther(reserves[0]));
    console.log("  Token B:", ethers.utils.formatEther(reserves[1]));
    
    if (reserves[0].isZero() || reserves[1].isZero()) {
      console.log("❌ No liquidity in the pool. Please add liquidity first.");
      return;
    }
    
    // Test 3: Check user balances before swap
    console.log("\n💰 Test 3: User Balances Before Swap");
    const user1BalanceA = await tokenA.balanceOf(user1.address);
    const user1BalanceB = await tokenB.balanceOf(user1.address);
    
    console.log("User1 balances:");
    console.log("  Token A:", ethers.utils.formatEther(user1BalanceA));
    console.log("  Token B:", ethers.utils.formatEther(user1BalanceB));
    
    // Test 4: Calculate swap amounts
    console.log("\n🧮 Test 4: Swap Calculation");
    const swapAmountIn = ethers.utils.parseEther("10"); // Swap 10 TKA for TKB
    
    // Get amounts out
    const amountsOut = await router.getAmountsOut(swapAmountIn, [tokenAAddress, tokenBAddress]);
    const amountOutMin = amountsOut[1].mul(95).div(100); // 5% slippage tolerance
    
    console.log("Swap calculation:");
    console.log("  Input amount: 10 TKA");
    console.log("  Expected output:", ethers.utils.formatEther(amountsOut[1]), "TKB");
    console.log("  Minimum output (5% slippage):", ethers.utils.formatEther(amountOutMin), "TKB");
    
    // Test 5: Check if user has enough tokens
    if (user1BalanceA.lt(swapAmountIn)) {
      console.log("⚠️  User1 doesn't have enough TKA for swap");
      console.log("Transferring some TKA to User1...");
      
      const transferTx = await tokenA.transfer(user1.address, swapAmountIn, {
        gasLimit: 100000,
        gasPrice: ethers.utils.parseUnits("20", "gwei")
      });
      await transferTx.wait();
      console.log("✅ Transferred 10 TKA to User1");
    }
    
    // Test 6: Approve router to spend tokens
    console.log("\n✅ Test 6: Approving Router");
    const user1TokenA = tokenA.connect(user1);
    
    const approveTx = await user1TokenA.approve(routerAddress, swapAmountIn, {
      gasLimit: 100000,
      gasPrice: ethers.utils.parseUnits("20", "gwei")
    });
    await approveTx.wait();
    console.log("✅ Router approved to spend User1's TKA");
    
    // Test 7: Execute swap
    console.log("\n🔄 Test 7: Executing Swap");
    const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes
    
    const swapTx = await router.connect(user1).swapExactTokensForTokens(
      swapAmountIn,
      amountOutMin,
      [tokenAAddress, tokenBAddress],
      user1.address,
      deadline,
      {
        gasLimit: 300000,
        gasPrice: ethers.utils.parseUnits("20", "gwei")
      }
    );
    
    console.log("Swap transaction hash:", swapTx.hash);
    await swapTx.wait();
    console.log("✅ Swap executed successfully");
    
    // Test 8: Check balances after swap
    console.log("\n💰 Test 8: User Balances After Swap");
    const user1BalanceAAfter = await tokenA.balanceOf(user1.address);
    const user1BalanceBAfter = await tokenB.balanceOf(user1.address);
    
    console.log("User1 balances after swap:");
    console.log("  Token A:", ethers.utils.formatEther(user1BalanceAAfter));
    console.log("  Token B:", ethers.utils.formatEther(user1BalanceBAfter));
    
    // Calculate actual swap results
    const tkaSpent = user1BalanceA.sub(user1BalanceAAfter);
    const tkbReceived = user1BalanceBAfter.sub(user1BalanceB);
    
    console.log("Swap results:");
    console.log("  TKA spent:", ethers.utils.formatEther(tkaSpent));
    console.log("  TKB received:", ethers.utils.formatEther(tkbReceived));
    
    // Test 9: Check reserves after swap
    console.log("\n📊 Test 9: Reserves After Swap");
    const reservesAfter = await pair.getReserves();
    console.log("Reserves after swap:");
    console.log("  Token A:", ethers.utils.formatEther(reservesAfter[0]));
    console.log("  Token B:", ethers.utils.formatEther(reservesAfter[1]));
    
    // Test 10: Calculate price impact
    console.log("\n📈 Test 10: Price Impact");
    const priceBefore = reserves[1].mul(ethers.utils.parseEther("1")).div(reserves[0]);
    const priceAfter = reservesAfter[1].mul(ethers.utils.parseEther("1")).div(reservesAfter[0]);
    const priceImpact = priceBefore.sub(priceAfter).mul(10000).div(priceBefore);
    
    console.log("Price impact:", priceImpact.toString(), "basis points");
    
    console.log("\n🎉 Token Swap Tests Completed Successfully!");
    
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
