import {
  ControlClaim,
  PublicIdentifier,
  PullPayment,
  PushPayment,
  Balances,
  GatewayUrl,
  Signature,
  ActiveStateChannel,
  ChainId,
  EthereumAccountAddress,
  InitializeStatus,
  GovernanceChainInformation,
  ChainInformation,
} from "@hypernetlabs/objects";
import { Subject } from "rxjs";

import { IGatewayConnectorProxy } from "@interfaces/utilities";

export class HypernetContext {
  constructor(
    public account: EthereumAccountAddress | null,
    public publicIdentifier: PublicIdentifier | null,
    public activeStateChannels: ActiveStateChannel[] | null,
    public inControl: boolean,
    public initializeStatus: InitializeStatus,
    public governanceChainInformation: GovernanceChainInformation,
    public onControlClaimed: Subject<ControlClaim>,
    public onControlYielded: Subject<ControlClaim>,
    public onPushPaymentSent: Subject<PushPayment>,
    public onPullPaymentSent: Subject<PullPayment>,
    public onPushPaymentReceived: Subject<PushPayment>,
    public onPullPaymentReceived: Subject<PullPayment>,
    public onPushPaymentUpdated: Subject<PushPayment>,
    public onPullPaymentUpdated: Subject<PullPayment>,
    public onPushPaymentDelayed: Subject<PushPayment>,
    public onPullPaymentDelayed: Subject<PullPayment>,
    public onPushPaymentCanceled: Subject<PushPayment>,
    public onPullPaymentCanceled: Subject<PullPayment>,
    public onBalancesChanged: Subject<Balances>,
    public onCeramicAuthenticationStarted: Subject<void>,
    public onCeramicAuthenticationSucceeded: Subject<void>,
    public onCeramicFailed: Subject<Error>,
    public onGatewayAuthorized: Subject<GatewayUrl>,
    public onGatewayDeauthorizationStarted: Subject<GatewayUrl>,
    public onAuthorizedGatewayUpdated: Subject<GatewayUrl>,
    public onAuthorizedGatewayActivationFailed: Subject<GatewayUrl>,
    public onGatewayIFrameDisplayRequested: Subject<GatewayUrl>,
    public onGatewayIFrameCloseRequested: Subject<GatewayUrl>,
    public onCoreIFrameDisplayRequested: Subject<void>,
    public onCoreIFrameCloseRequested: Subject<void>,
    public onInitializationRequired: Subject<void>,
    public onPrivateCredentialsRequested: Subject<void>,
    public onWalletConnectOptionsDisplayRequested: Subject<void>,
    public onGatewayConnectorProxyActivated: Subject<IGatewayConnectorProxy>,
    public onStateChannelCreated: Subject<ActiveStateChannel>,
    public onChainConnected: Subject<ChainId>,
    public onGovernanceChainConnected: Subject<ChainId>,
    public onChainChanged: Subject<ChainId>,
    public onAccountChanged: Subject<EthereumAccountAddress>,
    public onGovernanceChainChanged: Subject<ChainId>,
    public onGovernanceAccountChanged: Subject<EthereumAccountAddress>,
    public onGovernanceSignerUnavailable: Subject<void>,
  ) {}
}

// tslint:disable-next-line: max-classes-per-file
export class InitializedHypernetContext {
  constructor(
    public account: EthereumAccountAddress,
    public publicIdentifier: PublicIdentifier,
    public activeStateChannels: ActiveStateChannel[],
    public inControl: boolean,
    public initializeStatus: InitializeStatus,
    public governanceChainInformation: GovernanceChainInformation,
    public onControlClaimed: Subject<ControlClaim>,
    public onControlYielded: Subject<ControlClaim>,
    public onPushPaymentSent: Subject<PushPayment>,
    public onPullPaymentSent: Subject<PullPayment>,
    public onPushPaymentReceived: Subject<PushPayment>,
    public onPullPaymentReceived: Subject<PullPayment>,
    public onPushPaymentUpdated: Subject<PushPayment>,
    public onPullPaymentUpdated: Subject<PullPayment>,
    public onPushPaymentDelayed: Subject<PushPayment>,
    public onPullPaymentDelayed: Subject<PullPayment>,
    public onPushPaymentCanceled: Subject<PushPayment>,
    public onPullPaymentCanceled: Subject<PullPayment>,
    public onBalancesChanged: Subject<Balances>,
    public onCeramicAuthenticationStarted: Subject<void>,
    public onCeramicAuthenticationSucceeded: Subject<void>,
    public onCeramicFailed: Subject<Error>,
    public onGatewayAuthorized: Subject<GatewayUrl>,
    public onGatewayDeauthorizationStarted: Subject<GatewayUrl>,
    public onAuthorizedGatewayUpdated: Subject<GatewayUrl>,
    public onAuthorizedGatewayActivationFailed: Subject<GatewayUrl>,
    public onGatewayIFrameDisplayRequested: Subject<GatewayUrl>,
    public onGatewayIFrameCloseRequested: Subject<GatewayUrl>,
    public onCoreIFrameDisplayRequested: Subject<void>,
    public onCoreIFrameCloseRequested: Subject<void>,
    public onInitializationRequired: Subject<void>,
    public onPrivateCredentialsRequested: Subject<void>,
    public onWalletConnectOptionsDisplayRequested: Subject<void>,
    public onGatewayConnectorProxyActivated: Subject<IGatewayConnectorProxy>,
    public onStateChannelCreated: Subject<ActiveStateChannel>,
    public onChainConnected: Subject<ChainId>,
    public onGovernanceChainConnected: Subject<ChainId>,
    public onChainChanged: Subject<ChainId>,
    public onAccountChanged: Subject<EthereumAccountAddress>,
    public onGovernanceChainChanged: Subject<ChainId>,
    public onGovernanceAccountChanged: Subject<EthereumAccountAddress>,
    public onGovernanceSignerUnavailable: Subject<void>,
  ) {}
}
