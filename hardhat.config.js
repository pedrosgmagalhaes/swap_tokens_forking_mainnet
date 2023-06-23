// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.9" },
    ],
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 5000,
      details: { yul: false },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: process.env.INFURA_MAINNET_ENDPOINT,
      }
    },
  },
};
