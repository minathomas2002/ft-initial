import { IFilterBase } from './filter.interface';

export interface IOpportunitiesFilter extends IFilterBase<TOpportunitySortingKeys> {
  searchText?: string;
}

export type TOpportunitySortingKeys = keyof IOpportunityRecord;

export interface IOpportunityRecord {
  id: string;
  title: string;
  shortDescription: string;
  spendSAR: number;
  minQuantity: number;
  maxQuantity: number;
  localSuppliers: number;
  globalSuppliers: number;
  startDate: string; // ISO date string (e.g. "2025-10-10T00:00:00")
  endDate: string;
  status: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
  attachments: any[]; // You can replace `any` with a specific `Attachment` interface if defined
  spendSARFormatted: string;
  minQuantityFormatted: string;
  maxQuantityFormatted: string;
  localSuppliersFormatted: string;
  globalSuppliersFormatted: string;
}

export interface IOpportunitiesFilterRequest extends IFilterBase<TOpportunitySortingKeys> {
  searchText?: string;
}
