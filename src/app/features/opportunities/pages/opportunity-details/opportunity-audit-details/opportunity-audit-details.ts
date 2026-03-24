import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { IOpportunityDetails } from 'src/app/shared/interfaces';
import { LocalizedDatePipe, TranslatePipe } from 'src/app/shared/pipes';
import { OpportunitiesStore } from 'src/app/shared/stores/opportunities/opportunities.store';
import { getOpportunityTypeConfig } from 'src/app/shared/utils/opportunities.utils';

@Component({
  selector: 'app-opportunity-audit-details',
  imports: [LocalizedDatePipe, TranslatePipe],
  templateUrl: './opportunity-audit-details.html',
  styleUrl: './opportunity-audit-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpportunityAuditDetails {
  opportunityDetails = input<IOpportunityDetails | null>();
  getOpportunityTypeConfig = getOpportunityTypeConfig;
  opportunitiesStore = inject(OpportunitiesStore);

}
