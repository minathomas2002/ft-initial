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

  productNameSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Product Name',
    beforeValue: this.planStore.productPlanData()?.productPlan.productPlantOverview.overview.productName ?? '',
    currantValue: this.productNameControl()?.value ?? '',
    hasError: this.isFieldHasError(this.productNameControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.productName),
    isResolved: this.isResolvedField(EMaterialsFormControls.productName),
    showDifference: this.shouldShowDifference(this.productNameControl()),
  }));

  productSpecificationsSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Product Specifications',
    beforeValue: this.planStore.productPlanData()?.productPlan.productPlantOverview.overview.productSpecifications ?? '',
    currantValue: this.productSpecificationsControl()?.value ?? '',
    hasError: this.isFieldHasError(this.productSpecificationsControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.productSpecifications),
    isResolved: this.isResolvedField(EMaterialsFormControls.productSpecifications),
    showDifference: this.shouldShowDifference(this.productSpecificationsControl()),
  }));

  targetedAnnualPlantCapacitySummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Targeted Annual Plant Capacity',
    beforeValue: this.planStore.productPlanData()?.productPlan.productPlantOverview.overview.targetedAnnualPlantCapacity ?? '',
    currantValue: this.targetedAnnualPlantCapacityControl()?.value ?? '',
    hasError: this.isFieldHasError(this.targetedAnnualPlantCapacityControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.targetedAnnualPlantCapacity),
    isResolved: this.isResolvedField(EMaterialsFormControls.targetedAnnualPlantCapacity),
    showDifference: this.shouldShowDifference(this.targetedAnnualPlantCapacityControl()),
  }));

  timeRequiredToSetupFactorySummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Time Required to Setup Factory',
    beforeValue: this.planStore.productPlanData()?.productPlan.productPlantOverview.overview.timeRequiredToSetupFactory ?? '',
    currantValue: this.timeRequiredToSetupFactoryControl()?.value ?? '',
    hasError: this.isFieldHasError(this.timeRequiredToSetupFactoryControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.timeRequiredToSetupFactory),
    isResolved: this.isResolvedField(EMaterialsFormControls.timeRequiredToSetupFactory),
    showDifference: this.shouldShowDifference(this.timeRequiredToSetupFactoryControl()),
  }));
}
