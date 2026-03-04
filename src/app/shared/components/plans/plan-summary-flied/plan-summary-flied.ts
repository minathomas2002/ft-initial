import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-plan-summary-flied',
  imports: [TooltipModule, TranslatePipe],
  templateUrl: './plan-summary-flied.html',
  styleUrl: './plan-summary-flied.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanSummaryFlied {
  planSummaryField = input.required<IPlanSummaryField>();
  isAttachment = input<boolean>(false);
}

