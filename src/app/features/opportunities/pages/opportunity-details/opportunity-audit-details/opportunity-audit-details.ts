import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IOpportunityDetails } from 'src/app/shared/interfaces';
import { LocalizedDatePipe, TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-opportunity-audit-details',
  imports: [LocalizedDatePipe, TranslatePipe],
  templateUrl: './opportunity-audit-details.html',
  styleUrl: './opportunity-audit-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpportunityAuditDetails {
  opportunityDetails = input<IOpportunityDetails | null>();
}
