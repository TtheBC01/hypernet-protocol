import {
  PaymentId,
  PublicIdentifier,
  PushPayment,
  GatewayUrl,
  EPaymentState,
} from "@hypernetlabs/objects";
import { IHypernetWebIntegration } from "@hypernetlabs/web-integration";
import { utils } from "ethers";
import ko from "knockout";
import moment from "moment";

import { ButtonParams } from "../Button/Button.viewmodel";
import { PaymentStatusParams } from "../PaymentStatus/PaymentStatus.viewmodel";

import html from "./PushPayment.template.html";

export class PushPaymentParams {
  constructor(
    public integration: IHypernetWebIntegration,
    public payment: PushPayment,
  ) {}
}

// tslint:disable-next-line: max-classes-per-file
export class PushPaymentViewModel {
  public id: string;
  public to: ko.Observable<string>;
  public from: ko.Observable<string>;
  public state: ko.Observable<PaymentStatusParams>;
  public paymentToken: ko.Observable<string>;
  public requiredStake: ko.Observable<string>;
  public amountStaked: ko.Observable<string>;
  public expirationDate: ko.Observable<string>;
  public createdTimestamp: ko.Observable<string>;
  public updatedTimestamp: ko.Observable<string>;
  public collateralRecovered: ko.Observable<string>;
  public gatewayUrl: ko.Observable<GatewayUrl>;
  public paymentAmount: ko.Observable<string>;

  public acceptButton: ButtonParams;
  public showAcceptButton: ko.PureComputed<boolean>;
  public sendButton: ButtonParams;
  public showSendButton: ko.PureComputed<boolean>;

  protected integration: IHypernetWebIntegration;
  protected paymentId: PaymentId;
  protected publicIdentifier: ko.Observable<PublicIdentifier | null>;

  constructor(params: PushPaymentParams) {
    this.integration = params.integration;
    this.publicIdentifier = ko.observable(null);

    this.id = `Payment ${params.payment.id}`;
    this.paymentId = params.payment.id;
    this.to = ko.observable(params.payment.to);
    this.from = ko.observable(params.payment.from);
    this.state = ko.observable(new PaymentStatusParams(params.payment.state));
    this.paymentToken = ko.observable(params.payment.paymentToken);
    this.requiredStake = ko.observable(
      utils.formatUnits(params.payment.requiredStake, "wei"),
    );
    this.amountStaked = ko.observable(
      utils.formatUnits(params.payment.amountStaked, "wei"),
    );
    const mdate = moment.unix(params.payment.expirationDate);
    this.expirationDate = ko.observable(mdate.format());
    this.createdTimestamp = ko.observable(
      params.payment.createdTimestamp.toString(),
    );
    this.updatedTimestamp = ko.observable(
      params.payment.updatedTimestamp.toString(),
    );
    this.collateralRecovered = ko.observable(
      params.payment.collateralRecovered.toString(),
    );
    this.gatewayUrl = ko.observable(params.payment.gatewayUrl);
    this.paymentAmount = ko.observable(
      utils.formatUnits(params.payment.paymentAmount, "wei"),
    );

    this.integration.core.onPushPaymentReceived.subscribe({
      next: (payment) => {
        if (payment.id === this.paymentId) {
          const paymentStatusParams = new PaymentStatusParams(
            EPaymentState.Finalized,
          );
          this.state(paymentStatusParams);
          // @todo this is a manual override for now, since we don't yet have a way
          // to grab a finalized transfer in the core (and thus no way to correctly
          // or easily report a "finalized" payment state!)
          // this.state(new PaymentStatusParams(params.payment.state));
        }
      },
    });

    this.integration.core.onPushPaymentUpdated.subscribe({
      next: (payment) => {
        console.log(
          `In PushPayment, this.paymentId = ${this.paymentId}, updated payment = ${payment}`,
        );
        if (payment.id === this.paymentId) {
          this.state(new PaymentStatusParams(payment.state));
        }
      },
    });

    this.acceptButton = new ButtonParams("Accept", async () => {
      return await this.integration.core
        .acceptOffer(this.paymentId)
        .map((results) => {
          const result = results[0];

          return result.match(
            (payment) => {
              this.state(new PaymentStatusParams(payment.state));
            },
            (e) => {
              // tslint:disable-next-line: no-console
              console.error(
                `Error getting payment with ID ${this.paymentId}: ${e}`,
              );
            },
          );
        });
    });

    this.showAcceptButton = ko.pureComputed(() => {
      return (
        this.state().state === EPaymentState.Proposed &&
        this.publicIdentifier() === this.to()
      );
    });

    this.sendButton = new ButtonParams("Send", async () => {
      // tslint:disable-next-line: no-console
      console.log(`Attempting to send funds for payment ${this.paymentId}`);
      // await this.integration.completePayments([this.paymentId]);
      // const payments = await this.integration.completePayments([this.paymentId])

      // @todo changge this after we change the return type of completePayments & stakePosted
      /*const payment = payments[0];
      if (payment.isError) {
        console.error(`Error getting payment with ID ${this.paymentId}: ${payment.getError()}`);
        throw payment.getError()
      }
      this.state(new PaymentStatusParams(payment.getValue().state));*/
    });

    this.showSendButton = ko.pureComputed(() => {
      return this.state().state === EPaymentState.Staked;
    });

    this.integration.core.getPublicIdentifier().map((publicIdentifier) => {
      this.publicIdentifier(publicIdentifier);
    });
  }
}

ko.components.register("push-payment", {
  viewModel: PushPaymentViewModel,
  template: html,
});
