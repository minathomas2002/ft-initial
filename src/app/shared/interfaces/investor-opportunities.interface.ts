import { EOpportunityType } from "../enums/opportunities.enum";
import { IFilterBase } from "./filter.interface";

export interface IInvestorOpportunity {
  id: string,
  title: string,
  shortDescription: string,
  opportunityType: EOpportunityType,
  isApplied: boolean,
  isOtherOpportunity: boolean,
  icon: string
}

export type TInvestorOpportunitiesSortingKeys = keyof IInvestorOpportunity;

export interface IInvestorOpportunitiesFilterRequest extends IFilterBase<TInvestorOpportunitiesSortingKeys> {
  searchText?: string;
}
