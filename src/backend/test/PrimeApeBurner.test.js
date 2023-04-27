const { expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const keccak256 = require("keccak256")
const { MerkleTree } = require("merkletreejs")
const babyList = require('../baby.json')
const epicList = require('../epic.json')
const alphaList = require('../alpha.json')

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => parseInt(ethers.utils.formatEther(num))

let primeApeOffset = 7979
let pointsToRedeem = 60
const getInfectedApeLevel = (tokenId) => {
    if (tokenId >= primeApeOffset * 2)
        return 3
    if (tokenId >= primeApeOffset)
        return 2
    return 1
}
const buf2hex = x => '0x' + x.toString('hex')

let primeDragonEpicMerkleRoot = "0x900493612a071ad64784e9adbe4a945fc145614b5ab937e0805113bcab054483"
let primeDragonNormalMerkleRoot = "0x125d8be70edd7fdde86cd5c566e42f612f3da056b37163721828d171d035ba28"
let primeDragonAlphaMerkleRoot = "0xbf78512182e763d945c70c90a7eda13ada2b9c42020954a5b2c57fbc963b7279"

const getMerkleProof = (tokenIdsList, tokenId) => {
    const tokenIdHashed = keccak256(tokenId.toString())
    const leafNodes = tokenIdsList.map(e => keccak256(e.toString()));
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true});
    const hexProof = merkleTree.getHexProof(tokenIdHashed);

    return hexProof
}

describe("PrimeApeBurner", async function() {
    let deployer, addr1, addr2, infectedApePlanet, primeApePlanet, primeDragon, 
        primeKongPlanet, primeApeInfector, poisonedBananas, primeApeBurner, primeBabyDragon
    let openseaProxyRegistryAddress = "0xa5409ec958C83C3f309868babACA7c86DCB077c1"
    let primeDragonUri = "ipfs://QmdWtMgLzUmmzzP4wY541T3QupfomF9LGNG8mpLJFNKRko"

    const mintOriginalNfts = async () => {
        await primeApePlanet.connect(deployer).mintBatch(addr1.address, 1, 3);
        
        await primeDragon.connect(deployer).activatePublicMint(1000);
        await primeDragon.connect(addr1).publicMint(2, {value: toWei(2 * 0.22)});

        await primeDragon.connect(deployer).setPublicMaxMintPerAddress(800);
        await primeDragon.connect(addr1).publicMint(200, {value: toWei(200 * 0.22)});
        await primeDragon.connect(addr1).publicMint(200, {value: toWei(200 * 0.22)});
        await primeDragon.connect(addr1).publicMint(200, {value: toWei(200 * 0.22)});
        await primeDragon.connect(deployer).airDrop([addr1.address], [100]);

        await primeKongPlanet.connect(deployer).mintTo(2, addr1.address);
        
        await poisonedBananas.connect(deployer).setClaimContract(deployer.address);
        await poisonedBananas.connect(deployer).mintSingle(0, addr1.address);
        await poisonedBananas.connect(deployer).mintSingle(1, addr1.address);
        await poisonedBananas.connect(deployer).mintSingle(2, addr1.address);
        await primeApeInfector.connect(deployer).setInfectingOpen(true);
        await primeApeInfector.connect(addr1).infectApe(1, 0);
        await primeApeInfector.connect(addr1).infectApe(2, 1); // 2 + primeApeOffset
        await primeApeInfector.connect(addr1).infectApe(3, 2); // nextLevelThreeId + primeApeOffset * 2
    }

    beforeEach(async function() {
        // Get contract factories
        const InfectedApePlanet = await ethers.getContractFactory("InfectedApePlanet");
        const MintableErc721 = await ethers.getContractFactory("MintableERC721");
        const PrimeDragon = await ethers.getContractFactory("PrimeDragon");
        const PrimeKongPlanetErc721 = await ethers.getContractFactory("PrimeKongPlanetERC721");
        const PrimeApeInfector = await ethers.getContractFactory("PrimeApeInfector");
        const PoisonedBananas = await ethers.getContractFactory("PoisonedBananas");
        const PrimeApeBurner = await ethers.getContractFactory("PrimeApeBurner");
        const PrimeBabyDragon = await ethers.getContractFactory("PrimeBabyDragon");

        // Get signers
        [deployer, addr1, addr2, addr3] = await ethers.getSigners();
        whitelist = [addr1.address, addr2.address, addr3.address]

        // Deploy contracts
        infectedApePlanet = await InfectedApePlanet.deploy(openseaProxyRegistryAddress);
        primeApePlanet = await MintableErc721.deploy("Prime Ape Planet", "PAP");
        primeDragon = await PrimeDragon.deploy(primeDragonUri);
        primeKongPlanet = await PrimeKongPlanetErc721.deploy(openseaProxyRegistryAddress);
        poisonedBananas = await PoisonedBananas.deploy(openseaProxyRegistryAddress);
        primeApeInfector = await PrimeApeInfector.deploy(primeApePlanet.address, poisonedBananas.address, infectedApePlanet.address);
        primeApeBurner = await PrimeApeBurner.deploy();
        primeBabyDragon = await PrimeBabyDragon.deploy();
        
        await poisonedBananas.connect(deployer).setInfectContract(primeApeInfector.address);
        await infectedApePlanet.connect(deployer).setInfectContract(primeApeInfector.address);
        await primeApeBurner.connect(deployer).setContracts(primeApePlanet.address, primeDragon.address, primeKongPlanet.address,
            infectedApePlanet.address, primeBabyDragon.address);
        await primeBabyDragon.connect(deployer).setBurnerContract(primeApeBurner.address);
    });

    describe("Deployment", function() {
        it("Should track name and symbol of the nft collections", async function() {
            expect(await infectedApePlanet.name()).to.equal("Infected Ape Planet")
            expect(await infectedApePlanet.symbol()).to.equal("IAP")
            
            expect(await primeApePlanet.name()).to.equal("Prime Ape Planet")
            expect(await primeApePlanet.symbol()).to.equal("PAP")
            
            expect(await primeDragon.name()).to.equal("PrimeDragon")
            expect(await primeDragon.symbol()).to.equal("PrimeDragon")
            
            expect(await primeKongPlanet.name()).to.equal("Prime Kong Planet")
            expect(await primeKongPlanet.symbol()).to.equal("PKP")
            
            expect(await primeBabyDragon.name()).to.equal("Prime Baby Dragon")
            expect(await primeBabyDragon.symbol()).to.equal("PBD")
        })
    })

    describe("Mint", function() {
        it("Should burn in batch", async function() {
            await mintOriginalNfts()
            await primeApeBurner.connect(deployer).startAlphaBabyBonusWindow();
            await primeDragon.connect(addr1).setApprovalForAll(primeApeBurner.address, true);
            await primeApeBurner.connect(addr1).burnBatch(
                [primeDragon.address, primeDragon.address, primeDragon.address],
                [101, 113, 166],
                [getMerkleProof(babyList, "101"), getMerkleProof(babyList, "113"), getMerkleProof(babyList, "166")]
            );
            expect(await primeApeBurner.pointsPerAddress(addr1.address)).to.equal(3 * 60);
        })
        
        it("Should randomize, track the alpha eggs and limit them to 11", async function() {
            await mintOriginalNfts()
            await primeApeBurner.connect(deployer).startAlphaBabyBonusWindow();
            await primeDragon.connect(addr1).setApprovalForAll(primeApeBurner.address, true);

            // baby: 101, 113, 166, 401, 203, 21, 222, 28, 296, 360, 410
            await primeApeBurner.connect(addr1).burn(primeDragon.address, 101, getMerkleProof(babyList, "101"));
            await primeApeBurner.connect(addr1).burn(primeDragon.address, 113, getMerkleProof(babyList, "113"));
            await primeApeBurner.connect(addr1).burn(primeDragon.address, 166, getMerkleProof(babyList, "166"));
            await primeApeBurner.connect(addr1).burn(primeDragon.address, 401, getMerkleProof(babyList, "401"));
            await primeApeBurner.connect(addr1).burn(primeDragon.address, 203, getMerkleProof(babyList, "203"));
            await primeApeBurner.connect(addr1).burn(primeDragon.address, 21, getMerkleProof(babyList, "21"));
            await primeApeBurner.connect(addr1).burn(primeDragon.address, 222, getMerkleProof(babyList, "222"));
            await primeApeBurner.connect(addr1).burn(primeDragon.address, 28, getMerkleProof(babyList, "28"));
            await primeApeBurner.connect(addr1).burn(primeDragon.address, 296, getMerkleProof(babyList, "296"));
            await primeApeBurner.connect(addr1).burn(primeDragon.address, 360, getMerkleProof(babyList, "360"));

            // alpha: 291
            await primeApeBurner.connect(addr1).burn(primeDragon.address, 291, getMerkleProof(alphaList, "291"));

            // epic: 620
            await primeApeBurner.connect(addr1).burn(primeDragon.address, 620, getMerkleProof(epicList, "620"));
            
            expect(await primeApeBurner.pointsPerAddress(addr1.address)).to.equal(12 * 60);
            
            await primeBabyDragon.connect(deployer).setMintingEnabled(true);
            await primeApeBurner.connect(addr1).redeemBatch(6);
            await primeApeBurner.connect(addr1).redeemBatch(6);
            expect(await primeBabyDragon.balanceOf(addr1.address)).to.equal(12);
            expect(await primeApeBurner.pointsPerAddress(addr1.address)).to.equal(0);

            let alphaIds = await primeBabyDragon.getAlphaIds()
            console.log("alphaIds", alphaIds)

            let alphaUri = await primeBabyDragon.alphaUri()
            for(let i = 0; i < alphaIds.length; i ++){
                expect(await primeBabyDragon.tokenURI(alphaIds[i])).to.equal(alphaUri)
                expect(await primeBabyDragon.isAlpha(alphaIds[i])).to.equal(true)
            }
        })
        
        it("Should reveal the nft collection", async function() {
            await mintOriginalNfts()
            await primeApeBurner.connect(deployer).startAlphaBabyBonusWindow();
            await primeDragon.connect(addr1).setApprovalForAll(primeApeBurner.address, true);
            await primeApeBurner.connect(addr1).burn(primeDragon.address, 101, getMerkleProof(babyList, "101"));
            await primeBabyDragon.connect(deployer).setMintingEnabled(true);
            await primeApeBurner.connect(addr1).redeemBatch(1);
            expect(await primeBabyDragon.balanceOf(addr1.address)).to.equal(1);

            let unrevealedUri = await primeBabyDragon.baseURIString()
            let revealedUri = "newUri"
            let isAlpha = await primeBabyDragon.isAlpha(0)
            if (isAlpha) {
                let alphaUri = await primeBabyDragon.alphaUri()
                expect(await primeBabyDragon.tokenURI(0)).to.equal(alphaUri);
            }
            else
                expect(await primeBabyDragon.tokenURI(0)).to.equal(unrevealedUri);
            await expect(primeBabyDragon.connect(addr1).setBaseURI(revealedUri)).to.be.revertedWith('Ownable: caller is not the owner');
            await expect(primeBabyDragon.connect(addr1).setRevealed(true)).to.be.revertedWith('Ownable: caller is not the owner');
            await primeBabyDragon.connect(deployer).setBaseURI(revealedUri);
            await primeBabyDragon.connect(deployer).setRevealed(true);
            expect(await primeBabyDragon.tokenURI(0)).to.equal(revealedUri + 0 + ".json");
        })
        it("Should identify normal and epic prime dragons w baby with merkle tree", async function() {
            // baby: 101, 113, 166, 401, ...
            expect(await primeApeBurner.isValid(getMerkleProof(babyList, "101"), primeDragonNormalMerkleRoot, keccak256("101"))).to.equal(true)
            expect(await primeApeBurner.isValid(getMerkleProof(babyList, "113"), primeDragonNormalMerkleRoot, keccak256("113"))).to.equal(true)
            expect(await primeApeBurner.isValid(getMerkleProof(babyList, "166"), primeDragonNormalMerkleRoot, keccak256("166"))).to.equal(true)
            expect(await primeApeBurner.isValid(getMerkleProof(babyList, "401"), primeDragonNormalMerkleRoot, keccak256("401"))).to.equal(true)
            expect(await primeApeBurner.isValid(getMerkleProof(babyList, "50"), primeDragonNormalMerkleRoot, keccak256("50"))).to.equal(false)
            expect(await primeApeBurner.isValid(getMerkleProof(babyList, "100"), primeDragonNormalMerkleRoot, keccak256("100"))).to.equal(false)

            // epic: 620
            expect(await primeApeBurner.isValid(getMerkleProof(epicList, "620"), primeDragonEpicMerkleRoot, keccak256("620"))).to.equal(true)
            expect(await primeApeBurner.isValid(getMerkleProof(epicList, "621"), primeDragonEpicMerkleRoot, keccak256("621"))).to.equal(false)
        })

        it("Should burn NFTs and track points during alpha bonus window", async function() {
            await mintOriginalNfts()
            await primeApeBurner.connect(deployer).startAlphaBabyBonusWindow();
            
            // Burn a normal PDP w baby to get 60 points
            expect(await primeDragon.balanceOf(addr1.address)).to.equal(702);
            await primeDragon.connect(addr1).setApprovalForAll(primeApeBurner.address, true);

            const hexProof = getMerkleProof(babyList, "101")
            expect(await primeApeBurner.isValid(hexProof, primeDragonNormalMerkleRoot, keccak256("101"))).to.equal(true)

            await primeApeBurner.connect(addr1).burn(primeDragon.address, 101, hexProof);
            expect(await primeDragon.balanceOf(addr1.address)).to.equal(701);
            expect(await primeApeBurner.pointsPerAddress(addr1.address)).to.equal(60);
            
            await expect(primeApeBurner.connect(addr1).burn(primeDragon.address, 1, [])).to.be.revertedWith('Can only burn alpha, baby or alpha prime dragons during alpha baby bonus window');

            await primeApePlanet.connect(addr1).setApprovalForAll(primeApeBurner.address, true);
            await expect(primeApeBurner.connect(addr1).burn(primeApePlanet.address, 1, [])).to.be.revertedWith('Can only burn alpha, baby or alpha prime dragons during alpha baby bonus window');


            // epic: 620
            const hexProof620 = getMerkleProof(epicList, "620")
            expect(await primeApeBurner.isValid(hexProof620, primeDragonEpicMerkleRoot, keccak256("620"))).to.equal(true)
        })

        it("Should mint NFTs correctly", async function() {
            let primeApePlanetUri = "https://primeapeplanet.com/metadata/"
            await primeApePlanet.connect(deployer).setBaseURI(primeApePlanetUri);
            await primeApePlanet.connect(deployer).mint(addr1.address, 1);
            await primeApePlanet.connect(deployer).mint(addr1.address, 2);
            await primeApePlanet.connect(deployer).mint(addr1.address, 3);
            expect(await primeApePlanet.balanceOf(addr1.address)).to.equal(3);
            expect(await primeApePlanet.tokenURI(1)).to.equal(primeApePlanetUri + "1");
            expect(await primeApePlanet.tokenURI(2)).to.equal(primeApePlanetUri + "2");
            
            await primeDragon.connect(deployer).activatePublicMint(1000);
            await primeDragon.connect(addr1).publicMint(2, {value: toWei(2 * 0.22)});
            expect(await primeDragon.balanceOf(addr1.address)).to.equal(2);
            expect(await primeDragon.tokenURI(0)).to.equal(primeDragonUri + "0");
            expect(await primeDragon.tokenURI(1)).to.equal(primeDragonUri + "1");

            let primeKongPlanetUri = "https://primekongplanet.io/metadata/"
            await primeKongPlanet.connect(deployer).setBaseURI(primeKongPlanetUri);
            await primeKongPlanet.connect(deployer).mintTo(2, addr1.address);
            expect(await primeKongPlanet.balanceOf(addr1.address)).to.equal(2);
            expect(await primeKongPlanet.tokenURI(1)).to.equal(primeKongPlanetUri + "1.json");
            expect(await primeKongPlanet.tokenURI(2)).to.equal(primeKongPlanetUri + "2.json");
            
            let poisonedBananasUri = "https://primeapeplanet.com/bananas/"
            await poisonedBananas.connect(deployer).setBaseURI(poisonedBananasUri);
            expect(await poisonedBananas.uri(0)).to.equal(poisonedBananasUri + "0");
            expect(await poisonedBananas.uri(1)).to.equal(poisonedBananasUri + "1");
            expect(await poisonedBananas.uri(2)).to.equal(poisonedBananasUri + "2");
            await poisonedBananas.connect(deployer).setClaimContract(deployer.address);
            await poisonedBananas.connect(deployer).mintSingle(0, addr1.address);
            await poisonedBananas.connect(deployer).mintSingle(1, addr1.address);
            await poisonedBananas.connect(deployer).mintSingle(2, addr1.address);
            expect(await poisonedBananas.balanceOf(addr1.address, 0)).to.equal(1);
            expect(await poisonedBananas.balanceOf(addr1.address, 1)).to.equal(1);
            expect(await poisonedBananas.balanceOf(addr1.address, 2)).to.equal(1);
            await primeApeInfector.connect(deployer).setInfectingOpen(true);
            await primeApeInfector.connect(addr1).infectApe(1, 0);
            await primeApeInfector.connect(addr1).infectApe(2, 1);
            await primeApeInfector.connect(addr1).infectApe(3, 2);
            expect(await infectedApePlanet.balanceOf(addr1.address)).to.equal(3);
            expect(await infectedApePlanet.ownerOf(1 + primeApeOffset * 0)).to.equal(addr1.address);
            expect(await infectedApePlanet.ownerOf(2 + primeApeOffset * 1)).to.equal(addr1.address);
            let nextLevelThreeId = parseInt(await primeApeInfector.nextLevelThreeId())
            expect(await infectedApePlanet.ownerOf(nextLevelThreeId + primeApeOffset * 2)).to.equal(addr1.address);
            expect(getInfectedApeLevel(1)).to.equal(1)
            expect(getInfectedApeLevel(2 + primeApeOffset)).to.equal(2)
            expect(getInfectedApeLevel(nextLevelThreeId + primeApeOffset * 2)).to.equal(3)
        })
    })
    describe("Burn", function() {
        it("Should burn NFTs and track points after alpha bonus window", async function() {
            await mintOriginalNfts()

            await expect(primeApeBurner.connect(addr1).burn(primeDragon.address, 1, [])).to.be.revertedWith('Burn not allowed yet');
            await primeApeBurner.connect(deployer).startAlphaBabyBonusWindow();
            await expect(primeApeBurner.connect(addr1).burn(openseaProxyRegistryAddress, 1, [])).to.be.revertedWith('Invalid given NFT');
            await expect(primeApeBurner.connect(addr2).burn(primeDragon.address, 1, [])).to.be.revertedWith('You do not own this NFT');
            await expect(primeApeBurner.connect(addr1).burn(primeDragon.address, 9000, [])).to.be.revertedWith('ERC721: invalid token ID');
            await expect(primeApeBurner.connect(addr1).redeem()).to.be.revertedWith('Not enough points accumulated');
            await expect(primeBabyDragon.connect(addr1).mintTo(addr1.address, 10)).to.be.revertedWith('Sender not burner');
            
            await helpers.time.increase(72 * 60 * 60 + 10);
            await expect(primeApeBurner.connect(addr1).burn(primeApePlanet.address, 1, [])).to.be.revertedWith('ERC721: caller is not token owner or approved');

            // Burn a PAP to get 12 points
            expect(await primeApePlanet.balanceOf(addr1.address)).to.equal(3);
            await primeApePlanet.connect(addr1).setApprovalForAll(primeApeBurner.address, true);
            await primeApeBurner.connect(addr1).burn(primeApePlanet.address, 1, []);
            expect(await primeApePlanet.balanceOf(addr1.address)).to.equal(2);
            expect(await primeApeBurner.pointsPerAddress(addr1.address)).to.equal(12);

            // Burn a PDP to get 8 points
            expect(await primeDragon.balanceOf(addr1.address)).to.equal(702);
            await primeDragon.connect(addr1).setApprovalForAll(primeApeBurner.address, true);
            await primeApeBurner.connect(addr1).burn(primeDragon.address, 1, []);
            expect(await primeDragon.balanceOf(addr1.address)).to.equal(701);
            expect(await primeApeBurner.pointsPerAddress(addr1.address)).to.equal(20);

            // Burn a PKP to get 6 points
            /*
            TODO:
            Error: Transaction reverted: function returned an unexpected amount of data
            at PrimeKongPlanetERC721.isApprovedForAll (src/backend/contracts/PrimeKongPlanetERC721.sol:170)

            This is due to the usage of openseaProxyRegistryAddress on a local blockchain
            */
            // expect(await primeKongPlanet.balanceOf(addr1.address)).to.equal(2);
            // await primeKongPlanet.connect(addr1).setApprovalForAll(primeApeBurner.address, true);
            // await primeApeBurner.connect(addr1).burn(primeKongPlanet.address, 1);
            // expect(await primeKongPlanet.balanceOf(addr1.address)).to.equal(1);
            // expect(await primeApeBurner.pointsPerAddress(addr1.address)).to.equal(26);

            // Burn a IAP LV1 to get 5 points
            expect(await infectedApePlanet.balanceOf(addr1.address)).to.equal(3);
            await infectedApePlanet.connect(addr1).setApprovalForAll(primeApeBurner.address, true);
            await primeApeBurner.connect(addr1).burn(infectedApePlanet.address, 1, []);
            expect(await infectedApePlanet.balanceOf(addr1.address)).to.equal(2);
            expect(await primeApeBurner.pointsPerAddress(addr1.address)).to.equal(25);

            // Burn a IAP LV2 to get 10 points
            expect(await infectedApePlanet.balanceOf(addr1.address)).to.equal(2);
            await infectedApePlanet.connect(addr1).setApprovalForAll(primeApeBurner.address, true);
            await primeApeBurner.connect(addr1).burn(infectedApePlanet.address, 2 + primeApeOffset, []);
            expect(await infectedApePlanet.balanceOf(addr1.address)).to.equal(1);
            expect(await primeApeBurner.pointsPerAddress(addr1.address)).to.equal(35);

            // Burn a IAP LV3 to get 10 points
            let nextLevelThreeId = parseInt(await primeApeInfector.nextLevelThreeId())
            expect(await infectedApePlanet.balanceOf(addr1.address)).to.equal(1);
            await infectedApePlanet.connect(addr1).setApprovalForAll(primeApeBurner.address, true);
            await primeApeBurner.connect(addr1).burn(infectedApePlanet.address, nextLevelThreeId + primeApeOffset * 2, []);
            expect(await infectedApePlanet.balanceOf(addr1.address)).to.equal(0);
            expect(await primeApeBurner.pointsPerAddress(addr1.address)).to.equal(45);

            // Get enough points, then redeem
            await primeApeBurner.connect(addr1).burn(primeApePlanet.address, 2, []);
            await primeApeBurner.connect(addr1).burn(primeApePlanet.address, 3, []);
            expect(await primeApePlanet.balanceOf(addr1.address)).to.equal(0);
            expect(await primeApeBurner.pointsPerAddress(addr1.address)).to.equal(69);
            
            await expect(primeApeBurner.connect(addr1).redeemBatch(1)).to.be.revertedWith('Minting is not enabled');
            await primeBabyDragon.connect(deployer).setMintingEnabled(true);
            await primeApeBurner.connect(addr1).redeemBatch(1);
            expect(await primeBabyDragon.balanceOf(addr1.address)).to.equal(1);
            expect(await primeApeBurner.pointsPerAddress(addr1.address)).to.equal(9);

            expect(await primeBabyDragon.isAlpha(0)).to.equal(false)
            let baseUri = await primeBabyDragon.baseURIString()
            expect(await primeBabyDragon.tokenURI(0)).to.equal(baseUri)
        })
    })
    
})