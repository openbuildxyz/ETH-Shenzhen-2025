const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying SubcriptionConsumer to Sepolia with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // 使用真实的Chainlink订阅ID
    const subscriptionId = "30867384965334728711427918226381771937390809014305130314753698149523927636152";

    // 部署SubcriptionConsumer
    const SubcriptionConsumer = await ethers.getContractFactory("SubcriptionConsumer");
    const subscriptionConsumer = await SubcriptionConsumer.deploy(subscriptionId);
    await subscriptionConsumer.deployed();

    console.log("SubcriptionConsumer deployed to:", subscriptionConsumer.address);
    console.log("Subscription ID:", subscriptionId);
    console.log("Network: Sepolia Testnet");

    // 保存部署信息
    const deploymentInfo = {
        network: "sepolia",
        subscriptionConsumer: subscriptionConsumer.address,
        subscriptionId: subscriptionId,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        explorer: `https://sepolia.etherscan.io/address/${subscriptionConsumer.address}`
    };

    console.log("\nDeployment info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // 验证部署
    console.log("\nVerifying deployment...");
    const deployedSubscriptionId = await subscriptionConsumer.s_subscriptionId();
    console.log("Deployed subscription ID:", deployedSubscriptionId.toString());
    
    if (deployedSubscriptionId.toString() === subscriptionId) {
        console.log("✅ Subscription ID verification successful!");
    } else {
        console.log("❌ Subscription ID verification failed!");
    }

    // 测试基本功能（可选）
    console.log("\nTesting basic functionality...");
    try {
        // 注意：这需要你的订阅有足够的LINK余额
        console.log("Requesting random words with LINK payment...");
        const tx = await subscriptionConsumer.requestRandomWords(false);
        console.log("Transaction hash:", tx.hash);
        
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);
        
        // 获取请求ID
        const lastRequestId = await subscriptionConsumer.lastRequestId();
        console.log("Request ID:", lastRequestId.toString());
        
        // 注意：Chainlink VRF需要时间来处理请求
        console.log("Note: Random words will be available after Chainlink VRF processes the request");
        console.log("You can check the status using getRequestStatus()");
        
    } catch (error) {
        console.error("Error testing functionality:", error.message);
        console.log("This might be due to insufficient LINK balance in your subscription");
        console.log("Please check your Chainlink VRF subscription at: https://vrf.chain.link/");
    }

    console.log("\n🎉 Deployment completed successfully!");
    console.log("Next steps:");
    console.log("1. Verify your subscription has sufficient LINK balance");
    console.log("2. Test random word requests");
    console.log("3. Monitor Chainlink VRF events");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
