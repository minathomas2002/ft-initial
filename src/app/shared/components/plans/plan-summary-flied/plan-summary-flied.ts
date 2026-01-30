import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-plan-summary-flied',
  imports: [TooltipModule],
  templateUrl: './plan-summary-flied.html',
  styleUrl: './plan-summary-flied.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanSummaryFlied {
  planSummaryField = input.required<IPlanSummaryField>();
}

