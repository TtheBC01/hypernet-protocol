import { IHypernetCore } from "@hypernetlabs/hypernet-core";
import ko from "knockout";
import { ButtonParams } from "../Button/Button.viewmodel";
import html from "./Actions.template.html";
import { ethers } from "ethers";
import { TokenSelectorParams } from "../TokenSelector/TokenSelector.viewmodel";

export class ActionsParams {
  constructor(public core: IHypernetCore) {}
}

// tslint:disable-next-line: max-classes-per-file
export class ActionsViewModel {
  public startupComplete: ko.Observable<boolean>;
  public depositFundsButton: ButtonParams;
  public mintTestTokenButton: ButtonParams;
  public tokenSelector: TokenSelectorParams;
  public tokenSelected: ko.PureComputed<boolean>;

  protected core: IHypernetCore;

  constructor(params: ActionsParams) {
    this.core = params.core;

    this.startupComplete = ko.observable(false);

    this.tokenSelector = new TokenSelectorParams(this.core, ko.observable(null), false);

    this.tokenSelected = ko.pureComputed(() => {
      return this.tokenSelector.selectedToken() != null;
    });

    this.depositFundsButton = new ButtonParams("Deposit Funds", async () => {
      const selectedToken = this.tokenSelector.selectedToken();

      if (selectedToken == null) {
        return;
      }

      // tslint:disable-next-line: no-console
      console.log(`Selected token for deposit: ${selectedToken}`);
      await this.core.depositFunds(selectedToken, ethers.utils.parseEther("1"));
    });

    this.mintTestTokenButton = new ButtonParams("Mint Test Token", async () => {
      const selectedToken = this.tokenSelector.selectedToken();

      if (selectedToken == null) {
        return;
      }

      await this.core.mintTestToken(ethers.utils.parseEther("1"));
    });

    this.core.waitInitialized().map(() => {
      this.startupComplete(true);
    });
  }
}

ko.components.register("actions", {
  viewModel: ActionsViewModel,
  template: html,
});