import { IFilterBase } from './filter.interface';

export interface IInvestorRecord {
  id: string;
  code: string;
  fullName: string;
  countryCode: string;
  email: string;
  phoneNumber: string;
  otherPhone: string;
  photoURL: string;
  numberOfSubmittedPlans: number;
  joinDate: string;
  isEmailVerified: boolean;
}

export type TInvestorsSortingKeys = keyof IInvestorRecord;

export interface IInvestorsFilter extends IFilterBase<TInvestorsSortingKeys> {
  searchText?: string;
  joinDate?: Date[] | undefined;  
}

export interface IInvestorsFilterRequest extends IFilterBase<TInvestorsSortingKeys> {
  searchText?: string;
  joinDateTo?: string | null;
  joinDateFrom?: string | null;
}

