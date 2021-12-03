import {
  EthereumAccountAddress,
  EthereumContractAddress,
  GovernanceAbis,
  RegistryFactoryContractError,
} from "@hypernetlabs/objects";
import { BigNumber, ethers } from "ethers";
import { ResultAsync } from "neverthrow";

import { IRegistryFactoryContract } from "@contracts/IRegistryFactoryContract";

export class RegistryFactoryContract implements IRegistryFactoryContract {
  protected contract: ethers.Contract | null = null;
  constructor(
    protected providerOrSigner:
      | ethers.providers.Provider
      | ethers.providers.JsonRpcSigner
      | ethers.Wallet,
    contractAddress: EthereumContractAddress,
  ) {
    this.contract = new ethers.Contract(
      contractAddress,
      GovernanceAbis.UpgradeableRegistryFactory.abi,
      providerOrSigner,
    );
  }

  public getContractAddress(): EthereumContractAddress {
    return EthereumContractAddress(this.contract?.address || "");
  }

  public getContract(): ethers.Contract | null {
    return this.contract;
  }

  public addressToName(
    registryAddress: EthereumContractAddress,
  ): ResultAsync<EthereumContractAddress, RegistryFactoryContractError> {
    return ResultAsync.fromPromise(
      this.contract?.addressToName(
        registryAddress,
      ) as Promise<EthereumContractAddress>,
      (e) => {
        return new RegistryFactoryContractError(
          "Unable to call factoryContract addressToName()",
          e,
        );
      },
    );
  }

  public enumerableRegistries(
    index: number,
  ): ResultAsync<EthereumContractAddress, RegistryFactoryContractError> {
    return ResultAsync.fromPromise(
      this.contract?.enumerableRegistries(
        index,
      ) as Promise<EthereumContractAddress>,
      (e) => {
        return new RegistryFactoryContractError(
          "Unable to call factoryContract enumerableRegistries()",
          e,
        );
      },
    );
  }

  public nameToAddress(
    registryName: string,
  ): ResultAsync<EthereumContractAddress, RegistryFactoryContractError> {
    return ResultAsync.fromPromise(
      this.contract?.nameToAddress(
        registryName,
      ) as Promise<EthereumContractAddress>,
      (e) => {
        return new RegistryFactoryContractError(
          "Unable to call factoryContract nameToAddress()",
          e,
        );
      },
    );
  }

  public getNumberOfEnumerableRegistries(): ResultAsync<
    number,
    RegistryFactoryContractError
  > {
    return ResultAsync.fromPromise(
      this.contract?.getNumberOfEnumerableRegistries() as Promise<BigNumber>,
      (e) => {
        return new RegistryFactoryContractError(
          "Unable to call factoryContract getNumberOfEnumerableRegistries()",
          e,
        );
      },
    ).map((numberOfRegistries) => numberOfRegistries.toNumber());
  }

  public registrationFee(): ResultAsync<
    BigNumber,
    RegistryFactoryContractError
  > {
    return ResultAsync.fromPromise(
      this.contract?.registrationFee() as Promise<BigNumber>,
      (e) => {
        return new RegistryFactoryContractError(
          "Unable to call factoryContract registrationFee()",
          e,
        );
      },
    );
  }

  public createRegistryByToken(
    name: string,
    symbol: string,
    registrarAddress: EthereumAccountAddress,
    enumerable: boolean,
  ): ResultAsync<void, RegistryFactoryContractError> {
    return ResultAsync.fromPromise(
      this.contract?.createRegistryByToken(
        name,
        symbol,
        registrarAddress,
        enumerable,
      ) as Promise<ethers.providers.TransactionResponse>,
      (e) => {
        return new RegistryFactoryContractError(
          "Unable to call factoryContract createRegistryByToken()",
          e,
        );
      },
    )
      .andThen((tx) => {
        return ResultAsync.fromPromise(tx.wait(), (e) => {
          return new RegistryFactoryContractError("Unable to wait for tx", e);
        });
      })
      .map(() => {});
  }

  public modules(
    index: number,
  ): ResultAsync<EthereumContractAddress, RegistryFactoryContractError> {
    return ResultAsync.fromPromise(
      this.contract?.modules(index) as Promise<EthereumContractAddress>,
      (e) => {
        return new RegistryFactoryContractError(
          "Unable to call factoryContract modules()",
          e,
        );
      },
    );
  }

  public getModuleName(
    moduleAddress: EthereumContractAddress,
  ): ResultAsync<string, RegistryFactoryContractError> {
    const moduleABI = [
      {
        inputs: [],
        name: "name",
        outputs: [
          {
            internalType: "string",
            name: "",
            type: "string",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ];

    const moduleContract = new ethers.Contract(
      moduleAddress,
      moduleABI,
      this.providerOrSigner,
    );

    return ResultAsync.fromPromise(
      moduleContract?.name() as Promise<string>,
      (e) => {
        return new RegistryFactoryContractError(
          "Unable to call moduleContract name()",
          e,
        );
      },
    );
  }

  public getNumberOfModules(): ResultAsync<
    number,
    RegistryFactoryContractError
  > {
    return ResultAsync.fromPromise(
      this.contract?.getNumberOfModules() as Promise<BigNumber>,
      (e) => {
        return new RegistryFactoryContractError(
          "Unable to call factoryContract getNumberOfModules()",
          e,
        );
      },
    ).map((numberOfRegistries) => numberOfRegistries.toNumber());
  }
}
