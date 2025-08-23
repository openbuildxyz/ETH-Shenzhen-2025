const { ethers } = require("hardhat");

async function main() {
  console.log("💧 Testing Liquidity Management on Sepolia...");
  
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
    
    console.log("Testing Liquidity Management with:");
    console.log("Factory:", factoryAddress);
    console.log("Router:", routerAddress);
    console.log("Token A:", tokenAAddress);
    console.log("Token B:", tokenBAddress);
    
    // Test 1: Check if trading pair exists
    console.log("\n📊 Test 1: Trading Pair Check");
    const pairAddress = await factory.getPair(tokenAAddress, tokenBAddress);
    
    if (pairAddress === ethers.constants.AddressZero) {
      console.log("⚠️  Trading pair does not exist, creating it...");
      
      // Create trading pair
      const createPairTx = await factory.createPair(tokenAAddress, tokenBAddress, {
        gasLimit: 1500000,
        gasPrice: ethers.utils.parseUnits("15", "gwei")
      });
      await createPairTx.wait();
      console.log("✅ Trading pair created");
      
      // Get the new pair address
      const newPairAddress = await factory.getPair(tokenAAddress, tokenBAddress);
      console.log("✅ New pair address:", newPairAddress);
    } else {
      console.log("✅ Trading pair exists:", pairAddress);
    }
    
    // Get the final pair address
    const finalPairAddress = await factory.getPair(tokenAAddress, tokenBAddress);
    const pair = await ethers.getContractAt("LeafswapPair", finalPairAddress);
    
    // Test 2: Check initial reserves
    console.log("\n📊 Test 2: Initial Reserves");
    const initialReserves = await pair.getReserves();
    console.log("Initial reserves:");
    console.log("  Token A:", ethers.utils.formatEther(initialReserves[0]));
    console.log("  Token B:", ethers.utils.formatEther(initialReserves[1]));
    
    // Test 3: Add liquidity
    console.log("\n💧 Test 3: Adding Liquidity");
    
    // Check balances
    const deployerBalanceA = await tokenA.balanceOf(deployer.address);
    const deployerBalanceB = await tokenB.balanceOf(deployer.address);
    
    console.log("Deployer balances:");
    console.log("  Token A:", ethers.utils.formatEther(deployerBalanceA));
    console.log("  Token B:", ethers.utils.formatEther(deployerBalanceB));
    
    // Calculate liquidity amount (use smaller amount to avoid gas issues)
    const liquidityAmount = ethers.utils.parseEther("100"); // 100 tokens each
    
    if (deployerBalanceA.gte(liquidityAmount) && deployerBalanceB.gte(liquidityAmount)) {
      // Approve router to spend tokens
      console.log("Approving tokens for router...");
      const approveATx = await tokenA.approve(routerAddress, liquidityAmount, {
        gasLimit: 100000,
        gasPrice: ethers.utils.parseUnits("15", "gwei")
      });
      await approveATx.wait();
      
      const approveBTx = await tokenB.approve(routerAddress, liquidityAmount, {
        gasLimit: 100000,
        gasPrice: ethers.utils.parseUnits("15", "gwei")
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
          gasLimit: 400000,
          gasPrice: ethers.utils.parseUnits("15", "gwei")
        }
      );
      await addLiquidityTx.wait();
      console.log("✅ Liquidity added successfully");
      
      // Test 4: Check reserves after adding liquidity
      console.log("\n📊 Test 4: Reserves After Adding Liquidity");
      const newReserves = await pair.getReserves();
      console.log("New reserves:");
      console.log("  Token A:", ethers.utils.formatEther(newReserves[0]));
      console.log("  Token B:", ethers.utils.formatEther(newReserves[1]));
      
      // Test 5: Check LP token balance
      console.log("\n🪙 Test 5: LP Token Balance");
      const lpTokenBalance = await pair.balanceOf(deployer.address);
      console.log("LP token balance:", ethers.utils.formatEther(lpTokenBalance));
      
      // Test 6: Get total supply
      const totalSupply = await pair.totalSupply();
      console.log("Total LP token supply:", ethers.utils.formatEther(totalSupply));
      
    } else {
      console.log("⚠️  Insufficient token balance for adding liquidity");
      console.log("Need at least 100 tokens of each type");
    }
    
    // Test 7: Check factory statistics
    console.log("\n🏭 Test 7: Factory Statistics");
    const allPairsLength = await factory.allPairsLength();
    console.log("Total pairs:", allPairsLength.toString());
    
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
