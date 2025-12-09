export interface ISettingSlaReq {
  internalCycleTime : number;
  investorReplyTime: number; 
}

export interface ISettingSla extends ISettingSlaReq {
 
  minInvestorReplyTime : number;

}

export interface ISettingAutoAssign{
 
  isAssign : boolean;

}