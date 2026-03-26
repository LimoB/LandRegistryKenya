// migrations/2_deploy_land.js
const LandRegistry = artifacts.require("LandRegistry"); // Must match the name in .sol

module.exports = function (deployer) {
  deployer.deploy(LandRegistry);
};