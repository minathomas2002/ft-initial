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
    return (value != null && value.toString().trim() !== '') ? `${value}%` : '0%';
  }

  landPercentageSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.formatPercent(this.landPercentageControl()?.value);
    const beforeValue = this.formatPercent(this.planStore.productPlanData()?.productPlan.productPlantOverview.expectedCapex.landPercent);
    return {
      label: 'Land %',
      beforeValue,
      currantValue,
      hasError: this.isFieldHasError(this.landPercentageControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.landPercentage),
      isResolved: this.isResolvedField(EMaterialsFormControls.landPercentage),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  buildingPercentageSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.formatPercent(this.buildingPercentageControl()?.value);
    const beforeValue = this.formatPercent(this.planStore.productPlanData()?.productPlan.productPlantOverview.expectedCapex.buildingPercent);
    return {
      label: 'Building %',
      beforeValue,
      currantValue,
      hasError: this.isFieldHasError(this.buildingPercentageControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.buildingPercentage),
      isResolved: this.isResolvedField(EMaterialsFormControls.buildingPercentage),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  machineryEquipmentPercentageSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.formatPercent(this.machineryEquipmentPercentageControl()?.value);
    const beforeValue = this.formatPercent(this.planStore.productPlanData()?.productPlan.productPlantOverview.expectedCapex.machineryPercent);
    return {
      label: 'Machinery & Equipment %',
      beforeValue,
      currantValue,
      hasError: this.isFieldHasError(this.machineryEquipmentPercentageControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.machineryEquipmentPercentage),
      isResolved: this.isResolvedField(EMaterialsFormControls.machineryEquipmentPercentage),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  othersPercentageSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.formatPercent(this.othersPercentageControl()?.value);
    const beforeValue = this.formatPercent(this.planStore.productPlanData()?.productPlan.productPlantOverview.expectedCapex.othersPercent);
    return {
      label: 'Others %',
      beforeValue,
      currantValue,
      hasError: this.isFieldHasError(this.othersPercentageControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.othersPercentage),
      isResolved: this.isResolvedField(EMaterialsFormControls.othersPercentage),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  showOthersDescription = computed(() => {
    this.doRefresh();
    const currantValue = this.othersPercentageSummaryField().currantValue.replace('%', '');
    return Number(currantValue) > 0;
  });

  othersDescriptionSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.othersDescriptionControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.productPlantOverview.expectedCapex.othersDescription ?? '';
    return {
      label: 'Others Description',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.othersDescriptionControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.othersDescription),
      isResolved: this.isResolvedField(EMaterialsFormControls.othersDescription),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });
}
