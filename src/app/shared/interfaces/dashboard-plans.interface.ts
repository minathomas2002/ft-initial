import { IFilterBase } from './filter.interface';
import { EOpportunityType } from '../enums';
import { IApiPaginatedResponse } from './api.interface';

export enum EInvestorPlanStatus {
  APPROVED = 1,
  DRAFT = 2,
  PENDING = 3,
  REJECTED = 4,
  SUBMITTED = 5,
  UNDER_REVIEW = 6
}

export enum EInternalUserPlanStatus {
  APPROVED = 1,
  DEPT_APPROVED = 2,
  DEPT_REJECTED = 3,
  DV_APPROVED = 4,
  DV_REJECTED = 5,
  DV_REJECTION_ACKNOWLEDGED = 6,
  EMPLOYEE_APPROVED = 7,
  EMPLOYEE_REJECTED = 8,
  PENDING = 9,
  REJECTED = 10,
  UNASSIGNED = 11,
  UNDER_REVIEW = 12,
  ASSIGNED = 13
}

export interface IPlanRecord {
  id: string;
  planId: string;
  planCode: string;
  title: string;
  investorName?: string;
  planType: EOpportunityType;
  submissionDate: string;
  slaCountDown: number; // days remaining
  status: EInvestorPlanStatus | EInternalUserPlanStatus;
  actions: number[];
  assignee?: string;
}

export type TPlansSortingKeys = keyof IPlanRecord;

export interface IPlanFilter extends IFilterBase<TPlansSortingKeys> {
  searchText?: string;
  planType?: EOpportunityType | null;
  status?: EInvestorPlanStatus | EInternalUserPlanStatus | null;
  submissionDate?: Date[] | undefined;
  assignee?: string | null;
}

export interface IPlanFilterRequest extends IFilterBase<TPlansSortingKeys> {
  searchText?: string;
  planType?: EOpportunityType | null;
  status?: EInvestorPlanStatus | EInternalUserPlanStatus | null;
  submissionDateFrom?: string | null;
  submissionDateTo?: string | null;
  assignee?: string | null;
}

export interface IPlansDashboardStatistics {
  totalPlans: number;
  unAssignedPlans?: number;
  plansUnderReview?: number;
  approvedPlans: number;
  rejectedPlans: number;
  pendingAssignedPlans?: number;
  assignedPlans?: number;
}

export interface IPlansDashboardResponse<T> extends IApiPaginatedResponse<T> {
  counts: IPlansDashboardStatistics;
}

export interface IPlansResponse<T> extends IApiPaginatedResponse<T> {
}

export interface IAssignRequest {
  planId: string;
  employeeId: string;
}