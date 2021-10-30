const { expect } = require("chai");
const { ethers } = require("hardhat")
const { BN, expectRevert } = require('@openzeppelin/test-helpers')
const NFR = require("../artifacts/contracts/identity/NonFungibleRegistryEnumerableUpgradeable.sol/NonFungibleRegistryEnumerableUpgradeable.json")

describe("Registry Factory Unit Tests", function () {
    const burnAddress = "0x000000000000000000000000000000000000dEaD"; 
    let hypertoken;
    let registryfactory; 
    let owner;
    let addr1;

    beforeEach(async () => {
        [owner, addr1] = await ethers.getSigners()

        const Hypertoken = await ethers.getContractFactory("Hypertoken");
        hypertoken = await Hypertoken.deploy();
        await hypertoken.deployTransaction.wait();

        let tx = await hypertoken.transfer(addr1.address, ethers.utils.parseEther("100"));
        tx.wait();

        // deploy enumerable registry contract
        const EnumerableRegistry = await ethers.getContractFactory("NonFungibleRegistryEnumerableUpgradeable");
        const enumerableregistry = await EnumerableRegistry.deploy();
        enumerableregistry.deployTransaction.wait();

        // deploy registry contract
        const Registry = await ethers.getContractFactory("NonFungibleRegistryUpgradeable");
        const registry = await Registry.deploy();
        registry.deployTransaction.wait();

        // deploy factory contract
        const RegistryFactory = await ethers.getContractFactory("UpgradeableRegistryFactory");
        registryfactory = await RegistryFactory.deploy(
                owner.address, 
                ["Test"], 
                ["t"], 
                [owner.address], 
                enumerableregistry.address, 
                registry.address, 
                hypertoken.address
            );
        await registryfactory.deployTransaction.wait();
	});

    it("Check the constructor-deployed registries.", async function () {
        const testRegAddress = await registryfactory.nameToAddress("Test");
        const testReg = new ethers.Contract(testRegAddress, NFR.abi, owner);

        let tx = await testReg.register(addr1.address, "dummy", "dummy", 1);
        let txrcpt = tx.wait();

        tx = await testReg.register(addr1.address, "", "dummy", 2);
        txrcpt = tx.wait();

        expect(await testReg.name()).to.equal("Test");
        expect(await testReg.symbol()).to.equal("t");
        expect(await testReg.totalSupply()).to.equal(2);
    });

    it("Test createRegistry.", async function () {
        const registryName = "GatewaysEnumerable";
        const registrySymbol = "HNG";

        let tx = await registryfactory.createRegistry(registryName, registrySymbol, owner.address, true);
        txrcpt = await tx.wait(); 

        tx = await registryfactory.createRegistry("Gateways", registrySymbol, owner.address, false);
        txrcpt = await tx.wait(); 

        const registryAddress = await registryfactory.nameToAddress(registryName);

        const registryHandle = new ethers.Contract(registryAddress, NFR.abi, owner);

        expect(await registryHandle.name()).to.equal(registryName);
        expect(await registryHandle.symbol()).to.equal(registrySymbol);
        expect(await registryHandle.totalSupply()).to.equal(0);
    });

    it("Prevent duplicate names.", async function () {
        // can't create two registries with the same name
        await expectRevert(
            registryfactory.createRegistry(
                "Test",
                "t",
                owner.address,
                true
            ),
            "RegistryFactory: Registry by that name exists.",
        );
    });

    it("Prevent ownership by 0 address.", async function () {
        // can't create two registries with the same name
        await expectRevert(
                registryfactory.createRegistry(
                "Dummy",
                "d",
                "0x0000000000000000000000000000000000000000",
                true
            ),
            "RegistryFactory: Registrar address must not be 0.",
          );
    });

    it("Register By token is disabled when registrationToken is 0 address.", async function () {

        let tx = await registryfactory.setRegistrationToken("0x0000000000000000000000000000000000000000");
        tx.wait(); 

        // can't create two registries with the same name
        await expectRevert(
                registryfactory.createRegistryByToken(
                "Dummy",
                "d",
                owner.address,
                true
            ),
            "RegistryFactory: registration by token not enabled.",
          );
    });

    it("Only admin can enable token-based registry creation.", async function () {
        // can't create two registries with the same name
        await expectRevert(
                registryfactory.connect(addr1).setRegistrationToken(
                    hypertoken.address
                ),
            "RegistryFactory: must have admin role to create a registry",
        );
        let tx = await registryfactory.setRegistrationToken(hypertoken.address); 
        tx.wait();
        expect(await registryfactory.registrationToken()).to.equal(hypertoken.address);
    });

    it("Only admin can set burn address.", async function () {
        // can't create two registries with the same name
        await expectRevert(
                registryfactory.connect(addr1).setBurnAddress(
                    registryfactory.address
                ),
            "RegistryFactory: must have admin role to create a registry",
        );

        let tx = await registryfactory.setBurnAddress(registryfactory.address); 
        tx.wait();
        expect(await registryfactory.burnAddress()).to.equal(registryfactory.address);
    });

    it("Only admin can set registration fee.", async function () {
        // can't create two registries with the same name
        await expectRevert(
                registryfactory.connect(addr1).setRegistrationFee(
                    ethers.utils.parseEther("100")
                ),
            "RegistryFactory: must have admin role to create a registry",
        );

        let fee = ethers.utils.parseEther("100");
        let tx = await registryfactory.setRegistrationFee(fee); 
        tx.wait();
        expect(await registryfactory.registrationFee()).to.equal(fee);
    });

    it("Check Register by token feature.", async function () {
        // can't create two registries with the same name
        let tx = await registryfactory.setRegistrationToken(hypertoken.address);
        tx.wait();

        await expectRevert(
            registryfactory.connect(addr1).createRegistryByToken(
                "dummy",
                "dmy",
                addr1.address,
                true
            ),
        "ERC20: transfer amount exceeds allowance",
        );

        let fee = await registryfactory.registrationFee();
        let burnAddress = await registryfactory.burnAddress();

        tx = await hypertoken.connect(addr1).approve(registryfactory.address, fee);
        tx.wait();

        const previousBalance = await hypertoken.balanceOf(burnAddress);

        tx = await registryfactory.connect(addr1).createRegistryByToken("enumerabledummy", "edmy", addr1.address, true);
        tx.wait();

        let registryAddress = await registryfactory.nameToAddress("enumerabledummy");
        const dummyReg = new ethers.Contract(registryAddress, NFR.abi, addr1);

        expect(await registryfactory.getNumberOfEnumerableRegistries()).to.equal(2);
        expect(await hypertoken.balanceOf(addr1.address)).to.equal(fee);
        expect(await hypertoken.balanceOf(burnAddress)).to.equal(previousBalance.add(fee));
        expect(await dummyReg.name()).to.equal("enumerabledummy");
        expect(await dummyReg.symbol()).to.equal("edmy");

        tx = await hypertoken.connect(addr1).approve(registryfactory.address, fee);
        tx.wait();

        tx = await registryfactory.connect(addr1).createRegistryByToken("dummy", "dmy", addr1.address, false);
        tx.wait();
    });
});