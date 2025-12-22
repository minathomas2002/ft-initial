import { EAdminUserActions } from "../enums";
import { IFilterBase } from "./filter.interface";
import { ISelectItem } from "./select-item.interface";

export interface IEmployeeDateFromHR {
  employeeID: string;
  userName: string;
  nameAr: string;
  nameEn: string;
  phoneNumber: string;
  email: string;
  isRealData: boolean;
}

export interface IActiveEmployee {
  id: string;
  userId: string;
  nameAr: string;
  nameEn: string;
}

export interface IAssignActiveEmployee {
  id: string;
  name: string;  
}

export interface IAssignReassignActiveEmployee {
  activeEmployees: IAssignActiveEmployee[];
  currentEmployee?: IAssignActiveEmployee;
}

export interface ISystemEmployeeDetails {
  id: string;
  employeeID: string;
  name_En: string;
  name_Ar: string;
  email: string;
  phoneNumber: string;
  department: string;
  roleId: string;
  roleName: string;
  roleCode: number;
  active: boolean;
  userId: string;
  joinDate: string;

}

export interface ICreateSystemEmployeeRequest {
  employeeID: string;
  nameAr: string;
  nameEn: string;
  email: string;
  phoneNumber: string;
  roleId: string;
}

export interface ISystemEmployeeRecord {
  id: string;
  employeeID: string;
  nameAr: string;
  nameEn: string;
  email: string;
  phoneNumber: string;
  department: string;
  role: string;
  roleCode: number;
  joinDate: string;
  status: string;
  userId: string;
  actions: EAdminUserActions[];
}

export type TSystemEmployeeSortingKeys = keyof ISystemEmployeeRecord;

export interface ISystemEmployeeFilter extends IFilterBase<TSystemEmployeeSortingKeys> {
  searchText?: string;
  roleIds?: string[];
  statusFilters?: boolean[];
}

export interface ISystemEmployeeFilterRequest extends IFilterBase<TSystemEmployeeSortingKeys> {
  searchText?: string;
  roleIds?: string[];
  statusFilters?: boolean[];
}

export interface IUpdateSystemEmployeeRequest {
  id: string;
  name_Ar: string;
  name_En: string;
  phoneNumber: string;
  roleId: string;
}