const { ethers } = require("hardhat");

async function main() {
  console.log("🪙 Testing Token Transfer on Sepolia...");
  
  const [deployer] = await ethers.getSigners();
  
  // Load deployment info
  const fs = require('fs');
  const deploymentInfo = JSON.parse(fs.readFileSync('deployment-sepolia.json', 'utf8'));
  
  const tokenAAddress = deploymentInfo.contracts.tokenA;
  const tokenBAddress = deploymentInfo.contracts.tokenB;
  
  console.log("Testing with accounts:");
  console.log("Deployer:", deployer.address);
  
  try {
    // Get token contracts
    const tokenA = await ethers.getContractAt("TestToken", tokenAAddress);
    const tokenB = await ethers.getContractAt("TestToken", tokenBAddress);
    
    // Test 1: Check initial balances
    console.log("\n📊 Test 1: Initial Balances");
    const deployerBalanceA = await tokenA.balanceOf(deployer.address);
    const deployerBalanceB = await tokenB.balanceOf(deployer.address);
    
    console.log("Deployer TKA balance:", ethers.utils.formatEther(deployerBalanceA));
    console.log("Deployer TKB balance:", ethers.utils.formatEther(deployerBalanceB));
    
    // Test 2: Transfer tokens to a test address
    console.log("\n🔄 Test 2: Token Transfer");
    const testAddress = "0x1234567890123456789012345678901234567890";
    const transferAmount = ethers.utils.parseEther("10"); // Transfer 10 tokens
    
    // Transfer TKA to test address
    const tx1 = await tokenA.transfer(testAddress, transferAmount, {
      gasLimit: 100000,
      gasPrice: ethers.utils.parseUnits("15", "gwei")
    });
    await tx1.wait();
    console.log("✅ Transferred 10 TKA to test address");
    
    // Transfer TKB to test address
    const tx2 = await tokenB.transfer(testAddress, transferAmount, {
      gasLimit: 100000,
      gasPrice: ethers.utils.parseUnits("15", "gwei")
    });
    await tx2.wait();
    console.log("✅ Transferred 10 TKB to test address");
    
    // Test 3: Verify balances after transfer
    console.log("\n📊 Test 3: Balances After Transfer");
    const newDeployerBalanceA = await tokenA.balanceOf(deployer.address);
    const newDeployerBalanceB = await tokenB.balanceOf(deployer.address);
    const testAddressBalanceA = await tokenA.balanceOf(testAddress);
    const testAddressBalanceB = await tokenB.balanceOf(testAddress);
    
    console.log("Deployer TKA balance:", ethers.utils.formatEther(newDeployerBalanceA));
    console.log("Deployer TKB balance:", ethers.utils.formatEther(newDeployerBalanceB));
    console.log("Test address TKA balance:", ethers.utils.formatEther(testAddressBalanceA));
    console.log("Test address TKB balance:", ethers.utils.formatEther(testAddressBalanceB));
    
    console.log("\n🎉 Token Transfer Tests Completed Successfully!");
    
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
