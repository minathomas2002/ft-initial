import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OverviewCompanyStepSummary } from "../product-localization-plan-wizard/summary-pages/overview-company-step-summary/overview-company-step-summary";

@Component({
  selector: 'app-product-plan-summary-page',
  imports: [OverviewCompanyStepSummary],
  templateUrl: './product-plan-summary-page.html',
  styleUrl: './product-plan-summary-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPlanSummaryPage { }
