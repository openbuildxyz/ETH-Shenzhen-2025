const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  const network = hre.network.name;
  console.log(`Verifying contracts on ${network}...`);

  // Load deployment info
  const deploymentFile = path.join(__dirname, '../deployments', `${network}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.error(`Deployment file not found: ${deploymentFile}`);
    console.log("Please run deployment script first.");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  
  console.log("Loaded deployment info:");
  console.log(`- Network: ${deployment.network}`);
  console.log(`- USDK: ${deployment.contracts.USDK.address}`);
  console.log(`- ProofRegistry: ${deployment.contracts.ProofRegistry.address}`);

  try {
    console.log("\n=== Verifying USDK Contract ===");
    await hre.run("verify:verify", {
      address: deployment.contracts.USDK.address,
      constructorArguments: deployment.contracts.USDK.constructorArgs,
    });
    console.log("✅ USDK contract verified successfully");
  } catch (error) {
    console.error("❌ USDK verification failed:", error.message);
  }

  try {
    console.log("\n=== Verifying ProofRegistry Contract ===");
    await hre.run("verify:verify", {
      address: deployment.contracts.ProofRegistry.address,
      constructorArguments: deployment.contracts.ProofRegistry.constructorArgs,
    });
    console.log("✅ ProofRegistry contract verified successfully");
  } catch (error) {
    console.error("❌ ProofRegistry verification failed:", error.message);
  }

  console.log("\n=== Verification Complete ===");
  console.log("Check the contract pages on the block explorer for verification status.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });