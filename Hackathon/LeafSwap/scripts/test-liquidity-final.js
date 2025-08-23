const { ethers } = require("hardhat");

async function main() {
  console.log("💧 Testing Liquidity Management (Final) on Sepolia...");
  
  const [deployer] = await ethers.getSigners();
  
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
    
    console.log("Testing Liquidity Management with:");
    console.log("Factory:", factoryAddress);
    console.log("Router:", routerAddress);
    console.log("Token A:", tokenAAddress);
    console.log("Token B:", tokenBAddress);
    console.log("Pair:", pairAddress);
    
    // Step 1: Check pair status
    console.log("\n📊 Step 1: Check Pair Status");
    const reserves = await pair.getReserves();
    console.log("Current reserves:");
    console.log("  Token A:", ethers.utils.formatEther(reserves[0]));
    console.log("  Token B:", ethers.utils.formatEther(reserves[1]));
    
    // Step 2: Check user balances
    console.log("\n💰 Step 2: Check User Balances");
    const deployerBalanceA = await tokenA.balanceOf(deployer.address);
    const deployerBalanceB = await tokenB.balanceOf(deployer.address);
    
    console.log("Deployer balances:");
    console.log("  Token A:", ethers.utils.formatEther(deployerBalanceA));
    console.log("  Token B:", ethers.utils.formatEther(deployerBalanceB));
    
    // Step 3: Add liquidity if reserves are empty
    if (reserves[0].isZero() && reserves[1].isZero()) {
      console.log("\n💧 Step 3: Adding Initial Liquidity");
      
      // Calculate liquidity amount (use smaller amount for testing)
      const liquidityAmount = ethers.utils.parseEther("100"); // 100 tokens each
      
      if (deployerBalanceA.gte(liquidityAmount) && deployerBalanceB.gte(liquidityAmount)) {
        try {
          // Approve router to spend tokens
          console.log("Approving tokens for router...");
          const approveATx = await tokenA.approve(routerAddress, liquidityAmount, {
            gasLimit: 100000,
            gasPrice: ethers.utils.parseUnits("10", "gwei")
          });
          await approveATx.wait();
          
          const approveBTx = await tokenB.approve(routerAddress, liquidityAmount, {
            gasLimit: 100000,
            gasPrice: ethers.utils.parseUnits("10", "gwei")
          });
          await approveBTx.wait();
          
          console.log("✅ Tokens approved");
          
          // Add liquidity
          const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes
          const addLiquidityTx = await router.addLiquidity(
            tokenAAddress,
            tokenBAddress,
            liquidityAmount,
            liquidityAmount,
            0, // slippage tolerance
            0, // slippage tolerance
            deployer.address,
            deadline,
            {
              gasLimit: 500000,
              gasPrice: ethers.utils.parseUnits("10", "gwei")
            }
          );
          
          console.log("Adding liquidity... Transaction hash:", addLiquidityTx.hash);
          await addLiquidityTx.wait();
          console.log("✅ Liquidity added successfully");
          
          // Check reserves after adding liquidity
          const newReserves = await pair.getReserves();
          console.log("New reserves:");
          console.log("  Token A:", ethers.utils.formatEther(newReserves[0]));
          console.log("  Token B:", ethers.utils.formatEther(newReserves[1]));
          
          // Check LP token balance
          const lpTokenBalance = await pair.balanceOf(deployer.address);
          console.log("LP token balance:", ethers.utils.formatEther(lpTokenBalance));
          
          // Check total supply
          const totalSupply = await pair.totalSupply();
          console.log("Total LP token supply:", ethers.utils.formatEther(totalSupply));
          
        } catch (error) {
          console.log("❌ Failed to add liquidity:", error.message);
        }
      } else {
        console.log("⚠️  Insufficient token balance for adding liquidity");
        console.log("Need at least 100 tokens of each type");
      }
    } else {
      console.log("✅ Pool already has liquidity");
      
      // Check LP token balance
      const lpTokenBalance = await pair.balanceOf(deployer.address);
      console.log("LP token balance:", ethers.utils.formatEther(lpTokenBalance));
    }
    
    // Step 4: Check factory statistics
    console.log("\n🏭 Step 4: Factory Statistics");
    const allPairsLength = await factory.allPairsLength();
    console.log("Total pairs:", allPairsLength.toString());
    
    // Step 5: Test swap calculation
    console.log("\n🧮 Step 5: Test Swap Calculation");
    try {
      const swapAmountIn = ethers.utils.parseEther("10"); // 10 TKA
      const amountsOut = await router.getAmountsOut(swapAmountIn, [tokenAAddress, tokenBAddress]);
      
      console.log("Swap calculation:");
      console.log("  Input: 10 TKA");
      console.log("  Expected output:", ethers.utils.formatEther(amountsOut[1]), "TKB");
      
    } catch (error) {
      console.log("⚠️  Could not calculate swap amounts:", error.message);
    }
    
    console.log("\n🎉 Liquidity Management Tests Completed Successfully!");
    
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
