import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls, ETargetedCustomer } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-target-customers-summary-section',
  imports: [PlanSummaryFlied],
  templateUrl: './target-customers-summary-section.html',
  styleUrl: './target-customers-summary-section.scss',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TargetCustomersSummarySection extends SummarySectionBaseClass {
  private readonly targetedCustomerControl = computed(() => this.getValueFormControl(EMaterialsFormControls.targetedCustomer));
  private readonly namesOfTargetedSuppliersControl = computed(() => this.getValueFormControl(EMaterialsFormControls.namesOfTargetedSuppliers));
  private readonly productsUtilizeTargetedProductControl = computed(() => this.getValueFormControl(EMaterialsFormControls.productsUtilizeTargetedProduct));

  private formatTargetedCustomers(value: number[] | unknown): string {
    if (!Array.isArray(value) || value.length === 0) return '';
    return value
      .map((id: number) => {
        const label = ETargetedCustomer[id as unknown as keyof typeof ETargetedCustomer];
        return label != null ? String(label).replace(/_/g, ' ') : String(id);
      })
      .join(', ');
  }

  targetedCustomerSummaryField = computed<IPlanSummaryField>(() => {
    const value = this.targetedCustomerControl()?.value;
    const currantValue = Array.isArray(value) ? this.formatTargetedCustomers(value) : '';
    const targetSEC = this.planStore.productPlanData()?.productPlan.productPlantOverview.targetCustomers.targetSEC;
    const beforeValue = Array.isArray(targetSEC) ? targetSEC.map((id: number) => ETargetedCustomer[id as unknown as keyof typeof ETargetedCustomer] ?? id).join(', ') : '';
    return {
      label: 'Targeted Customer',
      beforeValue,
      currantValue,
      hasError: this.isFieldHasError(this.targetedCustomerControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.targetedCustomer),
      isResolved: this.isResolvedField(EMaterialsFormControls.targetedCustomer),
      showDifference: this.shouldShowDifference(this.targetedCustomerControl()),
    };
  });

  namesOfTargetedSuppliersSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Names of Targeted Suppliers',
    beforeValue: this.planStore.productPlanData()?.productPlan.productPlantOverview.targetCustomers.targetedLocalSupplierNames ?? '',
    currantValue: this.namesOfTargetedSuppliersControl()?.value ?? '',
    hasError: this.isFieldHasError(this.namesOfTargetedSuppliersControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.namesOfTargetedSuppliers),
    isResolved: this.isResolvedField(EMaterialsFormControls.namesOfTargetedSuppliers),
    showDifference: this.shouldShowDifference(this.namesOfTargetedSuppliersControl()),
  }));

  productsUtilizeTargetedProductSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Products Utilize Targeted Product',
    beforeValue: this.planStore.productPlanData()?.productPlan.productPlantOverview.targetCustomers.productsUtilizingTargetProduct ?? '',
    currantValue: this.productsUtilizeTargetedProductControl()?.value ?? '',
    hasError: this.isFieldHasError(this.productsUtilizeTargetedProductControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.productsUtilizeTargetedProduct),
    isResolved: this.isResolvedField(EMaterialsFormControls.productsUtilizeTargetedProduct),
    showDifference: this.shouldShowDifference(this.productsUtilizeTargetedProductControl()),
  }));
}
