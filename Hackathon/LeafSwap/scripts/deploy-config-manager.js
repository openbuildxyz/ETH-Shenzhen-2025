const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 开始部署 ConfigManager 合约...");
    
    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log("📝 部署账户:", deployer.address);
    console.log("💰 账户余额:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");
    
    // 初始配置参数 (基点)
    const initialSwapFeeRate = 30;    // 0.3%
    const initialMaxSlippage = 500;   // 5%
    const initialMinLiquidity = ethers.utils.parseEther("0.1"); // 0.1 ETH
    
    console.log("📊 初始配置:");
    console.log("  - 交易手续费率:", initialSwapFeeRate / 100, "%");
    console.log("  - 最大滑点容忍度:", initialMaxSlippage / 100, "%");
    console.log("  - 最小流动性要求:", ethers.utils.formatEther(initialMinLiquidity), "ETH");
    
    try {
        // 部署 ConfigManager 合约
        console.log("\n🔨 部署 ConfigManager 合约...");
        const ConfigManager = await ethers.getContractFactory("ConfigManager");
        const configManager = await ConfigManager.deploy(
            initialSwapFeeRate,
            initialMaxSlippage,
            initialMinLiquidity,
            {
                gasLimit: 2000000,
                gasPrice: ethers.utils.parseUnits("2", "gwei")
            }
        );
        
        await configManager.deployed();
        console.log("✅ ConfigManager 合约部署成功!");
        console.log("📍 合约地址:", configManager.address);
        
        // 验证部署
        console.log("\n🔍 验证部署...");
        const config = await configManager.getConfig();
        console.log("📋 当前配置:");
        console.log("  - 交易手续费率:", config.swapFeeRate / 100, "%");
        console.log("  - 最大滑点容忍度:", config.maxSlippage / 100, "%");
        console.log("  - 最小流动性要求:", ethers.utils.formatEther(config.minLiquidity), "ETH");
        
        const isValid = await configManager.isConfigValid();
        console.log("✅ 配置有效性:", isValid);
        
        // 保存部署信息
        const deploymentInfo = {
            network: "sepolia",
            deployer: deployer.address,
            contractName: "ConfigManager",
            contractAddress: configManager.address,
            initialConfig: {
                swapFeeRate: initialSwapFeeRate,
                maxSlippage: initialMaxSlippage,
                minLiquidity: initialMinLiquidity.toString()
            },
            deploymentTime: new Date().toISOString(),
            explorerUrl: `https://sepolia.etherscan.io/address/${configManager.address}`
        };
        
        const fs = require('fs');
        fs.writeFileSync(
            'deployment-config-manager.json',
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log("\n📄 部署信息已保存到 deployment-config-manager.json");
        console.log("🔗 区块浏览器:", deploymentInfo.explorerUrl);
        
        // 更新 config.js 文件
        updateConfigFile(configManager.address);
        
    } catch (error) {
        console.error("❌ 部署失败:", error);
        process.exit(1);
    }
}

function updateConfigFile(configManagerAddress) {
    try {
        const fs = require('fs');
        const configPath = 'frontend/config.js';
        
        if (fs.existsSync(configPath)) {
            let configContent = fs.readFileSync(configPath, 'utf8');
            
            // 检查是否已经包含 configManager 地址
            if (!configContent.includes('configManager')) {
                // 在 sepolia 网络配置中添加 configManager 地址
                const sepoliaConfigRegex = /(sepolia:\s*{[^}]*)/;
                const replacement = `$1,\n        configManager: "${configManagerAddress}"`;
                
                if (sepoliaConfigRegex.test(configContent)) {
                    configContent = configContent.replace(sepoliaConfigRegex, replacement);
                    fs.writeFileSync(configPath, configContent);
                    console.log("✅ 已更新 frontend/config.js 文件");
                }
            } else {
                console.log("ℹ️  frontend/config.js 已包含 configManager 地址");
            }
        }
    } catch (error) {
        console.log("⚠️  更新 config.js 文件时出错:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
