const { expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => parseInt(ethers.utils.formatEther(num))

describe("PoolMaster", async function() {
    let deployer, addr1, addr2, poolMaster, udsc

    beforeEach(async function() {
        const PoolMaster = await ethers.getContractFactory("PoolMaster");
        const Usdc = await ethers.getContractFactory("Erc20Usdc");

        [deployer, addr1, addr2, addr3] = await ethers.getSigners();

        usdc = await Usdc.deploy();
        const usdcAddress = usdc.address
        poolMaster = await PoolMaster.deploy();
        
        await poolMaster.connect(deployer).setUsdcAddress(usdcAddress);
    });

    describe("Game", function() {
        it("Should stake", async function() {
            // await primeApeBurner.connect(deployer).startAlphaBabyBonusWindow();
            // expect(await primeApeBurner.pointsPerAddress(addr1.address)).to.equal(3 * 60);
        })
    })
})