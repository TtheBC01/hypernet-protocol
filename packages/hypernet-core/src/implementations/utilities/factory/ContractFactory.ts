import {
  INonFungibleRegistryEnumerableUpgradeableContract,
  NonFungibleRegistryEnumerableUpgradeableContract,
} from "@hypernetlabs/contracts";
import { EthereumContractAddress } from "@hypernetlabs/objects";
import { inject, injectable } from "inversify";
import { ResultAsync } from "neverthrow";

import {
  IBlockchainProvider,
  IBlockchainProviderType,
} from "@interfaces/utilities";
import { IContractFactory } from "@interfaces/utilities/factory";

@injectable()
export class ContractFactory implements IContractFactory {
  public constructor(
    @inject(IBlockchainProviderType)
    protected blockchainProvider: IBlockchainProvider,
  ) {}

  public factoryNonFungibleRegistryEnumerableUpgradeableContract(
    contractAddress: EthereumContractAddress,
  ): ResultAsync<INonFungibleRegistryEnumerableUpgradeableContract, never> {
    return this.blockchainProvider.getGovernanceProvider().map((provider) => {
      return new NonFungibleRegistryEnumerableUpgradeableContract(
        provider,
        contractAddress,
      );
    });
  }
}