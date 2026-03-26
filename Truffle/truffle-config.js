const path = require("path");

module.exports = {
  // This ensures your Backend and (via symlink) Frontend stay in sync
  contracts_build_directory: path.join(__dirname, "../Backend/src/blockchain/artifacts"),

  networks: {
    develop: {
      host: "127.0.0.1",
      port: 9545,            // Port for 'truffle develop'
      network_id: "*",
    },
    ganache: {
      host: "127.0.0.1",
      port: 7545,            // Port for Ganache GUI
      network_id: "5777",
    }
  },

  compilers: {
    solc: {
      version: "0.8.20",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        // CRITICAL: "paris" prevents the "invalid opcode" error 
        // caused by the PUSH0 instruction introduced in Shanghai (0.8.20 default)
        evmVersion: "paris" 
      }
    }
  }
};