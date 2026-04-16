const path = require("path");

module.exports = {
  // Keeps compiled artifacts inside backend
  contracts_build_directory: path.join(
    __dirname,
    "../Backend/src/blockchain/artifacts"
  ),

  networks: {
    // Truffle built-in dev network (optional)
    develop: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*",
    },

    // Ganache GUI (your main working network)
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // 🔥 FIX: better than "5777"
      gas: 6721975,
      gasPrice: 20000000000,
    },
  },

  compilers: {
    solc: {
      version: "0.8.20",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },

        // IMPORTANT FIX for Ganache + newer Solidity opcodes
        evmVersion: "paris",
      },
    },
  },

  mocha: {
    timeout: 100000,
  },
};