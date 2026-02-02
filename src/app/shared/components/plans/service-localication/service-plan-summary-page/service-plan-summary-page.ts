import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CoverPageStepSummary } from './summary-pages/cover-page-step-summary/cover-page-step-summary';
import { OverviewStepSummary } from './summary-pages/overview-step-summary/overview-step-summary';
import { ExistingSaudiStepSummary } from './summary-pages/existing-saudi-step-summary/existing-saudi-step-summary';
import { DirectLocalizationStepSummary } from './summary-pages/direct-localization-step-summary/direct-localization-step-summary';
import { Signature } from 'src/app/shared/interfaces/plans.interface';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { inject } from '@angular/core';
import { SummarySectionSignature } from "../../plan-localization/plan-localization-step-05-summary/summary-sections/summary-section-signature/summary-section-signature";

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

  includeExistingSaudi = input<boolean>(true);
  includeDirectLocalization = input<boolean>(true);
  signature = input<Signature | null>(null);

  isViewMode = computed(() => this.planStore.wizardMode() === 'view');
}
