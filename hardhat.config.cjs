require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true  // This can help with large contracts
    }
  },
  networks: {
    "edu-chain-testnet": {
      url: `https://rpc.open-campus-codex.gelato.digital`,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY],
      chainId: 656476,
      gasMultiplier: 2,
      gasPrice: 'auto',
      timeout: 60000 // Increase timeout to 1 minute
    },
  }
};