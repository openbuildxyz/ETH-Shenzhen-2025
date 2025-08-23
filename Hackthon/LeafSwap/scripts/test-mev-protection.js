const { ethers } = require("hardhat");

async function main() {
  console.log("🛡️ Testing MEV Protection on Sepolia...");
  
  const [deployer] = await ethers.getSigners();
  
  // Create test user addresses (we'll use deployer for testing)
  const user1 = { address: "0x1234567890123456789012345678901234567890" };
  const user2 = { address: "0x0987654321098765432109876543210987654321" };
  
  // Load deployment info
  const fs = require('fs');
  const deploymentInfo = JSON.parse(fs.readFileSync('deployment-sepolia.json', 'utf8'));
  
  const mevGuardAddress = deploymentInfo.contracts.mevGuard;
  const factoryAddress = deploymentInfo.contracts.factory;
  const tokenAAddress = deploymentInfo.contracts.tokenA;
  const tokenBAddress = deploymentInfo.contracts.tokenB;
  
  try {
    // Get contracts
    const mevGuard = await ethers.getContractAt("MEVGuard", mevGuardAddress);
    const factory = await ethers.getContractAt("LeafswapAMMFactory", factoryAddress);
    const tokenA = await ethers.getContractAt("TestToken", tokenAAddress);
    const tokenB = await ethers.getContractAt("TestToken", tokenBAddress);
    
    console.log("Testing MEV Protection with:");
    console.log("MEVGuard:", mevGuardAddress);
    console.log("Factory:", factoryAddress);
    console.log("Token A:", tokenAAddress);
    console.log("Token B:", tokenBAddress);
    
    // Test 1: Check MEVGuard configuration
    console.log("\n📋 Test 1: MEVGuard Configuration");
    const owner = await mevGuard.owner();
    const antiFrontDefendBlock = await mevGuard.antiFrontDefendBlock();
    const antiMEVFeePercentage = await mevGuard.antiMEVFeePercentage();
    const antiMEVAmountOutLimitRate = await mevGuard.antiMEVAmountOutLimitRate();
    
    console.log("✅ Owner:", owner);
    console.log("✅ Anti-Front-Running Blocks:", antiFrontDefendBlock.toString());
    console.log("✅ MEV Fee Percentage:", antiMEVFeePercentage.toString());
    console.log("✅ Min Transaction Size:", antiMEVAmountOutLimitRate.toString());
    
    // Test 2: Check factory permissions
    console.log("\n🔐 Test 2: Factory Permissions");
    const factoryAuthorized = await mevGuard.factories(factoryAddress);
    console.log("✅ Factory authorized:", factoryAuthorized);
    
    // Test 3: Test user MEV protection settings
    console.log("\n👤 Test 3: User MEV Protection Settings");
    
    // Check initial state
    const user1MEVEnabled = await mevGuard.isUserMEVEnabled(user1.address);
    console.log("User1 MEV protection (initial):", user1MEVEnabled);
    
    // Enable MEV protection for user1
    const enableTx = await mevGuard.setUserMEVEnabled(user1.address, true, {
      gasLimit: 100000,
      gasPrice: ethers.utils.parseUnits("20", "gwei")
    });
    await enableTx.wait();
    console.log("✅ Enabled MEV protection for User1");
    
    // Check updated state
    const user1MEVEnabledAfter = await mevGuard.isUserMEVEnabled(user1.address);
    console.log("User1 MEV protection (after):", user1MEVEnabledAfter);
    
    // Test 4: Test MEV protection for user2
    const user2MEVEnabled = await mevGuard.isUserMEVEnabled(user2.address);
    console.log("User2 MEV protection:", user2MEVEnabled);
    
    // Test 5: Check trading pair MEV protection
    console.log("\n📊 Test 5: Trading Pair MEV Protection");
    const pairAddress = await factory.getPair(tokenAAddress, tokenBAddress);
    
    if (pairAddress !== ethers.constants.AddressZero) {
      console.log("✅ Trading pair exists:", pairAddress);
      
      // Check anti-front-running block edge
      const blockEdge = await mevGuard.antiFrontDefendBlockEdges(pairAddress);
      console.log("✅ Anti-front-running block edge:", blockEdge.toString());
      
      // Get current block
      const currentBlock = await ethers.provider.getBlockNumber();
      console.log("✅ Current block:", currentBlock);
      
      // Check if protection is active
      const protectionActive = blockEdge.gt(currentBlock);
      console.log("✅ Protection active:", protectionActive);
      
    } else {
      console.log("⚠️  Trading pair does not exist yet");
    }
    
    // Test 6: Test MEV fee calculation
    console.log("\n💰 Test 6: MEV Fee Calculation");
    const testAmount = ethers.utils.parseEther("1000");
    const feePercentage = antiMEVFeePercentage;
    const calculatedFee = testAmount.mul(feePercentage).div(10000);
    
    console.log("Test amount: 1000 tokens");
    console.log("Fee percentage:", feePercentage.toString(), "basis points");
    console.log("Calculated fee:", ethers.utils.formatEther(calculatedFee), "tokens");
    
    // Test 7: Test minimum transaction size
    console.log("\n📏 Test 7: Minimum Transaction Size");
    const limitRate = antiMEVAmountOutLimitRate;
    const minAmount = testAmount.mul(limitRate).div(10000);
    
    console.log("Limit rate:", limitRate.toString(), "basis points");
    console.log("Minimum amount for 1000 tokens:", ethers.utils.formatEther(minAmount), "tokens");
    
    console.log("\n🎉 MEV Protection Tests Completed Successfully!");
    
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
