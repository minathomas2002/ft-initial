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
export interface IUserEdit extends IUserCreate {
  
  userID: string;
}

export interface IUserCreateResponse {
  systemEmployeeId : string;
  userId : string;
}

  
