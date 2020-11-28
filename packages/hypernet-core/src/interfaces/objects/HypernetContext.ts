import { Subject } from "rxjs";
import { ControlClaim } from "./ControlClaim";
import { EthereumAddress } from "3box";
import { PublicIdentifier } from "./PublicIdentifier";
import { PullPayment, PushPayment } from "./Payment";
import { Balances } from "./Balances";

export class HypernetContext {
  constructor(
    public account: EthereumAddress | null,
    public privateKey: string | null,
    public publicIdentifier: PublicIdentifier | null,
    public inControl: boolean,
    public onControlClaimed: Subject<ControlClaim>,
    public onControlYielded: Subject<ControlClaim>,
    public onPushPaymentProposed: Subject<PushPayment>,
    public onPullPaymentProposed: Subject<PullPayment>,
    public onPushPaymentReceived: Subject<PushPayment>,
    public onPullPaymentApproved: Subject<PullPayment>,
    public onBalancesChanged: Subject<Balances>,
  ) {}
}

// tslint:disable-next-line: max-classes-per-file
export class InitializedHypernetContext {
  constructor(
    public account: EthereumAddress,
    public privateKey: string,
    public publicIdentifier: PublicIdentifier,
    public inControl: boolean,
    public onControlClaimed: Subject<ControlClaim>,
    public onControlYielded: Subject<ControlClaim>,
    public onPushPaymentProposed: Subject<PushPayment>,
    public onPullPaymentProposed: Subject<PullPayment>,
    public onPushPaymentReceived: Subject<PushPayment>,
    public onPullPaymentApproved: Subject<PullPayment>,
    public onBalancesChanged: Subject<Balances>,
  ) {}
}
