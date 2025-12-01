import { EAdminUserActions, ERoleNames, ERoles, EUserStatus } from "../enums";
import { IFilterBase } from "./filter.interface";

export interface IUsersFilter extends IFilterBase<TUsersSortingKeys> {
  searchText?: string;
  roleIds?: string[];
  statusFilters?: boolean | undefined;
  joinDate?: string;
}

export type TUsersSortingKeys = keyof IUserRecord;

export interface IUserRecord {
  id: string;
  employeeID: string;
  name_Ar: string;
  name_En: string;
  email: string;
  phoneNumber: string;
  department: string;
  role: ERoleNames;
  roleCode: ERoles;
  joinDate: string;
  status: string;
  userId: string;
  actions: EAdminUserActions[];
}

export interface IUsersFilterRequest {
  searchText?: string;
  roleIds?: string[];
  statusFilters?: boolean | undefined;
  joinDate?: string;
}

export interface IUserCreate {
  
  employeeID: string;
  nameAr: string;
  nameEn: string;
  email: string;
  phoneNumber: string;
  roleId: string;
  job: string;
}

export interface IUserEdit {
  id: string;
  name_Ar: string;
  name_En: string;
  phoneNumber: string;
  roleId: string;
}

export interface IUserCreateResponse {
  systemEmployeeId : string;
  userId : string;
}

export interface IUserUpdateStatus {
  id : string;
}

export interface IUserDetails {
  id : string;
  employeeID : string;
  name_En: string;
  name_Ar : string;
  email : string;
  phoneNumber : string;
  department : string;
  roleId : string;
  roleName : string; 
  roleCode : number; 
  active : boolean;
  userId : string;
  joinDate : Date;
    
  
}
  
export interface IRoleManagementFilter extends IFilterBase<TRoleManagementSortingKeys> {
  searchText?: string;
  roleIds?: string[];
  statusFilters?: boolean | undefined;
  joinDate?: Date[] | undefined;
}

export type TRoleManagementSortingKeys = keyof IRoleManagementRecord;

export interface IRoleManagementRecord {
  id: string;
  jobId: string;
  name_En: string;
  name_Ar: string;
  email: string;
  phoneNumber: string;
  role: string;
  roleCode: number;
  status: string;
  isActive: boolean;
  assignedDate: string;
  assignedBy: string;
  userId: string;
  userRoleId: string;
}

export interface IRoleManagementFilterRequest extends IFilterBase<TRoleManagementSortingKeys> {
  searchText?: string;
  roleIds?: string[];
  statusFilters?: boolean | undefined;
  joinDateFrom?: string | null;
  joinDateTo?: string | null;
}
