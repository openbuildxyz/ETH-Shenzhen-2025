const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Sepolia network connection and account balance...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("✅ Connected to Sepolia network");
    console.log("Account address:", deployer.address);
    
    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");
    
    if (balance.isZero()) {
      console.log("⚠️  Warning: Account has zero balance!");
      console.log("Please fund your account with Sepolia ETH from a faucet:");
      console.log("https://sepoliafaucet.com/");
      console.log("https://faucet.sepolia.dev/");
    } else if (balance.lt(ethers.utils.parseEther("0.01"))) {
      console.log("⚠️  Warning: Low balance! Consider adding more ETH for deployment.");
    } else {
      console.log("✅ Sufficient balance for deployment");
    }
    
    // Check network
    const network = await ethers.provider.getNetwork();
    console.log("Network chainId:", network.chainId);
    console.log("Expected chainId: 11155111 (Sepolia)");
    
    if (network.chainId === 11155111) {
      console.log("✅ Correct network: Sepolia");
    } else {
      console.log("❌ Wrong network! Expected Sepolia (11155111)");
    }
    
  } catch (error) {
    console.error("❌ Error connecting to Sepolia:", error.message);
    console.log("\nTroubleshooting:");
    console.log("1. Check your .env file has correct SEPOLIA_URL");
    console.log("2. Check your .env file has correct PRIVATE_KEY");
    console.log("3. Ensure you have internet connection");
    console.log("4. Try using a different RPC provider");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
