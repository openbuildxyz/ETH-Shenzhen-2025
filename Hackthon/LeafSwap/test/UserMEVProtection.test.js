const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("User MEV Protection", function () {
    let mevGuard, owner, user1, user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // 部署MEVGuard
        const MEVGuard = await ethers.getContractFactory("MEVGuard");
        mevGuard = await MEVGuard.deploy(
            owner.address,
            100, // antiFrontDefendBlock
            100, // antiMEVFeePercentage
            50,  // antiMEVAmountOutLimitRate
            "0x0000000000000000000000000000000000000001" // Mock SubscriptionConsumer
        );
        await mevGuard.deployed();
    });

    describe("用户MEV保护管理", function () {
        it("应该正确设置和检查用户的MEV保护状态", async function () {
            // 初始状态应该是false
            expect(await mevGuard.isUserMEVEnabled(user1.address)).to.be.false;
            expect(await mevGuard.isUserMEVEnabled(user2.address)).to.be.false;

            // 设置用户1启用MEV保护
            await mevGuard.setUserMEVEnabled(user1.address, true);
            expect(await mevGuard.isUserMEVEnabled(user1.address)).to.be.true;
            expect(await mevGuard.isUserMEVEnabled(user2.address)).to.be.false;

            // 设置用户2启用MEV保护
            await mevGuard.setUserMEVEnabled(user2.address, true);
            expect(await mevGuard.isUserMEVEnabled(user1.address)).to.be.true;
            expect(await mevGuard.isUserMEVEnabled(user2.address)).to.be.true;

            // 禁用用户1的MEV保护
            await mevGuard.setUserMEVEnabled(user1.address, false);
            expect(await mevGuard.isUserMEVEnabled(user1.address)).to.be.false;
            expect(await mevGuard.isUserMEVEnabled(user2.address)).to.be.true;
        });

        it("应该允许任何用户设置自己的MEV保护状态", async function () {
            // 用户1设置自己的MEV保护状态
            await mevGuard.connect(user1).setUserMEVEnabled(user1.address, true);
            expect(await mevGuard.isUserMEVEnabled(user1.address)).to.be.true;

            // 用户2设置自己的MEV保护状态
            await mevGuard.connect(user2).setUserMEVEnabled(user2.address, true);
            expect(await mevGuard.isUserMEVEnabled(user2.address)).to.be.true;

            // 用户1禁用自己的MEV保护
            await mevGuard.connect(user1).setUserMEVEnabled(user1.address, false);
            expect(await mevGuard.isUserMEVEnabled(user1.address)).to.be.false;
        });

        it("应该正确处理多个用户的MEV保护状态", async function () {
            // 设置多个用户的MEV保护状态
            await mevGuard.setUserMEVEnabled(user1.address, true);
            await mevGuard.setUserMEVEnabled(user2.address, false);
            await mevGuard.setUserMEVEnabled(owner.address, true);

            // 验证状态
            expect(await mevGuard.isUserMEVEnabled(user1.address)).to.be.true;
            expect(await mevGuard.isUserMEVEnabled(user2.address)).to.be.false;
            expect(await mevGuard.isUserMEVEnabled(owner.address)).to.be.true;

            // 切换状态
            await mevGuard.setUserMEVEnabled(user1.address, false);
            await mevGuard.setUserMEVEnabled(user2.address, true);

            // 验证切换后的状态
            expect(await mevGuard.isUserMEVEnabled(user1.address)).to.be.false;
            expect(await mevGuard.isUserMEVEnabled(user2.address)).to.be.true;
            expect(await mevGuard.isUserMEVEnabled(owner.address)).to.be.true;
        });
    });

    describe("MEV保护逻辑集成", function () {
        it("应该正确检查用户MEV保护状态", async function () {
            // 设置用户启用MEV保护
            await mevGuard.setUserMEVEnabled(user1.address, true);
            await mevGuard.setUserMEVEnabled(user2.address, false);

            // 验证状态
            expect(await mevGuard.isUserMEVEnabled(user1.address)).to.be.true;
            expect(await mevGuard.isUserMEVEnabled(user2.address)).to.be.false;

            // 测试defend函数（简化版本）
            const reserves = ethers.utils.parseEther("1000");
            const smallAmount = ethers.utils.parseEther("1");

            // 用户1启用了MEV保护，应该进行保护检查
            // 用户2未启用MEV保护，应该跳过保护检查
            // 这里只是验证状态，实际的defend逻辑在完整的测试中验证
        });
    });
});
