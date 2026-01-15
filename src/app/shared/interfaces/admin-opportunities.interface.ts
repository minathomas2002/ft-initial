import { EOpportunityAction, EOpportunityState, EOpportunityStatus, EOpportunityType } from "../enums/opportunities.enum";
import { ISelectItem } from "./select-item.interface";
import { IFilterBase } from "./filter.interface";

export interface IAdminOpportunity {
  id: string;
  title: string;
  shortDescription: string;
  opportunityType: EOpportunityType;
  opportunityCategory: number;
  isActive: boolean;
  status: EOpportunityStatus;
  startDate: string;
  endDate: string;
  isOtherOpportunity: boolean;
  actions: EOpportunityAction[];
}

export type TAdminOpportunitiesFilter = keyof IAdminOpportunity;

export interface IAdminOpportunitiesFilter extends IFilterBase<TAdminOpportunitiesFilter> {
  searchText?: string;
  state?: EOpportunityState;
  opportunityType?: EOpportunityType;
  status?: EOpportunityStatus;
}

export interface IAdminOpportunitiesFilterRequest extends IFilterBase<TAdminOpportunitiesFilter> {
  searchText?: string;
  status?: EOpportunityStatus;
  isActive?: boolean;
  opportunityType?: EOpportunityType;
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
  startDate: Date | null;
  endDate: Date | null;
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

export interface IOpportunityDraftRequest {
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
  startDate: string;
  endDate: string;
  image: File | null;
  designEngineerings: IKeyActivityRecordRequest[];
  sourcings: IKeyActivityRecordRequest[];
  manufacturings: IKeyActivityRecordRequest[];
  assemblyTestings: IKeyActivityRecordRequest[];
  afterSalesServices: IKeyActivityRecordRequest[];
}

export interface SafeObjectUrl {
  objectURL: {
    changingThisBreaksApplicationSecurity: string;
  };
}
