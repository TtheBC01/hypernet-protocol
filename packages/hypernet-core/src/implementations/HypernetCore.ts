import { IHypernetCore } from "@interfaces/IHypernetCore";
import {
  HypernetLedger,
  BigNumber,
  Payment,
  EthereumAddress,
  PublicKey,
  ControlClaim,
  HypernetConfig,
  PublicIdentifier,
  Balances,
} from "@interfaces/objects";
import { EthersBlockchainProvider } from "@implementations/utilities/BlockchainProvider";
import { ConfigProvider } from "@implementations/utilities/ConfigProvider";
import { IBlockchainProvider } from "@interfaces/utilities/IBlockchainProvider";
import { ILedgerRepository } from "@interfaces/data";
import { VectorLedgerRepository } from "@implementations/data/VectorLedgerRepository";
import { ContextProvider } from "@implementations/utilities/ContextProvider";
import { IAccountsRepository } from "@interfaces/data/IAccountsRepository";
import { AccountsRepository } from "@implementations/data/AccountsRepository";
import { IContextProvider } from "@interfaces/utilities/IContextProvider";
import { Subject } from "rxjs";
import { IBrowserNodeProvider } from "@interfaces/utilities/IBrowserNodeProvider";
import { BrowserNodeProvider } from "@implementations/utilities/BrowserNodeProvider";
import { IVectorUtils, IConfigProvider } from "@interfaces/utilities";
import { VectorUtils } from "@implementations/utilities/VectorUtils";
import { IAccountService, IPaymentService } from "@interfaces/business";
import { AccountService, PaymentService } from "@implementations/business";

export class HypernetCore implements IHypernetCore {
  public onControlClaimed: Subject<ControlClaim>;
  public onControlYielded: Subject<ControlClaim>;

  protected blockchainProvider: IBlockchainProvider;
  protected configProvider: IConfigProvider;
  protected contextProvider: IContextProvider;
  protected browserNodeProvider: IBrowserNodeProvider;
  protected vectorUtils: IVectorUtils;

  protected accountRepository: IAccountsRepository;
  protected linkRepository: ILedgerRepository;

  protected accountService: IAccountService;
  protected paymentService: IPaymentService;

  protected _initialized: boolean;
  protected _inControl: boolean;

  constructor(config?: HypernetConfig) {
    this._initialized = false;
    this._inControl = false;

    this.onControlClaimed = new Subject<ControlClaim>();
    this.onControlYielded = new Subject<ControlClaim>();

    this.onControlClaimed.subscribe({
      next: () => {
        this._inControl = true;
      },
    });

    this.onControlYielded.subscribe({
      next: () => {
        this._inControl = false;
      },
    });

    this.blockchainProvider = new EthersBlockchainProvider();
    this.configProvider = new ConfigProvider(config);
    this.contextProvider = new ContextProvider(
      this.onControlClaimed,
      this.onControlYielded,
    );
    this.browserNodeProvider = new BrowserNodeProvider(this.configProvider, this.contextProvider);
    this.vectorUtils = new VectorUtils(this.configProvider, this.contextProvider, this.browserNodeProvider);

    this.accountRepository = new AccountsRepository(this.blockchainProvider, this.vectorUtils, this.browserNodeProvider);
    this.linkRepository = new VectorLedgerRepository(this.browserNodeProvider,
      this.configProvider,
      this.contextProvider,
      this.vectorUtils);

    this.paymentService = new PaymentService();

    this.accountService = new AccountService(this.accountRepository);
  }

  public initialized(): boolean {
    return this._initialized;
  }
  public inControl(): boolean {
    return this._inControl;
  }

  public async getEthereumAccounts(): Promise<EthereumAddress[]> {
    return this.accountService.getAccounts();
  }

  public async getPublicIdentifier(): Promise<PublicIdentifier> {
    const context = await this.contextProvider.getInitializedContext()

    return context.publicIdentifier;
  }

  public async depositFunds(assetAddress: string, amount: BigNumber): Promise<void> {
    return this.accountService.depositFunds(assetAddress, amount);
  }

  public async withdrawFunds(assetAddress: EthereumAddress,
    amount: BigNumber,
    destinationAddress: EthereumAddress): Promise<void> {
    return this.accountService.withdrawFunds(assetAddress, amount, destinationAddress);
  }

  public async getBalances(): Promise<Balances> {
    return this.accountService.getBalances();
  }

  public async getLedgers(): Promise<HypernetLedger[]> {
    throw new Error('Method not yet implemented.')
  }


  public async getActiveLedgers(): Promise<HypernetLedger[]> {
    throw new Error('Method not yet implemented.')
  }


  public async getLedgerByCounterparty(counterPartyAccount: PublicIdentifier): Promise<HypernetLedger> {
    throw new Error('Method not yet implemented.')
  }


  public async sendFunds(counterPartyAccount: PublicIdentifier,
    amount: BigNumber,
    expirationDate: moment.Moment,
    requiredStake: BigNumber,
    paymentToken: EthereumAddress,
    disputeMediator: PublicKey): Promise<HypernetLedger> {
    throw new Error('Method not yet implemented.')
  }


  public async authorizeFunds(counterPartyAccount: PublicIdentifier,
    totalAuthorized: BigNumber,
    expirationDate: moment.Moment,
    requiredStake: BigNumber,
    paymentToken: EthereumAddress,
    disputeMediator: PublicKey): Promise<HypernetLedger> {
    throw new Error('Method not yet implemented.')
  }

  public async acceptFunds(paymentId: string): Promise<HypernetLedger> {
    throw new Error('Method not yet implemented.')
  }

  public async pullFunds(paymentId: string,
    amount: BigNumber): Promise<HypernetLedger> {
    throw new Error('Method not yet implemented.')
  }

  public async finalizePullPayment(paymentId: string,
    finalAmount: BigNumber): Promise<HypernetLedger> {
    throw new Error('Method not yet implemented.')
  }

  public async initiateDispute(paymentId: string,
    metadata: string): Promise<HypernetLedger> {
    throw new Error('Method not yet implemented.')
  }

  /**
   * @param privateKey this is just for temporary usage.
   */
  public async initialize(account: string, privateKey: string): Promise<void> {
    const context = await this.contextProvider.getContext();
    context.account = account;
    context.privateKey = privateKey;
    await this.contextProvider.setContext(context);

    // const messagingListener = this.messagingListener.initialize();

    // await Promise.all([messagingListener]);

    // This should always be the last thing we do, after everything else is initialized
    // await this.controlService.claimControl();

    // Set the status bit
    this._initialized = true;
  }
}
