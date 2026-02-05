import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { OverviewCompanyStepSummary } from '../product-localization-plan-wizard/summary-pages/overview-company-step-summary/overview-company-step-summary';
import { ProductPlantOverviewStepSummary } from '../product-localization-plan-wizard/summary-pages/product-plant-overview-step-summary/product-plant-overview-step-summary';
import { ValueChainStepSummary } from '../product-localization-plan-wizard/summary-pages/value-chain-step-summary/value-chain-step-summary';
import { SaudizationStepSummary } from '../product-localization-plan-wizard/summary-pages/saudization-step-summary/saudization-step-summary';
import { ICommentsCountAndPhase } from '../product-localization-plan-wizard/product-localization-plan-wizard';

@Component({
  selector: 'app-product-plan-summary-page',
  imports: [
    OverviewCompanyStepSummary,
    ProductPlantOverviewStepSummary,
    ValueChainStepSummary,
    SaudizationStepSummary,
  ],
  templateUrl: './product-plan-summary-page.html',
  styleUrl: './product-plan-summary-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPlanSummaryPage {
  /** From wizard: selectedInputs().length per step (indicator for selected/commented fields). */
  step1CommentsCountAndPhase = input<ICommentsCountAndPhase>({ count: 0, phase: 'none' });
  step2CommentsCountAndPhase = input<ICommentsCountAndPhase>({ count: 0, phase: 'none' });
  step3CommentsCountAndPhase = input<ICommentsCountAndPhase>({ count: 0, phase: 'none' });
  step4CommentsCountAndPhase = input<ICommentsCountAndPhase>({ count: 0, phase: 'none' });

  onEditStep = output<number>();

  onEditStepClick(stepNumber: number): void {
    this.onEditStep.emit(stepNumber);
  }
}
