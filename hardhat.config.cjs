require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.27",
  networks: {
    "edu-chain-testnet": {
      // Testnet configuration
      url: `https://rpc.open-campus-codex.gelato.digital`,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY],
      chainId: 656476,
    },
  },
};