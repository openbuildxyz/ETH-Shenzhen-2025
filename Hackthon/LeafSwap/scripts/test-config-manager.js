const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 开始测试 ConfigManager 合约...");
    
    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log("📝 测试账户:", deployer.address);
    
    // 加载部署信息
    const fs = require('fs');
    let deploymentInfo;
    
    try {
        deploymentInfo = JSON.parse(fs.readFileSync('deployment-config-manager.json', 'utf8'));
        console.log("📄 加载部署信息:", deploymentInfo.contractAddress);
    } catch (error) {
        console.error("❌ 无法加载部署信息:", error.message);
        return;
    }
    
    try {
        // 创建合约实例
        const ConfigManager = await ethers.getContractFactory("ConfigManager");
        const configManager = ConfigManager.attach(deploymentInfo.contractAddress);
        
        console.log("\n🔍 测试 1: 获取当前配置");
        const currentConfig = await configManager.getConfig();
        console.log("📋 当前配置:");
        console.log("  - 交易手续费率:", currentConfig.swapFeeRate.toString(), "基点 (", (currentConfig.swapFeeRate / 100).toFixed(1), "%)");
        console.log("  - 最大滑点容忍度:", currentConfig.maxSlippage.toString(), "基点 (", (currentConfig.maxSlippage / 100).toFixed(1), "%)");
        console.log("  - 最小流动性要求:", ethers.utils.formatEther(currentConfig.minLiquidity), "ETH");
        
        console.log("\n🔍 测试 2: 检查配置有效性");
        const isValid = await configManager.isConfigValid();
        console.log("✅ 配置有效性:", isValid);
        
        console.log("\n🔍 测试 3: 获取合约所有者");
        const owner = await configManager.owner();
        console.log("👑 合约所有者:", owner);
        console.log("🔗 当前账户:", deployer.address);
        console.log("✅ 是否为所有者:", owner.toLowerCase() === deployer.address.toLowerCase());
        
        console.log("\n🔍 测试 4: 更新配置");
        const newSwapFeeRate = 50;    // 0.5%
        const newMaxSlippage = 800;   // 8%
        const newMinLiquidity = ethers.utils.parseEther("0.2"); // 0.2 ETH
        
        console.log("📝 新配置:");
        console.log("  - 交易手续费率:", newSwapFeeRate / 100, "%");
        console.log("  - 最大滑点容忍度:", newMaxSlippage / 100, "%");
        console.log("  - 最小流动性要求:", ethers.utils.formatEther(newMinLiquidity), "ETH");
        
        // 发送更新交易
        const tx = await configManager.updateConfig(
            newSwapFeeRate,
            newMaxSlippage,
            newMinLiquidity,
            {
                gasLimit: 300000,
                gasPrice: ethers.utils.parseUnits("2", "gwei")
            }
        );
        
        console.log("📤 交易已发送:", tx.hash);
        
        // 等待确认
        const receipt = await tx.wait();
        console.log("✅ 交易已确认，区块号:", receipt.blockNumber);
        
        console.log("\n🔍 测试 5: 验证更新后的配置");
        const updatedConfig = await configManager.getConfig();
        console.log("📋 更新后的配置:");
        console.log("  - 交易手续费率:", updatedConfig.swapFeeRate.toString(), "基点 (", (updatedConfig.swapFeeRate / 100).toFixed(1), "%)");
        console.log("  - 最大滑点容忍度:", updatedConfig.maxSlippage.toString(), "基点 (", (updatedConfig.maxSlippage / 100).toFixed(1), "%)");
        console.log("  - 最小流动性要求:", ethers.utils.formatEther(updatedConfig.minLiquidity), "ETH");
        
        // 验证更新是否成功
        const updateSuccess = 
            updatedConfig.swapFeeRate.eq(newSwapFeeRate) &&
            updatedConfig.maxSlippage.eq(newMaxSlippage) &&
            updatedConfig.minLiquidity.eq(newMinLiquidity);
        
        console.log("✅ 配置更新验证:", updateSuccess ? "成功" : "失败");
        
        console.log("\n🔍 测试 6: 测试无效配置（应该失败）");
        try {
            const invalidTx = await configManager.updateConfig(
                1500, // 15% - 超过最大值
                800,
                newMinLiquidity,
                {
                    gasLimit: 300000,
                    gasPrice: ethers.utils.parseUnits("2", "gwei")
                }
            );
            console.log("❌ 测试失败：应该拒绝无效配置");
        } catch (error) {
            console.log("✅ 正确拒绝了无效配置:", error.message.includes("swap fee rate too high"));
        }
        
        console.log("\n🎉 ConfigManager 合约测试完成!");
        console.log("🔗 合约地址:", deploymentInfo.contractAddress);
        console.log("🔗 区块浏览器:", deploymentInfo.explorerUrl);
        
    } catch (error) {
        console.error("❌ 测试失败:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
