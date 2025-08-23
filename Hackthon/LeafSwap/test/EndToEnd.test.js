const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Leafswap End-to-End Test", function () {
    let mevGuard, factory, router, weth, tokenA, tokenB, owner, user1, user2;
    let pair;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // 1. 部署WETH
        const WETH9 = await ethers.getContractFactory("WETH9");
        weth = await WETH9.deploy();
        await weth.deployed();
        console.log("✅ WETH deployed to:", weth.address);

        // 2. 部署MEVGuard
        const MEVGuard = await ethers.getContractFactory("MEVGuard");
        mevGuard = await MEVGuard.deploy(
            owner.address,
            100, // antiFrontDefendBlock
            100, // antiMEVFeePercentage
            50,  // antiMEVAmountOutLimitRate
            "0x0000000000000000000000000000000000000001" // 模拟的SubscriptionConsumer地址
        );
        await mevGuard.deployed();
        console.log("✅ MEVGuard deployed to:", mevGuard.address);

        // 3. 部署Factory
        const LeafswapAMMFactory = await ethers.getContractFactory("LeafswapAMMFactory");
        factory = await LeafswapAMMFactory.deploy(
            owner.address, // feeToSetter
            30, // swapFeeRate: 0.3%
            mevGuard.address // MEVGuard
        );
        await factory.deployed();
        console.log("✅ Factory deployed to:", factory.address);

        // 4. 设置工厂权限
        await mevGuard.setFactoryStatus(factory.address, true);
        console.log("✅ Factory permissions set");

        // 5. 部署Router
        const LeafswapRouter = await ethers.getContractFactory("LeafswapRouter");
        router = await LeafswapRouter.deploy(factory.address, weth.address);
        await router.deployed();
        console.log("✅ Router deployed to:", router.address);

        // 6. 部署测试代币
        const TestToken = await ethers.getContractFactory("TestToken");
        tokenA = await TestToken.deploy("TokenA", "TKA");
        tokenB = await TestToken.deploy("TokenB", "TKB");
        await tokenA.deployed();
        await tokenB.deployed();
        console.log("✅ Test tokens deployed:", tokenA.address, tokenB.address);

        // 7. 创建交易对
        await factory.createPair(tokenA.address, tokenB.address);
        const pairAddress = await factory.getPair(tokenA.address, tokenB.address);
        pair = await ethers.getContractAt("LeafswapPair", pairAddress);
        console.log("✅ Pair created at:", pairAddress);
    });

    describe("完整系统测试", function () {
        it("应该完成完整的流动性添加和交换流程", async function () {
            console.log("\n🔄 开始端到端测试...");

            // 1. 给用户分配代币
            const initialAmount = ethers.utils.parseEther("10000");
            await tokenA.transfer(user1.address, initialAmount);
            await tokenB.transfer(user1.address, initialAmount);
            console.log("✅ 代币分配完成");

            // 2. 用户授权Router使用代币
            await tokenA.connect(user1).approve(router.address, initialAmount);
            await tokenB.connect(user1).approve(router.address, initialAmount);
            console.log("✅ 代币授权完成");

            // 3. 添加流动性
            const liquidityAmount = ethers.utils.parseEther("1000");
            const deadline = Math.floor(Date.now() / 1000) + 300;

            await router.connect(user1).addLiquidity(
                tokenA.address,
                tokenB.address,
                liquidityAmount,
                liquidityAmount,
                0, // 最小流动性
                0, // 最小流动性
                user1.address,
                deadline
            );
            console.log("✅ 流动性添加完成");

            // 4. 验证流动性
            const user1Liquidity = await pair.balanceOf(user1.address);
            expect(user1Liquidity).to.be.gt(0);
            console.log("✅ 流动性验证通过，用户LP代币数量:", ethers.utils.formatEther(user1Liquidity));

            // 5. 获取储备量
            const [reserve0, reserve1] = await pair.getReserves();
            console.log("✅ 储备量:", {
                tokenA: ethers.utils.formatEther(reserve0),
                tokenB: ethers.utils.formatEther(reserve1)
            });

            // 6. 进行代币交换（使用较小的滑点）
            const swapAmount = ethers.utils.parseEther("100");
            const minAmountOut = ethers.utils.parseEther("90"); // 10%滑点

            await router.connect(user1).swapExactTokensForTokens(
                swapAmount,
                minAmountOut,
                [tokenA.address, tokenB.address],
                user1.address,
                deadline
            );
            console.log("✅ 代币交换完成");

            // 7. 验证交换结果
            const user1TokenBBalance = await tokenB.balanceOf(user1.address);
            expect(user1TokenBBalance).to.be.gt(0);
            console.log("✅ 交换验证通过，用户TokenB余额:", ethers.utils.formatEther(user1TokenBBalance));

            console.log("🎉 端到端测试完成！");
        });

        it("应该正确处理MEV保护功能", async function () {
            console.log("\n🛡️ 测试MEV保护功能...");

            // 1. 验证工厂权限
            const factoryStatus = await mevGuard.factories(factory.address);
            expect(factoryStatus).to.be.true;
            console.log("✅ 工厂权限验证通过");

            // 2. 验证MEV保护配置
            const antiFrontDefendBlock = await mevGuard.antiFrontDefendBlock();
            const antiMEVFeePercentage = await mevGuard.antiMEVFeePercentage();
            const antiMEVAmountOutLimitRate = await mevGuard.antiMEVAmountOutLimitRate();
            
            expect(antiFrontDefendBlock).to.equal(100);
            expect(antiMEVFeePercentage).to.equal(100);
            expect(antiMEVAmountOutLimitRate).to.equal(50);
            console.log("✅ MEV保护配置验证通过");

            console.log("🎉 MEV保护功能测试完成！");
        });

        it("应该正确处理费用和滑点", async function () {
            console.log("\n💰 测试费用和滑点...");

            // 1. 添加初始流动性
            const initialAmount = ethers.utils.parseEther("10000");
            await tokenA.transfer(user1.address, initialAmount);
            await tokenB.transfer(user1.address, initialAmount);
            await tokenA.connect(user1).approve(router.address, initialAmount);
            await tokenB.connect(user1).approve(router.address, initialAmount);

            const liquidityAmount = ethers.utils.parseEther("1000");
            const deadline = Math.floor(Date.now() / 1000) + 300;

            await router.connect(user1).addLiquidity(
                tokenA.address,
                tokenB.address,
                liquidityAmount,
                liquidityAmount,
                0,
                0,
                user1.address,
                deadline
            );

            // 2. 记录交换前余额
            const balanceBefore = await tokenB.balanceOf(user1.address);
            const swapAmount = ethers.utils.parseEther("100");

            // 3. 进行交换
            await router.connect(user1).swapExactTokensForTokens(
                swapAmount,
                0, // 接受任何滑点
                [tokenA.address, tokenB.address],
                user1.address,
                deadline
            );

            // 4. 验证滑点
            const balanceAfter = await tokenB.balanceOf(user1.address);
            const receivedAmount = balanceAfter.sub(balanceBefore);
            expect(receivedAmount).to.be.gt(0);
            console.log("✅ 滑点测试通过，收到代币数量:", ethers.utils.formatEther(receivedAmount));

            // 5. 验证费用
            const swapFeeRate = await factory.swapFeeRate();
            expect(swapFeeRate).to.equal(30); // 0.3%
            console.log("✅ 费用验证通过，交换费率:", swapFeeRate.toString());

            console.log("🎉 费用和滑点测试完成！");
        });
    });

    describe("错误处理测试", function () {
        it("应该正确处理无效的交换路径", async function () {
            const deadline = Math.floor(Date.now() / 1000) + 300;
            const swapAmount = ethers.utils.parseEther("100");

            await expect(
                router.connect(user1).swapExactTokensForTokens(
                    swapAmount,
                    0,
                    [tokenA.address], // 无效路径
                    user1.address,
                    deadline
                )
            ).to.be.reverted;
            console.log("✅ 无效路径错误处理正确");
        });

        it("应该正确处理过期的交易", async function () {
            const expiredDeadline = Math.floor(Date.now() / 1000) - 1; // 已过期
            const swapAmount = ethers.utils.parseEther("100");

            await expect(
                router.connect(user1).swapExactTokensForTokens(
                    swapAmount,
                    0,
                    [tokenA.address, tokenB.address],
                    user1.address,
                    expiredDeadline
                )
            ).to.be.revertedWith("LeafswapRouter: EXPIRED");
            console.log("✅ 过期交易错误处理正确");
        });
    });
});
