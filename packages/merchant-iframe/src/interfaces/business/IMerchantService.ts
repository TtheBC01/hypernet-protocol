import { ResultAsync } from "neverthrow";
import { MerchantConnectorError, MerchantValidationError } from "@merchant-iframe/interfaces/objects/errors";
import { IMerchantConnector, IRedirectInfo } from "@hypernetlabs/merchant-connector";

export interface IMerchantService {
  validateMerchantConnector(): ResultAsync<string, MerchantValidationError>;
  activateMerchantConnector(): ResultAsync<IMerchantConnector, MerchantConnectorError | MerchantValidationError>;
  prepareForRedirect(redirectInfo: IRedirectInfo): ResultAsync<void, Error>;
  getMerchantUrl(): ResultAsync<string, MerchantValidationError>;
  autoActivateMerchantConnector(): ResultAsync<
    IMerchantConnector | null,
    MerchantConnectorError | MerchantValidationError
  >;
}
