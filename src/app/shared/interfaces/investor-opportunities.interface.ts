import { EOpportunityType } from "../enums/opportunities.enum";

export interface IInvestorOpportunity {
  id: string,
  title: string,
  shortDescription: string,
  opportunityType: EOpportunityType,
  isApplied: boolean,
  isOtherOpportunity: boolean,
  icon: string
}
