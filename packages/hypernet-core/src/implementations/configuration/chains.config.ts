import {
  ChainId,
  ChainInformation,
  EthereumContractAddress,
  GovernanceChainInformation,
  ProviderUrl,
} from "@hypernetlabs/objects";

export const chainConfig = new Map<ChainId, ChainInformation>([
  [
    ChainId(1337),
    new GovernanceChainInformation(
      "Local Development Chain",
      ChainId(1337),
      true,
      EthereumContractAddress("0xF12b5dd4EAD5F743C6BaA640B0216200e89B60Da"), // channelFactory
      EthereumContractAddress("0x8f0483125FCb9aaAEFA9209D8E9d7b9C8B9Fb90F"), // transferRegistry
      EthereumContractAddress("0xAa588d3737B611baFD7bD713445b314BD453a5C8"), // hypertoken
      EthereumContractAddress("0xFB88dE099e13c3ED21F80a7a1E49f8CAEcF10df6"), // messageTransfer
      EthereumContractAddress("0x30753E4A8aad7F8597332E813735Def5dD395028"), // insuranceTransfer
      EthereumContractAddress("0x2C2B9C9a4a25e24B174f26114e8926a9f2128FE4"), // parameterizedTransfer
      EthereumContractAddress("0xdDA6327139485221633A1FcD65f4aC932E60A2e1"), // hypernetGovernor
      EthereumContractAddress("0x82D50AD3C1091866E258Fd0f1a7cC9674609D254"), // registryFactory
      EthereumContractAddress("0x48005e7dDF065DE036Bf0D693DDb0011aE7a041c"), // gatewayRegistry
      EthereumContractAddress("0x6408D38D12F97C33e31D3D7C698FfDb6870e8217"), // liquidityRegistry
      EthereumContractAddress("0x10C6FA5fb8A6C6b97126501E24b70F5e9CcF2E80"), // tokenRegistry
      EthereumContractAddress("0x973d5Ab6084B2c6AB30762d7137204287e7f0276"), // chainRegistry
      EthereumContractAddress("TODO"), // batchModuleAddress
      [ProviderUrl("http://localhost:8545")],
    ),
  ],
  [
    ChainId(1369),
    new GovernanceChainInformation(
      "Dev Environment Chain",
      ChainId(1369),
      true,
      EthereumContractAddress("0xF12b5dd4EAD5F743C6BaA640B0216200e89B60Da"), // channelFactory
      EthereumContractAddress("0x8f0483125FCb9aaAEFA9209D8E9d7b9C8B9Fb90F"), // transferRegistry
      EthereumContractAddress("0xAa588d3737B611baFD7bD713445b314BD453a5C8"), // hypertoken
      EthereumContractAddress("0xFB88dE099e13c3ED21F80a7a1E49f8CAEcF10df6"), // messageTransfer
      EthereumContractAddress("0x30753E4A8aad7F8597332E813735Def5dD395028"), // insuranceTransfer
      EthereumContractAddress("0x2C2B9C9a4a25e24B174f26114e8926a9f2128FE4"), // parameterizedTransfer
      EthereumContractAddress("0xdDA6327139485221633A1FcD65f4aC932E60A2e1"), // hypernetGovernor
      EthereumContractAddress("0x82D50AD3C1091866E258Fd0f1a7cC9674609D254"), // registryFactory
      EthereumContractAddress("0x6408D38D12F97C33e31D3D7C698FfDb6870e8217"), // gatewayRegistry
      EthereumContractAddress("0x29A5Df5784eC1e58a03557e825470A217534C816"), // liquidityRegistry
      EthereumContractAddress("0x973d5Ab6084B2c6AB30762d7137204287e7f0276"), // tokenRegistry
      EthereumContractAddress("0xCdFa906b330485021fD37d5E3Ceab4F11D5101c6"), // chainRegistry
      EthereumContractAddress("TODO"), // batchModuleAddress
      [ProviderUrl("https://eth-provider-dev.hypernetlabs.io")],
    ),
  ],
  [
    ChainId(4),
    new GovernanceChainInformation(
      "Rinkeby",
      ChainId(4),
      true,
      EthereumContractAddress("0xC82e22B0Ef5808DE0F7E9CeB265499e29012b02c"), // channelFactory
      EthereumContractAddress("0x4b86a332d76b21933d245fEF7636B1019EE6C824"), // transferRegistry
      EthereumContractAddress("0x6D4eE7f794103672490830e15308A99eB7a89024"), // hypertoken
      EthereumContractAddress("0x9E86dd60e0B1e7e142F033d1BdEf734c6b3224Bb"), // messageTransfer
      EthereumContractAddress("0xed911640fd86f92fD1337526010adda8F3Eb8344"), // insuranceTransfer
      EthereumContractAddress("0x5FAe7F15Ae20A10053CCca1DcFce0E2Bb4D50A7d"), // parameterizedTransfer
      EthereumContractAddress("0x3353da0f24fCACd83832b09e9371a937195D2640"), // hypernetGovernor
      EthereumContractAddress("0x60eFCb4dDA1bef87aA244006273e3DdDb0E4abCB"), // registryFactory
      EthereumContractAddress("0x507D5F4E81db1c7fa078CBf1e59B37cC91640258"), // gatewayRegistry
      EthereumContractAddress("0xc616c67f9c680E662103b26cEfFcC70a121CD5d5"), // liquidityRegistry
      EthereumContractAddress("0x4BE5BA85859B124a52fBE822d042AcdCd3b4eC4D"), // tokenRegistry
      EthereumContractAddress("TODO"), // chainRegistry
      EthereumContractAddress("TODO"), // batchModuleAddress
      [
        ProviderUrl(
          "https://rinkeby.infura.io/v3/72827ccd538446f2a20e35a632664c52",
        ),
      ],
    ),
  ],
  [
    ChainId(1),
    new GovernanceChainInformation(
      "MainNet",
      ChainId(1),
      true,
      EthereumContractAddress("TODO"), // channelFactory
      EthereumContractAddress("TODO"), // transferRegistry
      EthereumContractAddress("TODO"), // hypertoken
      EthereumContractAddress("TODO"), // messageTransfer
      EthereumContractAddress("TODO"), // insuranceTransfer
      EthereumContractAddress("TODO"), // parameterizedTransfer
      EthereumContractAddress("TODO"), // hypernetGovernor
      EthereumContractAddress("TODO"), // registryFactory
      EthereumContractAddress("TODO"), // gatewayRegistry
      EthereumContractAddress("TODO"), // liquidityRegistry
      EthereumContractAddress("TODO"), // tokenRegistry
      EthereumContractAddress("TODO"), // chainRegistry
      EthereumContractAddress("TODO"), // batchModuleAddress
      [ProviderUrl("https://mainnet.hypernet.foundation")],
    ),
  ],
]);
