const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🔗 Creating trading pair on Sepolia...");
  console.log("Deployer account:", deployer.address);

  // Load deployment info
  const fs = require('fs');
  let deploymentInfo;
  
  try {
    deploymentInfo = JSON.parse(fs.readFileSync('deployment-sepolia.json', 'utf8'));
  } catch (error) {
    console.error("❌ Could not load deployment-sepolia.json");
    console.log("Please run the deployment script first");
    return;
  }

  const factoryAddress = deploymentInfo.contracts.factory;
  const tokenAAddress = deploymentInfo.contracts.tokenA;
  const tokenBAddress = deploymentInfo.contracts.tokenB;

  console.log("Factory:", factoryAddress);
  console.log("Token A:", tokenAAddress);
  console.log("Token B:", tokenBAddress);

  try {
    // Get factory contract
    const factory = await ethers.getContractAt("LeafswapAMMFactory", factoryAddress);
    
    // Check if pair already exists
    const existingPair = await factory.getPair(tokenAAddress, tokenBAddress);
    if (existingPair !== ethers.constants.AddressZero) {
      console.log("✅ Trading pair already exists at:", existingPair);
      return;
    }

    console.log("Creating trading pair...");
    const createPairTx = await factory.createPair(tokenAAddress, tokenBAddress, {
      gasLimit: 2000000,
      gasPrice: ethers.utils.parseUnits("20", "gwei")
    });
    
    console.log("Transaction hash:", createPairTx.hash);
    await createPairTx.wait();
    
    const pairAddress = await factory.getPair(tokenAAddress, tokenBAddress);
    console.log("✅ Trading pair created successfully at:", pairAddress);
    console.log("Explorer:", `https://sepolia.etherscan.io/address/${pairAddress}`);

    // Update deployment info
    deploymentInfo.contracts.pair = pairAddress;
    fs.writeFileSync('deployment-sepolia.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Updated deployment-sepolia.json");

  } catch (error) {
    console.error("❌ Error creating trading pair:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Suggestions:");
      console.log("1. Add more ETH to your account");
      console.log("2. Try with lower gas price");
      console.log("3. Wait for network congestion to decrease");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
