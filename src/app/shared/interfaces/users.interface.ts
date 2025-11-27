import { EAdminUserActions, ERoleNames } from "../enums";
import { IFilterBase } from "./filter.interface";

export interface IUsersFilter extends IFilterBase<TUsersSortingKeys> {
  userNameEmailId?: string;
  userTitleId?: string[];
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
  roleCode: number;
  joinDate: string;
  status: string;
  userId: string;
  actions: EAdminUserActions[];
}

export interface IUsersFilterRequest {
  userNameEmailId?: string;
  userTitleId?: string[];
}
