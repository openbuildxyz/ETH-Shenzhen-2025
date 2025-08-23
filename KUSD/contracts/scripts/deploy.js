const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());
  console.log("Network:", hre.network.name);

  // Contract deployment parameters
  const USDK_NAME = "USDK Stablecoin";
  const USDK_SYMBOL = "USDK";

  // Role addresses (can be the same as deployer initially)
  const DEFAULT_ADMIN = deployer.address;
  const MINTER = deployer.address;
  const BURNER = deployer.address;
  const PAUSER = deployer.address;
  const ORACLE = deployer.address;

  console.log("\n=== Deploying USDK Token ===");
  
  // Deploy USDK
  const USDK = await hre.ethers.getContractFactory("USDK");
  const usdk = await USDK.deploy(
    USDK_NAME,
    USDK_SYMBOL,
    DEFAULT_ADMIN,
    MINTER,
    BURNER,
    PAUSER
  );

  await usdk.waitForDeployment();
  const usdkAddress = await usdk.getAddress();
  console.log("USDK deployed to:", usdkAddress);

  console.log("\n=== Deploying ProofRegistry ===");
  
  // Deploy ProofRegistry
  const ProofRegistry = await hre.ethers.getContractFactory("ProofRegistry");
  const proofRegistry = await ProofRegistry.deploy(DEFAULT_ADMIN, ORACLE);

  await proofRegistry.waitForDeployment();
  const proofRegistryAddress = await proofRegistry.getAddress();
  console.log("ProofRegistry deployed to:", proofRegistryAddress);

  // Verify initial setup
  console.log("\n=== Verifying Setup ===");
  
  console.log("USDK total supply:", await usdk.totalSupply());
  console.log("USDK decimals:", await usdk.decimals());
  console.log("ProofRegistry batch count:", await proofRegistry.getBatchCount());

  // Save deployment addresses to file
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    contracts: {
      USDK: {
        address: usdkAddress,
        constructorArgs: [USDK_NAME, USDK_SYMBOL, DEFAULT_ADMIN, MINTER, BURNER, PAUSER]
      },
      ProofRegistry: {
        address: proofRegistryAddress,
        constructorArgs: [DEFAULT_ADMIN, ORACLE]
      }
    },
    deployedAt: new Date().toISOString()
  };

  const fs = require('fs');
  const path = require('path');
  
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`\nDeployment info saved to: ${deploymentFile}`);
  
  console.log("\n=== Deployment Summary ===");
  console.log(`Network: ${hre.network.name}`);
  console.log(`USDK Token: ${usdkAddress}`);
  console.log(`ProofRegistry: ${proofRegistryAddress}`);
  console.log(`Deployer: ${deployer.address}`);

  // If on a testnet, mint some test tokens
  if (['localhost', 'hardhat', 'sepolia', 'arbitrumSepolia'].includes(hre.network.name)) {
    console.log("\n=== Minting Test Tokens ===");
    const testMintAmount = hre.ethers.parseUnits("1000000", 18); // 1M USDK
    
    try {
      const tx = await usdk.mint(deployer.address, testMintAmount);
      await tx.wait();
      console.log(`Minted ${hre.ethers.formatUnits(testMintAmount, 18)} USDK to ${deployer.address}`);
      console.log("New total supply:", hre.ethers.formatUnits(await usdk.totalSupply(), 18));
    } catch (error) {
      console.log("Test minting failed (this is expected on mainnet):", error.message);
    }
  }

  console.log("\n=== Next Steps ===");
  console.log("1. Update your backend configuration with the new contract addresses");
  console.log("2. Verify contracts on Etherscan if deploying to mainnet:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${usdkAddress} "${USDK_NAME}" "${USDK_SYMBOL}" "${DEFAULT_ADMIN}" "${MINTER}" "${BURNER}" "${PAUSER}"`);
  console.log(`   npx hardhat verify --network ${hre.network.name} ${proofRegistryAddress} "${DEFAULT_ADMIN}" "${ORACLE}"`);
  console.log("3. Configure proper multi-sig wallets for production");
  console.log("4. Test the integration with your backend API");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });