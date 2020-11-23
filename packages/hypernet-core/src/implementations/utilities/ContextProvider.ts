import { getPublicKeyFromPrivateKey } from "@connext/vector-utils/dist/crypto";
import { getPublicIdentifierFromPublicKey } from "@connext/vector-utils/dist/identifiers";
import {
  HypernetContext,
  ControlClaim,
  InitializedHypernetContext,
  PushPayment,
  PullPayment,
} from "@interfaces/objects";
import { IContextProvider } from "@interfaces/utilities/IContextProvider";
import { Subject } from "rxjs";

export class ContextProvider implements IContextProvider {
  protected context: HypernetContext;
  constructor(
    onControlClaimed: Subject<ControlClaim>,
    onControlYielded: Subject<ControlClaim>,
    onPushPaymentProposed: Subject<PushPayment>,
    onPullPaymentProposed: Subject<PullPayment>,
    onPushPaymentReceived: Subject<PushPayment>,
    onPullPaymentReceived: Subject<PullPayment>,
  ) {
    this.context = new HypernetContext(
      null,
      null,
      null,
      false,
      onControlClaimed,
      onControlYielded,
      onPushPaymentProposed,
      onPullPaymentProposed,
      onPushPaymentReceived,
      onPullPaymentReceived
    );
  }
  public async getContext(): Promise<HypernetContext> {
    return this.context;
  }

  public async getInitializedContext(): Promise<InitializedHypernetContext> {
    if (this.context.account == null || this.context.publicIdentifier == null
      || this.context.privateKey == null) {
      throw new Error("Can not open a link until you have set your working account. Call HypernetCore.initialize()!")
    }

    return new InitializedHypernetContext(this.context.account,
      this.context.privateKey,
      this.context.publicIdentifier,
      this.context.inControl,
      this.context.onControlClaimed,
      this.context.onControlYielded,
      this.context.onPushPaymentProposed,
      this.context.onPullPaymentProposed,
      this.context.onPushPaymentReceived,
      this.context.onPullPaymentReceived);
  }

  public setContext(context: HypernetContext): void {
    if (context.privateKey != null) {
      const publicKey = getPublicKeyFromPrivateKey(context.privateKey);
      context.publicIdentifier = getPublicIdentifierFromPublicKey(publicKey);
    }
    
    this.context = context;
  }
}
