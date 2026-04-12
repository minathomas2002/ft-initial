import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';
import { OpportunitiesStore } from 'src/app/shared/stores/opportunities/opportunities.store';
import { EOpportunityQuantity } from 'src/app/shared/enums/opportunities.enum';

@Component({
  selector: 'app-overview-summary-section',
  imports: [PlanSummaryFlied],
  templateUrl: './overview-summary-section.html',
  styleUrl: './overview-summary-section.scss',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewSummarySection extends SummarySectionBaseClass {
  private readonly opportunitiesStore = inject(OpportunitiesStore);

  /** Localized "month" / "months" from a numeric form value (1 → singular, else plural). */
  private monthsSuffixForValue(value: unknown): string {
    const raw = String(value ?? '').trim().replace(',', '.');
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) {
      return this.i18nService.translate('plans.form.months');
    }
    return Math.abs(n) === 1
      ? this.i18nService.translate('plans.form.month')
      : this.i18nService.translate('plans.form.months');
  }

  private readonly productNameControl = computed(() => this.getValueFormControl(EMaterialsFormControls.productName));
  private readonly productSpecificationsControl = computed(() => this.getValueFormControl(EMaterialsFormControls.productSpecifications));
  private readonly targetedAnnualPlantCapacityControl = computed(() => this.getValueFormControl(EMaterialsFormControls.targetedAnnualPlantCapacity));
  private readonly timeRequiredToSetupFactoryControl = computed(() => this.getValueFormControl(EMaterialsFormControls.timeRequiredToSetupFactory));

  private targetedAnnualPlantCapacityUnitSuffix = computed(() => {
    const unit = this.opportunitiesStore.selectedOpportunityQuantityUnit();
    if (!unit) return '';

    const unitMap: Record<EOpportunityQuantity, string> = {
      [EOpportunityQuantity.KM]: this.i18nService.translate('opportunity.units.km'),
      [EOpportunityQuantity.Panels]: this.i18nService.translate('opportunity.units.panels'),
      [EOpportunityQuantity.CB]: this.i18nService.translate('opportunity.units.cb'),
      [EOpportunityQuantity.Discs]: this.i18nService.translate('opportunity.units.discs'),
      [EOpportunityQuantity.KTons]: this.i18nService.translate('opportunity.units.ktons'),
      [EOpportunityQuantity.Unit]: this.i18nService.translate('opportunity.units.unit'),
    };

    return unitMap[unit] ?? '';
  });

  productNameSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.productNameControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.productPlantOverview.overview.productName ?? '';
    return {
      label: this.i18nService.translate('plans.form.productName'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.productNameControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.productName),
      isResolved: this.isResolvedField(EMaterialsFormControls.productName),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  productSpecificationsSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.productSpecificationsControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.productPlantOverview.overview.productSpecifications ?? '';
    return {
      label: this.i18nService.translate('plans.form.productSpecifications'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.productSpecificationsControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.productSpecifications),
      isResolved: this.isResolvedField(EMaterialsFormControls.productSpecifications),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  targetedAnnualPlantCapacitySummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const unitSuffix = this.targetedAnnualPlantCapacityUnitSuffix();
    const currantValue = this.targetedAnnualPlantCapacityControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.productPlantOverview.overview.targetedAnnualPlantCapacity ?? '';
    return {
      label: this.i18nService.translate('plans.form.targetedAnnualPlantCapacity'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.targetedAnnualPlantCapacityControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.targetedAnnualPlantCapacity),
      isResolved: this.isResolvedField(EMaterialsFormControls.targetedAnnualPlantCapacity),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
      beforeSuffix: unitSuffix,
      suffix: unitSuffix,
    };
  });

  timeRequiredToSetupFactorySummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    this.i18nService.currentLanguage();
    const currantValue = this.timeRequiredToSetupFactoryControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.productPlantOverview.overview.timeRequiredToSetupFactory ?? '';
    return {
      label: this.i18nService.translate('plans.form.timeRequiredToSetupFactory'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.timeRequiredToSetupFactoryControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.timeRequiredToSetupFactory),
      isResolved: this.isResolvedField(EMaterialsFormControls.timeRequiredToSetupFactory),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
      beforeSuffix: this.monthsSuffixForValue(beforeValue),
      suffix: this.monthsSuffixForValue(currantValue),
    };
  });
}
