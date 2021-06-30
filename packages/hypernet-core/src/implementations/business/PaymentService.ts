import {
  EthereumAddress,
  Payment,
  PublicIdentifier,
  PullPayment,
  PushPayment,
  HypernetConfig,
  PaymentId,
  MerchantUrl,
  AcceptPaymentError,
  InsufficientBalanceError,
  InvalidParametersError,
  LogicalError,
  MerchantConnectorError,
  MerchantValidationError,
  PaymentFinalizeError,
  PaymentCreationError,
  InvalidPaymentError,
  PaymentStakeError,
  TransferCreationError,
  TransferResolutionError,
  BalancesUnavailableError,
  RouterChannelUnknownError,
  VectorError,
  BlockchainUnavailableError,
  EPaymentState,
  UnixTimestamp,
  BigNumberString,
} from "@hypernetlabs/objects";
import { ResultUtils, ILogUtils, ILogUtilsType } from "@hypernetlabs/utils";
import { BigNumber } from "ethers";
import { injectable, inject } from "inversify";
import { err, errAsync, ok, okAsync, ResultAsync, Result } from "neverthrow";

import { IPaymentService } from "@interfaces/business";
import {
  IAccountsRepository,
  IAccountsRepositoryType,
  ILinkRepository,
  ILinkRepositoryType,
  IMerchantConnectorRepository,
  IMerchantConnectorRepositoryType,
  IPaymentRepository,
  IPaymentRepositoryType,
} from "@interfaces/data";
import { HypernetContext } from "@interfaces/objects";
import {
  IConfigProvider,
  IConfigProviderType,
  IContextProvider,
  IContextProviderType,
} from "@interfaces/utilities";

type PaymentsByIdsErrors =
  | RouterChannelUnknownError
  | VectorError
  | BlockchainUnavailableError
  | LogicalError
  | InvalidPaymentError
  | InvalidParametersError;

/**
 * PaymentService uses Vector internally to send payments on the requested channel.
 * The order of operations for sending funds is as follows:
 * sendFunds() is called by sender, which creates a Message transfer with Vector, which triggers
 * offerReceived() on the recipient side, which tosses an event up to the user, who then calls
 * acceptOffers() to accept the sender's funds, which creates an Insurance transfer with Vector, which triggers
 * stakePosted() on the sender's side, which finally creates the Parameterized transfer with Vector, which triggers
 * paymentPosted() on the recipient's side, which finalizes/resolves the vector parameterized transfer.
 *
 * Note that the general expected order of operations is mirrored by the ordering of functions within this class.
 *
 * @todo we should also finalize the insurance transfer, and maybe finalize the offer transfer
 */
@injectable()
export class PaymentService implements IPaymentService {
  /**
   * Creates an instanceo of the paymentService.
   */

  constructor(
    @inject(ILinkRepositoryType) protected linkRepository: ILinkRepository,
    @inject(IAccountsRepositoryType)
    protected accountRepository: IAccountsRepository,
    @inject(IContextProviderType) protected contextProvider: IContextProvider,
    @inject(IConfigProviderType) protected configProvider: IConfigProvider,
    @inject(IPaymentRepositoryType)
    protected paymentRepository: IPaymentRepository,
    @inject(IMerchantConnectorRepositoryType)
    protected merchantConnectorRepository: IMerchantConnectorRepository,
    @inject(ILogUtilsType) protected logUtils: ILogUtils,
  ) {}

  /**
   * Authorizes funds to a specified counterparty, with an amount, rate, & expiration date.
   * @param counterPartyAccount the public identifier of the counterparty to authorize funds to
   * @param totalAuthorized the total amount the counterparty is allowed to "pull"
   * @param expirationDate the latest time in which the counterparty can pull funds. This must be after the full maturation date of totalAuthorized, as calculated via deltaAmount and deltaTime.
   * @param deltaAmount The amount per deltaTime to authorize
   * @param deltaTime the number of seconds after which deltaAmount will be authorized, up to the limit of totalAuthorized.
   * @param requiredStake the amount of stake the counterparyt must put up as insurance
   * @param paymentToken the (Ethereum) address of the payment token
   * @param merchantUrl the registered URL for the merchant that will resolve any disputes.
   */
  public authorizeFunds(
    counterPartyAccount: PublicIdentifier,
    totalAuthorized: BigNumberString,
    expirationDate: UnixTimestamp,
    deltaAmount: BigNumberString,
    deltaTime: number,
    requiredStake: BigNumberString,
    paymentToken: EthereumAddress,
    merchantUrl: MerchantUrl,
    metadata: string | null,
  ): ResultAsync<PullPayment, PaymentCreationError | LogicalError> {
    // @TODO Check deltaAmount, deltaTime, totalAuthorized, and expiration date
    // totalAuthorized / (deltaAmount/deltaTime) > ((expiration date - now) + someMinimumNumDays)

    return ResultUtils.combine([
      this.paymentRepository.createPullPayment(
        counterPartyAccount,
        totalAuthorized,
        deltaTime,
        deltaAmount,
        expirationDate,
        requiredStake,
        paymentToken,
        merchantUrl,
        metadata,
      ),
      this.contextProvider.getContext(),
    ]).map((vals) => {
      const [payment, context] = vals;

      // Send an event
      context.onPullPaymentSent.next(payment);

      return payment;
    });
  }

  public pullFunds(
    paymentId: PaymentId,
    amount: BigNumberString,
  ): ResultAsync<Payment, PaymentsByIdsErrors | PaymentCreationError> {
    // Pull the up the payment
    return this.paymentRepository
      .getPaymentsByIds([paymentId])
      .andThen((payments) => {
        const payment = payments.get(paymentId);

        // Verify that it is indeed a pull payment
        if (payment instanceof PullPayment) {
          const amountTransferred = BigNumber.from(payment.amountTransferred);
          // Verify that we're not pulling too quickly (greater than the average rate)
          if (amountTransferred.add(amount).gt(payment.vestedAmount)) {
            return errAsync(
              new InvalidParametersError(
                `Amount of ${amount} exceeds the vested payment amount of ${payment.vestedAmount}`,
              ),
            );
          }

          // Verify that the amount we're trying to pull does not exceed the total authorized amount
          if (amountTransferred.add(amount).gt(payment.authorizedAmount)) {
            return errAsync(
              new InvalidParametersError(
                `Amount of ${amount} exceeds the total authorized amount of ${payment.authorizedAmount}`,
              ),
            );
          }

          // Create the PullRecord
          return this.paymentRepository
            .createPullRecord(paymentId, amount)
            .andThen((payment) => {
              return this._refreshBalances().map(() => {
                return payment;
              });
            });
        } else {
          return errAsync(
            new InvalidParametersError(
              "Can not pull funds from a non pull payment",
            ),
          );
        }
      });
  }

  /**
   * Sends a payment to the specified recipient.
   * Internally, creates a null/message/offer transfer to communicate
   * with the counterparty and signal a request for a stake.
   * @param counterPartyAccount the intended recipient
   * @param amount the amount of payment to send
   * @param expirationDate the expiration date at which point this payment will revert
   * @param requiredStake the amount of insurance the counterparty should put up
   * @param paymentToken the (Ethereum) address of the payment token
   * @param merchantUrl the registered URL for the merchant that will resolve any disputes.
   */
  public sendFunds(
    counterPartyAccount: PublicIdentifier,
    amount: BigNumberString,
    expirationDate: UnixTimestamp,
    requiredStake: BigNumberString,
    paymentToken: EthereumAddress,
    merchantUrl: MerchantUrl,
    metadata: string | null,
  ): ResultAsync<PushPayment, PaymentCreationError | LogicalError> {
    // TODO: Sanity checking on the values
    return ResultUtils.combine([
      this.paymentRepository.createPushPayment(
        counterPartyAccount,
        amount,
        expirationDate,
        requiredStake,
        paymentToken,
        merchantUrl,
        metadata,
      ),
      this.contextProvider.getContext(),
    ]).map((vals) => {
      const [payment, context] = vals;

      // Send an event
      context.onPushPaymentSent.next(payment);

      return payment;
    });
  }

  /**
   * Called when someone has sent us a payment offer.
   * Lookup the transfer, and convert it to a payment.
   * Then, publish an RXJS event to the user.
   * @param paymentId the paymentId for the offer
   */
  public offerReceived(
    paymentId: PaymentId,
  ): ResultAsync<void, PaymentsByIdsErrors> {
    const prerequisites = ResultUtils.combine([
      this.paymentRepository.getPaymentsByIds([paymentId]),
      this.contextProvider.getInitializedContext(),
    ]);

    return prerequisites.andThen((vals) => {
      const [payments, context] = vals;

      const payment = payments.get(paymentId);

      if (payment == null) {
        return errAsync(
          new InvalidPaymentError(
            `PaymentService:offerReceived():Could not get payment!`,
          ),
        );
      }

      // offerReceived will be called even if we are the ones that created
      // the transfer. Because of that, we only want to generate an event
      // if the payment is TO us.
      if (
        payment.state !== EPaymentState.Proposed ||
        payment.to !== context.publicIdentifier
      ) {
        // The payment has already moved forward, somehow.
        // We don't need to do anything, we probably got called
        // by another instance of the core.
        return okAsync(undefined);
      }

      // Payment state is 'Proposed' and to us, continue to handle
      if (payment instanceof PushPayment) {
        // Someone wants to send us a pushPayment, emit up to the api
        context.onPushPaymentReceived.next(payment);
      } else if (payment instanceof PullPayment) {
        // Someone wants to send us a pullPayment, emit up to the api
        context.onPullPaymentReceived.next(payment);
      } else {
        throw new LogicalError("Unknown payment type!");
      }

      return this._refreshBalances();
    });
  }

  /**
   * For each paymentID provided, attempts to accept funds (ie: provide a stake) for that payment.
   * @param paymentIds a list of paymentIds for which to accept funds for
   */
  public acceptOffers(
    paymentIds: PaymentId[],
  ): ResultAsync<
    Result<Payment, AcceptPaymentError>[],
    | InsufficientBalanceError
    | AcceptPaymentError
    | BalancesUnavailableError
    | MerchantValidationError
    | PaymentsByIdsErrors
  > {
    let config: HypernetConfig;
    let payments: Map<PaymentId, Payment>;
    const merchantUrls = new Set<MerchantUrl>();

    return ResultUtils.combine([
      this.configProvider.getConfig(),
      this.paymentRepository.getPaymentsByIds(paymentIds),
    ])
      .andThen((vals) => {
        [config, payments] = vals;

        // Iterate over the payments, and find all the merchant URLs.

        for (const keyval of payments) {
          merchantUrls.add(keyval[1].merchantUrl);
        }

        return ResultUtils.combine([
          this.accountRepository.getBalanceByAsset(config.hypertokenAddress),
          this.merchantConnectorRepository.getMerchantAddresses(
            Array.from(merchantUrls),
          ),
        ]);
      })
      .andThen((vals) => {
        const [hypertokenBalance, addresses] = vals;

        // If we don't have a public key for each merchant, then we should not proceed.
        if (merchantUrls.size != addresses.size) {
          return errAsync(
            new MerchantValidationError("Not all merchants are authorized!"),
          );
        }

        // For each payment ID, call the singular version of acceptOffers
        // Wrap each one as a Result object, and return an array of Results
        let totalStakeRequired = BigNumber.from(0);
        // First, verify to make sure that we have enough hypertoken to cover the insurance collectively
        for (const [key, payment] of payments) {
          if (payment.state !== EPaymentState.Proposed) {
            return errAsync(
              new AcceptPaymentError(
                `Cannot accept payment ${payment.id}, it is not in the Proposed state`,
              ),
            );
          }

          totalStakeRequired = totalStakeRequired.add(
            BigNumber.from(payment.requiredStake),
          );
        }

        // Check the balance and make sure you have enough HyperToken to cover it
        if (
          BigNumber.from(hypertokenBalance.freeAmount).lt(totalStakeRequired)
        ) {
          return errAsync(
            new InsufficientBalanceError(
              "Not enough Hypertoken to cover provided payments.",
            ),
          );
        }

        // Now that we know we can (probably) make the payments, let's try
        const stakeAttempts = new Array<
          Promise<Result<Payment, AcceptPaymentError>>
        >();
        for (const keyval of payments) {
          const [paymentId, payment] = keyval;
          this.logUtils.log(
            `PaymentService:acceptOffers: attempting to provide stake for payment ${paymentId}`,
          );

          // We need to get the public key of the merchant for the payment
          const merchantAddress = addresses.get(payment.merchantUrl);

          if (merchantAddress != null) {
            const stakeAttempt = this.paymentRepository
              .provideStake(paymentId, merchantAddress)
              .match(
                (payment) => ok(payment) as Result<Payment, AcceptPaymentError>,
                (e) =>
                  err(
                    new AcceptPaymentError(
                      `Payment ${paymentId} could not be staked!`,
                      e,
                    ),
                  ),
              );

            stakeAttempts.push(stakeAttempt);
          } else {
            throw new LogicalError(
              "Merchant does not have a public key; are they ",
            );
          }
        }
        return ResultAsync.fromPromise(
          Promise.all(stakeAttempts),
          (e) => new AcceptPaymentError("Error while staking payment", e),
        ).andThen((paymentsResult) => {
          return this._refreshBalances().map(() => paymentsResult);
        });
      });
  }

  /**
   * Notifies the service that a stake has been posted; if verified,
   * then provides assets to the counterparty (ie a parameterizedPayment)
   * @param paymentId the paymentId for the stake
   */
  public stakePosted(
    paymentId: PaymentId,
  ): ResultAsync<
    void,
    | InvalidPaymentError
    | PaymentFinalizeError
    | PaymentStakeError
    | TransferResolutionError
    | PaymentsByIdsErrors
    | TransferCreationError
  > {
    this.logUtils.debug(`Insurance transfer created for payment ${paymentId}`);

    return ResultUtils.combine([
      this.paymentRepository.getPaymentsByIds([paymentId]),
      this.contextProvider.getInitializedContext(),
    ]).andThen((vals) => {
      const [payments, context] = vals;

      const payment = payments.get(paymentId);

      if (payment == null) {
        this.logUtils.error(`Invalid payment ID: ${paymentId}`);
        return errAsync(new InvalidPaymentError("Invalid payment ID!"));
      }

      // Let the UI know we got an insurance transfer
      if (payment instanceof PushPayment) {
        context.onPushPaymentUpdated.next(payment);
      }
      if (payment instanceof PullPayment) {
        context.onPullPaymentUpdated.next(payment);
      }

      return this._advancePayment(payment, context);
    });
  }

  /**
   * Notifies the service that the parameterized payment has been created.
   * Called by the reciever of a parameterized transfer, AFTER they have put up stake,
   * and after the sender has created the Parameterized transfer
   * @param paymentId the payment ID to accept/resolve
   */
  public paymentPosted(
    paymentId: PaymentId,
  ): ResultAsync<
    void,
    | PaymentFinalizeError
    | PaymentStakeError
    | TransferResolutionError
    | PaymentsByIdsErrors
    | TransferCreationError
  > {
    this.logUtils.debug(`Payment transfer created for payment ${paymentId}`);

    return ResultUtils.combine([
      this.paymentRepository.getPaymentsByIds([paymentId]),
      this.contextProvider.getInitializedContext(),
    ]).andThen((vals) => {
      const [payments, context] = vals;

      const payment = payments.get(paymentId);

      if (payment == null) {
        this.logUtils.error(`Invalid payment ID: ${paymentId}`);
        return errAsync(new InvalidParametersError("Invalid payment ID!"));
      }

      // Let the UI know we got a parameterized transfer. For push payments, this is
      // just an update, for a pull payment, it means you can start pulling
      if (payment instanceof PushPayment) {
        context.onPushPaymentUpdated.next(payment);
      }
      if (payment instanceof PullPayment) {
        context.onPullPaymentReceived.next(payment);
      }

      return this._advancePayment(payment, context);
    });
  }

  /**
   * Notifies the service that the parameterized payment has been resolved.
   * @param paymentId the payment id that has been resolved.
   */
  public paymentCompleted(
    paymentId: PaymentId,
  ): ResultAsync<
    void,
    | PaymentFinalizeError
    | PaymentStakeError
    | TransferResolutionError
    | PaymentsByIdsErrors
    | TransferCreationError
  > {
    return ResultUtils.combine([
      this.paymentRepository.getPaymentsByIds([paymentId]),
      this.contextProvider.getInitializedContext(),
    ]).andThen((vals) => {
      const [payments, context] = vals;

      const payment = payments.get(paymentId);

      if (payment == null) {
        this.logUtils.error(`Invalid payment ID: ${paymentId}`);
        return errAsync(new InvalidParametersError("Invalid payment ID!"));
      }

      // Let the UI know we got an insurance transfer
      if (payment instanceof PushPayment) {
        context.onPushPaymentUpdated.next(payment);
      }
      if (payment instanceof PullPayment) {
        context.onPullPaymentUpdated.next(payment);
      }

      return this._advancePayment(payment, context);
    });
  }

  /**
   * Right now, if the insurance is resolved, all we need to do is generate an update event.
   *
   * @param paymentId
   */
  public insuranceResolved(
    paymentId: PaymentId,
  ): ResultAsync<
    void,
    | PaymentFinalizeError
    | PaymentStakeError
    | TransferResolutionError
    | PaymentsByIdsErrors
    | TransferCreationError
  > {
    this.logUtils.debug(`Insurance transfer resolved for payment ${paymentId}`);

    return ResultUtils.combine([
      this.paymentRepository.getPaymentsByIds([paymentId]),
      this.contextProvider.getInitializedContext(),
    ]).andThen((vals) => {
      const [payments, context] = vals;

      const payment = payments.get(paymentId);

      if (payment == null) {
        this.logUtils.error(`Invalid payment ID: ${paymentId}`);
        return errAsync(new InvalidParametersError("Invalid payment ID!"));
      }

      // Let the UI know we got an insurance transfer
      if (payment instanceof PushPayment) {
        context.onPushPaymentUpdated.next(payment);
      }
      if (payment instanceof PullPayment) {
        context.onPullPaymentUpdated.next(payment);
      }

      return this._advancePayment(payment, context);
    });
  }

  /**
   * Notifies the service that a pull-payment has been recorded.
   * @param paymentId the paymentId for the pull-payment
   */
  public pullRecorded(
    paymentId: PaymentId,
  ): ResultAsync<void, PaymentsByIdsErrors> {
    return ResultUtils.combine([
      this.paymentRepository.getPaymentsByIds([paymentId]),
      this.contextProvider.getContext(),
    ]).andThen((vals) => {
      const [payments, context] = vals;
      const payment = payments.get(paymentId);

      if (payment == null) {
        return errAsync(new InvalidParametersError("Invalid payment ID!"));
      }

      // Notify the world that this pull payment was updated
      if (payment instanceof PullPayment) {
        context.onPullPaymentUpdated.next(payment);
      }

      return this._refreshBalances();
    });
  }

  public initiateDispute(
    paymentId: PaymentId,
  ): ResultAsync<
    Payment,
    | MerchantConnectorError
    | MerchantValidationError
    | PaymentsByIdsErrors
    | TransferResolutionError
  > {
    // Get the payment
    return this.paymentRepository
      .getPaymentsByIds([paymentId])
      .andThen((payments) => {
        const payment = payments.get(paymentId);

        if (payment == null) {
          return errAsync<void, InvalidParametersError>(
            new InvalidParametersError("Invalid payment ID"),
          );
        }

        // You can only dispute payments that are in the accepted state- the reciever has taken their money.
        // The second condition can't happen if it's in Accepted unless something is very, very badly wrong,
        // but it keeps typescript happy
        if (
          payment.state != EPaymentState.Accepted ||
          payment.details.insuranceTransferId == null
        ) {
          return errAsync<void, InvalidParametersError>(
            new InvalidParametersError(
              "Can not dispute a payment that is not in the Accepted state",
            ),
          );
        }

        // Resolve the dispute
        return this.merchantConnectorRepository.resolveChallenge(
          payment.merchantUrl,
          paymentId,
          payment.details.insuranceTransferId,
        );
      })
      .andThen(() => {
        return this.paymentRepository.getPaymentsByIds([paymentId]);
      })
      .andThen((payments) => {
        const payment = payments.get(paymentId);
        if (payment == null) {
          return errAsync(new InvalidParametersError("Invalid payment ID"));
        }
        return this._refreshBalances().andThen(() => okAsync(payment));
      });
  }

  public resolveInsurance(
    paymentId: PaymentId,
  ): ResultAsync<
    Payment,
    | RouterChannelUnknownError
    | VectorError
    | BlockchainUnavailableError
    | LogicalError
    | InvalidPaymentError
    | InvalidParametersError
    | TransferResolutionError
  > {
    // Get the payment
    return this.paymentRepository
      .getPaymentsByIds([paymentId])
      .andThen((payments) => {
        const payment = payments.get(paymentId);

        if (payment == null) {
          return errAsync(new InvalidParametersError("Invalid payment ID"));
        }

        // You can only resolve payments insurance that are in the accepted state- the reciever has taken their money but you they still
        // have payment amount staked as an insurace amount.
        // The second condition can't happen if it's in Accepted unless something is very, very badly wrong,
        // but it keeps typescript happy
        if (
          payment.state != EPaymentState.Accepted ||
          payment.details.insuranceTransferId == null
        ) {
          return errAsync(
            new InvalidParametersError(
              "Can not resolve payment that is not in the Accepted state",
            ),
          );
        }
        // Making sure the payment staked amount(the insurance amount) is equal to the payment required staked amount
        if (
          payment.amountStaked.toString() != payment.requiredStake.toString()
        ) {
          return errAsync(
            new InvalidParametersError(
              "Payment insurance amount should be equal to payment required staked amount",
            ),
          );
        }

        // Resolve the insurance
        return this.paymentRepository.resolveInsurance(
          paymentId,
          payment.details.insuranceTransferId,
        );
      })
      .andThen(() => {
        return this.paymentRepository.getPaymentsByIds([paymentId]);
      })
      .andThen((payments) => {
        const payment = payments.get(paymentId);
        if (payment == null) {
          return errAsync(new InvalidParametersError("Invalid payment ID"));
        }
        return okAsync(payment);
      });
  }

  public advancePayments(
    paymentIds: PaymentId[],
  ): ResultAsync<
    void,
    | PaymentFinalizeError
    | PaymentStakeError
    | TransferResolutionError
    | PaymentsByIdsErrors
    | TransferCreationError
  > {
    return ResultUtils.combine([
      this.paymentRepository.getPaymentsByIds(paymentIds),
      this.contextProvider.getContext(),
    ])
      .map((vals) => {
        const [payments, context] = vals;

        const paymentAdvancements = new Array<
          ResultAsync<
            void,
            | PaymentFinalizeError
            | PaymentStakeError
            | TransferResolutionError
            | PaymentsByIdsErrors
            | TransferCreationError
          >
        >();
        for (const keyval of payments) {
          const [paymentId, payment] = keyval;
          paymentAdvancements.push(this._advancePayment(payment, context));
        }
        return ResultUtils.combine(paymentAdvancements);
      })
      .map(() => {});
  }

  protected _advancePayment(
    payment: Payment,
    context: HypernetContext,
  ): ResultAsync<
    void,
    | PaymentFinalizeError
    | PaymentStakeError
    | TransferResolutionError
    | PaymentsByIdsErrors
    | TransferCreationError
  > {
    this.logUtils.debug(`Advancing payment ${payment.id}`);

    return this.merchantConnectorRepository
      .getAuthorizedMerchantsConnectorsStatus()
      .andThen((merchantConnectorStatusMap) => {
        const merchantConnectorStatus = merchantConnectorStatusMap.get(
          payment.merchantUrl,
        );
        this.logUtils.debug(
          `In _advancePayment, merchantConnectorStatus = ${
            merchantConnectorStatus == true
          }`,
        );
        if (merchantConnectorStatus == true) {
          return this._advancePaymentForActivatedMerchant(
            payment,
            context,
          ).map(() => {});
        } else {
          // Validator is not active, so we will not advance the payment
          this.logUtils.debug(
            `Validator inactive, payment ${payment.id} will be delayed`,
          );

          // fire an event for payment advancement error / onPaymentDelay
          if (payment instanceof PushPayment) {
            context.onPushPaymentDelayed.next(payment);
          }
          if (payment instanceof PullPayment) {
            context.onPullPaymentDelayed.next(payment);
          }
          return this._refreshBalances();
        }
      });
  }

  protected _advancePaymentForActivatedMerchant(
    payment: Payment,
    context: HypernetContext,
  ): ResultAsync<
    Payment,
    | PaymentFinalizeError
    | PaymentStakeError
    | TransferResolutionError
    | PaymentsByIdsErrors
    | TransferCreationError
  > {
    // Notified the UI, move on to advancing the state of the payment.
    // Payment state must be in "staked" in order to progress
    const paymentId = payment.id;
    if (
      payment.state == EPaymentState.Staked &&
      payment.from === context.publicIdentifier
    ) {
      // If the payment state is staked, we know that the proper
      // insurance has been posted.
      this.logUtils.log(`Providing asset for paymentId ${paymentId}`);
      return this.paymentRepository
        .provideAsset(paymentId)
        .andThen((updatedPayment) => {
          if (updatedPayment instanceof PushPayment) {
            context.onPushPaymentUpdated.next(updatedPayment);
          }
          if (updatedPayment instanceof PullPayment) {
            context.onPullPaymentUpdated.next(updatedPayment);
          }
          return okAsync(updatedPayment);
        });
    }

    // Payment state must be in "approved" to finalize
    if (
      payment.state == EPaymentState.Approved &&
      payment.to === context.publicIdentifier
    ) {
      // If the payment state is approved, we know that it matches our insurance payment
      if (payment instanceof PushPayment) {
        // Resolve the parameterized payment immediately for the full balance
        return this.paymentRepository
          .acceptPayment(paymentId, payment.paymentAmount)
          .map((finalizedPayment) => {
            context.onPushPaymentUpdated.next(finalizedPayment as PushPayment);
            return payment;
          });
      }
    }

    return okAsync(payment);
  }

  // Caculates balances and update the context after that
  private _refreshBalances(): ResultAsync<
    void,
    BalancesUnavailableError | VectorError | RouterChannelUnknownError
  > {
    return ResultUtils.combine([
      this.contextProvider.getContext(),
      this.accountRepository.getBalances(),
    ]).map((vals) => {
      const [context, balances] = vals;
      context.onBalancesChanged.next(balances);
    });
  }
}
