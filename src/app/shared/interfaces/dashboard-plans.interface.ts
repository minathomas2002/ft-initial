import { IFilterBase } from './filter.interface';
import { EOpportunityType } from '../enums';
import { IApiPaginatedResponse } from './api.interface';

export enum EPlanStatus {
  SUBMITTED = 1,
  PENDING = 2,
  UNDER_REVIEW = 3,
  APPROVED = 4,
  REJECTED = 5,
}

export interface IPlanRecord {
  id: string;
  planId: string;
  planCode: string;
  title: string;
  planType: EOpportunityType;
  submissionDate: string;
  slaCountDown: number; // days remaining
  status: EPlanStatus;
}

export type TPlansSortingKeys = keyof IPlanRecord;

export interface IPlanFilter extends IFilterBase<TPlansSortingKeys> {
  searchText?: string;
  planType?: EOpportunityType | null;
  status?: EPlanStatus | null;
  submissionDate?: Date[] | undefined;
}

export interface IPlanFilterRequest extends IFilterBase<TPlansSortingKeys> {
  searchText?: string;
  planType?: EOpportunityType | null;
  status?: EPlanStatus | null;
  submissionDateFrom?: string | null;
  submissionDateTo?: string | null;
}

export interface IPlansDashboardStatistics {
  totalPlans: number;
  plansUnderReview: number;
  approvedPlans: number;
  rejectedPlans: number;
}
  
export interface IPlansDashboardResponse <T> extends IApiPaginatedResponse<T> {
    counts: IPlansDashboardStatistics;
}  

export interface IAssignRequest{
  planId: string;
  employeeId: string; 
}