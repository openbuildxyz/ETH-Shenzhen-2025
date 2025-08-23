const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Token Distribution on Sepolia...");
  
  const [deployer] = await ethers.getSigners();
  
  // Load deployment info
  const fs = require('fs');
  const deploymentInfo = JSON.parse(fs.readFileSync('deployment-sepolia.json', 'utf8'));
  
  const tokenAAddress = deploymentInfo.contracts.tokenA;
  const tokenBAddress = deploymentInfo.contracts.tokenB;
  
  try {
    console.log("Deployer address:", deployer.address);
    console.log("Token A (TKA):", tokenAAddress);
    console.log("Token B (TKB):", tokenBAddress);
    
    // Get token contracts
    const tokenA = await ethers.getContractAt("TestToken", tokenAAddress);
    const tokenB = await ethers.getContractAt("TestToken", tokenBAddress);
    
    // Check token info
    console.log("\n📊 Token Information:");
    const tokenAName = await tokenA.name();
    const tokenASymbol = await tokenA.symbol();
    const tokenADecimals = await tokenA.decimals();
    const tokenATotalSupply = await tokenA.totalSupply();
    
    const tokenBName = await tokenB.name();
    const tokenBSymbol = await tokenB.symbol();
    const tokenBDecimals = await tokenB.decimals();
    const tokenBTotalSupply = await tokenB.totalSupply();
    
    console.log("TKA:", tokenAName, `(${tokenASymbol})`);
    console.log("  Decimals:", tokenADecimals.toString());
    console.log("  Total Supply:", ethers.utils.formatEther(tokenATotalSupply));
    
    console.log("TKB:", tokenBName, `(${tokenBSymbol})`);
    console.log("  Decimals:", tokenBDecimals.toString());
    console.log("  Total Supply:", ethers.utils.formatEther(tokenBTotalSupply));
    
    // Check deployer balances
    console.log("\n💰 Deployer Balances:");
    const deployerBalanceA = await tokenA.balanceOf(deployer.address);
    const deployerBalanceB = await tokenB.balanceOf(deployer.address);
    
    console.log("TKA balance:", ethers.utils.formatEther(deployerBalanceA));
    console.log("TKB balance:", ethers.utils.formatEther(deployerBalanceB));
    
    // Check pair contract balances (if liquidity was added)
    const pairAddress = deploymentInfo.contracts.pair;
    if (pairAddress && pairAddress !== "Not created yet") {
      console.log("\n🏊 Pair Contract Balances:");
      const pairBalanceA = await tokenA.balanceOf(pairAddress);
      const pairBalanceB = await tokenB.balanceOf(pairAddress);
      
      console.log("TKA in pair:", ethers.utils.formatEther(pairBalanceA));
      console.log("TKB in pair:", ethers.utils.formatEther(pairBalanceB));
    }
    
    // Calculate distribution percentages
    console.log("\n📈 Distribution Analysis:");
    const deployerPercentageA = deployerBalanceA.mul(10000).div(tokenATotalSupply);
    const deployerPercentageB = deployerBalanceB.mul(10000).div(tokenBTotalSupply);
    
    console.log("Deployer TKA ownership:", deployerPercentageA.toNumber() / 100, "%");
    console.log("Deployer TKB ownership:", deployerPercentageB.toNumber() / 100, "%");
    
    // Check if we need to transfer more tokens
    console.log("\n🎯 Frontend Testing Assessment:");
    
    if (deployerBalanceA.gte(ethers.utils.parseEther("1000")) && 
        deployerBalanceB.gte(ethers.utils.parseEther("1000"))) {
      console.log("✅ Deployer has sufficient tokens for frontend testing");
      console.log("   - TKA: " + ethers.utils.formatEther(deployerBalanceA) + " (sufficient)");
      console.log("   - TKB: " + ethers.utils.formatEther(deployerBalanceB) + " (sufficient)");
    } else {
      console.log("⚠️  Deployer may need more tokens for comprehensive testing");
    }
    
    console.log("\n🌐 Frontend Testing Setup:");
    console.log("1. MetaMask Network: Sepolia Testnet (Chain ID: 11155111)");
    console.log("2. Deployer Address:", deployer.address);
    console.log("3. TKA Contract:", tokenAAddress);
    console.log("4. TKB Contract:", tokenBAddress);
    console.log("5. Available TKA:", ethers.utils.formatEther(deployerBalanceA));
    console.log("6. Available TKB:", ethers.utils.formatEther(deployerBalanceB));
    
    console.log("\n💡 Testing Recommendations:");
    console.log("- Use small amounts (1-10 tokens) for initial testing");
    console.log("- Test both token swapping and liquidity management");
    console.log("- Verify MEV protection features work correctly");
    console.log("- Check that frontend displays correct balances");
    
  } catch (error) {
    console.error("❌ Check failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
