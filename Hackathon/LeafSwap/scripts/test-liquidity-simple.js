const { ethers } = require("hardhat");

async function main() {
  console.log("💧 Testing Liquidity Management (Simplified) on Sepolia...");
  
  const [deployer] = await ethers.getSigners();
  
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
    
    console.log("Testing Liquidity Management with:");
    console.log("Factory:", factoryAddress);
    console.log("Router:", routerAddress);
    console.log("Token A:", tokenAAddress);
    console.log("Token B:", tokenBAddress);
    
    // Step 1: Check if trading pair exists
    console.log("\n📊 Step 1: Check Trading Pair");
    const pairAddress = await factory.getPair(tokenAAddress, tokenBAddress);
    
    if (pairAddress === ethers.constants.AddressZero) {
      console.log("⚠️  Trading pair does not exist");
      
      // Step 2: Try to create trading pair with lower gas
      console.log("\n🏭 Step 2: Creating Trading Pair");
      try {
        const createPairTx = await factory.createPair(tokenAAddress, tokenBAddress, {
          gasLimit: 1000000, // Reduced gas limit
          gasPrice: ethers.utils.parseUnits("10", "gwei") // Lower gas price
        });
        
        console.log("Creating pair... Transaction hash:", createPairTx.hash);
        await createPairTx.wait();
        console.log("✅ Trading pair created successfully");
        
        // Get the new pair address
        const newPairAddress = await factory.getPair(tokenAAddress, tokenBAddress);
        console.log("✅ New pair address:", newPairAddress);
        
      } catch (error) {
        console.log("❌ Failed to create trading pair:", error.message);
        console.log("This might be due to gas issues or insufficient balance");
        return;
      }
    } else {
      console.log("✅ Trading pair already exists:", pairAddress);
    }
    
    // Step 3: Get final pair address and check reserves
    console.log("\n📊 Step 3: Check Pair Status");
    const finalPairAddress = await factory.getPair(tokenAAddress, tokenBAddress);
    
    if (finalPairAddress !== ethers.constants.AddressZero) {
      const pair = await ethers.getContractAt("LeafswapPair", finalPairAddress);
      const reserves = await pair.getReserves();
      
      console.log("Pair address:", finalPairAddress);
      console.log("Reserves:");
      console.log("  Token A:", ethers.utils.formatEther(reserves[0]));
      console.log("  Token B:", ethers.utils.formatEther(reserves[1]));
      
      // Step 4: Check if we need to add liquidity
      if (reserves[0].isZero() && reserves[1].isZero()) {
        console.log("\n💧 Step 4: Adding Initial Liquidity");
        
        // Check balances
        const deployerBalanceA = await tokenA.balanceOf(deployer.address);
        const deployerBalanceB = await tokenB.balanceOf(deployer.address);
        
        console.log("Deployer balances:");
        console.log("  Token A:", ethers.utils.formatEther(deployerBalanceA));
        console.log("  Token B:", ethers.utils.formatEther(deployerBalanceB));
        
        // Use smaller amount for testing
        const liquidityAmount = ethers.utils.parseEther("50"); // 50 tokens each
        
        if (deployerBalanceA.gte(liquidityAmount) && deployerBalanceB.gte(liquidityAmount)) {
          try {
            // Approve router to spend tokens
            console.log("Approving tokens for router...");
            const approveATx = await tokenA.approve(routerAddress, liquidityAmount, {
              gasLimit: 80000,
              gasPrice: ethers.utils.parseUnits("10", "gwei")
            });
            await approveATx.wait();
            
            const approveBTx = await tokenB.approve(routerAddress, liquidityAmount, {
              gasLimit: 80000,
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
                gasLimit: 300000,
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
            
          } catch (error) {
            console.log("❌ Failed to add liquidity:", error.message);
          }
        } else {
          console.log("⚠️  Insufficient token balance for adding liquidity");
        }
      } else {
        console.log("✅ Pool already has liquidity");
      }
    }
    
    // Step 5: Check factory statistics
    console.log("\n🏭 Step 5: Factory Statistics");
    const allPairsLength = await factory.allPairsLength();
    console.log("Total pairs:", allPairsLength.toString());
    
    console.log("\n🎉 Liquidity Management Tests Completed!");
    
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
