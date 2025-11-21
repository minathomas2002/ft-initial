import { EAdminOpportunityActions, EOpportunityStatus, EOpportunityType } from "../enums/opportunities.enum";

export interface IAdminOpportunity {
  id: string;
  title: string;
  shortDescription: string;
  opportunityType: EOpportunityType;
  status: EOpportunityStatus;
  state: string;
  isOtherOpportunity: boolean;
  icon: string;
  warningMessage: string;
  applicationPeriod: string;
  actions: EAdminOpportunityActions[];
}
