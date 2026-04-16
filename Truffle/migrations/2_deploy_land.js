const LandRegistry = artifacts.require("LandRegistry");

module.exports = async function (deployer, network, accounts) {
  console.log("Deploying LandRegistry contract...");

  // Deploy contract
  await deployer.deploy(LandRegistry);

  const instance = await LandRegistry.deployed();

  console.log("LandRegistry deployed at:", instance.address);
  console.log("Network:", network);
  console.log("Deployer account:", accounts[0]);

  // Optional: If you want to auto-set officer/admin after deployment
  // (ONLY if your constructor doesn't already handle roles properly)

  // Example:
  // await instance.setOfficer(accounts[0]); // if needed
};