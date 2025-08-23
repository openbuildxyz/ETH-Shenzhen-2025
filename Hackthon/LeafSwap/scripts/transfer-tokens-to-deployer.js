const { ethers } = require("hardhat");

async function main() {
  console.log("🪙 Transferring TKA and TKB tokens to deployer for frontend testing...");
  
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
    
    // Check current balances
    console.log("\n📊 Current Balances:");
    const deployerBalanceA = await tokenA.balanceOf(deployer.address);
    const deployerBalanceB = await tokenB.balanceOf(deployer.address);
    
    console.log("Deployer TKA balance:", ethers.utils.formatEther(deployerBalanceA));
    console.log("Deployer TKB balance:", ethers.utils.formatEther(deployerBalanceB));
    
    // Check total supply
    const totalSupplyA = await tokenA.totalSupply();
    const totalSupplyB = await tokenB.totalSupply();
    
    console.log("Total TKA supply:", ethers.utils.formatEther(totalSupplyA));
    console.log("Total TKB supply:", ethers.utils.formatEther(totalSupplyB));
    
    // Calculate transfer amounts (send 50% of total supply to deployer)
    const transferAmountA = totalSupplyA.div(2); // 50% of total supply
    const transferAmountB = totalSupplyB.div(2); // 50% of total supply
    
    console.log("\n🔄 Transferring tokens to deployer...");
    console.log("Transfer amount TKA:", ethers.utils.formatEther(transferAmountA));
    console.log("Transfer amount TKB:", ethers.utils.formatEther(transferAmountB));
    
    // Transfer TKA to deployer
    console.log("\n📤 Transferring TKA...");
    const transferATx = await tokenA.transfer(deployer.address, transferAmountA, {
      gasLimit: 100000,
      gasPrice: ethers.utils.parseUnits("10", "gwei")
    });
    
    console.log("TKA transfer transaction hash:", transferATx.hash);
    await transferATx.wait();
    console.log("✅ TKA transfer completed");
    
    // Transfer TKB to deployer
    console.log("\n📤 Transferring TKB...");
    const transferBTx = await tokenB.transfer(deployer.address, transferAmountB, {
      gasLimit: 100000,
      gasPrice: ethers.utils.parseUnits("10", "gwei")
    });
    
    console.log("TKB transfer transaction hash:", transferBTx.hash);
    await transferBTx.wait();
    console.log("✅ TKB transfer completed");
    
    // Check final balances
    console.log("\n📊 Final Balances:");
    const finalBalanceA = await tokenA.balanceOf(deployer.address);
    const finalBalanceB = await tokenB.balanceOf(deployer.address);
    
    console.log("Deployer TKA balance:", ethers.utils.formatEther(finalBalanceA));
    console.log("Deployer TKB balance:", ethers.utils.formatEther(finalBalanceB));
    
    // Calculate received amounts
    const receivedA = finalBalanceA.sub(deployerBalanceA);
    const receivedB = finalBalanceB.sub(deployerBalanceB);
    
    console.log("\n🎉 Transfer Summary:");
    console.log("TKA received:", ethers.utils.formatEther(receivedA));
    console.log("TKB received:", ethers.utils.formatEther(receivedB));
    
    console.log("\n🌐 Frontend Testing Info:");
    console.log("Deployer address for frontend:", deployer.address);
    console.log("TKA contract address:", tokenAAddress);
    console.log("TKB contract address:", tokenBAddress);
    console.log("TKA balance for testing:", ethers.utils.formatEther(finalBalanceA));
    console.log("TKB balance for testing:", ethers.utils.formatEther(finalBalanceB));
    
    console.log("\n💡 Frontend Testing Instructions:");
    console.log("1. Connect MetaMask to Sepolia network");
    console.log("2. Import deployer address as a new account");
    console.log("3. Add TKA and TKB tokens to MetaMask:");
    console.log("   - TKA: " + tokenAAddress);
    console.log("   - TKB: " + tokenBAddress);
    console.log("4. Test token swapping and liquidity management");
    
  } catch (error) {
    console.error("❌ Transfer failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
