import { ERC20Abi, FullChannelState } from "@connext/vector-types";
import { IAccountsRepository } from "@interfaces/data/IAccountsRepository";
import { AssetBalance, Balances, BigNumber, EthereumAddress, PublicIdentifier } from "@interfaces/objects";
import { IVectorUtils, IBlockchainProvider, IBrowserNodeProvider } from "@interfaces/utilities";
import { Contract } from "ethers";
import { artifacts, TestToken } from "@connext/vector-contracts"

export class AccountsRepository implements IAccountsRepository {
  constructor(
    protected blockchainProvider: IBlockchainProvider,
    protected vectorUtils: IVectorUtils,
    protected browserNodeProvider: IBrowserNodeProvider,
  ) {}

  public async getPublicIdentifier(): Promise<PublicIdentifier> {
    const browserNode = await this.browserNodeProvider.getBrowserNode();

    return browserNode.publicIdentifier;
  }

  public async getAccounts(): Promise<string[]> {
    const provider = await this.blockchainProvider.getProvider();

    return await provider.listAccounts();
  }

  public async getBalances(): Promise<Balances> {
    const browserNode = await this.browserNodeProvider.getBrowserNode();
    const channelAddress = await this.vectorUtils.getRouterChannelAddress();

    const channelStateRes = await browserNode.getStateChannel({ channelAddress });

    if (channelStateRes.isError) {
      throw new Error("Cannot get the state channel status!");
    }

    const channelState = channelStateRes.getValue() as FullChannelState;

    const assetBalances = new Array<AssetBalance>();
    for (let i = 0; i < channelState.assetIds.length; i++) {
      assetBalances.push(
        new AssetBalance(
          channelState.assetIds[i],
          BigNumber.from(channelState.balances[i].amount[1]),
          BigNumber.from(0),
          BigNumber.from(0),
        ),
      );
    }
    return new Balances(assetBalances);
  }

  public async getBalanceByAsset(assetAddress: EthereumAddress): Promise<AssetBalance> {
    const balances = await this.getBalances();

    for (const assetBalance of balances.assets) {
      if (assetBalance.assetAddresss === assetAddress) {
        return assetBalance;
      }
    }
    return new AssetBalance(assetAddress, BigNumber.from(0), BigNumber.from(0), BigNumber.from(0));
  }

  public async depositFunds(assetAddress: EthereumAddress, amount: BigNumber): Promise<void> {
    const signer = await this.blockchainProvider.getSigner();
    const channelAddress = await this.vectorUtils.getRouterChannelAddress();
    const browserNode = await this.browserNodeProvider.getBrowserNode();

    let tx;

    if (assetAddress = "0x0000000000000000000000000000000000000000") {
      // send eth
      tx = await signer.sendTransaction({ to: channelAddress, value: amount });
    } else {
      // send an actual erc20 token
      let tokenContract = new Contract(assetAddress, ERC20Abi)
      tx = await tokenContract.transfer(channelAddress, amount)
    }

    // TODO: Wait on this, break it up, this could take a while
    await tx.wait();

    const depositRes = await browserNode.reconcileDeposit({
      assetId: assetAddress,
      channelAddress,
      // publicIdentifier: browserNode.publicIdentifier
    });

    if (depositRes.isError) {
      console.log(depositRes.getError());
      throw new Error("Deposit can not be reconciled");
    }
    
    const deposit = depositRes.getValue();

    if (deposit.channelAddress !== channelAddress) {
      throw new Error("Something has gone horribly wrong!");
    }
  }

  public async withdrawFunds(assetAddress: string, amount: BigNumber, destinationAddress: string): Promise<void> {
    const channelAddress = await this.vectorUtils.getRouterChannelAddress();
    const browserNode = await this.browserNodeProvider.getBrowserNode();

    await browserNode.withdraw({
      channelAddress,
      amount: amount.toString(),
      assetId: assetAddress,
      recipient: destinationAddress,
      fee: "0",
    });
  }

  public async mintTestToken(amount: BigNumber, to: EthereumAddress): Promise<void> {
    const [provider, signer] = await Promise.all([
      this.blockchainProvider.getProvider(),
      await this.blockchainProvider.getSigner(),
    ]);

    const testTokenContract = new Contract("0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0", artifacts['TestToken'].abi, signer)
    let mintTx = await testTokenContract.mint(to, amount)
    await mintTx.wait()
  }
}