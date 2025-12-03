import { EOpportunityType } from "../enums/opportunities.enum";
import { IFilterBase } from "./filter.interface";

export interface IOpportunity {
  id: string,
  title: string,
  shortDescription: string,
  opportunityType: EOpportunityType,
  isApplied: boolean,
  isOtherOpportunity: boolean,
  icon: string
}

export type TOpportunitiesSortingKeys = keyof IOpportunity;

export interface IOpportunitiesFilterRequest extends IFilterBase<TOpportunitiesSortingKeys> {
  searchText?: string;
}

export interface IOpportunityActivity {
  id: string;
  opportunityId: string;
  keyActivity: string;
  orderIndex: number;
  createdDate: string;
  keyActivityFormatted: string;
}

export interface IOpportunityAttachment {
  id: string;
  fileName: string;
  fileExtension: string;
  ibmIdentifier: string;
  objectId: string;
  fileUrl: string;
  createdDate: string;
}

export interface IOpportunityDetails {
  id: string;
  title: string;
  shortDescription: string;
  opportunityType: EOpportunityType;
  opportunityCategory: string;
  spendSAR: number;
  minQuantity: number;
  maxQuantity: number;
  localSuppliers: number;
  globalSuppliers: number;
  startDate: string;
  endDate: string;
  status: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
  actions: number[];
  minQuantityFormatted: string;
  maxQuantityFormatted: string;
  localSuppliersFormatted: string;
  globalSuppliersFormatted: string;
  designEngineerings: IOpportunityActivity[];
  sourcings: IOpportunityActivity[];
  manufacturings: IOpportunityActivity[];
  assemblyTestings: IOpportunityActivity[];
  afterSalesServices: IOpportunityActivity[];
  attachments: IOpportunityAttachment[];
  linkedPlans: number;
  hasActivePlans: boolean;
}