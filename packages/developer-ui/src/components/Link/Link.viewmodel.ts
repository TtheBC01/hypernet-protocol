import { HypernetLink } from "@hypernetlabs/objects";
import { IHypernetWebIntegration } from "@hypernetlabs/web-integration";
import ko from "knockout";

import { PullPaymentParams } from "../PullPayment/PullPayment.viewmodel";
import { PushPaymentParams } from "../PushPayment/PushPayment.viewmodel";

import html from "./Link.template.html";

export class LinkParams {
  constructor(
    public integration: IHypernetWebIntegration,
    public link: HypernetLink,
  ) {}
}

// tslint:disable-next-line: max-classes-per-file
export class LinkViewModel {
  public counterpartyId: string;
  public pushPayments: ko.ObservableArray<PushPaymentParams>;
  public pullPayments: ko.ObservableArray<PullPaymentParams>;

  protected counterParty: string;
  protected integration: IHypernetWebIntegration;

  constructor(params: LinkParams) {
    this.integration = params.integration;
    this.counterParty = params.link.counterPartyAccount;
    this.counterpartyId = `${params.link.counterPartyAccount}`;
    this.pushPayments = ko.observableArray<PushPaymentParams>();
    this.pullPayments = ko.observableArray<PullPaymentParams>();

    const pushPaymentParams = params.link.pushPayments.map((val) => {
      return new PushPaymentParams(this.integration, val);
    });
    this.pushPayments.push(...pushPaymentParams);

    // tslint:disable-next-line: no-console
    console.log(`Pushed ${pushPaymentParams.length} push payment params`);

    const pullPaymentParams = params.link.pullPayments.map((val) => {
      return new PullPaymentParams(this.integration, val);
    });
    this.pullPayments.push(...pullPaymentParams);

    // tslint:disable-next-line: no-console
    console.log(`Pushed ${pullPaymentParams.length} pull payment params`);

    this.integration.core.onPullPaymentReceived.subscribe({
      next: (payment) => {
        // It's for us, we'll need to add it to the payments for the link
        this.pullPayments.push(
          new PullPaymentParams(this.integration, payment),
        );
      },
    });

    this.integration.core.onPushPaymentReceived.subscribe({
      next: (payment) => {
        // It's for us, we'll need to add it to the payments for the link
        this.pushPayments.push(
          new PushPaymentParams(this.integration, payment),
        );
      },
    });
  }
}

ko.components.register("link", {
  viewModel: LinkViewModel,
  template: html,
});
