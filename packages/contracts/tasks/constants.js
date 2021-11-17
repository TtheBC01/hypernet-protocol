// const HT = require("../artifacts/contracts/governance/Hypertoken.sol/Hypertoken.json");
// const HG = require("../artifacts/contracts/governance/HypernetGovernor.sol/HypernetGovernor.json");
// const RF = require("../artifacts/contracts/identity/UpgradeableRegistryFactory.sol/UpgradeableRegistryFactory.json");
// const NFR = require("../artifacts/contracts/identity/NonFungibleRegistryEnumerableUpgradeable.sol/NonFungibleRegistryEnumerableUpgradeable.json");

// define some dynamic imports
const hAddress = function () {
  const hre = require("hardhat");
  if (hre.hardhatArguments.network == "dev") {
    return "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  } else {
    return "0xAa588d3737B611baFD7bD713445b314BD453a5C8";
  }
};

const govAddress = function () {
  const hre = require("hardhat");
  if (hre.hardhatArguments.network == "dev") {
    return "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  } else {
    return "0xdDA6327139485221633A1FcD65f4aC932E60A2e1";
  }
};

const timelockAddress = function () {
  const hre = require("hardhat");
  if (hre.hardhatArguments.network == "dev") {
    return "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  } else {
    return "0xeec918d74c746167564401103096D45BbD494B74";
  }
};

const factoryAddress = function () {
  const hre = require("hardhat");
  if (hre.hardhatArguments.network == "dev") {
    return "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
  } else {
    return "0x82D50AD3C1091866E258Fd0f1a7cC9674609D254";
  }
};

// module.exports = {
//   HT,
//   HG,
//   RF,
//   NFR,
//   govAddress,
//   timelockAddress,
//   factoryAddress,
//   hAddress
// };