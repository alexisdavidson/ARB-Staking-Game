const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

// Goerli
let openseaProxyRegistryAddress = "0xa5409ec958C83C3f309868babACA7c86DCB077c1"
let primeDragonUri = "ipfs://QmdWtMgLzUmmzzP4wY541T3QupfomF9LGNG8mpLJFNKRko"
const teamWallet = "0x6a231675E7f583f83a56FE5cAfb24748c0CbA721"
const testWallets = ["0x6a231675E7f583f83a56FE5cAfb24748c0CbA721", "0x1580c391b099a51309b795fe35081ac60b996209", "0x91ea9fb382f7194fb37c70f73a1cfa1c208be496", "0x7c0357b140aa4f7f1d0677ab5f0dcc0bc673f692", "0x79a57ed0c57adc64858a92df058068ee1028ae57", "0x5eb97fd6c21c474110b0e0fa6a1d5428b1f31176", "0x37ab02a1e49b43675ada2431cb3518c3e21e0c4c", "0x6cd51667f796f76a85c1dc106bdf2d4201f6a0f4", "0x711da8c35900a41b9b1835f174c4b8ac7166a8ff", "0xda5f69e9c76369a1d2b9c5e7e8cb24e9b98988c2"]
let primeApePlanetAddress = "0x6a870CfF35132163FF4cC583e80f71f0a9A53B69"
let infectedApePlanetAddress = "0xB861B9931a8Ca4399217abecb279075B447597B6"
let primeDragonAddress = "0xd600088bA1aEcBCE0a06F391D8E3b3D1Ae06308e"
let primeKongPlanetAddress = "0xe97A0a72f010306f656C8bbcBFFEC74E561f4176"
let primeApePlanet
// Mainnet
// const teamWallet = "" // Todo: Ask mainnet owner wallet
// let primeApePlanetAddress = "0x6632a9d63E142F17a668064D41A21193b49B41a0"
// let infectedApePlanetAddress = "0xFD8917a36f76c4DA9550F26DB2faaaA242d6AE2c"
// let primeDragonAddress = "0x3B81f59B921eD8E037c4F12E631fb7c46D821138"
// let primeKongPlanetAddress = "0x5845E5F0571427D0ce33550587961262CA8CDF5C"

// Deploy contracts that are already on the mainnet for simulation
async function deployTestContracts(deployer) {
  const InfectedApePlanet = await ethers.getContractFactory("InfectedApePlanet");
  const MintableERC721 = await ethers.getContractFactory("MintableERC721");
  const PrimeDragon = await ethers.getContractFactory("PrimeDragon");
  const PrimeKongPlanetERC721 = await ethers.getContractFactory("PrimeKongPlanetERC721");
  const PrimeApeInfector = await ethers.getContractFactory("PrimeApeInfector");
  const PoisonedBananas = await ethers.getContractFactory("PoisonedBananas");

  const infectedApePlanet = await InfectedApePlanet.deploy(openseaProxyRegistryAddress);
  infectedApePlanetAddress = infectedApePlanet.address
  console.log("InfectedApePlanet contract address", infectedApePlanetAddress)
  saveFrontendFiles(infectedApePlanet, "InfectedApePlanet");

  primeApePlanet = await MintableERC721.deploy("Prime Ape Planet", "PAP");
  primeApePlanetAddress = primeApePlanet.address
  console.log("MintableERC721 contract address", primeApePlanetAddress)
  saveFrontendFiles(primeApePlanet, "MintableERC721");

  const primeDragon = await PrimeDragon.deploy(primeDragonUri);
  primeDragonAddress = primeDragon.address
  console.log("PrimeDragon contract address", primeDragonAddress)
  saveFrontendFiles(primeDragon, "PrimeDragon");

  const primeKongPlanet = await PrimeKongPlanetERC721.deploy(openseaProxyRegistryAddress);
  primeKongPlanetAddress = primeKongPlanet.address
  console.log("PrimeKongPlanetERC721 contract address", primeKongPlanetAddress)
  saveFrontendFiles(primeKongPlanet, "PrimeKongPlanetERC721");

  const poisonedBananas = await PoisonedBananas.deploy(openseaProxyRegistryAddress);
  console.log("PoisonedBananas contract address", poisonedBananas.address)
  saveFrontendFiles(poisonedBananas, "PoisonedBananas");

  const primeApeInfector = await PrimeApeInfector.deploy(primeApePlanet.address, poisonedBananas.address, infectedApePlanet.address);
  console.log("PrimeApeInfector contract address", primeApeInfector.address)
  saveFrontendFiles(primeApeInfector, "PrimeApeInfector");
  
  await poisonedBananas.setInfectContract(primeApeInfector.address);
  await infectedApePlanet.setInfectContract(primeApeInfector.address);
  
  console.log("Test contracts: Setters functions called")

  // Simulate many mints to speed up the testing process on Goerli
  await primeApeInfector.setInfectingOpen(true);
  await primeDragon.activatePublicMint(1000);
  await primeDragon.setPublicMaxMintPerAddress(800);
  await poisonedBananas.setClaimContract(deployer.address);

  let amount = 7
  await primeApePlanet.mintBatch(deployer.address, 1, amount);
  
  let nextPrimeApePlanetTokenId = amount + 1
  async function airdropTestNfts(address, amount) {
    await primeDragon.airDrop([address], [amount]);
    await primeApePlanet.mintBatch(address, nextPrimeApePlanetTokenId, amount);
    nextPrimeApePlanetTokenId += amount
    await primeKongPlanet.mintTo(amount, address);
    await poisonedBananas.mintMultiple([0], [amount], address);
    await poisonedBananas.mintMultiple([1], [amount], address);
    await poisonedBananas.mintMultiple([2], [amount], address);

    /* Notes:
    -infecting an ape must be performed by the holder of the ape / banana
    */ 
  }

  await airdropTestNfts(testWallets[0], amount)
  
  console.log("Test contracts: Airdrops called")

  // Transfer ownerships
  await primeDragon.transferOwnership(teamWallet)
  await primeApePlanet.transferOwnership(teamWallet)
  await primeKongPlanet.transferOwnership(teamWallet)
  await poisonedBananas.transferOwnership(teamWallet)
  await primeApeInfector.transferOwnership(teamWallet)
  await infectedApePlanet.transferOwnership(teamWallet)
  
  console.log("Test contracts: Ownerships transfered")
}


async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  let balanceBefore = fromWei(await deployer.getBalance())
  console.log("Account balance:", fromWei(await deployer.getBalance()));
  
  // await deployTestContracts(deployer) // Comment out to not redeploy all original NFTs test contracts

  // New contracts
  // const PrimeApeBurner = await ethers.getContractFactory("PrimeApeBurner");
  const PrimeBabyDragon = await ethers.getContractFactory("PrimeBabyDragon");

  // const primeApeBurner = await PrimeApeBurner.deploy();
  // console.log("PrimeApeBurner contract address", primeApeBurner.address)
  // saveFrontendFiles(primeApeBurner, "PrimeApeBurner");

  const primeBabyDragon = await PrimeBabyDragon.deploy();
  console.log("PrimeBabyDragon contract address", primeBabyDragon.address)
  saveFrontendFiles(primeBabyDragon, "PrimeBabyDragon");

  // const primeBabyDragonAddress = primeBabyDragon.address
  // const primeBabyDragonAddress = "0xC0352Dca81e6b9e2C881D616Ac605c29d3B86190" // sepolia
  // await primeApeBurner.setContracts(primeApePlanetAddress, primeDragonAddress, primeKongPlanetAddress,
  //     infectedApePlanetAddress, primeBabyDragonAddress);
  // await primeBabyDragon.setBurnerContract(primeApeBurner.address);

  console.log("Setters functions called")
  
  await primeBabyDragon.setMintingEnabled(true); // sepolia, goerli
  await primeBabyDragon.airdrop(deployer.address);
  // if (!primeApePlanet) {
  //   const MintableERC721 = await ethers.getContractFactory("MintableERC721");
  //   primeApePlanet = await MintableERC721.attach(primeApePlanetAddress);
  // }
  // if (primeApePlanet) {
  //   await primeApePlanet.setApprovalForAll(primeApeBurner.address, true);
  //   await primeApeBurner.burnBatch([primeApePlanetAddress, primeApePlanetAddress, primeApePlanetAddress, primeApePlanetAddress, primeApePlanetAddress], [1, 2, 3, 4, 5], [[], [], [], [], []]);
  //   await primeApeBurner.redeemBatch(1);
  // }

  console.log("Tests functions called.")
  // console.log("primeBabyDragon.balanceOf(deployer): ", parseInt(await primeBabyDragon.balanceOf(deployer.address)))
  
  // await primeApeBurner.transferOwnership(teamWallet)
  // await primeBabyDragon.transferOwnership(teamWallet)
  console.log("Transfer Ownership functions called")

  console.log("Eth spent for deployment script: ", balanceBefore - fromWei(await deployer.getBalance()));
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/contractsData";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
