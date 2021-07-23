import { artifacts } from "@connext/vector-contracts";
import { ERC20Abi } from "@connext/vector-types";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import {
  TypedDataDomain,
  TypedDataField,
} from "@ethersproject/abstract-signer";
import {
  TransferAbis,
  BigNumberString,
  BlockchainUnavailableError,
  Signature,
  EthereumAddress,
  HexString,
} from "@hypernetlabs/objects";
import { ResultUtils } from "@hypernetlabs/utils";
import { Bytes, Contract, ethers } from "ethers";
import { ResultAsync } from "neverthrow";

import {
  IBlockchainProvider,
  IBlockchainUtils,
  IConfigProvider,
} from "@interfaces/utilities";

export class EthersBlockchainUtils implements IBlockchainUtils {
  protected erc20Abi: string[];
  constructor(
    protected blockchainProvider: IBlockchainProvider,
    protected configProvider: IConfigProvider,
  ) {
    // The ERC20Abi from Vector does not include the name() function, so we will roll our own
    this.erc20Abi = Object.assign([], ERC20Abi);
    this.erc20Abi.push("function name() view returns (string)");
  }

  public verifyTypedData(
    domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
    value: Record<string, any>,
    signature: Signature,
  ): EthereumAddress {
    return EthereumAddress(
      ethers.utils.verifyTypedData(domain, types, value, signature),
    );
  }

  public erc20Transfer(
    assetAddress: EthereumAddress,
    channelAddress: string,
    amount: BigNumberString,
  ): ResultAsync<TransactionResponse, BlockchainUnavailableError> {
    return this.blockchainProvider.getSigner().andThen((signer) => {
      const tokenContract = new Contract(assetAddress, this.erc20Abi, signer);
      return ResultAsync.fromPromise(
        tokenContract.transfer(channelAddress, amount),
        (err) => {
          return err as BlockchainUnavailableError;
        },
      );
    });
  }

  public mintToken(
    amount: BigNumberString,
    to: EthereumAddress,
  ): ResultAsync<TransactionResponse, BlockchainUnavailableError> {
    return this.blockchainProvider.getSigner().andThen((signer) => {
      const testTokenContract = new Contract(
        "0x9FBDa871d559710256a2502A2517b794B482Db40",
        artifacts.TestToken.abi,
        signer,
      );

      return ResultAsync.fromPromise(
        testTokenContract.mint(to, amount) as Promise<TransactionResponse>,
        (e) => {
          return e as BlockchainUnavailableError;
        },
      );
    });
  }

  public getMessageTransferEncodedCancelData(): ResultAsync<
    [string, HexString],
    BlockchainUnavailableError
  > {
    return ResultUtils.combine([
      this.blockchainProvider.getProvider(),
      this.configProvider.getConfig(),
    ]).andThen((vals) => {
      const [provider, config] = vals;
      const messageTransferContract = new Contract(
        config.messageTransferAddress,
        TransferAbis.MessageTransfer.abi,
        provider,
      );

      return ResultUtils.combine([
        ResultAsync.fromPromise(
          messageTransferContract.ResolverEncoding() as Promise<HexString>,
          (e) => {
            return e as BlockchainUnavailableError;
          },
        ),

        ResultAsync.fromPromise(
          messageTransferContract.EncodedCancel() as Promise<HexString>,
          (e) => {
            return e as BlockchainUnavailableError;
          },
        ),
      ]);
    });
  }

  public getInsuranceTransferEncodedCancelData(): ResultAsync<
    [string, HexString],
    BlockchainUnavailableError
  > {
    return ResultUtils.combine([
      this.blockchainProvider.getProvider(),
      this.configProvider.getConfig(),
    ]).andThen((vals) => {
      const [provider, config] = vals;
      const insuranceTransferContract = new Contract(
        config.insuranceTransferAddress,
        TransferAbis.Insurance.abi,
        provider,
      );

      return ResultUtils.combine([
        ResultAsync.fromPromise(
          insuranceTransferContract.ResolverEncoding() as Promise<HexString>,
          (e) => {
            return e as BlockchainUnavailableError;
          },
        ),

        ResultAsync.fromPromise(
          insuranceTransferContract.EncodedCancel() as Promise<HexString>,
          (e) => {
            return e as BlockchainUnavailableError;
          },
        ),
      ]);
    });
  }

  public getParameterizedTransferEncodedCancelData(): ResultAsync<
    [string, HexString],
    BlockchainUnavailableError
  > {
    return ResultUtils.combine([
      this.blockchainProvider.getProvider(),
      this.configProvider.getConfig(),
    ]).andThen((vals) => {
      const [provider, config] = vals;
      const parameterizedTransferContract = new Contract(
        config.parameterizedTransferAddress,
        TransferAbis.Parameterized.abi,
        provider,
      );

      return ResultUtils.combine([
        ResultAsync.fromPromise(
          parameterizedTransferContract.ResolverEncoding() as Promise<HexString>,
          (e) => {
            return e as BlockchainUnavailableError;
          },
        ),

        ResultAsync.fromPromise(
          parameterizedTransferContract.EncodedCancel() as Promise<HexString>,
          (e) => {
            return e as BlockchainUnavailableError;
          },
        ),
      ]);
    });
  }
}
