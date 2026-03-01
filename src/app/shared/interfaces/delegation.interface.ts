import { EDelegationActions } from "../enums/delegation-enum";
import { IFilterBase } from "./filter.interface";
export type DelegationStatus = "Upcoming" | "Active" | "Cancelled" | "Expired";

export interface IAddDelegationRequest {
  id?: string| null;
  delegatorId: string;
  delegateeId: string;
  from: string;
  to: string;
}
export interface ActiveEmployee{
  id: string;
  name: string;
  role:number;
}
export interface IDelegationRecord {
  delgationId: string;
  delegatorName: string;
  delegatorId?: string| null;
  delegateeName: string;
  delegateeId?: string| null;
  startDate: string;
  endDate: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string;
  updatedAt: string;
  status: DelegationStatus;
  delegationActions: EDelegationActions[];
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

