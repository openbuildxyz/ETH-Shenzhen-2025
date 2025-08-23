const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying SubcriptionConsumer with account:", deployer.address);

    // 使用真实的Chainlink订阅ID
    const subscriptionId = "30867384965334728711427918226381771937390809014305130314753698149523927636152";

    // 部署SubcriptionConsumer
    const SubcriptionConsumer = await ethers.getContractFactory("SubcriptionConsumer");
    const subscriptionConsumer = await SubcriptionConsumer.deploy(subscriptionId);
    await subscriptionConsumer.deployed();

    console.log("SubcriptionConsumer deployed to:", subscriptionConsumer.address);
    console.log("Subscription ID:", subscriptionId);

    // 保存部署信息
    const deploymentInfo = {
        network: "localhost",
        subscriptionConsumer: subscriptionConsumer.address,
        subscriptionId: subscriptionId,
        deployer: deployer.address,
        timestamp: new Date().toISOString()
    };

    console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));

    // 测试基本功能
    console.log("\nTesting basic functionality...");
    
    try {
        // 测试请求随机数（使用LINK支付）
        console.log("Requesting random words with LINK payment...");
        const tx1 = await subscriptionConsumer.requestRandomWords(false);
        await tx1.wait();
        console.log("Random words request sent successfully");

        // 测试请求随机数（使用原生代币支付）
        console.log("Requesting random words with native payment...");
        const tx2 = await subscriptionConsumer.requestRandomWords(true);
        await tx2.wait();
        console.log("Random words request with native payment sent successfully");

        // 获取请求状态
        const lastRequestId = await subscriptionConsumer.lastRequestId();
        console.log("Last request ID:", lastRequestId.toString());

        const requestStatus = await subscriptionConsumer.getRequestStatus(lastRequestId);
        console.log("Request status:", {
            fulfilled: requestStatus.fulfilled,
            randomWords: requestStatus.randomWords.map(w => w.toString())
        });

    } catch (error) {
        console.error("Error testing functionality:", error.message);
        console.log("Note: This is expected if you don't have a valid subscription ID or LINK tokens");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
