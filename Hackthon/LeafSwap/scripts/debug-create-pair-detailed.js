const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Detailed Debug of createPair Function...");
  
  const [deployer] = await ethers.getSigners();
  
  // Load deployment info
  const fs = require('fs');
  const deploymentInfo = JSON.parse(fs.readFileSync('deployment-sepolia.json', 'utf8'));
  
  try {
    console.log("Deployer:", deployer.address);
    console.log("Factory:", deploymentInfo.contracts.factory);
    console.log("MEVGuard:", deploymentInfo.contracts.mevGuard);
    console.log("Token A:", deploymentInfo.contracts.tokenA);
    console.log("Token B:", deploymentInfo.contracts.tokenB);
    
    // Get contracts
    const factory = await ethers.getContractAt("LeafswapAMMFactory", deploymentInfo.contracts.factory);
    const mevGuard = await ethers.getContractAt("MEVGuard", deploymentInfo.contracts.mevGuard);
    
    // Step 1: Check if pair already exists
    console.log("\n📊 Step 1: Check existing pair");
    const existingPair = await factory.getPair(deploymentInfo.contracts.tokenA, deploymentInfo.contracts.tokenB);
    console.log("Existing pair:", existingPair);
    
    if (existingPair !== ethers.constants.AddressZero) {
      console.log("✅ Pair already exists!");
      return;
    }
    
    // Step 2: Check factory permissions
    console.log("\n🔐 Step 2: Check factory permissions");
    const factoryAuthorized = await mevGuard.factories(deploymentInfo.contracts.factory);
    console.log("Factory authorized in MEVGuard:", factoryAuthorized);
    
    // Step 3: Check factory configuration
    console.log("\n⚙️ Step 3: Check factory configuration");
    const factoryMEVGuard = await factory.MEVGuard();
    const feeToSetter = await factory.feeToSetter();
    console.log("Factory MEVGuard:", factoryMEVGuard);
    console.log("Factory fee to setter:", feeToSetter);
    
    // Step 4: Try to create pair with detailed error handling
    console.log("\n🏭 Step 4: Attempt to create pair");
    
    try {
      // First, let's try to estimate gas
      console.log("Estimating gas for createPair...");
      const gasEstimate = await factory.estimateGas.createPair(
        deploymentInfo.contracts.tokenA,
        deploymentInfo.contracts.tokenB
      );
      console.log("Estimated gas:", gasEstimate.toString());
      
      // Try with estimated gas + buffer
      const gasLimit = gasEstimate.mul(120).div(100); // 20% buffer
      console.log("Using gas limit:", gasLimit.toString());
      
      const createPairTx = await factory.createPair(
        deploymentInfo.contracts.tokenA,
        deploymentInfo.contracts.tokenB,
        {
          gasLimit: gasLimit,
          gasPrice: ethers.utils.parseUnits("10", "gwei")
        }
      );
      
      console.log("Creating pair... Transaction hash:", createPairTx.hash);
      console.log("Waiting for confirmation...");
      
      const receipt = await createPairTx.wait();
      console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
      console.log("Gas used:", receipt.gasUsed.toString());
      
      // Check if pair was created
      const newPair = await factory.getPair(deploymentInfo.contracts.tokenA, deploymentInfo.contracts.tokenB);
      console.log("New pair address:", newPair);
      
      if (newPair !== ethers.constants.AddressZero) {
        console.log("✅ Pair created successfully!");
        
        // Get pair info
        const pair = await ethers.getContractAt("LeafswapPair", newPair);
        const token0 = await pair.token0();
        const token1 = await pair.token1();
        const pairFactory = await pair.factory();
        
        console.log("Pair info:");
        console.log("  Token0:", token0);
        console.log("  Token1:", token1);
        console.log("  Factory:", pairFactory);
        
      } else {
        console.log("❌ Pair creation failed - no pair address returned");
      }
      
    } catch (error) {
      console.log("❌ Failed to create pair:", error.message);
      
      // Try to get more specific error information
      if (error.message.includes("execution reverted")) {
        console.log("💡 Error: Execution reverted - check contract logic");
        
        // Try to decode the error
        if (error.data) {
          console.log("Error data:", error.data);
        }
      } else if (error.message.includes("insufficient funds")) {
        console.log("💡 Error: Insufficient funds for gas");
      } else if (error.message.includes("gas")) {
        console.log("💡 Error: Gas-related issue");
      } else {
        console.log("💡 Error: Unknown error");
      }
      
      // Try with a simpler approach - just call without waiting
      console.log("\n🔄 Trying alternative approach...");
      try {
        const tx = await factory.createPair(
          deploymentInfo.contracts.tokenA,
          deploymentInfo.contracts.tokenB,
          {
            gasLimit: 2000000,
            gasPrice: ethers.utils.parseUnits("5", "gwei")
          }
        );
        
        console.log("Alternative transaction sent:", tx.hash);
        console.log("Check transaction status manually on Etherscan");
        
      } catch (altError) {
        console.log("Alternative approach also failed:", altError.message);
      }
    }
    
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
