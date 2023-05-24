const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

// npx hardhat run .\src\backend\scripts\trigger_test_functions.js --network sepolia

async function main() {
  let poolMasterAddress = "0xb96b91A2F44e3113EC0757a0d0054B51525D3751"
  const PoolMaster = await ethers.getContractFactory("PoolMaster");
  let wallet = await new ethers.Wallet(''); // remove before commit
  let signer = await wallet.connect(ethers.provider);

  let poolMaster = await PoolMaster.attach(poolMasterAddress);
  console.log("poolMaster address", poolMaster.address)

  await poolMaster.connect(signer).startEpoch("BTC", "ETH");

  console.log("all functions called")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
