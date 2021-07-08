import {
  EthereumAddress,
  Payment,
  PublicIdentifier,
  PullPayment,
  PushPayment,
  PaymentId,
  TransferId,
  GatewayUrl,
  PaymentFinalizeError,
  RouterChannelUnknownError,
  VectorError,
  PaymentCreationError,
  BlockchainUnavailableError,
  LogicalError,
  TransferResolutionError,
  InvalidPaymentError,
  InvalidParametersError,
  PaymentStakeError,
  TransferCreationError,
  BigNumberString,
  UnixTimestamp,
  Signature,
} from "@hypernetlabs/objects";
import { ResultAsync } from "neverthrow";

export interface IPaymentRepository {
  /**
   *
   * @param paymentIds
   */
  getPaymentsByIds(
    paymentIds: PaymentId[],
  ): ResultAsync<
    Map<PaymentId, Payment>,
    | RouterChannelUnknownError
    | VectorError
    | BlockchainUnavailableError
    | LogicalError
    | InvalidPaymentError
    | InvalidParametersError
  >;

  /**
   * Creates a push payment and returns it. Nothing moves until
   * the payment is accepted; the payment will return with the
   * "PROPOSED" status. This function just creates an OfferTransfer.
   */
  createPushPayment(
    counterPartyAccount: PublicIdentifier,
    amount: BigNumberString,
    expirationDate: UnixTimestamp,
    requiredStake: BigNumberString,
    paymentToken: EthereumAddress,
    gatewayUrl: GatewayUrl,
    metadata: string | null,
  ): ResultAsync<PushPayment, PaymentCreationError>;

  createPullPayment(
    counterPartyAccount: PublicIdentifier,
    maximumAmount: BigNumberString, // TODO: amounts should be consistently use BigNumber
    deltaTime: number,
    deltaAmount: BigNumberString, // TODO: amounts should be consistently use BigNumber
    expirationDate: UnixTimestamp,
    requiredStake: BigNumberString, // TODO: amounts should be consistently use BigNumber
    paymentToken: EthereumAddress,
    gatewayUrl: GatewayUrl,
    metadata: string | null,
  ): ResultAsync<PullPayment, PaymentCreationError>;

  createPullRecord(
    paymentId: PaymentId,
    amount: BigNumberString,
  ): ResultAsync<Payment, PaymentCreationError>;

  /**
   * Provides assets for a given list of payment ids.
   * Internally, this is what actually creates the ParameterizedPayment with Vector.
   * @param paymentId
   */
  provideAsset(
    paymentId: PaymentId,
  ): ResultAsync<
    Payment,
    | BlockchainUnavailableError
    | PaymentStakeError
    | TransferResolutionError
    | RouterChannelUnknownError
    | VectorError
    | LogicalError
    | InvalidPaymentError
    | InvalidParametersError
    | TransferCreationError
  >;

  /**
   * Provides stake for a given payment id
   * Internally, this is what actually creates the InsurancePayments with Vector.
   * @param paymentId
   */
  provideStake(
    paymentId: PaymentId,
    gatewayAddress: EthereumAddress,
  ): ResultAsync<
    Payment,
    | BlockchainUnavailableError
    | PaymentStakeError
    | TransferResolutionError
    | RouterChannelUnknownError
    | VectorError
    | LogicalError
    | InvalidPaymentError
    | InvalidParametersError
    | TransferCreationError
  >;

  /**
   * Finalizes/confirms a payment
   * Internally, this is what actually calls resolve() on the Vector transfer -
   * be it a insurancePayments or parameterizedPayments.
   * @param paymentId
   */
  acceptPayment(
    paymentId: PaymentId,
    amount: BigNumberString,
  ): ResultAsync<
    Payment,
    | RouterChannelUnknownError
    | VectorError
    | BlockchainUnavailableError
    | LogicalError
    | PaymentFinalizeError
    | TransferResolutionError
    | InvalidPaymentError
    | InvalidParametersError
  >;

  resolveInsurance(
    paymentId: PaymentId,
    transferId: TransferId,
    amount: BigNumberString,
    gatewaySignature: Signature | null,
  ): ResultAsync<void, TransferResolutionError>;

  /**
   * This method will resolve the offer transfer for a payment
   * @param payment the payment to finalize
   */
  finalizePayment(payment: Payment): ResultAsync<void, TransferResolutionError>;
}

export const IPaymentRepositoryType = Symbol.for("IPaymentRepository");
