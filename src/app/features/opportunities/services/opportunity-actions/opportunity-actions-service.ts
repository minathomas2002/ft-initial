import { Injectable } from '@angular/core';
import { EOpportunityAction } from 'src/app/shared/enums/opportunities.enum';
import { IOpportunityDetails } from 'src/app/shared/interfaces';

@Injectable({
  providedIn: 'root',
})
export class OpportunityActionsService {
  canApplyOnDetails(details: IOpportunityDetails | undefined) {
    if (!details) return false;
    return details.actions?.includes(EOpportunityAction.Apply);
  }
}
