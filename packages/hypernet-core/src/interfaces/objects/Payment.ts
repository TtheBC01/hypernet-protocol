import * as moment from "moment";
import { BigNumber } from "@interfaces/objects";

export enum EPaymentState {
  Sent,
  Approved,
  Challenged,
}

export class Payment {
  constructor(
    public channelId: string,
    public amount: BigNumber,
    public created_timestamp: moment.Moment,
    public updated_timestamp: moment.Moment,
    public state: EPaymentState,
  ) {}
}