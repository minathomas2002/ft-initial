import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-expected-capex-summary-section',
  imports: [PlanSummaryFlied],
  templateUrl: './expected-capex-summary-section.html',
  styleUrl: './expected-capex-summary-section.scss',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpectedCapexSummarySection extends SummarySectionBaseClass {
  private readonly landPercentageControl = computed(() => this.getValueFormControl(EMaterialsFormControls.landPercentage));
  private readonly buildingPercentageControl = computed(() => this.getValueFormControl(EMaterialsFormControls.buildingPercentage));
  private readonly machineryEquipmentPercentageControl = computed(() => this.getValueFormControl(EMaterialsFormControls.machineryEquipmentPercentage));
  private readonly othersPercentageControl = computed(() => this.getValueFormControl(EMaterialsFormControls.othersPercentage));
  private readonly othersDescriptionControl = computed(() => this.getValueFormControl(EMaterialsFormControls.othersDescription));

  private formatPercent(value: number | null | undefined): string {
    return value != null ? `${value}%` : '';
  }

  landPercentageSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Land %',
    beforeValue: this.formatPercent(this.planStore.productPlanData()?.productPlan.productPlantOverview.expectedCapex.landPercent),
    currantValue: this.formatPercent(this.landPercentageControl()?.value),
    hasError: this.isFieldHasError(this.landPercentageControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.landPercentage),
    isResolved: this.isResolvedField(EMaterialsFormControls.landPercentage),
    showDifference: this.shouldShowDifference(this.landPercentageControl()),
  }));

  buildingPercentageSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Building %',
    beforeValue: this.formatPercent(this.planStore.productPlanData()?.productPlan.productPlantOverview.expectedCapex.buildingPercent),
    currantValue: this.formatPercent(this.buildingPercentageControl()?.value),
    hasError: this.isFieldHasError(this.buildingPercentageControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.buildingPercentage),
    isResolved: this.isResolvedField(EMaterialsFormControls.buildingPercentage),
    showDifference: this.shouldShowDifference(this.buildingPercentageControl()),
  }));

  machineryEquipmentPercentageSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Machinery & Equipment %',
    beforeValue: this.formatPercent(this.planStore.productPlanData()?.productPlan.productPlantOverview.expectedCapex.machineryPercent),
    currantValue: this.formatPercent(this.machineryEquipmentPercentageControl()?.value),
    hasError: this.isFieldHasError(this.machineryEquipmentPercentageControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.machineryEquipmentPercentage),
    isResolved: this.isResolvedField(EMaterialsFormControls.machineryEquipmentPercentage),
    showDifference: this.shouldShowDifference(this.machineryEquipmentPercentageControl()),
  }));

  othersPercentageSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Others %',
    beforeValue: this.formatPercent(this.planStore.productPlanData()?.productPlan.productPlantOverview.expectedCapex.othersPercent),
    currantValue: this.formatPercent(this.othersPercentageControl()?.value),
    hasError: this.isFieldHasError(this.othersPercentageControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.othersPercentage),
    isResolved: this.isResolvedField(EMaterialsFormControls.othersPercentage),
    showDifference: this.shouldShowDifference(this.othersPercentageControl()),
  }));

  othersDescriptionSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Others Description',
    beforeValue: this.planStore.productPlanData()?.productPlan.productPlantOverview.expectedCapex.othersDescription ?? '',
    currantValue: this.othersDescriptionControl()?.value ?? '',
    hasError: this.isFieldHasError(this.othersDescriptionControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.othersDescription),
    isResolved: this.isResolvedField(EMaterialsFormControls.othersDescription),
    showDifference: this.shouldShowDifference(this.othersDescriptionControl()),
  }));
}
