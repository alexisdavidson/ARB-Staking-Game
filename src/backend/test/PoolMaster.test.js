const { expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => parseInt(ethers.utils.formatEther(num))

describe("PoolMaster", async function() {
    let deployer, addr1, addr2, poolMaster, udsc, token

    beforeEach(async function() {
        const PoolMaster = await ethers.getContractFactory("PoolMaster");
        const Usdc = await ethers.getContractFactory("Erc20Usdc");
        const Token = await ethers.getContractFactory("Token");

        [deployer, addr1, addr2, addr3] = await ethers.getSigners();

        usdc = await Usdc.deploy();
        token = await Token.deploy();
        const usdcAddress = usdc.address
        const tokenAddress = token.address
        poolMaster = await PoolMaster.deploy();
        
        await poolMaster.connect(deployer).setTokenAddress(tokenAddress);
        await poolMaster.connect(deployer).setUsdcAddress(usdcAddress);
        
        await token.connect(deployer).transfer(addr1.address, 10_000);
        await token.connect(deployer).transfer(addr2.address, 10_000);
        await token.connect(deployer).transfer(addr3.address, 10_000);
    });

    describe("Basic functions", function() {
        it("Should stake", async function() {
            expect(await poolMaster.usdc()).to.equal(usdc.address);

            await expect(poolMaster.connect(deployer).stake(0, 10_000, true)).to.be.revertedWith("Epoch not started yet");
            await poolMaster.connect(deployer).startEpoch("ARB", "ETH");

            await expect(poolMaster.connect(deployer).stake(3, 0, false)).to.be.revertedWith("Invalid pool Id");
            await expect(poolMaster.connect(deployer).stake(0, 0, false)).to.be.revertedWith("Must stake more than 0 tokens");
            await expect(poolMaster.connect(deployer).stake(0, 10_000, true)).to.be.revertedWith("ERC20: insufficient allowance");
            await usdc.connect(deployer).approve(poolMaster.address, 10_000);
            await poolMaster.connect(deployer).stake(0, 10_000, true);
            await expect(poolMaster.connect(deployer).stake(0, 10_000, true)).to.be.revertedWith("User already staked for this epoch");

            await expect(poolMaster.connect(addr1).stake(0, 10_000, true)).to.be.revertedWith("ERC20: insufficient allowance");
            await usdc.connect(addr1).approve(poolMaster.address, 10_000);
            await expect(poolMaster.connect(addr1).stake(0, 10_000, true)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
            
            await expect(poolMaster.connect(addr1).stake(0, 10_000, false)).to.be.revertedWith("ERC20: insufficient allowance");
            await token.connect(addr1).approve(poolMaster.address, 10_000);
            await poolMaster.connect(addr1).stake(0, 10_000, false);
            await expect(poolMaster.connect(addr1).stake(1, 10_000, false)).to.be.revertedWith("User already staked for this epoch");
        })
        it("Should start and end epoch", async function() {
            expect(await poolMaster.epochEnded()).to.equal(true);
            await expect(poolMaster.connect(deployer).stake(0, 10_000, true)).to.be.revertedWith("Epoch not started yet");
            await expect(poolMaster.connect(addr1).startEpoch("ARB", "ETH")).to.be.revertedWith("Ownable: caller is not the owner");
            await poolMaster.connect(deployer).startEpoch("ARB", "ETH");
            expect(await poolMaster.epochEnded()).to.equal(false);
            
            await usdc.connect(deployer).approve(poolMaster.address, 10_000);
            await poolMaster.connect(deployer).stake(0, 10_000, true);
            
            await expect(poolMaster.connect(addr1).endEpoch(0)).to.be.revertedWith("Ownable: caller is not the owner");
            await poolMaster.connect(deployer).endEpoch(0);
        })
    })
    
    describe("Rules", function() {
        it("Should reward winners with usdc", async function() {
            await poolMaster.connect(deployer).startEpoch("ARB", "ETH");

            await usdc.connect(deployer).transfer(addr2.address, toWei(3_000));
            let balanceAddr2Start = await usdc.balanceOf(addr2.address)
            console.log("balanceAddr2Start", balanceAddr2Start)
            
            await usdc.connect(deployer).approve(poolMaster.address, toWei(1_000));
            await poolMaster.connect(deployer).stake(0, toWei(1_000), true);
            await token.connect(addr1).approve(poolMaster.address, 1_000);
            await poolMaster.connect(addr1).stake(0, 1_000, false);

            await usdc.connect(addr2).approve(poolMaster.address, toWei(1_000));
            await poolMaster.connect(addr2).stake(1, toWei(1_000), true);
            await token.connect(addr3).approve(poolMaster.address, 1_000);
            await poolMaster.connect(addr3).stake(1, 1_000, false);
            
            let balanceAddr2AfterStake = toWei(fromWei(balanceAddr2Start) - 1_000)
            console.log("balanceAddr2AfterStake", balanceAddr2AfterStake)
            expect(await usdc.balanceOf(addr2.address)).to.equal(balanceAddr2AfterStake);

            await poolMaster.connect(deployer).endEpoch(0);
            
            let balanceAddr2After = toWei(fromWei(balanceAddr2AfterStake) + 1_000 * 0.99 - (1_000 * 0.99) * 0.125)
            console.log("balanceAddr2After", balanceAddr2After)
            expect(await usdc.balanceOf(addr2.address)).to.equal(balanceAddr2After);
        })

        it("Should reward winners with token", async function() {
            await poolMaster.connect(deployer).startEpoch("ARB", "ETH");

            // await token.connect(deployer).transfer(addr2.address, toWei(3_000));
            let balanceAddr2Start = await token.balanceOf(addr2.address)
            console.log("balanceAddr2Start", balanceAddr2Start)
            let balanceAddr1Start = await token.balanceOf(addr1.address)
            console.log("balanceAddr1Start", balanceAddr1Start)
            
            await token.connect(deployer).approve(poolMaster.address, 1_000);
            await poolMaster.connect(deployer).stake(0, 1_000, false);
            await token.connect(addr1).approve(poolMaster.address, 1_000);
            await poolMaster.connect(addr1).stake(0, 1_000, false);

            await token.connect(addr2).approve(poolMaster.address, 1_000);
            await poolMaster.connect(addr2).stake(1, 1_000, false);
            await token.connect(addr3).approve(poolMaster.address, 1_000);
            await poolMaster.connect(addr3).stake(1, 1_000, false);
            
            let balanceAddr2AfterStake = balanceAddr2Start - 1_000
            console.log("balanceAddr2AfterStake", balanceAddr2AfterStake)
            expect(await token.balanceOf(addr2.address)).to.equal(balanceAddr2AfterStake);
            console.log("balanceAddr1AfterStake", await token.balanceOf(addr1.address))

            await poolMaster.connect(deployer).endEpoch(0);
            
            let balanceAddr2After = balanceAddr2AfterStake + 1_000 - 1_000 * 0.125
            console.log("balanceAddr2After", balanceAddr2After)
            console.log("balanceAddr1After", await token.balanceOf(addr1.address))
            expect(await token.balanceOf(addr2.address)).to.equal(balanceAddr2After);

            let amountLosers = 2
            let rewardsForWinners = 1_000 * 0.1 * amountLosers
            let amountWinners = 2
            let rewardPerWinner = rewardsForWinners / amountWinners
            expect(await token.balanceOf(addr1.address)).to.equal(10_000 + rewardPerWinner);
        })
        it("Should register usdc stake fee", async function() {
            await poolMaster.connect(deployer).startEpoch("ARB", "ETH");

            let balanceAddr2Start = await usdc.balanceOf(deployer.address)

            await usdc.connect(deployer).approve(poolMaster.address, toWei(1_000));
            await poolMaster.connect(deployer).stake(0, toWei(1_000), true);
            
            let balanceAddr2Bet = await usdc.balanceOf(deployer.address)
            expect(balanceAddr2Bet).to.equal(toWei(fromWei(balanceAddr2Start) - 1_000));
            
            await poolMaster.connect(deployer).endEpoch(0);
            let balanceAddr2End = await usdc.balanceOf(deployer.address)
            expect(balanceAddr2End).to.equal(toWei(fromWei(balanceAddr2Bet) + 1_000 * 0.99));
            expect(await usdc.balanceOf(poolMaster.address)).to.equal(toWei(1_000 * 0.01));
        })

        it("Should give reward to pool3 participants", async function() {
            // todo
        })

        it("Should bet only during betting phase", async function() {
            // todo
        })
    })
})