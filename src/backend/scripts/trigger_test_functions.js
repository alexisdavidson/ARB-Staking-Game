const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

// npx hardhat run .\src\backend\scripts\trigger_test_functions.js --network sepolia

async function main() {
  let poolMasterAddress = "0xaFc26D44Eeb63441f4D83De8b10772DD79169a0e"
  const PoolMaster = await ethers.getContractFactory("PoolMaster");
  let wallet = await new ethers.Wallet(''); // remove before commit
  let signer = await wallet.connect(ethers.provider);

  let poolMaster = await PoolMaster.attach(poolMasterAddress);
  console.log("poolMaster address", poolMaster.address)

  await poolMaster.connect(signer).startEpoch(signer.address, "0xaFc26D44Eeb63441f4D83De8b10772DD79169a0e", "ARB", "ETH");

  console.log("all functions called")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
