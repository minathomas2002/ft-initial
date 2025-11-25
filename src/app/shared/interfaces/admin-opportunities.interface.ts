import { EOpportunityAction, EOpportunityStatus, EOpportunityType } from "../enums/opportunities.enum";
import { ISelectItem } from "./select-item.interface";

export interface IAdminOpportunity {
  id: string;
  title: string;
  shortDescription: string;
  opportunityType: EOpportunityType;
  status: EOpportunityStatus;
  state: string;
  isOtherOpportunity: boolean;
  icon: string;
  warningMessage: string;
  applicationPeriod: string;
  actions: EOpportunityAction[];
}


/* opportunity form */
export interface ICreateOpportunity {
  opportunityInformationFrom: IOpportunityInformationFrom;
  opportunityLocalizationForm: IOpportunityLocalizationFrom;
}

export interface IOpportunityInformationFrom {
  id: string | null
  title: string;
  opportunityType: string | null;
  shortDescription: string;
  opportunityCategory: string;
  spendSAR: string;
  minQuantity: string;
  maxQuantity: string;
  localSuppliers: string;
  globalSuppliers: string;
  dateRange: [Date, Date] | null;
  image: File | null;
}

export interface IOpportunityLocalizationFrom {
  designEngineerings: IKeyActivityRecord[];
  sourcings: IKeyActivityRecord[];
  manufacturings: IKeyActivityRecord[];
  assemblyTestings: IKeyActivityRecord[];
  afterSalesServices: IKeyActivityRecord[];
}

export interface IKeyActivityRecord {
  keyActivity: string;
}

export interface IKeyActivityRecordRequest {
  keyActivity: string;
  orderIndex: number;
}

export interface IOpportunityDraftRequest extends IOpportunityInformationFrom {
  designEngineerings: IKeyActivityRecordRequest[];
  sourcings: IKeyActivityRecordRequest[];
  manufacturings: IKeyActivityRecordRequest[];
  assemblyTestings: IKeyActivityRecordRequest[];
  afterSalesServices: IKeyActivityRecordRequest[];
}