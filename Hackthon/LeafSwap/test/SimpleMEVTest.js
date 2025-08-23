const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Simple MEV Test", function () {
    let mevGuard, owner, factory;
    
    beforeEach(async function () {
        [owner, factory] = await ethers.getSigners();
        
        // 部署MEVGuard
        const MEVGuard = await ethers.getContractFactory("MEVGuard");
        mevGuard = await MEVGuard.deploy(
            owner.address,
            100, // antiFrontDefendBlock: 100个区块
            100, // antiMEVFeePercentage: 1%
            50,  // antiMEVAmountOutLimitRate: 0.5%
            "0x0000000000000000000000000000000000000001" // 模拟的SubscriptionConsumer地址
        );
    });
    
    describe("基础功能", function () {
        it("应该正确设置初始参数", async function () {
            expect(await mevGuard.antiFrontDefendBlock()).to.equal(100);
            expect(await mevGuard.antiMEVFeePercentage()).to.equal(100);
            expect(await mevGuard.antiMEVAmountOutLimitRate()).to.equal(50);
        });
        
        it("应该正确设置工厂权限", async function () {
            const factoryAddress = "0x1234567890123456789012345678901234567890";
            await mevGuard.setFactoryStatus(factoryAddress, true);
            expect(await mevGuard.factories(factoryAddress)).to.be.true;
        });
        
        it("应该正确设置防抢跑边界", async function () {
            const pairAddress = "0x1234567890123456789012345678901234567890";
            const startBlock = 1000;
            
            // 首先设置工厂权限
            await mevGuard.setFactoryStatus(factory.address, true);
            
            // 然后通过工厂调用设置防抢跑边界
            await mevGuard.connect(factory).setAntiFrontDefendBlockEdge(pairAddress, startBlock);
            expect(await mevGuard.antiFrontDefendBlockEdges(pairAddress)).to.equal(startBlock + 100);
        });
    });
    
    describe("权限管理", function () {
        it("只有所有者可以修改配置参数", async function () {
            const [owner, user1] = await ethers.getSigners();
            
            // 所有者可以修改
            await mevGuard.setAntiFrontDefendBlock(200);
            expect(await mevGuard.antiFrontDefendBlock()).to.equal(200);
            
            // 非所有者不能修改
            await expect(
                mevGuard.connect(user1).setAntiFrontDefendBlock(300)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});
