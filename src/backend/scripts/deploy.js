const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

async function main() {
  let poolMaster, udsc, token
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  let balanceBefore = fromWei(await deployer.getBalance())
  console.log("Account balance:", fromWei(await deployer.getBalance()));
  
  const PoolMaster = await ethers.getContractFactory("PoolMaster");
  // const Erc20Usdc = await ethers.getContractFactory("Erc20Usdc");
  // const Token = await ethers.getContractFactory("Token");

  // usdc = await Erc20Usdc.deploy();
  // console.log("Erc20Usdc contract address", usdc.address)
  // saveFrontendFiles(usdc, "Erc20Usdc");

  // token = await Token.deploy();
  // console.log("Token contract address", token.address)
  // saveFrontendFiles(token, "Token");

  poolMaster = await PoolMaster.deploy();
  console.log("PoolMaster contract address", poolMaster.address)
  saveFrontendFiles(poolMaster, "PoolMaster");
        
  // const usdcAddress = usdc.address
  // const tokenAddress = token.address
  const usdcAddress = "0x5d7897579269F234015ba65743D9108F4AD5dB22"
  const tokenAddress = "0x4F69a31125a4bA6a51786181d5cC5a15E69df0c5"
  await poolMaster.setTokenAddress(tokenAddress);
  await poolMaster.setUsdcAddress(usdcAddress);

  console.log("Setters functions called")
  
  // to remove for mainnet
  await poolMaster.startEpoch("BNB", "ETH");
  console.log("Test functions called")

  // todo
  
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
