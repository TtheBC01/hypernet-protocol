/* Autogenerated file. Do not edit manually. */
/* tslint:disable */

import { Parameterized } from "..";

export type { HashlockTransfer } from "./HashlockTransfer";
export type { Insurance } from "./Insurance";
export type { ITransferDefinition } from "./ITransferDefinition";
export type { ITransferRegistry } from "./ITransferRegistry";
export type { MessageTransfer } from "./MessageTransfer";
export type { Parameterized } from "./Parameterized";
export type { TransferDefinition } from "./TransferDefinition";
export type { Withdraw } from "./Withdraw";

export type {
  InsuranceState,
  InsuranceResolver,
  InsuranceResolverData,
} from "./InsuranceTypes";
export type {
  ParameterizedState,
  ParameterizedResolver,
  ParameterizedResolverData,
  Rate,
} from "./ParameterizedTypes";
export type { MessageState, MessageResolver } from "./MessageTypes";

export { HashlockTransfer__factory } from "./factories/HashlockTransfer__factory";
export { Insurance__factory } from "./factories/Insurance__factory";
export { ITransferDefinition__factory } from "./factories/ITransferDefinition__factory";
export { ITransferRegistry__factory } from "./factories/ITransferRegistry__factory";
export { MessageTransfer__factory } from "./factories/MessageTransfer__factory";
export { Parameterized__factory } from "./factories/Parameterized__factory";
export { TransferDefinition__factory } from "./factories/TransferDefinition__factory";
export { Withdraw__factory } from "./factories/Withdraw__factory";

export { IMessageTransferInterface } from "./MessageTransfer";
export { IInsuranceInterface } from "./Insurance";
export { IParameterizedInterface } from "./Parameterized";

import ERC721Abi from "./artifacts/ERC721";
import InsuranceAbi from "./artifacts/Insurance";
import LiquidityRegistryAbi from "./artifacts/LiquidityRegistry";
import MessageTransferAbi from "./artifacts/MessageTransfer";
import MocRegistryAbi from "./artifacts/MocRegistry";
import ParameterizedAbi from "./artifacts/Parameterized";

const TransferAbis = {
  ERC721: ERC721Abi,
  Insurance: InsuranceAbi,
  Parameterized: ParameterizedAbi,
  MessageTransfer: MessageTransferAbi,
  MocRegistry: MocRegistryAbi,
  LiquidityRegistry: LiquidityRegistryAbi,
};

export { TransferAbis };
