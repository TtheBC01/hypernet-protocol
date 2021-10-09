import {
  BlockchainUnavailableError,
  EthereumAddress,
  RegistryEntry,
  Registry,
} from "@hypernetlabs/objects";
import { ResultAsync } from "neverthrow";

export interface IRegistryService {
  getRegistries(
    pageNumber: number,
    pageSize: number,
  ): ResultAsync<Registry[], BlockchainUnavailableError>;
  getRegistryByName(
    registryNames: string[],
  ): ResultAsync<Map<string, Registry>, BlockchainUnavailableError>;
  getRegistryByAddress(
    registryAddresses: EthereumAddress[],
  ): ResultAsync<Map<EthereumAddress, Registry>, BlockchainUnavailableError>;
  getRegistryEntries(
    registryName: string,
    registryEntriesNumberArr?: number[],
  ): ResultAsync<RegistryEntry[], BlockchainUnavailableError>;
  getRegistryEntryByLabel(
    registryName: string,
    label: string,
  ): ResultAsync<RegistryEntry, BlockchainUnavailableError>;
  updateRegistryEntryTokenURI(
    registryName: string,
    tokenId: number,
    registrationData: string,
  ): ResultAsync<RegistryEntry, BlockchainUnavailableError>;
  updateRegistryEntryLabel(
    registryName: string,
    tokenId: number,
    label: string,
  ): ResultAsync<RegistryEntry, BlockchainUnavailableError>;
  getRegistryEntriesTotalCount(
    registryNames: string[],
  ): ResultAsync<Map<string, number>, BlockchainUnavailableError>;
  getNumberOfRegistries(): ResultAsync<number, BlockchainUnavailableError>;
}
