import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls, EProductManufacturingExperience } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-product-manufacturing-experience-summary-section',
  imports: [PlanSummaryFlied],
  templateUrl: './product-manufacturing-experience-summary-section.html',
  styleUrl: './product-manufacturing-experience-summary-section.scss',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductManufacturingExperienceSummarySection extends SummarySectionBaseClass {
  private readonly productManufacturingExperienceControl = computed(() => this.getValueFormControl(EMaterialsFormControls.productManufacturingExperience));
  private readonly provideToSECControl = computed(() => this.getFormControl(EMaterialsFormControls.provideToSEC));
  private readonly qualifiedPlantLocationSECControl = computed(() => this.getValueFormControl(EMaterialsFormControls.qualifiedPlantLocationSEC));
  private readonly approvedVendorIDSECControl = computed(() => this.getValueFormControl(EMaterialsFormControls.approvedVendorIDSEC));
  private readonly yearsOfExperienceSECControl = computed(() => this.getValueFormControl(EMaterialsFormControls.yearsOfExperienceSEC));
  private readonly totalQuantitiesSECControl = computed(() => this.getValueFormControl(EMaterialsFormControls.totalQuantitiesSEC));
  private readonly provideToLocalSuppliersControl = computed(() => this.getFormControl(EMaterialsFormControls.provideToLocalSuppliers));
  private readonly namesOfSECApprovedSuppliersControl = computed(() => this.getValueFormControl(EMaterialsFormControls.namesOfSECApprovedSuppliers));
  private readonly qualifiedPlantLocationControl = computed(() => this.getValueFormControl(EMaterialsFormControls.qualifiedPlantLocation));
  private readonly yearsOfExperienceControl = computed(() => this.getValueFormControl(EMaterialsFormControls.yearsOfExperience));
  private readonly totalQuantitiesControl = computed(() => this.getValueFormControl(EMaterialsFormControls.totalQuantities));

  private readonly mfg = () => this.planStore.productPlanData()?.productPlan.productPlantOverview.manufacturingExperience;

  private yesNo(value: boolean | null | undefined): string {
    return value === true ? 'Yes' : value === false ? 'No' : '';
  }

  private formatProductManufacturingExperience(value: number | unknown): string {
    if (value === null || value === undefined || value === '') return '';
    
    const labelMap: Record<number, string> = {
      [EProductManufacturingExperience.Years_5]: 'Less than 5 years',
      [EProductManufacturingExperience.Years_5_10]: '5 to 10 years',
      [EProductManufacturingExperience.Years_10]: 'More than 10 years',
    };
    
    return labelMap[value as number] ?? String(value);
  }

  productManufacturingExperienceSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const value = this.productManufacturingExperienceControl()?.value;
    const currantValue = this.formatProductManufacturingExperience(value);
    const beforeValue = this.formatProductManufacturingExperience(this.mfg()?.experienceRange);
    return {
      label: 'Product Manufacturing Experience',
      beforeValue,
      currantValue,
      hasError: this.isFieldHasError(this.productManufacturingExperienceControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.productManufacturingExperience),
      isResolved: this.isResolvedField(EMaterialsFormControls.productManufacturingExperience),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  provideToSECSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.yesNo(this.provideToSECControl()?.value);
    const beforeValue = this.yesNo(this.mfg()?.provideToSEC);
    return {
      label: 'Do you currently provide this product to SEC?',
      beforeValue,
      currantValue,
      hasError: this.isFieldHasError(this.provideToSECControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.provideToSEC),
      isResolved: this.isResolvedField(EMaterialsFormControls.provideToSEC),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  qualifiedPlantLocationSECSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.qualifiedPlantLocationSECControl()?.value ?? '';
    const beforeValue = this.mfg()?.qualifiedPlantLocation_SEC ?? '';
    return {
      label: 'Qualified Plant Location (By SEC)',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.qualifiedPlantLocationSECControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.qualifiedPlantLocationSEC),
      isResolved: this.isResolvedField(EMaterialsFormControls.qualifiedPlantLocationSEC),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  approvedVendorIDSECSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.approvedVendorIDSECControl()?.value ?? '';
    const beforeValue = this.mfg()?.approvedVendorId_SEC ?? '';
    return {
      label: 'Approved Vendor ID (with SEC)',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.approvedVendorIDSECControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.approvedVendorIDSEC),
      isResolved: this.isResolvedField(EMaterialsFormControls.approvedVendorIDSEC),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  yearsOfExperienceSECSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.yearsOfExperienceSECControl()?.value ?? '';
    const beforeValue = this.mfg()?.yearsExperience_SEC?.toString() || '';
    return {
      label: 'Years of Experience (with SEC)',
      beforeValue,
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.yearsOfExperienceSECControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.yearsOfExperienceSEC),
      isResolved: this.isResolvedField(EMaterialsFormControls.yearsOfExperienceSEC),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  totalQuantitiesSECSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.totalQuantitiesSECControl()?.value ?? '';
    const beforeValue = this.mfg()?.totalQuantitiesToSEC?.toString() || '';
    return {
      label: 'Total Quantities provided to SEC',
      beforeValue,
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.totalQuantitiesSECControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.totalQuantitiesSEC),
      isResolved: this.isResolvedField(EMaterialsFormControls.totalQuantitiesSEC),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  provideToLocalSuppliersSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.yesNo(this.provideToLocalSuppliersControl()?.value);
    const beforeValue = this.yesNo(this.mfg()?.provideToLocalSuppliers);
    return {
      label: "Do you currently provide this product to SEC's approved local suppliers?",
      beforeValue,
      currantValue,
      hasError: this.isFieldHasError(this.provideToLocalSuppliersControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.provideToLocalSuppliers),
      isResolved: this.isResolvedField(EMaterialsFormControls.provideToLocalSuppliers),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  namesOfSECApprovedSuppliersSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.namesOfSECApprovedSuppliersControl()?.value ?? '';
    const beforeValue = this.mfg()?.localSupplierNames || '';
    return {
      label: "Name(s) of SEC approved local supplier(s)",
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.namesOfSECApprovedSuppliersControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.namesOfSECApprovedSuppliers),
      isResolved: this.isResolvedField(EMaterialsFormControls.namesOfSECApprovedSuppliers),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  qualifiedPlantLocationSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.qualifiedPlantLocationControl()?.value ?? '';
    const beforeValue = this.mfg()?.qualifiedPlantLocation_LocalSupplier || '';
    return {
      label: 'Qualified Plant Location',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.qualifiedPlantLocationControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.qualifiedPlantLocation),
      isResolved: this.isResolvedField(EMaterialsFormControls.qualifiedPlantLocation),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  yearsOfExperienceSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.yearsOfExperienceControl()?.value ?? '';
    const beforeValue = this.mfg()?.yearsExperience_LocalSupplier?.toString() || '';
    return {
      label: 'Years of Experience',
      beforeValue,
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.yearsOfExperienceControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.yearsOfExperience),
      isResolved: this.isResolvedField(EMaterialsFormControls.yearsOfExperience),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  totalQuantitiesSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.totalQuantitiesControl()?.value ?? '';
    const beforeValue = this.mfg()?.totalQuantitiesToLocalSuppliers?.toString() || '';
    return {
      label: 'Total quantities provided to all approved local suppliers',
      beforeValue,
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.totalQuantitiesControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.totalQuantities),
      isResolved: this.isResolvedField(EMaterialsFormControls.totalQuantities),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });
}
