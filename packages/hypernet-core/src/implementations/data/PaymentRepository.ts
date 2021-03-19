import { NodeResponses } from "@connext/vector-types";
import { ResultUtils } from "@hypernetlabs/utils";
import { IPaymentRepository } from "@interfaces/data";
import {
  EthereumAddress,
  HypernetConfig,
  IHypernetOfferDetails,
  InitializedHypernetContext,
  Payment,
  PublicIdentifier,
  PublicKey,
  PullPayment,
  PushPayment,
  IHypernetPullPaymentDetails,
  IFullTransferState,
  IBasicTransferResponse,
} from "@hypernetlabs/objects";
import {
  CoreUninitializedError,
  LogicalError,
  PaymentFinalizeError,
  PaymentStakeError,
  RouterChannelUnknownError,
  TransferResolutionError,
  VectorError,
} from "@hypernetlabs/objects/errors";
import { EPaymentType, ETransferType, MessageState, EMessageTransferType } from "@hypernetlabs/objects/types";
import {
  IBrowserNode,
  IBrowserNodeProvider,
  IConfigProvider,
  IContextProvider,
  ILogUtils,
  IPaymentUtils,
  ITimeUtils,
  IVectorUtils,
} from "@interfaces/utilities";
import { ResultAsync, errAsync, okAsync } from "neverthrow";
import { BigNumber } from "ethers";

/**
 * Contains methods for creating push, pull, etc payments,
 * as well as retrieving them, and finalizing them.
 */
export class PaymentRepository implements IPaymentRepository {
  /**
   * Returns an instance of PaymentRepository
   */
  constructor(
    protected browserNodeProvider: IBrowserNodeProvider,
    protected vectorUtils: IVectorUtils,
    protected configProvider: IConfigProvider,
    protected contextProvider: IContextProvider,
    protected paymentUtils: IPaymentUtils,
    protected logUtils: ILogUtils,
    protected timeUtils: ITimeUtils,
  ) {}

  public createPullRecord(
    paymentId: string,
    amount: string,
  ): ResultAsync<Payment, RouterChannelUnknownError | CoreUninitializedError | VectorError | Error> {
    let transfers: IFullTransferState[];
    let browserNode: IBrowserNode;

    return ResultUtils.combine([this._getTransfersByPaymentId(paymentId), this.browserNodeProvider.getBrowserNode()])
      .andThen((vals) => {
        [transfers, browserNode] = vals;
        return this.paymentUtils.transfersToPayment(paymentId, transfers);
      })
      .andThen((payment) => {
        const message: IHypernetPullPaymentDetails = {
          messageType: EMessageTransferType.PULLPAYMENT,
          paymentId: paymentId,
          to: payment.to,
          from: payment.from,
          paymentToken: payment.paymentToken,
          pullPaymentAmount: amount,
        };

        return this.vectorUtils.createPullNotificationTransfer(payment.to, message);
      })
      .andThen((transferResponse) => {
        // Get the newly minted transfer
        return browserNode.getTransfer(transferResponse.transferId);
      })
      .andThen((newTransfer) => {
        // Add the new transfer to the list
        transfers.push(newTransfer);

        // Convert the list of transfers to a payment (again)
        return this.paymentUtils.transfersToPayment(paymentId, transfers);
      });
  }

  public createPullPayment(
    counterPartyAccount: PublicIdentifier,
    maximumAmount: string, // TODO: amounts should be consistently use BigNumber
    deltaTime: number,
    deltaAmount: string, // TODO: amounts should be consistently use BigNumber
    expirationDate: number,
    requiredStake: string, // TODO: amounts should be consistently use BigNumber
    paymentToken: EthereumAddress,
    merchantUrl: string,
  ): ResultAsync<PullPayment, RouterChannelUnknownError | CoreUninitializedError | VectorError | Error> {
    let browserNode: IBrowserNode;
    let context: InitializedHypernetContext;
    let paymentId: string;
    let timestamp: number;

    return ResultUtils.combine([
      this.browserNodeProvider.getBrowserNode(),
      this.contextProvider.getInitializedContext(),
      this.paymentUtils.createPaymentId(EPaymentType.Pull),
      this.timeUtils.getBlockchainTimestamp(),
    ])
      .andThen((vals) => {
        [browserNode, context, paymentId, timestamp] = vals;

        const message: IHypernetOfferDetails = {
          messageType: EMessageTransferType.OFFER,
          paymentId,
          creationDate: timestamp,
          to: counterPartyAccount,
          from: context.publicIdentifier,
          requiredStake,
          paymentAmount: maximumAmount,
          expirationDate,
          paymentToken,
          merchantUrl,
          rate: {
            deltaAmount,
            deltaTime,
          },
        };

        // Create a message transfer, with the terms of the payment in the metadata.
        return this.vectorUtils.createOfferTransfer(counterPartyAccount, message);
      })
      .andThen((transferInfo) => {
        return browserNode.getTransfer(transferInfo.transferId);
      })
      .andThen((transfer) => {
        // Return the payment
        return this.paymentUtils.transfersToPayment(paymentId, [transfer]);
      })
      .map((payment) => {
        return payment as PullPayment;
      });
  }

  /**
   * Creates a push payment and returns it. Nothing moves until
   * the payment is accepted; the payment will return with the
   * "PROPOSED" status. This function just creates an OfferTransfer.
   * @param counterPartyAccount the public identifier of the account to pay
   * @param amount the amount to pay the counterparty
   * @param expirationDate the date (in unix time) at which point the payment will expire & revert
   * @param requiredStake the amount of insurance the counterparty must put up for this payment
   * @param paymentToken the (Ethereum) address of the payment token
   * @param merchantUrl the registered URL for the merchant that will resolve any disputes.
   */
  public createPushPayment(
    counterPartyAccount: PublicIdentifier,
    amount: string,
    expirationDate: number,
    requiredStake: string,
    paymentToken: EthereumAddress,
    merchantUrl: string,
  ): ResultAsync<PushPayment, RouterChannelUnknownError | CoreUninitializedError | VectorError | Error> {
    let browserNode: IBrowserNode;
    let context: InitializedHypernetContext;
    let paymentId: string;
    let timestamp: number;

    return ResultUtils.combine([
      this.browserNodeProvider.getBrowserNode(),
      this.contextProvider.getInitializedContext(),
      this.paymentUtils.createPaymentId(EPaymentType.Push),
      this.timeUtils.getBlockchainTimestamp(),
    ])
      .andThen((vals) => {
        [browserNode, context, paymentId, timestamp] = vals;

        const message: IHypernetOfferDetails = {
          messageType: EMessageTransferType.OFFER,
          paymentId,
          creationDate: timestamp,
          to: counterPartyAccount,
          from: context.publicIdentifier,
          requiredStake: requiredStake.toString(),
          paymentAmount: amount.toString(),
          expirationDate: expirationDate,
          paymentToken,
          merchantUrl,
        };

        // Create a message transfer, with the terms of the payment in the metadata.
        return this.vectorUtils.createOfferTransfer(counterPartyAccount, message);
      })
      .andThen((transferInfo) => {
        return browserNode.getTransfer(transferInfo.transferId);
      })
      .andThen((transfer) => {
        // Return the payment
        return this.paymentUtils.transfersToPayment(paymentId, [transfer]);
      })
      .map((payment) => {
        return payment as PushPayment;
      });
  }

  /**
   * Given a paymentId, return the component transfers.
   * @param paymentId the payment to get transfers for
   */
  protected _getTransfersByPaymentId(paymentId: string): ResultAsync<IFullTransferState[], Error> {
    let browserNode: IBrowserNode;
    let channelAddress: string;

    return ResultUtils.combine([this.browserNodeProvider.getBrowserNode(), this.vectorUtils.getRouterChannelAddress()])
      .andThen((vals) => {
        [browserNode, channelAddress] = vals;
        return browserNode.getActiveTransfers(channelAddress);
      })
      .andThen((activeTransfers) => {
        // We also need to look for potentially resolved transfers
        const earliestDate = this.paymentUtils.getEarliestDateFromTransfers(activeTransfers);

        return browserNode.getTransfers(earliestDate, this.timeUtils.getUnixNow());
      })
      .andThen((transfers) => {
        // This new list is complete- it should include active and inactive transfers
        // after the earliest active transfer
        const transferTypeResults = new Array<
          ResultAsync<
            {
              transferType: ETransferType;
              transfer: IFullTransferState;
            },
            VectorError | Error
          >
        >();
        for (const transfer of transfers) {
          transferTypeResults.push(this.paymentUtils.getTransferTypeWithTransfer(transfer));
        }

        return ResultUtils.combine(transferTypeResults);
      })
      .andThen((tranferTypesWithTransfers) => {
        // For each transfer, we are either just going to know it's relevant
        // from the data in the metadata, or we are going to check if it's an
        // insurance payment and we have more bulletproof ways to check
        const relevantTransfers: IFullTransferState[] = [];
        for (const transferTypeWithTransfer of tranferTypesWithTransfers) {
          const { transferType, transfer } = transferTypeWithTransfer;

          if (transferType === ETransferType.Offer) {
            const offerDetails: IHypernetOfferDetails = JSON.parse((transfer.transferState as MessageState).message);

            if (offerDetails.paymentId === paymentId) {
              relevantTransfers.push(transfer);
            }
          } else if (transferType === ETransferType.Insurance || transferType === ETransferType.Parameterized) {
            if (paymentId === transfer.transferState.UUID) {
              relevantTransfers.push(transfer);
            } else {
              this.logUtils.debug(`Transfer not relevant to payment ${paymentId}, transferId: ${transfer.transferId}`);
            }
          } else {
            this.logUtils.debug(`Unrecognized transfer in PaymentRepository, transferId: ${transfer.transferId}`);
          }
        }

        return okAsync(relevantTransfers);
      });
  }

  /**
   * Given a list of payment Ids, return the associated payments.
   * @param paymentIds the list of payments to get
   */
  public getPaymentsByIds(paymentIds: string[]): ResultAsync<Map<string, Payment>, Error> {
    let browserNode: IBrowserNode;
    let channelAddress: string;

    return ResultUtils.combine([this.browserNodeProvider.getBrowserNode(), this.vectorUtils.getRouterChannelAddress()])
      .andThen((vals) => {
        [browserNode, channelAddress] = vals;

        return browserNode.getActiveTransfers(channelAddress);
      })
      .andThen((activeTransfers) => {
        // We also need to look for potentially resolved transfers
        const earliestDate = this.paymentUtils.getEarliestDateFromTransfers(activeTransfers);

        return browserNode.getTransfers(earliestDate, this.timeUtils.getUnixNow());
      })
      .andThen((transfers) => {
        const transferTypeResults = new Array<
          ResultAsync<
            {
              transferType: ETransferType;
              transfer: IFullTransferState;
            },
            VectorError | Error
          >
        >();
        for (const transfer of transfers) {
          transferTypeResults.push(this.paymentUtils.getTransferTypeWithTransfer(transfer));
        }

        return ResultUtils.combine(transferTypeResults);
      })
      .andThen((tranferTypesWithTransfers) => {
        // For each transfer, we are either just going to know it's relevant
        // from the data in the metadata, or we are going to check if it's an
        // insurance payment and we have more bulletproof ways to check
        const relevantTransfers: IFullTransferState[] = [];
        for (const transferTypeWithTransfer of tranferTypesWithTransfers) {
          const { transferType, transfer } = transferTypeWithTransfer;

          if (transferType === ETransferType.Offer) {
            const offerDetails: IHypernetOfferDetails = JSON.parse((transfer.transferState as MessageState).message);
            if (paymentIds.includes(offerDetails.paymentId)) {
              relevantTransfers.push(transfer);
            }
          } else {
            if (transferType === ETransferType.Insurance || transferType === ETransferType.Parameterized) {
              if (paymentIds.includes(transfer.transferState.UUID)) {
                relevantTransfers.push(transfer);
              } else {
                this.logUtils.log(`Transfer not relevant in PaymentRepository, transferId: ${transfer.transferId}`);
              }
            } else {
              this.logUtils.log(`Unrecognized transfer in PaymentRepository, transferId: ${transfer.transferId}`);
            }
          }
        }

        return this.paymentUtils.transfersToPayments(relevantTransfers);
      })
      .map((payments) => {
        return payments.reduce((map, obj) => {
          map.set(obj.id, obj);
          return map;
        }, new Map<string, Payment>());
      });
  }

  /**
   * Finalizes/confirms a payment
   * Internally, this is what actually calls resolve() on the Vector transfer -
   * be it a insurancePayments or parameterizedPayments.
   * @param paymentId the payment to finalize
   * @param amount the amount of the payment to finalize for
   */
  public finalizePayment(
    paymentId: string,
    amount: string,
  ): ResultAsync<Payment, RouterChannelUnknownError | CoreUninitializedError | VectorError | Error> {
    let browserNode: IBrowserNode;
    let existingTransfers: IFullTransferState[];
    let parameterizedTransferId: string;

    return ResultUtils.combine([this.browserNodeProvider.getBrowserNode(), this._getTransfersByPaymentId(paymentId)])
      .andThen((vals) => {
        [browserNode, existingTransfers] = vals;

        this.logUtils.log(`Finalizing payment ${paymentId}`);

        // get the transfer id from the paymentId
        // use payment utils for this
        return this.paymentUtils.sortTransfers(paymentId, existingTransfers);
      })
      .andThen((sortedTransfers) => {
        if (sortedTransfers.parameterizedTransfer == null) {
          return errAsync(
            new PaymentFinalizeError(
              `Cannot finalize payment ${paymentId}, no parameterized transfer exists for this!`,
            ),
          );
        }

        parameterizedTransferId = sortedTransfers.parameterizedTransfer.transferId;

        return this.vectorUtils.resolvePaymentTransfer(parameterizedTransferId, paymentId, amount);
      })
      .andThen(() => {
        return browserNode.getTransfer(parameterizedTransferId);
      })
      .andThen((transfer) => {
        // Remove the parameterized transfer, and replace it
        // with this latest transfer
        existingTransfers = existingTransfers.filter((obj) => obj.transferId !== parameterizedTransferId);
        existingTransfers.push(transfer);

        // Transfer has been resolved successfully; return the updated payment.
        const updatedPayment = this.paymentUtils.transfersToPayment(paymentId, existingTransfers);

        return updatedPayment;
      });
  }

  /**
   * Provides stake for a given payment id
   * Internally, this is what actually creates the InsurancePayments with Vector.
   * @param paymentId the payment for which to provide stake for
   */
  public provideStake(
    paymentId: string,
    merchantPublicKey: PublicKey,
  ): ResultAsync<
    Payment,
    | PaymentStakeError
    | TransferResolutionError
    | RouterChannelUnknownError
    | CoreUninitializedError
    | VectorError
    | Error
  > {
    let browserNode: IBrowserNode;
    let config: HypernetConfig;
    let existingTransfers: IFullTransferState[];
    let timestamp: number;

    return ResultUtils.combine([
      this.browserNodeProvider.getBrowserNode(),
      this.configProvider.getConfig(),
      this._getTransfersByPaymentId(paymentId),
      this.timeUtils.getBlockchainTimestamp(),
    ])
      .andThen((vals) => {
        [browserNode, config, existingTransfers, timestamp] = vals;

        return this.paymentUtils.transfersToPayment(paymentId, existingTransfers);
      })
      .andThen((payment) => {
        const paymentSender = payment.from;
        const paymentID = payment.id;
        const paymentStart = timestamp;
        const paymentExpiration = paymentStart + config.defaultPaymentExpiryLength;

        // TODO: There are probably some logical times when you should not provide a stake
        if (false) {
          return errAsync(new PaymentStakeError());
        }

        this.logUtils.log(`PaymentRepository:provideStake: Creating insurance transfer for paymentId: ${paymentId}`);
        return this.vectorUtils.createInsuranceTransfer(
          paymentSender,
          merchantPublicKey,
          payment.requiredStake,
          paymentExpiration,
          paymentID,
        );
      })
      .andThen((transferInfoUnk) => {
        const transferInfo = transferInfoUnk as IBasicTransferResponse;
        return browserNode.getTransfer(transferInfo.transferId);
      })
      .andThen((transfer) => {
        const allTransfers = [transfer, ...existingTransfers];

        // Transfer has been created successfully; return the updated payment.
        return this.paymentUtils.transfersToPayment(paymentId, allTransfers);
      });
  }

  /**
   * Singular version of provideAssets
   * Internally, creates a parameterizedPayment with Vector,
   * and returns a payment of state 'Approved'
   * @param paymentId the payment for which to provide an asset for
   */
  public provideAsset(
    paymentId: string,
  ): ResultAsync<Payment, RouterChannelUnknownError | CoreUninitializedError | VectorError | LogicalError> {
    let browserNode: IBrowserNode;
    let config: HypernetConfig;
    let existingTransfers: IFullTransferState[];
    let timestamp: number;

    return ResultUtils.combine([
      this.browserNodeProvider.getBrowserNode(),
      this.configProvider.getConfig(),
      this._getTransfersByPaymentId(paymentId),
      this.timeUtils.getBlockchainTimestamp(),
    ])
      .andThen((vals) => {
        [browserNode, config, existingTransfers, timestamp] = vals;

        return this.paymentUtils.transfersToPayment(paymentId, existingTransfers);
      })
      .andThen((payment) => {
        const paymentTokenAddress = payment.paymentToken;
        let paymentTokenAmount: BigNumber;
        if (payment instanceof PushPayment) {
          paymentTokenAmount = payment.paymentAmount;
        } else if (payment instanceof PullPayment) {
          paymentTokenAmount = payment.authorizedAmount;
        } else {
          this.logUtils.error(`Payment was not instance of push or pull payment!`);
          return errAsync(new LogicalError());
        }

        const paymentRecipient = payment.to;
        const paymentID = payment.id;

        // The -1 here is critical to avoiding resolution errors down the road.
        // The way that a parameterized payment's value is calculated, is the blocktime
        // minus the start time. If this is 0, then you have big issues (according to
        // "mathematicians", you can't divide by 0. What do they know?).
        // Since we don't have any assurance that a block has passed between creating the
        // transfer and resolving it, this offset assures this will never happen.
        const paymentStart = timestamp - 1;
        const paymentExpiration = timestamp + config.defaultPaymentExpiryLength;

        this.logUtils.log(`Providing a payment amount of ${paymentTokenAmount}`);

        // Use vectorUtils to create the parameterizedPayment
        return this.vectorUtils.createPaymentTransfer(
          payment instanceof PushPayment ? EPaymentType.Push : EPaymentType.Pull,
          paymentRecipient,
          paymentTokenAmount,
          paymentTokenAddress,
          paymentID,
          paymentStart,
          paymentExpiration,
          payment instanceof PullPayment ? payment.deltaTime : undefined,
          payment instanceof PullPayment ? payment.deltaAmount.toString() : undefined,
        );
      })
      .andThen((transferInfoUnk) => {
        const transferInfo = transferInfoUnk as NodeResponses.ConditionalTransfer;
        return browserNode.getTransfer(transferInfo.transferId);
      })
      .andThen((transfer) => {
        const allTransfers = [transfer, ...existingTransfers];

        // Transfer has been created successfully; return the updated payment.
        return this.paymentUtils.transfersToPayment(paymentId, allTransfers);
      });
  }
}
