const { ethers } = require("hardhat");

async function main() {
  console.log("🏭 Testing Trading Pair Creation on Sepolia...");
  
  const [deployer] = await ethers.getSigners();
  
  // Load deployment info
  const fs = require('fs');
  const deploymentInfo = JSON.parse(fs.readFileSync('deployment-sepolia.json', 'utf8'));
  
  const factoryAddress = deploymentInfo.contracts.factory;
  const tokenAAddress = deploymentInfo.contracts.tokenA;
  const tokenBAddress = deploymentInfo.contracts.tokenB;
  
  try {
    console.log("Testing trading pair creation...");
    console.log("Deployer:", deployer.address);
    console.log("Factory:", factoryAddress);
    console.log("Token A:", tokenAAddress);
    console.log("Token B:", tokenBAddress);
    
    // Get factory contract
    const factory = await ethers.getContractAt("LeafswapAMMFactory", factoryAddress);
    
    // Check if pair already exists
    console.log("\n📊 Step 1: Check if pair exists");
    const existingPair = await factory.getPair(tokenAAddress, tokenBAddress);
    
    if (existingPair !== ethers.constants.AddressZero) {
      console.log("✅ Trading pair already exists:", existingPair);
      return;
    }
    
    console.log("⚠️  Trading pair does not exist, creating...");
    
    // Try to create pair with minimal gas
    console.log("\n🏭 Step 2: Creating trading pair");
    try {
      const createPairTx = await factory.createPair(tokenAAddress, tokenBAddress, {
        gasLimit: 800000, // Even lower gas limit
        gasPrice: ethers.utils.parseUnits("8", "gwei") // Lower gas price
      });
      
      console.log("Creating pair... Transaction hash:", createPairTx.hash);
      console.log("Waiting for confirmation...");
      
      const receipt = await createPairTx.wait();
      console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
      
      // Get the new pair address
      const newPairAddress = await factory.getPair(tokenAAddress, tokenBAddress);
      console.log("✅ New pair address:", newPairAddress);
      
      // Check factory statistics
      const allPairsLength = await factory.allPairsLength();
      console.log("✅ Total pairs:", allPairsLength.toString());
      
      console.log("\n🎉 Trading pair created successfully!");
      
    } catch (error) {
      console.log("❌ Failed to create trading pair:", error.message);
      
      if (error.message.includes("insufficient funds")) {
        console.log("💡 Suggestion: Add more ETH to your account");
      } else if (error.message.includes("gas")) {
        console.log("💡 Suggestion: Try with even lower gas price");
      } else {
        console.log("💡 Suggestion: Check contract permissions and configuration");
      }
    }
    
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
