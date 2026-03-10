import { ERoles } from "../enums";
import { EDelegationActions, EDelegationStatus } from "../enums/delegation.enum";
import { IFilterBase } from "./filter.interface";

export interface IAddDelegationRequest {
  delegatorId: string;
  delegateeId: string;
  from: string;
  to: string;
}

export interface IEditDelegationRequest {
  delegationId: string;
  from: string;
  to: string;
}
export interface ActiveEmployee {
  id: string;
  name: string;
  role: number;
}
export interface IDelegationRecord {
  delgationId: string;
  delegatorName: string;
  delegatorId?: string | null;
  delegateeName: string;
  delegateeId?: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string;
  updatedAt: string;
  status: EDelegationStatus;
  delegationActions: EDelegationActions[];
}
export type TDelegationSortingKeys = keyof IDelegationRecord;

export interface IDelegationFilter extends IFilterBase<TDelegationSortingKeys> {
  searchText?: string;
  status?: boolean[];
  delegationDateFrom?: string | null;
  delegationDateTo?: string | null;
  delegationPeriod?: Date[] | null;
}

export interface IDelegationFilterRequest extends IFilterBase<TDelegationSortingKeys> {
  searchText?: string;
  status?: boolean[];
  delegationDateFrom?: string | null;
  delegationDateTo?: string | null;
}


export interface IImpersonationOptions {
  userId: string;
  nameEn: string;
  nameAr: string;
  profilePic: string;
  role: ERoles;
  userName: string;
}