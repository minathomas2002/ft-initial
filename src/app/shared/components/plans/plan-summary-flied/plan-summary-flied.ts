import { CommonModule, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';

@Component({
  selector: 'app-plan-summary-flied',
  imports: [TooltipModule],
  templateUrl: './plan-summary-flied.html',
  styleUrl: './plan-summary-flied.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanSummaryFlied {
  planStore = inject(PlanStore);
  planSummaryField = input.required<IPlanSummaryField>();
  showDifference = computed(() =>
    this.planStore.wizardMode() === 'resubmit' &&
    this.planSummaryField().beforeValue !== this.planSummaryField().currantValue
  );
}
