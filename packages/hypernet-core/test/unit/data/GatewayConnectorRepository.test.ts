import {
  GatewayConnectorError,
  GatewayValidationError,
  Signature,
  Balances,
  GatewayActivationError,
  ProxyError,
  AuthorizedGatewaysSchema,
  IBasicTransferResponse,
  GatewayRegistrationInfo,
} from "@hypernetlabs/objects";
import { IAjaxUtils, ILogUtils } from "@hypernetlabs/utils";
import { GatewayConnectorRepository } from "@implementations/data/GatewayConnectorRepository";
import {
  IGatewayConnectorRepository,
  IAuthorizedGatewayEntry,
} from "@interfaces/data/IGatewayConnectorRepository";
import { BigNumber } from "ethers";
import { okAsync, errAsync } from "neverthrow";
import td, { verify } from "testdouble";

import { IStorageUtils } from "@interfaces/data/utilities";
import {
  IVectorUtils,
  IGatewayConnectorProxy,
  IBlockchainUtils,
} from "@interfaces/utilities";
import { IGatewayConnectorProxyFactory } from "@interfaces/utilities/factory";
import {
  gatewayUrl,
  account,
  account2,
  routerChannelAddress,
  insuranceTransferId,
  commonPaymentId,
  gatewaySignature,
  gatewayUrl2,
  publicIdentifier,
  gatewayAddress,
  expirationDate,
} from "@mock/mocks";
import {
  BlockchainProviderMock,
  ConfigProviderMock,
  ContextProviderMock,
  VectorUtilsMockFactory,
} from "@tests/mock/utils";

const validatedSignature = Signature("0xValidatedSignature");
const newAuthorizationSignature = Signature("0xNewAuthorizationSignature");
const authorizationSignature = Signature(
  "0x1e866e66e7f3a68658bd186bafbdc534d4a5022e14022fddfe8865e2236dc67d64eee05b4d8f340dffa1928efa517784b63cad6a3fb35d999cb9d722b34075071b",
);
const balances = new Balances([]);

class GatewayConnectorRepositoryMocks {
  public blockchainProvider = new BlockchainProviderMock();
  public ajaxUtils = td.object<IAjaxUtils>();
  public vectorUtils =
    VectorUtilsMockFactory.factoryVectorUtils(expirationDate);
  public configProvider = new ConfigProviderMock();
  public contextProvider = new ContextProviderMock();
  public gatewayConnectorProxyFactory =
    td.object<IGatewayConnectorProxyFactory>();
  public gatewayConnectorProxy = td.object<IGatewayConnectorProxy>();
  public blockchainUtils = td.object<IBlockchainUtils>();
  public storageUtils = td.object<IStorageUtils>();
  public logUtils = td.object<ILogUtils>();

  public gatewayRegistrationInfo1 = new GatewayRegistrationInfo(
    gatewayUrl,
    account,
    gatewaySignature,
  );

  public gatewayRegistrationInfo2 = new GatewayRegistrationInfo(
    gatewayUrl2,
    account2,
    gatewaySignature,
  );

  public expectedSignerDomain = {
    name: "Hypernet Protocol",
    version: "1",
  };

  public expectedSignerTypes = {
    AuthorizedGateway: [
      { name: "authorizedGatewayUrl", type: "string" },
      { name: "gatewayValidatedSignature", type: "string" },
    ],
  };

  public expectedSignerValue = {
    authorizedGatewayUrl: gatewayUrl,
    gatewayValidatedSignature: validatedSignature,
  };

  constructor() {
    td.when(
      this.storageUtils.read<IAuthorizedGatewayEntry[]>(
        AuthorizedGatewaysSchema.title,
      ),
    ).thenReturn(
      okAsync([
        {
          gatewayUrl,
          authorizationSignature,
        },
      ]),
    );

    const authorizedGatewayEntry = [
      {
        gatewayUrl: gatewayUrl,
        authorizationSignature: newAuthorizationSignature,
      },
    ];

    td.when(
      this.storageUtils.write<IAuthorizedGatewayEntry[]>(
        AuthorizedGatewaysSchema.title,
        authorizedGatewayEntry,
      ),
    ).thenReturn(okAsync(undefined));

    td.when(
      this.storageUtils.write<IAuthorizedGatewayEntry[]>(
        AuthorizedGatewaysSchema.title,
        [],
      ),
    ).thenReturn(okAsync(undefined));

    td.when(
      this.gatewayConnectorProxyFactory.factoryProxy(
        this.gatewayRegistrationInfo1,
      ),
    ).thenReturn(okAsync(this.gatewayConnectorProxy));

    td.when(this.gatewayConnectorProxy.getValidatedSignature()).thenReturn(
      okAsync(Signature(validatedSignature)),
    );

    td.when(
      this.gatewayConnectorProxy.activateConnector(publicIdentifier, balances),
    ).thenReturn(okAsync(undefined));

    td.when(this.gatewayConnectorProxy.deauthorize()).thenReturn(
      okAsync(undefined),
    );

    td.when(
      this.blockchainUtils.verifyTypedData(
        td.matchers.contains(this.expectedSignerDomain),
        td.matchers.contains(this.expectedSignerTypes),
        td.matchers.contains(this.expectedSignerValue),
        Signature(authorizationSignature),
      ),
    ).thenReturn(account as never);

    td.when(
      this.blockchainUtils.getGatewayRegistrationInfo(gatewayUrl),
    ).thenReturn(
      okAsync(this.gatewayRegistrationInfo1),
      errAsync(new Error("gatewayUrl called twice")),
    );

    td.when(
      this.blockchainUtils.getGatewayRegistrationInfo(gatewayUrl2),
    ).thenReturn(
      okAsync(this.gatewayRegistrationInfo2),
      errAsync(new Error("gatewayUrl2 called twice")),
    );

    td.when(
      this.blockchainProvider.signer._signTypedData(
        td.matchers.contains(this.expectedSignerDomain),
        td.matchers.contains(this.expectedSignerTypes),
        td.matchers.contains(this.expectedSignerValue),
      ),
    ).thenResolve(newAuthorizationSignature);

    td.when(
      this.ajaxUtils.get(
        td.matchers.argThat((arg: URL) => {
          return arg.toString() == `${gatewayUrl}address`;
        }),
      ),
    ).thenReturn(okAsync(account));

    td.when(
      this.ajaxUtils.get(
        td.matchers.argThat((arg: URL) => {
          return arg.toString() == `${gatewayUrl2}address`;
        }),
      ),
    ).thenReturn(okAsync(account2));
  }

  public factoryRepository(): IGatewayConnectorRepository {
    return new GatewayConnectorRepository(
      this.blockchainProvider,
      this.ajaxUtils,
      this.configProvider,
      this.contextProvider,
      this.vectorUtils,
      this.storageUtils,
      this.gatewayConnectorProxyFactory,
      this.blockchainUtils,
      this.logUtils,
    );
  }
}

describe("GatewayConnectorRepository tests", () => {
  test("getAuthorizedGateways returns a map", async () => {
    // Arrange
    const mocks = new GatewayConnectorRepositoryMocks();
    const repo = mocks.factoryRepository();

    // Act
    const result = await repo.getAuthorizedGateways();

    // Assert
    expect(result).toBeDefined();
    expect(result.isErr()).toBeFalsy();
    const authorizedGateways = result._unsafeUnwrap();
    expect(authorizedGateways.size).toBe(1);
    expect(authorizedGateways.get(gatewayUrl)).toBe(authorizationSignature);
  });

  test("getAuthorizedGateways returns an empty map", async () => {
    // Arrange
    const mocks = new GatewayConnectorRepositoryMocks();

    td.when(mocks.storageUtils.read(AuthorizedGatewaysSchema.title)).thenReturn(
      okAsync(null),
    );

    const repo = mocks.factoryRepository();

    // Act
    const result = await repo.getAuthorizedGateways();

    // Assert
    expect(result).toBeDefined();
    expect(result.isErr()).toBeFalsy();
    const authorizedGateways = result._unsafeUnwrap();
    expect(authorizedGateways.size).toBe(0);
  });

  test("activateAuthorizedGateways returns successfully", async () => {
    // Arrange
    const mocks = new GatewayConnectorRepositoryMocks();
    const repo = mocks.factoryRepository();

    // Act
    const result = await repo.activateAuthorizedGateways(balances);

    // Assert
    expect(result).toBeDefined();
    expect(result.isErr()).toBeFalsy();
  });

  test("activateAuthorizedGateways re-authenticates if the signature has changed", async () => {
    // Arrange
    const mocks = new GatewayConnectorRepositoryMocks();

    td.when(
      mocks.blockchainUtils.verifyTypedData(
        td.matchers.contains(mocks.expectedSignerDomain),
        td.matchers.contains(mocks.expectedSignerTypes),
        td.matchers.contains(mocks.expectedSignerValue),
        Signature(authorizationSignature),
      ),
    ).thenReturn(account2 as never);

    let onAuthorizedGatewayUpdatedVal: string | null = null;
    mocks.contextProvider.onAuthorizedGatewayUpdated.subscribe((val) => {
      onAuthorizedGatewayUpdatedVal = val.toString();
    });

    const repo = mocks.factoryRepository();

    // Act
    const result = await repo.activateAuthorizedGateways(balances);

    // Assert
    expect(result).toBeDefined();
    expect(result.isErr()).toBeFalsy();
    expect(onAuthorizedGatewayUpdatedVal).toBeDefined();
    expect(onAuthorizedGatewayUpdatedVal).toBe(gatewayUrl);
  });

  test("activateAuthorizedGateways passes if proxy can not be factoried", async () => {
    // Arrange
    const mocks = new GatewayConnectorRepositoryMocks();

    const error = new ProxyError();
    td.when(
      mocks.gatewayConnectorProxyFactory.factoryProxy(
        mocks.gatewayRegistrationInfo1,
      ),
    ).thenReturn(errAsync(error));

    let onAuthorizedGatewayActivationFailedVal: string | null = null;
    mocks.contextProvider.onAuthorizedGatewayActivationFailed.subscribe(
      (val) => {
        onAuthorizedGatewayActivationFailedVal = val.toString();
      },
    );

    const repo = mocks.factoryRepository();

    // Act
    const result = await repo.activateAuthorizedGateways(balances);

    // Assert
    expect(result).toBeDefined();
    expect(result.isErr()).toBeFalsy();
    expect(onAuthorizedGatewayActivationFailedVal).toBe(gatewayUrl);
  });

  test("activateAuthorizedGateways passes if one of the gateway connector's signatures can't be verified by the iFrame.", async () => {
    // Arrange
    const mocks = new GatewayConnectorRepositoryMocks();

    const error = new GatewayValidationError();
    td.when(mocks.gatewayConnectorProxy.getValidatedSignature()).thenReturn(
      errAsync(error),
    );

    let onAuthorizedGatewayActivationFailedVal: string | null = null;
    mocks.contextProvider.onAuthorizedGatewayActivationFailed.subscribe(
      (val) => {
        onAuthorizedGatewayActivationFailedVal = val.toString();
      },
    );

    const repo = mocks.factoryRepository();

    // Act
    const result = await repo.activateAuthorizedGateways(balances);

    // Assert
    expect(result).toBeDefined();
    expect(result.isErr()).toBeFalsy();
    expect(onAuthorizedGatewayActivationFailedVal).toBe(gatewayUrl);
  });

  test("activateAuthorizedGateways passes if the connector can not be activated and make sure proxy is destroyed", async () => {
    // Arrange
    const mocks = new GatewayConnectorRepositoryMocks();

    const error = new GatewayActivationError();
    td.when(
      mocks.gatewayConnectorProxy.activateConnector(publicIdentifier, balances),
    ).thenReturn(errAsync(error));

    let onAuthorizedGatewayActivationFailedVal: string | null = null;
    mocks.contextProvider.onAuthorizedGatewayActivationFailed.subscribe(
      (val) => {
        onAuthorizedGatewayActivationFailedVal = val.toString();
      },
    );

    const repo = mocks.factoryRepository();

    // Act
    const result = await repo.activateAuthorizedGateways(balances);

    // Assert
    expect(result).toBeDefined();
    expect(result.isErr()).toBeFalsy();
    verify(mocks.gatewayConnectorProxy.destroy());
    expect(onAuthorizedGatewayActivationFailedVal).toBe(gatewayUrl);
  });

  test("addAuthorizedGateway returns successfully", async () => {
    // Arrange
    const mocks = new GatewayConnectorRepositoryMocks();

    td.when(mocks.storageUtils.read(AuthorizedGatewaysSchema.title)).thenReturn(
      okAsync(null),
    );

    const repo = mocks.factoryRepository();

    // Act
    const result = await repo.addAuthorizedGateway(
      mocks.gatewayRegistrationInfo1,
      balances,
    );

    // Assert
    expect(result).toBeDefined();
    expect(result.isErr()).toBeFalsy();
  });

  test("addAuthorizedGateway returns an error if proxy can not be factoried", async () => {
    // Arrange
    const mocks = new GatewayConnectorRepositoryMocks();

    td.when(mocks.storageUtils.read(AuthorizedGatewaysSchema.title)).thenReturn(
      okAsync(null),
    );

    const error = new GatewayConnectorError();
    td.when(
      mocks.gatewayConnectorProxyFactory.factoryProxy(
        mocks.gatewayRegistrationInfo1,
      ),
    ).thenReturn(errAsync(error));

    let onAuthorizedGatewayActivationFailedVal: string | null = null;
    mocks.contextProvider.onAuthorizedGatewayActivationFailed.subscribe(
      (val) => {
        onAuthorizedGatewayActivationFailedVal = val.toString();
      },
    );

    const repo = mocks.factoryRepository();

    // Act
    const result = await repo.addAuthorizedGateway(
      mocks.gatewayRegistrationInfo1,
      balances,
    );

    // Assert
    expect(result).toBeDefined();
    expect(result.isErr()).toBeTruthy();
    const resultVal = result._unsafeUnwrapErr();
    expect(resultVal).toBeInstanceOf(GatewayActivationError);
    expect(onAuthorizedGatewayActivationFailedVal).toBe(gatewayUrl);
  });

  test("addAuthorizedGateway returns an error if proxy can not provide validated signature", async () => {
    // Arrange
    const mocks = new GatewayConnectorRepositoryMocks();

    td.when(mocks.storageUtils.read(AuthorizedGatewaysSchema.title)).thenReturn(
      okAsync(null),
    );

    const error = new GatewayValidationError();
    td.when(mocks.gatewayConnectorProxy.getValidatedSignature()).thenReturn(
      errAsync(error),
    );

    let onAuthorizedGatewayActivationFailedVal: string | null = null;
    mocks.contextProvider.onAuthorizedGatewayActivationFailed.subscribe(
      (val) => {
        onAuthorizedGatewayActivationFailedVal = val.toString();
      },
    );

    const repo = mocks.factoryRepository();

    // Act
    const result = await repo.addAuthorizedGateway(
      mocks.gatewayRegistrationInfo1,
      balances,
    );

    // Assert
    expect(result).toBeDefined();
    expect(result.isErr()).toBeTruthy();
    const resultVal = result._unsafeUnwrapErr();
    expect(resultVal).toBeInstanceOf(GatewayActivationError);
    expect(onAuthorizedGatewayActivationFailedVal).toBe(gatewayUrl);
  });

  test("addAuthorizedGateway returns an error if signature is denied", async () => {
    // Arrange
    const mocks = new GatewayConnectorRepositoryMocks();

    td.when(mocks.storageUtils.read(AuthorizedGatewaysSchema.title)).thenReturn(
      okAsync(null),
    );

    const error = new GatewayValidationError();
    td.when(
      mocks.blockchainProvider.signer._signTypedData(
        td.matchers.contains(mocks.expectedSignerDomain),
        td.matchers.contains(mocks.expectedSignerTypes),
        td.matchers.contains(mocks.expectedSignerValue),
      ),
    ).thenReject(error);

    let onAuthorizedGatewayActivationFailedVal: string | null = null;
    mocks.contextProvider.onAuthorizedGatewayActivationFailed.subscribe(
      (val) => {
        onAuthorizedGatewayActivationFailedVal = val.toString();
      },
    );

    const repo = mocks.factoryRepository();

    // Act
    const result = await repo.addAuthorizedGateway(
      mocks.gatewayRegistrationInfo1,
      balances,
    );

    // Assert
    expect(result).toBeDefined();
    expect(result.isErr()).toBeTruthy();
    const resultVal = result._unsafeUnwrapErr();
    expect(resultVal).toBeInstanceOf(GatewayActivationError);
    expect(onAuthorizedGatewayActivationFailedVal).toBe(gatewayUrl);
  });

  test("addAuthorizedGateway returns an error if connector can not be activated", async () => {
    // Arrange
    const mocks = new GatewayConnectorRepositoryMocks();

    td.when(mocks.storageUtils.read(AuthorizedGatewaysSchema.title)).thenReturn(
      okAsync(null),
    );

    const error = new GatewayConnectorError();
    td.when(
      mocks.gatewayConnectorProxy.activateConnector(publicIdentifier, balances),
    ).thenReturn(errAsync(error));

    let onAuthorizedGatewayActivationFailedVal: string | null = null;
    mocks.contextProvider.onAuthorizedGatewayActivationFailed.subscribe(
      (val) => {
        onAuthorizedGatewayActivationFailedVal = val.toString();
      },
    );

    const repo = mocks.factoryRepository();

    // Act
    const result = await repo.addAuthorizedGateway(
      mocks.gatewayRegistrationInfo1,
      balances,
    );

    // Assert
    expect(result).toBeDefined();
    expect(result.isErr()).toBeTruthy();
    const resultVal = result._unsafeUnwrapErr();
    expect(resultVal).toBeInstanceOf(GatewayActivationError);
    expect(onAuthorizedGatewayActivationFailedVal).toBe(gatewayUrl);
  });

  test("getGatewayRegistrationInfo returns successfully", async () => {
    // Arrange
    const mocks = new GatewayConnectorRepositoryMocks();
    const repo = mocks.factoryRepository();

    // Act
    const result = await repo.getGatewayRegistrationInfo([gatewayUrl]);

    // Assert
    expect(result).toBeDefined();
    expect(result.isErr()).toBeFalsy();
    const value = result._unsafeUnwrap();
    expect(value.size).toBe(1);
    expect(value.get(gatewayUrl)).toBe(mocks.gatewayRegistrationInfo1);
  });

  test("getGatewayRegistrationInfo returns successfully from cache", async () => {
    // Arrange
    const mocks = new GatewayConnectorRepositoryMocks();

    const repo = mocks.factoryRepository();

    // Act
    const result = await repo
      .getGatewayRegistrationInfo([gatewayUrl])
      .andThen(() => {
        return repo.getGatewayRegistrationInfo([gatewayUrl]);
      });

    // Assert
    expect(result).toBeDefined();
    expect(result.isErr()).toBeFalsy();
    const value = result._unsafeUnwrap();
    expect(value.size).toBe(1);
    expect(value.get(gatewayUrl)).toBe(mocks.gatewayRegistrationInfo1);
  });

  test("getGatewayAddresses returns successfully from partial cache", async () => {
    // Arrange
    const mocks = new GatewayConnectorRepositoryMocks();

    const repo = mocks.factoryRepository();

    // Act
    const result = await repo
      .getGatewayRegistrationInfo([gatewayUrl])
      .andThen(() => {
        return repo.getGatewayRegistrationInfo([gatewayUrl, gatewayUrl2]);
      });

    // Assert
    expect(result).toBeDefined();
    expect(result.isErr()).toBeFalsy();
    const value = result._unsafeUnwrap();
    expect(value.size).toBe(2);
    expect(value.get(gatewayUrl)).toBe(mocks.gatewayRegistrationInfo1);
    expect(value.get(gatewayUrl2)).toBe(mocks.gatewayRegistrationInfo2);
  });

  test("getGatewayRegistrationInfo returns an error if a single gateway has an error", async () => {
    // Arrange
    const mocks = new GatewayConnectorRepositoryMocks();

    const error = new Error();
    td.when(
      mocks.blockchainUtils.getGatewayRegistrationInfo(gatewayUrl),
    ).thenReturn(errAsync(error));

    const repo = mocks.factoryRepository();

    // Act
    const result = await repo
      .activateAuthorizedGateways(balances)
      .andThen(() => {
        return repo.getGatewayRegistrationInfo([gatewayUrl, gatewayUrl2]);
      });

    // Assert
    expect(result).toBeDefined();
    expect(result.isErr()).toBeTruthy();
    const value = result._unsafeUnwrapErr();
    expect(value).toBe(error);
  });

  test("getAuthorizedGatewaysConnectorsStatus returns map of gateway urls and status", async () => {
    // Arrange
    const mocks = new GatewayConnectorRepositoryMocks();
    const repo = mocks.factoryRepository();
    const resultMap = new Map([[gatewayUrl, true]]);

    // Act
    const result = await repo
      .activateAuthorizedGateways(balances)
      .andThen(() => {
        return repo.getAuthorizedGatewaysConnectorsStatus();
      });

    // Assert
    expect(result).toBeDefined();
    expect(result.isErr()).toBeFalsy();
    const value = result._unsafeUnwrap();
    expect(value).toStrictEqual(resultMap);
  });

  test("deauthorizeGateway without errors", async () => {
    // Arrange
    const mocks = new GatewayConnectorRepositoryMocks();
    const repo = mocks.factoryRepository();

    // Act
    await repo.activateAuthorizedGateways(balances);
    const result = await repo.deauthorizeGateway(gatewayUrl);

    // Assert
    expect(result).toBeDefined();
    expect(result.isErr()).toBeFalsy();
    expect(result._unsafeUnwrap()).toBe(undefined);
  });
});
