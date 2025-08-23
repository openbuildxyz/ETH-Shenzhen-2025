const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying Leafswap with MEV protection using account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    try {
        // 1. 部署MEV保护合约
        console.log("\n1. Deploying MEVGuard...");
        const MEVGuard = await ethers.getContractFactory("MEVGuard");
        
        // 配置参数：
        // - 防抢跑保护期：100个区块（约20分钟）
        // - MEV手续费：1%（100个基点）
        // - 最小交易规模：0.5%（50个基点）
        // - 使用模拟的SubscriptionConsumer地址（实际部署时需要真实地址）
        const antiFrontDefendBlock = 100;
        const antiMEVFeePercentage = 100; // 1%
        const antiMEVAmountOutLimitRate = 50; // 0.5%
        const mockSubscriptionConsumer = "0x0000000000000000000000000000000000000001"; // 临时地址
        
        const mevGuard = await MEVGuard.deploy(
            deployer.address,
            antiFrontDefendBlock,
            antiMEVFeePercentage,
            antiMEVAmountOutLimitRate,
            mockSubscriptionConsumer
        );
        await mevGuard.deployed();
        console.log("MEVGuard deployed to:", mevGuard.address);

        // 2. 部署增强版工厂合约
        console.log("\n2. Deploying LeafswapAMMFactory...");
        const LeafswapAMMFactory = await ethers.getContractFactory("LeafswapAMMFactory");
        const factory = await LeafswapAMMFactory.deploy(
            deployer.address, // feeToSetter
            30, // swapFeeRate: 0.3% (30个基点)
            mevGuard.address // MEVGuard地址
        );
        await factory.deployed();
        console.log("LeafswapAMMFactory deployed to:", factory.address);

        // 3. 设置MEVGuard的工厂权限
        console.log("\n3. Setting factory permissions in MEVGuard...");
        await mevGuard.setFactoryStatus(factory.address, true);
        console.log("Factory permissions set in MEVGuard");

        // 4. 部署测试代币
        console.log("\n4. Deploying test tokens...");
        const TestToken = await ethers.getContractFactory("TestToken");
        const tokenA = await TestToken.deploy("Test Token A", "TKA");
        await tokenA.deployed();
        console.log("Token A deployed to:", tokenA.address);

        const tokenB = await TestToken.deploy("Test Token B", "TKB");
        await tokenB.deployed();
        console.log("Token B deployed to:", tokenB.address);

        // 5. 创建交易对
        console.log("\n5. Creating trading pair...");
        const tx = await factory.createPair(tokenA.address, tokenB.address);
        const receipt = await tx.wait();
        
        // 从事件中获取pair地址
        const pairCreatedEvent = receipt.events?.find(e => e.event === 'PairCreated');
        const pairAddress = pairCreatedEvent?.args?.pair;
        console.log("Trading pair created at:", pairAddress);

        // 6. 部署路由器（可选，用于前端交互）
        console.log("\n6. Deploying Router...");
        const LeafswapRouter = await ethers.getContractFactory("LeafswapRouter");
        const router = await LeafswapRouter.deploy(factory.address, "0x0000000000000000000000000000000000000000"); // 使用零地址作为WETH
        await router.deployed();
        console.log("Router deployed to:", router.address);

        // 7. 验证部署
        console.log("\n7. Verifying deployment...");
        const pairCount = await factory.allPairsLength();
        console.log("Total pairs:", pairCount.toString());
        
        const mevGuardAddress = await factory.MEVGuard();
        console.log("MEVGuard in factory:", mevGuardAddress);
        
        const swapFeeRate = await factory.swapFeeRate();
        console.log("Swap fee rate:", swapFeeRate.toString(), "basis points");

        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Network:", network.name);
        console.log("Deployer:", deployer.address);
        console.log("MEVGuard:", mevGuard.address);
        console.log("Factory:", factory.address);
        console.log("Router:", router.address);
        console.log("Token A:", tokenA.address);
        console.log("Token B:", tokenB.address);
        console.log("Trading Pair:", pairAddress);
        
        console.log("\n=== MEV PROTECTION CONFIG ===");
        console.log("Anti-Front-Running Blocks:", antiFrontDefendBlock);
        console.log("MEV Fee Percentage:", antiMEVFeePercentage, "basis points");
        console.log("Min Transaction Size:", antiMEVAmountOutLimitRate, "basis points");
        
        console.log("\n=== NEXT STEPS ===");
        console.log("1. Update frontend configuration with new contract addresses");
        console.log("2. Test MEV protection with small transactions");
        console.log("3. Verify protection period behavior");
        console.log("4. Test Anti-MEV mode after protection period ends");
        
        // 保存部署信息到文件
        const deploymentInfo = {
            network: network.name,
            deployer: deployer.address,
            contracts: {
                mevGuard: mevGuard.address,
                factory: factory.address,
                router: router.address,
                tokenA: tokenA.address,
                tokenB: tokenB.address,
                pair: pairAddress
            },
            config: {
                antiFrontDefendBlock,
                antiMEVFeePercentage,
                antiMEVAmountOutLimitRate,
                swapFeeRate: swapFeeRate.toString()
            },
            timestamp: new Date().toISOString()
        };
        
        const fs = require('fs');
        fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
        console.log("\nDeployment info saved to deployment-info.json");

    } catch (error) {
        console.error("Deployment failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
