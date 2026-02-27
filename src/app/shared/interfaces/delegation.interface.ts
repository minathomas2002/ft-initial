import { EDelegationActions } from "../enums/delegation-enum";
import { IFilterBase } from "./filter.interface";
export type DelegationStatus = "Upcoming" | "Active" | "Cancelled" | "Expired";

export interface IAddDelegationRequest {
  delegatorId: string;
  delegateeId: string;
  startDate: string;
  endDate: string;
}
export interface IDelegationRecord {
  id: number;
  delegatorName: string;
  delegatorId: string;
  delegateeName: string;
  delegateeId: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string;
  updatedAt: string;
  status: DelegationStatus;
  actions: EDelegationActions[];
}
export type TDelegationSortingKeys = keyof IDelegationRecord;

export interface IDelegationFilter extends IFilterBase<TDelegationSortingKeys> {
  searchText?: string;
  status?: boolean[];
  delegationDateFrom?: string|null;
  delegationDateTo?: string|null;
  delegationPeriod?: Date[]|null;
}

export interface IDelegationFilterRequest extends IFilterBase<TDelegationSortingKeys> {
  searchText?: string;
  status?: boolean[];
  delegationDateFrom?: string|null;
  delegationDateTo?: string|null;
}

