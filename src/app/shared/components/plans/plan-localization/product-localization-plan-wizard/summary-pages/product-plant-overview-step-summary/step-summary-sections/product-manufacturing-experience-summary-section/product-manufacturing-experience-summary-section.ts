import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
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

  productManufacturingExperienceSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Product Manufacturing Experience',
    beforeValue: this.mfg()?.experienceRange ?? '',
    currantValue: this.productManufacturingExperienceControl()?.value ?? '',
    hasError: this.isFieldHasError(this.productManufacturingExperienceControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.productManufacturingExperience),
    isResolved: this.isResolvedField(EMaterialsFormControls.productManufacturingExperience),
    showDifference: this.shouldShowDifference(this.productManufacturingExperienceControl()),
  }));

  provideToSECSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Do you currently provide this product to SEC?',
    beforeValue: this.yesNo(this.mfg()?.provideToSEC),
    currantValue: this.yesNo(this.provideToSECControl()?.value),
    hasError: this.isFieldHasError(this.provideToSECControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.provideToSEC),
    isResolved: this.isResolvedField(EMaterialsFormControls.provideToSEC),
    showDifference: this.shouldShowDifference(this.provideToSECControl()),
  }));

  qualifiedPlantLocationSECSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Qualified Plant Location (By SEC)',
    beforeValue: this.mfg()?.qualifiedPlantLocation_SEC ?? '',
    currantValue: this.qualifiedPlantLocationSECControl()?.value ?? '',
    hasError: this.isFieldHasError(this.qualifiedPlantLocationSECControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.qualifiedPlantLocationSEC),
    isResolved: this.isResolvedField(EMaterialsFormControls.qualifiedPlantLocationSEC),
    showDifference: this.shouldShowDifference(this.qualifiedPlantLocationSECControl()),
  }));

  approvedVendorIDSECSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Approved Vendor ID (with SEC)',
    beforeValue: this.mfg()?.approvedVendorId_SEC ?? '',
    currantValue: this.approvedVendorIDSECControl()?.value ?? '',
    hasError: this.isFieldHasError(this.approvedVendorIDSECControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.approvedVendorIDSEC),
    isResolved: this.isResolvedField(EMaterialsFormControls.approvedVendorIDSEC),
    showDifference: this.shouldShowDifference(this.approvedVendorIDSECControl()),
  }));

  yearsOfExperienceSECSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Years of Experience (with SEC)',
    beforeValue: this.mfg()?.yearsExperience_SEC?.toString() || '',
    currantValue: this.yearsOfExperienceSECControl()?.value ?? '',
    hasError: this.isFieldHasError(this.yearsOfExperienceSECControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.yearsOfExperienceSEC),
    isResolved: this.isResolvedField(EMaterialsFormControls.yearsOfExperienceSEC),
    showDifference: this.shouldShowDifference(this.yearsOfExperienceSECControl()),
  }));

  totalQuantitiesSECSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Total Quantities provided to SEC',
    beforeValue: this.mfg()?.totalQuantitiesToSEC?.toString() || '',
    currantValue: this.totalQuantitiesSECControl()?.value ?? '',
    hasError: this.isFieldHasError(this.totalQuantitiesSECControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.totalQuantitiesSEC),
    isResolved: this.isResolvedField(EMaterialsFormControls.totalQuantitiesSEC),
    showDifference: this.shouldShowDifference(this.totalQuantitiesSECControl()),
  }));

  provideToLocalSuppliersSummaryField = computed<IPlanSummaryField>(() => ({
    label: "Do you currently provide this product to SEC's approved local suppliers?",
    beforeValue: this.yesNo(this.mfg()?.provideToLocalSuppliers),
    currantValue: this.yesNo(this.provideToLocalSuppliersControl()?.value),
    hasError: this.isFieldHasError(this.provideToLocalSuppliersControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.provideToLocalSuppliers),
    isResolved: this.isResolvedField(EMaterialsFormControls.provideToLocalSuppliers),
    showDifference: this.shouldShowDifference(this.provideToLocalSuppliersControl()),
  }));

  namesOfSECApprovedSuppliersSummaryField = computed<IPlanSummaryField>(() => ({
    label: "Name(s) of SEC approved local supplier(s)",
    beforeValue: this.mfg()?.localSupplierNames || '',
    currantValue: this.namesOfSECApprovedSuppliersControl()?.value ?? '',
    hasError: this.isFieldHasError(this.namesOfSECApprovedSuppliersControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.namesOfSECApprovedSuppliers),
    isResolved: this.isResolvedField(EMaterialsFormControls.namesOfSECApprovedSuppliers),
    showDifference: this.shouldShowDifference(this.namesOfSECApprovedSuppliersControl()),
  }));

  qualifiedPlantLocationSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Qualified Plant Location',
    beforeValue: this.mfg()?.qualifiedPlantLocation_LocalSupplier || '',
    currantValue: this.qualifiedPlantLocationControl()?.value ?? '',
    hasError: this.isFieldHasError(this.qualifiedPlantLocationControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.qualifiedPlantLocation),
    isResolved: this.isResolvedField(EMaterialsFormControls.qualifiedPlantLocation),
    showDifference: this.shouldShowDifference(this.qualifiedPlantLocationControl()),
  }));

  yearsOfExperienceSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Years of Experience',
    beforeValue: this.mfg()?.yearsExperience_LocalSupplier?.toString() || '',
    currantValue: this.yearsOfExperienceControl()?.value ?? '',
    hasError: this.isFieldHasError(this.yearsOfExperienceControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.yearsOfExperience),
    isResolved: this.isResolvedField(EMaterialsFormControls.yearsOfExperience),
    showDifference: this.shouldShowDifference(this.yearsOfExperienceControl()),
  }));

  totalQuantitiesSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Total quantities provided to all approved local suppliers',
    beforeValue: this.mfg()?.totalQuantitiesToLocalSuppliers?.toString() || '',
    currantValue: this.totalQuantitiesControl()?.value ?? '',
    hasError: this.isFieldHasError(this.totalQuantitiesControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.totalQuantities),
    isResolved: this.isResolvedField(EMaterialsFormControls.totalQuantities),
    showDifference: this.shouldShowDifference(this.totalQuantitiesControl()),
  }));
}
