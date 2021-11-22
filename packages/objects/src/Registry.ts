import { BigNumberString } from "@objects/BigNumberString";
import { EthereumAccountAddress } from "@objects/EthereumAccountAddress";
import { EthereumContractAddress } from "@objects/EthereumContractAddress";

export class Registry {
  constructor(
    public registrarAddresses: EthereumAccountAddress[],
    public registrarAdminAddresses: EthereumAccountAddress[],
    public address: EthereumContractAddress,
    public name: string,
    public symbol: string,
    public numberOfEntries: number,
    public allowStorageUpdate: boolean,
    public allowLabelChange: boolean,
    public allowTransfers: boolean,
    public registrationToken: EthereumContractAddress,
    public registrationFee: BigNumberString,
    public burnAddress: EthereumAccountAddress,
    public burnFee: number,
    public primaryRegistry: EthereumContractAddress,
    public index: number | null,
  ) {}
}
