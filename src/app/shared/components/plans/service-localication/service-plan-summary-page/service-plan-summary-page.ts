import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CoverPageStepSummary } from './summary-pages/cover-page-step-summary/cover-page-step-summary';
import { OverviewStepSummary } from './summary-pages/overview-step-summary/overview-step-summary';
import { ExistingSaudiStepSummary } from './summary-pages/existing-saudi-step-summary/existing-saudi-step-summary';
import { DirectLocalizationStepSummary } from './summary-pages/direct-localization-step-summary/direct-localization-step-summary';
import { SummarySectionSignature } from 'src/app/shared/components/plans/service-localication/service-plan-summary-page/summary-pages/signature-summary/summary-section-signature';
import { Signature } from 'src/app/shared/interfaces/plans.interface';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { inject } from '@angular/core';

@Component({
  selector: 'app-service-plan-summary-page',
  imports: [
    CoverPageStepSummary,
    OverviewStepSummary,
    ExistingSaudiStepSummary,
    DirectLocalizationStepSummary,
    SummarySectionSignature
],
  templateUrl: './service-plan-summary-page.html',
  styleUrl: './service-plan-summary-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicePlanSummaryPage {
  private readonly planStore = inject(PlanStore);
  onEditStep = output<number>();

  includeExistingSaudi = input<boolean>(true);
  includeDirectLocalization = input<boolean>(true);
  signature = input<Signature | null>(null);

  isViewMode = computed(() => this.planStore.wizardMode() === 'view');

  onEditStepClick(stepNumber: number): void {
    this.onEditStep.emit(stepNumber);
  }
}
