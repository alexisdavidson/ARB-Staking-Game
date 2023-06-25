require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
// require("hardhat-gas-reporter");
require("dotenv").config();

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.10",
      },
      {
        version: "0.8.11",
      },
      {
        version: "0.8.13",
      },
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
    ],
  },
  networks: {
     hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true
     },
     sepolia: {
       url: process.env.REACT_APP_API_URL_SEPOLIA_INFURA,
       accounts: ['0x' + process.env.REACT_APP_PRIVATE_KEY_TESTNETS],
       allowUnlimitedContractSize: true,
       gas: 2100000,
       gasPrice: 3000000000,
     },
     arbitrumGoerli: {
       url: "https://goerli-rollup.arbitrum.io/rpc",
       chainId: 421613,
       //accounts: [GOERLI_TESTNET_PRIVATE_KEY]
     },
     arbitrumOne: {
       url: "https://arb1.arbitrum.io/rpc",
       accounts: ['0x' + process.env.REACT_APP_PRIVATE_KEY_ARBITRUM_ONE],
     }
    //  mainnet: {
    //   url: process.env.REACT_APP_API_URL_MAINNET_INFURA,
    //   accounts: ['0x' + process.env.REACT_APP_PRIVATE_KEY_GOERLI_KENNY],
    //   // accounts: [process.env.REACT_APP_PRIVATE_KEY_MAINNET_KENNY_2],
    //   gas: 2100000,
    //   gasPrice: 30000000000
    // }
  },
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test"
  },
  etherscan: {
    // apiKey: process.env.REACT_APP_ETHERSCAN_API_KEY
    apiKey: process.env.REACT_APP_ARBISCAN_API_KEY
  }
};
