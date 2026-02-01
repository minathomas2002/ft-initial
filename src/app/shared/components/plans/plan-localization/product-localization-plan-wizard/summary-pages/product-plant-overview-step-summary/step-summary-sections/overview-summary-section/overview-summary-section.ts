import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-overview-summary-section',
  imports: [PlanSummaryFlied],
  templateUrl: './overview-summary-section.html',
  styleUrl: './overview-summary-section.scss',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewSummarySection extends SummarySectionBaseClass {
  private readonly productNameControl = computed(() => this.getValueFormControl(EMaterialsFormControls.productName));
  private readonly productSpecificationsControl = computed(() => this.getValueFormControl(EMaterialsFormControls.productSpecifications));
  private readonly targetedAnnualPlantCapacityControl = computed(() => this.getValueFormControl(EMaterialsFormControls.targetedAnnualPlantCapacity));
  private readonly timeRequiredToSetupFactoryControl = computed(() => this.getValueFormControl(EMaterialsFormControls.timeRequiredToSetupFactory));

  productNameSummaryField = computed<IPlanSummaryField>(() => {
    const currantValue = this.productNameControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.productPlantOverview.overview.productName ?? '';
    return {
      label: 'Product Name',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.productNameControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.productName),
      isResolved: this.isResolvedField(EMaterialsFormControls.productName),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  productSpecificationsSummaryField = computed<IPlanSummaryField>(() => {
    const currantValue = this.productSpecificationsControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.productPlantOverview.overview.productSpecifications ?? '';
    return {
      label: 'Product Specifications',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.productSpecificationsControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.productSpecifications),
      isResolved: this.isResolvedField(EMaterialsFormControls.productSpecifications),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  targetedAnnualPlantCapacitySummaryField = computed<IPlanSummaryField>(() => {
    const currantValue = this.targetedAnnualPlantCapacityControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.productPlantOverview.overview.targetedAnnualPlantCapacity ?? '';
    return {
      label: 'Targeted Annual Plant Capacity',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.targetedAnnualPlantCapacityControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.targetedAnnualPlantCapacity),
      isResolved: this.isResolvedField(EMaterialsFormControls.targetedAnnualPlantCapacity),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  timeRequiredToSetupFactorySummaryField = computed<IPlanSummaryField>(() => {
    const currantValue = this.timeRequiredToSetupFactoryControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.productPlantOverview.overview.timeRequiredToSetupFactory ?? '';
    return {
      label: 'Time Required to Setup Factory',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.timeRequiredToSetupFactoryControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.timeRequiredToSetupFactory),
      isResolved: this.isResolvedField(EMaterialsFormControls.timeRequiredToSetupFactory),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });
}
