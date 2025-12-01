import { ERoles, EUserStatus } from "../enums";
import { IFilterBase } from "./filter.interface";
import { ISelectItem } from "./select-item.interface";

export interface IRoleManagementAssignmentRecord {
  id: string;
  jobId: string;
  nameEn: string;
  nameAr: string;
  email: string;
  phoneNumber: string;
  role: string;
  roleCode: number;
  status: string;
  isActive: true,
  assignedDate: string;
  assignedBy: string;
  userId: string;
  userRoleId: string;
}

export type TRoleManagementAssignmentSortingKeys = keyof IRoleManagementAssignmentRecord;

export interface IRoleManagementAssignmentFilter extends IFilterBase<TRoleManagementAssignmentSortingKeys> {
  searchText?: string;
  roleCodes?: ISelectItem[];
  statusFilters?: ISelectItem[];
  assignedDate: Date[] | null;
}

export interface IRoleManagementAssignmentFilterRequest extends IFilterBase<TRoleManagementAssignmentSortingKeys> {
  searchText?: string;
  roleCodes?: number[];
  statusFilters?: boolean[];
  assignedDateFrom?: string | null;
  assignedDateTo?: string | null;
}

export interface ICurrentRoleHolders {
  employeeId: string;
  userId: string;
  nameEn: string;
  nameAr: string;
  email: string;
  role: string;
  roleCode: ERoles;
  status: EUserStatus;
  assignedDate: string;
  assignedBy: string;
  isAssigned: boolean;
}

export interface ITransferRoleRequest {
  roleCode: ERoles;
  newUserId: string;
  currentUserId: string;
}