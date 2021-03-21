import { IAccountService } from "@interfaces/business";
import { IAccountsRepository } from "@interfaces/data";
import {
  Balances,
  EthereumAddress,
  HypernetContext,
  InitializedHypernetContext,
  PublicIdentifier,
} from "@hypernetlabs/objects";
import {
  BalancesUnavailableError,
  BlockchainUnavailableError,
  CoreUninitializedError,
  LogicalError,
  VectorError,
} from "@hypernetlabs/objects";
import { IContextProvider, ILogUtils } from "@interfaces/utilities";
import { okAsync, ResultAsync } from "neverthrow";
import { BigNumber } from "ethers";

/**
 *
 */
export class AccountService implements IAccountService {
  constructor(
    protected accountRepository: IAccountsRepository,
    protected contextProvider: IContextProvider,
    protected logUtils: ILogUtils,
  ) {}

  public getPublicIdentifier(): ResultAsync<PublicIdentifier, VectorError | LogicalError> {
    return this.accountRepository.getPublicIdentifier();
  }

  public getAccounts(): ResultAsync<string[], BlockchainUnavailableError> {
    return this.accountRepository.getAccounts();
  }

  public getBalances(): ResultAsync<Balances, BalancesUnavailableError | CoreUninitializedError> {
    return this.accountRepository.getBalances();
  }

  public depositFunds(
    assetAddress: EthereumAddress,
    amount: BigNumber,
  ): ResultAsync<
    Balances,
    BalancesUnavailableError | CoreUninitializedError | BlockchainUnavailableError | VectorError | Error
  > {
    this.logUtils.log(`HypernetCore:depositFunds: assetAddress: ${assetAddress}`);

    let context: HypernetContext;

    return this.contextProvider
      .getContext()
      .andThen((contextVal) => {
        context = contextVal;

        return this.accountRepository.depositFunds(assetAddress, amount);
      })
      .andThen(() => {
        return this.accountRepository.getBalances();
      })
      .andThen((balances) => {
        context.onBalancesChanged.next(balances);

        return okAsync(balances);
      });
  }

  public withdrawFunds(
    assetAddress: EthereumAddress,
    amount: BigNumber,
    destinationAddress: EthereumAddress,
  ): ResultAsync<
    Balances,
    BalancesUnavailableError | CoreUninitializedError | BlockchainUnavailableError | VectorError | Error
  > {
    let context: InitializedHypernetContext;

    return this.contextProvider
      .getInitializedContext()
      .andThen((contextVal) => {
        context = contextVal;
        return this.accountRepository.withdrawFunds(assetAddress, amount, destinationAddress);
      })
      .andThen(() => {
        return this.accountRepository.getBalances();
      })
      .andThen((balances) => {
        context.onBalancesChanged.next(balances);

        return okAsync(balances);
      });
  }
}
