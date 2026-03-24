import { EOpportunityQuantity, EOpportunityType } from "../enums/opportunities.enum";
import { IApiPaginatedResponse } from "./api.interface";
import { IFilterBase } from "./filter.interface";

export interface IOpportunity {
  id: string,
  title: string,
  shortDescription: string,
  opportunityType: EOpportunityType,
  isApplied: boolean,
  isOtherOpportunity: boolean,
  numberOfPlans:number;
  icon: string
}
export interface IOpportunityLookup {
  id: string,
  name: string,
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
  ibmFileBase64?: IOpportunityFileBase64;
  objectId: string;
  fileUrl: string;
  createdDate: string;
}

export interface IOpportunityFileBase64 {
  fileBase64?: string;
  fileBase64MimeType?: string;
}

export interface IOpportunityDetails {
  id: string;
  title: string;
  shortDescription: string;
  opportunityType: EOpportunityType;
  numberOfPlans: number;
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
  createdBy: string;
  createdDate: string|null;
  updatedBy: string | null;
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
  quantityUnit: EOpportunityQuantity;
}

export interface IOpportunitiesDashboardResponse<T> extends IApiPaginatedResponse<T> {
  counts: {
    totalOpportunities: number;
    activePublishedOpportunities: number;
    inactiveOpportunities: number;
    draftOpportunities: number;
  };
}

export interface IOpportunityLocalizationTablesValidationResponse {
  designEngineeringRequired: boolean;
  sourcingRequired: boolean;
  manufacturingRequired: boolean;
  assemblyTestingRequired: boolean;
  afterSalesRequired: boolean;
}
