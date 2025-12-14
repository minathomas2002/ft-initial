import { EOpportunityType } from '../enums/opportunities.enum';
import { TColors } from '../interfaces/colors.interface';

export function getOpportunityTypeConfig(opportunityType: number): { label: string; color: TColors } {
  switch (opportunityType) {
    case EOpportunityType.SERVICES:
      return {
        label: 'opportunity.type.services',
        color: 'primary'
      };
    case EOpportunityType.PRODUCT:
      return {
        label: 'opportunity.type.product',
        color: 'orange'
      };
    default:
      return {
        label: '',
        color: 'gray',
      };
  }
}

