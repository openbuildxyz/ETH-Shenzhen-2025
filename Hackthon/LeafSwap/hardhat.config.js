require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    sepolia: {
      url: process.env.SEPOLIA_URL || "https://eth-sepolia.g.alchemy.com/v2/demo",
      accounts: process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 64 ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: 20000000000, // 20 gwei
    },
    testnet: {
      url: process.env.TESTNET_URL || "",
      accounts: process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 64 ? [process.env.PRIVATE_KEY] : [],
      chainId: 5, // Goerli
    },
    mainnet: {
      url: process.env.MAINNET_URL || "",
      accounts: process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 64 ? [process.env.PRIVATE_KEY] : [],
      chainId: 1,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
