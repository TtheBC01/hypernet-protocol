import {
  EPaymentType,
  ETransferType,
  UnixTimestamp,
  IBasicTransferResponse,
  Signature,
  BigNumberString,
} from "@hypernetlabs/objects";
import { BigNumber } from "ethers";
import { okAsync } from "neverthrow";
import td from "testdouble";

import { BrowserNodeProviderMock } from "./BrowserNodeProviderMock";

import { IVectorUtils } from "@interfaces/utilities";
import {
  activeInsuranceTransfer,
  activeOfferTransfer,
  activeParameterizedTransfer,
  chainId,
  commonAmount,
  commonPaymentId,
  erc20AssetAddress,
  gatewayAddress,
  gatewaySignature,
  gatewayUrl,
  insuranceTransferId,
  offerTransferId,
  parameterizedTransferId,
  publicIdentifier,
  publicIdentifier2,
  routerChannelAddress,
  routerPublicIdentifier,
  unixNow,
} from "@mock/mocks";

export class VectorUtilsMockFactory {
  static factoryVectorUtils(expirationDate: UnixTimestamp): IVectorUtils {
    const vectorUtils = td.object<IVectorUtils>();

    td.when(
      vectorUtils.getTransferTypeWithTransfer(
        td.matchers.contains({ transferId: offerTransferId }),
      ),
    ).thenReturn(
      okAsync({
        transferType: ETransferType.Offer,
        transfer: activeOfferTransfer,
      }),
    );
    td.when(
      vectorUtils.getTransferTypeWithTransfer(
        td.matchers.contains({ transferId: insuranceTransferId }),
      ),
    ).thenReturn(
      okAsync({
        transferType: ETransferType.Insurance,
        transfer: activeInsuranceTransfer,
      }),
    );
    td.when(
      vectorUtils.getTransferTypeWithTransfer(
        td.matchers.contains({ transferId: parameterizedTransferId }),
      ),
    ).thenReturn(
      okAsync({
        transferType: ETransferType.Parameterized,
        transfer: activeParameterizedTransfer,
      }),
    );

    td.when(
      vectorUtils.getRouterChannelAddress(routerPublicIdentifier, chainId),
    ).thenReturn(okAsync(routerChannelAddress));

    td.when(
      vectorUtils.createOfferTransfer(
        routerPublicIdentifier,
        chainId,
        publicIdentifier2,
        td.matchers.contains({
          routerPublicIdentifier: routerPublicIdentifier,
          chainId: chainId,
          paymentId: commonPaymentId,
          creationDate: unixNow,
          to: publicIdentifier2,
          from: publicIdentifier,
          requiredStake: commonAmount.toString(),
          paymentAmount: commonAmount.toString(),
          expirationDate,
          paymentToken: erc20AssetAddress,
          gatewayUrl: gatewayUrl,
        }),
      ),
    ).thenReturn(
      okAsync({
        channelAddress: routerChannelAddress,
        transferId: offerTransferId,
      }),
    );

    td.when(
      vectorUtils.resolveParameterizedTransfer(
        parameterizedTransferId,
        commonPaymentId,
        commonAmount,
      ),
    ).thenReturn(
      okAsync({
        channelAddress: routerChannelAddress,
        transferId: parameterizedTransferId,
      }),
    );

    td.when(
      vectorUtils.createInsuranceTransfer(
        routerPublicIdentifier,
        chainId,
        publicIdentifier,
        gatewayAddress,
        commonAmount,
        expirationDate,
        commonPaymentId,
      ),
    ).thenReturn(
      okAsync({
        channelAddress: routerChannelAddress,
        transferId: insuranceTransferId,
      }),
    );

    td.when(
      vectorUtils.createParameterizedTransfer(
        routerPublicIdentifier,
        chainId,
        EPaymentType.Push,
        publicIdentifier2,
        commonAmount,
        erc20AssetAddress,
        commonPaymentId,
        UnixTimestamp(unixNow - 1),
        expirationDate,
        undefined,
        undefined,
      ),
    ).thenReturn(
      okAsync({
        channelAddress: routerChannelAddress,
        transferId: parameterizedTransferId,
      }),
    );

    td.when(
      vectorUtils.resolveInsuranceTransfer(
        insuranceTransferId,
        commonPaymentId,
        null,
        BigNumberString("0"),
      ),
    ).thenReturn(okAsync({} as IBasicTransferResponse));

    td.when(
      vectorUtils.resolveInsuranceTransfer(
        insuranceTransferId,
        commonPaymentId,
        Signature(gatewaySignature),
        BigNumberString("1"),
      ),
    ).thenReturn(okAsync({} as IBasicTransferResponse));

    return vectorUtils;
  }
}
