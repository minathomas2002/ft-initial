import { EAdminUserActions, EUserStatus } from "../enums/users.enum";
import { IFilterBase } from "./filter.interface";

export interface IUsersFilter extends IFilterBase<TUsersSortingKeys> {
  userNameEmailId?: string;
  userTitleId?: string[];
}

export type TUsersSortingKeys = keyof IUserRecord;

export interface IUserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: EUserStatus;
  joinDate: string;
  actions: EAdminUserActions[];
}

export interface IUsersFilterRequest {
  userNameEmailId?: string;
  userTitleId?: string[];
}
