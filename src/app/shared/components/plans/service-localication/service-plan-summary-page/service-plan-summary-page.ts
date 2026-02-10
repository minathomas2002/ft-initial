import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CoverPageStepSummary } from './summary-pages/cover-page-step-summary/cover-page-step-summary';
import { OverviewStepSummary } from './summary-pages/overview-step-summary/overview-step-summary';
import { ExistingSaudiStepSummary } from './summary-pages/existing-saudi-step-summary/existing-saudi-step-summary';
import { DirectLocalizationStepSummary } from './summary-pages/direct-localization-step-summary/direct-localization-step-summary';
import { Signature } from 'src/app/shared/interfaces/plans.interface';
import { ICommentsCountAndPhase } from 'src/app/shared/types/plan-comments.types';
import { SummarySectionSignature } from '../../summary-section-signature/summary-section-signature';

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
  onEditStep = output<number>();

  includeExistingSaudi = input<boolean>(true);
  includeDirectLocalization = input<boolean>(true);
  signature = input<Signature | null>(null);

  /** From wizard: selectedInputs().length per step (indicator for selected/commented fields). */
  step1CommentsCountAndPhase = input<ICommentsCountAndPhase>({ count: 0, phase: 'none' });
  step2CommentsCountAndPhase = input<ICommentsCountAndPhase>({ count: 0, phase: 'none' });
  step3CommentsCountAndPhase = input<ICommentsCountAndPhase>({ count: 0, phase: 'none' });
  step4CommentsCountAndPhase = input<ICommentsCountAndPhase>({ count: 0, phase: 'none' });


  onEditStepClick(stepNumber: number): void {
    this.onEditStep.emit(stepNumber);
  }
}
