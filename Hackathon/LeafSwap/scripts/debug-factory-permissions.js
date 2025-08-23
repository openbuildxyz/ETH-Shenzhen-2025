const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Debugging Factory Permissions...");
  
  const [deployer] = await ethers.getSigners();
  
  // Load deployment info
  const fs = require('fs');
  const deploymentInfo = JSON.parse(fs.readFileSync('deployment-sepolia.json', 'utf8'));
  
  try {
    console.log("Deployer:", deployer.address);
    console.log("Factory:", deploymentInfo.contracts.factory);
    console.log("MEVGuard:", deploymentInfo.contracts.mevGuard);
    
    // Get contracts
    const mevGuard = await ethers.getContractAt("MEVGuard", deploymentInfo.contracts.mevGuard);
    const factory = await ethers.getContractAt("LeafswapAMMFactory", deploymentInfo.contracts.factory);
    
    // Check 1: MEVGuard owner
    console.log("\n🔐 Check 1: MEVGuard Owner");
    const mevGuardOwner = await mevGuard.owner();
    console.log("MEVGuard owner:", mevGuardOwner);
    console.log("Deployer is owner:", mevGuardOwner === deployer.address ? "✅" : "❌");
    
    // Check 2: Factory authorization in MEVGuard
    console.log("\n🏭 Check 2: Factory Authorization in MEVGuard");
    const factoryAuthorized = await mevGuard.factories(deploymentInfo.contracts.factory);
    console.log("Factory authorized:", factoryAuthorized);
    
    if (!factoryAuthorized) {
      console.log("❌ Factory is not authorized in MEVGuard!");
      console.log("This is likely the cause of the createPair failure.");
      
      // Try to authorize the factory
      console.log("\n🔧 Attempting to authorize factory...");
      try {
        const authorizeTx = await mevGuard.setFactoryStatus(deploymentInfo.contracts.factory, true, {
          gasLimit: 100000,
          gasPrice: ethers.utils.parseUnits("10", "gwei")
        });
        
        console.log("Authorizing factory... Transaction hash:", authorizeTx.hash);
        await authorizeTx.wait();
        console.log("✅ Factory authorized successfully!");
        
        // Verify authorization
        const newFactoryAuthorized = await mevGuard.factories(deploymentInfo.contracts.factory);
        console.log("Factory authorized (after):", newFactoryAuthorized);
        
      } catch (error) {
        console.log("❌ Failed to authorize factory:", error.message);
      }
    } else {
      console.log("✅ Factory is already authorized");
    }
    
    // Check 3: Factory MEVGuard address
    console.log("\n🔄 Check 3: Factory MEVGuard Address");
    const factoryMEVGuard = await factory.MEVGuard();
    console.log("Factory MEVGuard:", factoryMEVGuard);
    console.log("Expected MEVGuard:", deploymentInfo.contracts.mevGuard);
    console.log("Addresses match:", factoryMEVGuard === deploymentInfo.contracts.mevGuard ? "✅" : "❌");
    
    // Check 4: Factory feeToSetter
    console.log("\n💰 Check 4: Factory Fee To Setter");
    const feeToSetter = await factory.feeToSetter();
    console.log("Fee to setter:", feeToSetter);
    console.log("Deployer is fee to setter:", feeToSetter === deployer.address ? "✅" : "❌");
    
    // Check 5: Test createPair with debug info
    console.log("\n🧪 Check 5: Test createPair with debug info");
    const tokenA = deploymentInfo.contracts.tokenA;
    const tokenB = deploymentInfo.contracts.tokenB;
    
    console.log("Token A:", tokenA);
    console.log("Token B:", tokenB);
    
    // Check if pair already exists
    const existingPair = await factory.getPair(tokenA, tokenB);
    console.log("Existing pair:", existingPair);
    
    if (existingPair === ethers.constants.AddressZero) {
      console.log("Pair does not exist, attempting to create...");
      
      try {
        const createPairTx = await factory.createPair(tokenA, tokenB, {
          gasLimit: 1000000,
          gasPrice: ethers.utils.parseUnits("10", "gwei")
        });
        
        console.log("Creating pair... Transaction hash:", createPairTx.hash);
        await createPairTx.wait();
        console.log("✅ Pair created successfully!");
        
        const newPair = await factory.getPair(tokenA, tokenB);
        console.log("New pair address:", newPair);
        
      } catch (error) {
        console.log("❌ Failed to create pair:", error.message);
        
        // Try to get more detailed error info
        if (error.message.includes("PermissionDenied")) {
          console.log("💡 Error: Permission denied - Factory not authorized in MEVGuard");
        } else if (error.message.includes("insufficient funds")) {
          console.log("💡 Error: Insufficient funds for gas");
        } else {
          console.log("💡 Error: Unknown error, check contract logic");
        }
      }
    } else {
      console.log("✅ Pair already exists");
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
