// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
// const { NFR } = require("/tasks/constants.js");
const { NFR} = require("../tasks/constants.js");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const [owner] = await hre.ethers.getSigners();
  console.log("Deployment Wallet Address:", owner.address);
  console.log("RPC URL:", hre.network.config.url);

  const hypernetidaddress = "0xC1B2875d2dde88fd4889Be7499176e61C8a5aF6c";
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  const feeData = await owner.getFeeData();
  const gasSettings = { 
    maxFeePerGas: ethers.utils.parseUnits("80.0", "gwei"),
    maxPriorityFeePerGas: ethers.utils.parseUnits("80.0", "gwei"), 
    gasLimit: ethers.utils.parseUnits("15", 6) };
  console.log(gasSettings);

  // deploy enumerable registry contract
  const EnumerableRegistry = await ethers.getContractFactory(
    "NonFungibleRegistryEnumerableUpgradeable",
  );
  const enumerableregistry = await EnumerableRegistry.deploy(gasSettings);  
  const enumerable_registry_reciept =
    await enumerableregistry.deployTransaction.wait(6);
  console.log(
    "Enumerable Registry Beacon Address:",
    enumerableregistry.address,
  );
  console.log(
    "Factory Gas Fee:",
    enumerable_registry_reciept.gasUsed.toString(),
  );

  // deploy registry contract
  const Registry = await ethers.getContractFactory(
    "NonFungibleRegistryUpgradeable",
  );
  const registry = await Registry.deploy(gasSettings);
  const registry_reciept = await registry.deployTransaction.wait(6);
  console.log("Registry Beacon Address:", registry.address);
  console.log("Registry Gas Fee:", registry_reciept.gasUsed.toString());

  // deploy factory contract with the deployer wallet as the admin
  const FactoryRegistry = await ethers.getContractFactory(
    "UpgradeableRegistryFactory",
  );
  const factoryregistry = await FactoryRegistry.deploy(
    owner.address,
    [
        "Hypernet Profiles",
        "Registry Modules",
        "Hypernet.ID"
    ],
    [
        "Customizable Web3 user profile tokens for the Hypernet Protocol.",
        "Official modules for extending Hypernet registry functionality.",
        "Pseudo-anonymous identity verification for the web3 metaverse."
    ],
    [
        owner.address, 
        owner.address,
        hypernetidaddress
    ],
    enumerableregistry.address,
    registry.address,
    zeroAddress,
    gasSettings
  );
  const factory_reciept = await factoryregistry.deployTransaction.wait(6);
  console.log("Factory Address:", factoryregistry.address);
  console.log("Factory Gas Fee:", factory_reciept.gasUsed.toString());

  // deploy the batch minting module
  const BatchModule = await ethers.getContractFactory("BatchModule");
  batchmodule = await BatchModule.deploy("Batch Minting", gasSettings);
  const batchmodule_reciept = await batchmodule.deployTransaction.wait(3);
  console.log("Batch Module Address:", batchmodule.address);
  console.log("Batch Module Gas Fee:", batchmodule_reciept.gasUsed.toString());

  // deploy the lazy minting module
  const LazyMintModule = await ethers.getContractFactory("LazyMintModule");
  const lazymintmodule = await LazyMintModule.deploy("Lazy Minting", gasSettings);
  const lazymintmodule_reciept = await lazymintmodule.deployTransaction.wait(3);
  console.log("Lazy Mint Module Address:", lazymintmodule.address);
  console.log("Lazy Mint Module Gas Fee:", lazymintmodule_reciept.gasUsed.toString());

  // deploy the Merkle Drop module
  const MerkleModule = await ethers.getContractFactory("MerkleModule");
  const merklemodule = await MerkleModule.deploy("Merkle Drop", gasSettings);
  const merklemodule_reciept = await merklemodule.deployTransaction.wait(3);
  console.log("Merkle Module Address:", merklemodule.address);
  console.log("Merkle Module Gas Fee:", merklemodule_reciept.gasUsed.toString());

  // register the deployer wallet so it can recieve NFIs
  const profilesAddress = await factoryregistry.nameToAddress("Hypernet Profiles");
  const profilesHandle = new hre.ethers.Contract(
    profilesAddress,
    NFR.abi,
    owner,
  );

  // register the deployer account
  const registrationTx = await profilesHandle.register(owner.address, "Deployer Account", "", 9205545327, gasSettings);
  const registrationRcpt = await registrationTx.wait(3);
  console.log("Deployer Account Register Gas Fee:", registrationRcpt.gasUsed.toString());

  // register the Hypernet.ID account so it can also register and recieve NFIs
  const registrationHIDTx = await profilesHandle.register(hypernetidaddress, "Hypernet.ID Account", "", 6940495172, gasSettings);
  const registrationHIDRcpt = await registrationHIDTx.wait(3);
  console.log("Hypernet.ID Account Register Gas Fee:", registrationHIDRcpt.gasUsed.toString());

  // give the Hypernet.ID account the REGISTRAR role in Hypernet Profiles registry
  const hidAdminTx = await profilesHandle.grantRole(
      profilesHandle.REGISTRAR_ROLE(),
      hypernetidaddress,
      gasSettings
    );
  const hidAdminRcpt = await hidAdminTx.wait(3);
  console.log("Hypernet.ID address has registrar role");
  console.log("Access Control Gas Fee:", hidAdminRcpt.gasUsed.toString());

  // update the Registry Modules registry
  const registryModulesAddress = await factoryregistry.nameToAddress("Registry Modules");
  const registryModulesHandle = new hre.ethers.Contract(
    registryModulesAddress,
    NFR.abi,
    owner,
  );

  const batchRegTx = await registryModulesHandle.register(owner.address, "Batch Minting", `${batchmodule.address}`, 1, gasSettings);
  const batchRegRcpt = await batchRegTx.wait(3);
  console.log("Batch Module Register Gas Fee:", batchRegRcpt.gasUsed.toString());

  const lazyMintRegTx = await registryModulesHandle.register(owner.address, "Lazy Minting", `${lazymintmodule.address}`, 2, gasSettings);
  const lazyMintRegRcpt = await lazyMintRegTx.wait(3);
  console.log("Lazy Mint Module Register Gas Fee:", lazyMintRegRcpt.gasUsed.toString());
  
  const merkleDropRegTx = await registryModulesHandle.register(owner.address, "Merkle Drop", `${merklemodule.address}`, 3, gasSettings);
  const merkleDropRegRcpt = await merkleDropRegTx.wait(3);
  console.log("Merkle Drop Module Register Gas Fee:", merkleDropRegRcpt.gasUsed.toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
