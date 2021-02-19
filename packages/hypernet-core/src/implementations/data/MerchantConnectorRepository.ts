import { IMerchantConnectorRepository } from "@interfaces/data";
import { HexString, PublicKey, BigNumber } from "@interfaces/objects";
import {
  CoreUninitializedError,
  MerchantConnectorError,
  MerchantValidationError,
  PersistenceError,
} from "@interfaces/objects/errors";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { ParentProxy, ResultUtils, IAjaxUtils } from "@hypernetlabs/utils";
import { IBlockchainProvider, IConfigProvider, IContextProvider, IVectorUtils } from "@interfaces/utilities";
import { ethers } from "ethers";

class MerchantConnectorProxy extends ParentProxy {
  constructor(element: HTMLElement | null, iframeUrl: string) {
    super(element, iframeUrl);
  }

  public activateConnector(): ResultAsync<void, MerchantConnectorError> {
    const call = this._createCall("activateConnector", null);

    return call.getResult();
  }

  public resolveChallenge(paymentId: HexString): ResultAsync<IResolutionResult, MerchantConnectorError> {
    const call = this._createCall("resolveChallenge", null);

    return call.getResult();
  }

  public getPublicKey(): ResultAsync<PublicKey, MerchantConnectorError> {
    const call = this._createCall("getPublicKey", null);

    return call.getResult();
  }

  public getValidatedSignature(): ResultAsync<string, MerchantValidationError> {
    const call = this._createCall("getValidatedSignature", null);

    return call.getResult();
  }
}

interface IAuthorizedMerchantEntry {
  merchantUrl: string;
  authorizationSignature: string;
}

interface IResolutionResult {
  mediatorSignature: string;
  amount: string;
}

export class MerchantConnectorRepository implements IMerchantConnectorRepository {
  protected activatedMerchants: Map<string, MerchantConnectorProxy>;

  constructor(
    protected blockchainProvider: IBlockchainProvider,
    protected ajaxUtils: IAjaxUtils,
    protected configProvider: IConfigProvider,
    protected contextProvider: IContextProvider,
    protected vectorUtils: IVectorUtils,
  ) {
    this.activatedMerchants = new Map();
  }

  public getMerchantConnectorSignature(merchantUrl: URL): ResultAsync<string, Error> {
    const url = new URL(merchantUrl.toString());
    url.pathname = "signature";
    return this.ajaxUtils.get<string, Error>(url).andThen((response) => {
      return okAsync(response);
    });
  }
  public getMerchantPublicKeys(merchantUrls: string[]): ResultAsync<Map<string, PublicKey>, Error> {
    // TODO: right now, the merchant will publish a URL with their public key; eventually, they should be held in a smart contract

    // For merchants that are already authorized, we can just go to their connector for the
    // public key.
    const publicKeyRequests = new Array<ResultAsync<{merchantUrl: string, publicKey: PublicKey}, MerchantConnectorError | Error>>();
    for (const merchantUrl of merchantUrls) {
      const merchantProxy = this.activatedMerchants.get(merchantUrl);

      if (merchantProxy != null) {
        publicKeyRequests.push(merchantProxy.getPublicKey().map((publicKey) => {return {merchantUrl, publicKey};}));
      }
      else {
        // Need to get it from the source
        const url = new URL(merchantUrl.toString());
      url.pathname = "publicKey";
      publicKeyRequests.push(this.ajaxUtils.get<string, Error>(url).map((publicKey) => {return {merchantUrl, publicKey};}));
      }
    }

    return ResultUtils.combine(publicKeyRequests)
    .map((vals) => {
      const returnMap = new Map<string, PublicKey>();
      for (const val of vals) {
        returnMap.set(val.merchantUrl.toString(), val.publicKey);
      }

      return returnMap;
    });
  }

  public addAuthorizedMerchant(merchantUrl: URL): ResultAsync<void, PersistenceError> {
    console.log("In addAuthorizedMerchant!");
    let proxy: MerchantConnectorProxy;
    return this.configProvider
      .getConfig()
      .andThen((config) => {
        // First, we will create the proxy
        proxy = this._factoryProxy(config.merchantIframeUrl, merchantUrl);

        console.log("Activating proxy!");
        return proxy.activate();
      })
      .andThen(() => {
        console.log("Proxy activated, getting validated signature!");
        // With the proxy activated, we can get the validated merchant signature
        return ResultUtils.combine([proxy.getValidatedSignature(), this.blockchainProvider.getSigner()]);
      })
      .andThen((vals) => {
        const [merchantSignature, signer] = vals;

        console.log(`Validated signature: ${merchantSignature}`);

        // merchantSignature has been validated by the iframe, so this is already confirmed.
        // Now we need to get an authorization signature
        return ResultAsync.fromPromise(signer.signMessage(merchantSignature), (e) => e as MerchantConnectorError);
      })
      .andThen((authorizationSignature) => {
        const authorizedMerchants = this._getAuthorizedMerchants();

        authorizedMerchants.set(merchantUrl.toString(), authorizationSignature);

        this._setAuthorizedMerchants(authorizedMerchants);

        // Activate the merchant connector
        return proxy.activateConnector();
      })
      .map(() => {
        this.activatedMerchants.set(merchantUrl.toString(), proxy);
      });
  }

  public getAuthorizedMerchants(): ResultAsync<Map<string, string>, PersistenceError> {
    const authorizedMerchants = this._getAuthorizedMerchants();

    return okAsync(authorizedMerchants);
  }

  public resolveChallenge(
    merchantUrl: URL,
    paymentId: string,
    transferId: string,
  ): ResultAsync<void, MerchantConnectorError | MerchantValidationError | CoreUninitializedError> {
    const proxy = this.activatedMerchants.get(merchantUrl.toString());

    if (proxy == null) {
      return errAsync(new MerchantValidationError(`No existing merchant connector for ${merchantUrl}`));
    }

    return proxy
      .resolveChallenge(paymentId)
      .andThen((result) => {
        const { mediatorSignature, amount } = result;

        return this.vectorUtils.resolveInsuranceTransfer(transferId, paymentId, mediatorSignature, BigNumber.from(amount));
      })
      .map(() => {});
  }

  protected _setAuthorizedMerchants(authorizedMerchantMap: Map<string, string>) {
    const authorizedMerchantEntries = new Array<IAuthorizedMerchantEntry>();
    for (const keyval of authorizedMerchantMap) {
      authorizedMerchantEntries.push({ merchantUrl: keyval[0].toString(), authorizationSignature: keyval[1] });
    }
    window.localStorage.setItem("AuthorizedMerchants", JSON.stringify(authorizedMerchantEntries));
  }

  protected _getAuthorizedMerchants(): Map<string, string> {
    let authorizedMerchantStr = window.localStorage.getItem("AuthorizedMerchants");

    if (authorizedMerchantStr == null) {
      authorizedMerchantStr = "[]";
    }
    const authorizedMerchantEntries = JSON.parse(authorizedMerchantStr) as IAuthorizedMerchantEntry[];

    const authorizedMerchants = new Map<string, string>();
    for (const authorizedMerchantEntry of authorizedMerchantEntries) {
      authorizedMerchants.set(
        authorizedMerchantEntry.merchantUrl,
        authorizedMerchantEntry.authorizationSignature,
      );
    }
    return authorizedMerchants;
  }

  // public initialize(): ResultAsync<void, MerchantConnectorError> {

  // }

  public activateAuthorizedMerchants(): ResultAsync<
    void,
    MerchantConnectorError | MerchantValidationError | CoreUninitializedError
  > {
    return ResultUtils.combine([
      this.configProvider.getConfig(),
      this.contextProvider.getInitializedContext(),
      this.getAuthorizedMerchants(),
    ]).andThen((vals) => {
      const [config, context, authorizedMerchants] = vals;
      const activationResults = new Array<ResultAsync<void, Error>>();

      for (const keyval of authorizedMerchants) {
        activationResults.push(
          this._activateAuthorizedMerchant(context.account, new URL(keyval[0]), keyval[1], config.merchantIframeUrl),
        );
      }

      return ResultUtils.combine(activationResults).map(() => {});
    });
  }

  protected _activateAuthorizedMerchant(
    address: string,
    merchantUrl: URL,
    authorizationSignature: string,
    merchantIFrameUrl: string,
  ): ResultAsync<void, MerchantConnectorError | MerchantValidationError> {
    const proxy = this._factoryProxy(merchantIFrameUrl, merchantUrl);
    return proxy
      .activate()
      .andThen(() => {
        // Once the proxy is activated, we need to get the validated signature
        return proxy.getValidatedSignature();
      })
      .andThen((validatedSignature) => {
        const validationAddress = ethers.utils.verifyMessage(validatedSignature, authorizationSignature);

        if (validationAddress !== address) {
          // TODO: this is recoverable, we just need a new signature
          return errAsync(
            new MerchantValidationError(
              "Validated signature of merchant connector does not match signature on file. Need to re-authorized the connector!",
            ),
          );
        }

        return proxy.activateConnector();
      });
  }

  protected _factoryProxy(merchantIFrameUrl: string, merchantUrl: URL): MerchantConnectorProxy {
    const iframeUrl = new URL(merchantIFrameUrl);
    iframeUrl.searchParams.set("merchantUrl", merchantUrl.toString());
    const proxy = new MerchantConnectorProxy(null, iframeUrl.toString());
    return proxy;
  }
}
