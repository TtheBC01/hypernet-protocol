import { Subject } from "rxjs";
import { IResolutionResult } from "./IResolutionResult";
export interface IMerchantConnector {
  resolveChallenge(paymentId: string): Promise<IResolutionResult>;
  getPublicKey(): Promise<string>;

  onSendFundsRequested: Subject<ISendFundsRequest>;
  onAuthorizeFundsRequested: Subject<IAuthorizeFundsRequest>;

  // Sends a request to display the connector UI
  onDisplayRequested: Subject<void>;

  // Sends a request to close the connector UI
  onCloseRequested: Subject<void>;

  // Listen for iframe close event
  onIFrameClosed: Subject<void>;
}

export interface ISendFundsRequest {}

export interface IAuthorizeFundsRequest {}
