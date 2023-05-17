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
            await poolMaster.connect(deployer).startEpoch(deployer.address, addr1.address);

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
            await expect(poolMaster.connect(addr1).startEpoch(deployer.address, addr1.address)).to.be.revertedWith("Ownable: caller is not the owner");
            await poolMaster.connect(deployer).startEpoch(deployer.address, addr1.address);
            expect(await poolMaster.epochEnded()).to.equal(false);
            
            await usdc.connect(deployer).approve(poolMaster.address, 10_000);
            await poolMaster.connect(deployer).stake(0, 10_000, true);
            
            await expect(poolMaster.connect(addr1).endEpoch(0)).to.be.revertedWith("Ownable: caller is not the owner");
            await poolMaster.connect(deployer).endEpoch(0);
        })
    })
    
    describe("Rules", function() {
        it("Should reward winners", async function() {
            await poolMaster.connect(deployer).startEpoch(deployer.address, addr1.address);

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
            
            // let balanceDeployerBefore = await usdc.balanceOf(deployer.address)
            // let balanceAddr2Before = await addr2.balanceOf(deployer.address)
            // console.log("balanceAddr2Before", balanceAddr2Before)
            
            // let balanceAddr2After = toWei(fromWei(balanceAddr2Before) + 1_000 - 1_000 * 0.125)
            // console.log("balanceAddr2After", balanceAddr2After)
            // expect(await addr2.getBalance()).to.equal(balanceAddr2After);

            // let balanceAddr3After = toWei(fromWei(balanceAddr3Before) + 1_000 - 1_000 * 0.125)
            // console.log("balanceAddr3After", balanceAddr3After)
            // expect(await addr3.getBalance()).to.equal(balanceAddr3After);

            // let balanceDeployerAfter = balanceDeployerBefore + toWei(1_000) * 0.99 + toWei(1_000) / 10
            // expect(await usdc.balanceOf(deployer.address)).to.equal(balanceDeployerAfter);
        })
        it("Should register usdc stake fee", async function() {
            await poolMaster.connect(deployer).startEpoch(deployer.address, addr1.address);

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
    })
})