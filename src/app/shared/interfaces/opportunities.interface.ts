import { EOpportunityType } from "../enums/opportunities.enum";
import { IFilterBase } from "./filter.interface";

export interface IOpportunity {
  id: string,
  title: string,
  shortDescription: string,
  opportunityType: EOpportunityType,
  isApplied: boolean,
  isOtherOpportunity: boolean,
  icon: string
}

export type TOpportunitiesSortingKeys = keyof IOpportunity;

export interface IOpportunitiesFilterRequest extends IFilterBase<TOpportunitiesSortingKeys> {
  searchText?: string;
}
