require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

const { MONAD_RPC = "https://testnet-rpc.monad.xyz", PRIVATE_KEY = "" } = process.env;

module.exports = {
  solidity: {
    version: "0.8.21", // keep your installed solc
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    monad: {
      url: MONAD_RPC,
      chainId: 10143,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
