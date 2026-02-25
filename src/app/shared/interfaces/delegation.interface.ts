import { EDelegationActions } from "../enums/delegation-enum";
import { IFilterBase } from "./filter.interface";
export type DelegationStatus = "Upcoming" | "Active" | "Cancelled" | "Expired";

export interface IDelegationRecord {
  id: number;
  delegator: string;
  delegatee: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  createdBy: string;
  lastModifiedBy: string;
  lastModifiedDate: string;
  status: DelegationStatus;
  actions: EDelegationActions[];
}
export type TDelegationSortingKeys = keyof IDelegationRecord;

export interface IDelegationFilter extends IFilterBase<TDelegationSortingKeys> {
  searchText?: string;
  statusFilters?: boolean[];
}

export interface IDelegationFilterRequest extends IFilterBase<TDelegationSortingKeys> {
  searchText?: string;
  statusFilters?: boolean[];
}


export interface IDelegationDetails {
 id: number;
  delegator: string;
  delegatee: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  createdBy: string;
  lastModifiedBy: string;
  lastModifiedDate: string;
  status: DelegationStatus;

}
