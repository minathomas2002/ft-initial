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
    
    const labelMap: Record<number, string> = {
      [ETargetedCustomer.SEC]: 'SEC',
      [ETargetedCustomer.SEC_APPROVED_LOCAL_SUPPLIERS]: "SEC's approved local suppliers",
    };
    
    return value
      .map((id: number) => {
        return labelMap[id] ?? String(id);
      })
      .join(', ');
  }

  targetedCustomerSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const value = this.targetedCustomerControl()?.value;
    const currantValue = Array.isArray(value) ? this.formatTargetedCustomers(value) : '';
    const targetSEC = this.planStore.productPlanData()?.productPlan.productPlantOverview.targetCustomers.targetSEC;
    const beforeValue = Array.isArray(targetSEC) ? this.formatTargetedCustomers(targetSEC) : '';
    return {
      label: 'Targeted Customer',
      beforeValue,
      currantValue,
      hasError: this.isFieldHasError(this.targetedCustomerControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.targetedCustomer),
      isResolved: this.isResolvedField(EMaterialsFormControls.targetedCustomer),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });
  
  showNamesOfTargetedSuppliersAndProducts = computed(() => {
    this.doRefresh();
    const value = this.targetedCustomerControl()?.value;
    return value.includes(String(ETargetedCustomer.SEC_APPROVED_LOCAL_SUPPLIERS));
  });

  namesOfTargetedSuppliersSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.namesOfTargetedSuppliersControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.productPlantOverview.targetCustomers.targetedLocalSupplierNames ?? '';
    return {
      label: 'Names of Targeted Suppliers',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.namesOfTargetedSuppliersControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.namesOfTargetedSuppliers),
      isResolved: this.isResolvedField(EMaterialsFormControls.namesOfTargetedSuppliers),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  productsUtilizeTargetedProductSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.productsUtilizeTargetedProductControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.productPlantOverview.targetCustomers.productsUtilizingTargetProduct ?? '';
    return {
      label: 'Products Utilize Targeted Product',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.productsUtilizeTargetedProductControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.productsUtilizeTargetedProduct),
      isResolved: this.isResolvedField(EMaterialsFormControls.productsUtilizeTargetedProduct),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });
}
