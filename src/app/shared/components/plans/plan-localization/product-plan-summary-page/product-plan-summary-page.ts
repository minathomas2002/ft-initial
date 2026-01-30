import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OverviewCompanyStepSummary } from '../product-localization-plan-wizard/summary-pages/overview-company-step-summary/overview-company-step-summary';
import { ProductPlantOverviewStepSummary } from '../product-localization-plan-wizard/summary-pages/product-plant-overview-step-summary/product-plant-overview-step-summary';
import { ValueChainStepSummary } from '../product-localization-plan-wizard/summary-pages/value-chain-step-summary/value-chain-step-summary';
import { SaudizationStepSummary } from '../product-localization-plan-wizard/summary-pages/saudization-step-summary/saudization-step-summary';

@Component({
  selector: 'app-product-plan-summary-page',
  imports: [OverviewCompanyStepSummary, ProductPlantOverviewStepSummary, ValueChainStepSummary, SaudizationStepSummary],
  templateUrl: './product-plan-summary-page.html',
  styleUrl: './product-plan-summary-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPlanSummaryPage { }
