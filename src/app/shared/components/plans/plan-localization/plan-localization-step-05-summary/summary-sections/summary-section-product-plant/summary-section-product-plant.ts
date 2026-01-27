import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SummaryField } from 'src/app/shared/components/plans/summary-field/summary-field';
import { SummarySectionHeader } from 'src/app/shared/components/plans/summary-section-header/summary-section-header';
import { EMaterialsFormControls, ETargetedCustomer } from 'src/app/shared/enums';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { IPageComment, IProductPlanResponse } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-summary-section-product-plant',
  imports: [SummarySectionHeader, SummaryField],
  templateUrl: './summary-section-product-plant.html',
  styleUrl: './summary-section-product-plant.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionProductPlant {
  isViewMode = input<boolean>(false);
  formGroup = input.required<FormGroup>();
  pageComments = input<IPageComment[]>([]);
  commentTitle = input<string>('Comments');
  originalPlanResponse = input<IProductPlanResponse | null>(null);
  onEdit = output<void>();
  private readonly planStore = inject(PlanStore);
  targetedCustomerOptions = this.planStore.targetedCustomerOptions;
  productManufacturingExperienceOptions = this.planStore.productManufacturingExperienceOptions;

  // Form group accessors
  overviewFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.overviewFormGroup) as FormGroup;
  });

  expectedCAPEXInvestmentFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.expectedCAPEXInvestmentFormGroup) as FormGroup;
  });

  targetCustomersFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.targetCustomersFormGroup) as FormGroup;
  });

  productManufacturingExperienceFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.productManufacturingExperienceFormGroup) as FormGroup;
  });

  showSECApprovedLocalSuppliersSection = computed(() => {
    if (!this.targetedCustomer()) {
      return false;
    }
    return this.targetedCustomer().split(',')
      .some((customer: string) => customer.trim() === this.targetedCustomerOptions().find((option: any) => option.id === ETargetedCustomer.SEC_APPROVED_LOCAL_SUPPLIERS.toString())?.name);
  });

  // Helper method to get value from nested form group
  getValue(formGroup: FormGroup | null, controlName: string): any {
    if (!formGroup) return null;
    const control = formGroup.get(controlName);
    if (control instanceof FormGroup) {
      const valueControl = control.get(EMaterialsFormControls.value);
      return valueControl ? valueControl.value : control.value;
    }
    return control?.value ?? null;
  }

  hasFieldError(fieldPath: string): boolean {
    const parts = fieldPath.split('.');
    let control: any = this.formGroup();

    for (const part of parts) {
      if (control instanceof FormGroup) {
        control = control.get(part);
      } else {
        return false;
      }
    }

    if (control && control.invalid && control.dirty) {
      return true;
    }

    return false;
  }

  onEditClick(): void {
    this.onEdit.emit();
  }

  // Computed values
  productName = computed(() => this.getValue(this.overviewFormGroup(), EMaterialsFormControls.productName));
  productSpecifications = computed(() => this.getValue(this.overviewFormGroup(), EMaterialsFormControls.productSpecifications));
  targetedAnnualPlantCapacity = computed(() => this.getValue(this.overviewFormGroup(), EMaterialsFormControls.targetedAnnualPlantCapacity));
  timeRequiredToSetupFactory = computed(() => this.getValue(this.overviewFormGroup(), EMaterialsFormControls.timeRequiredToSetupFactory));

  landPercentage = computed(() => this.getValue(this.expectedCAPEXInvestmentFormGroup(), EMaterialsFormControls.landPercentage));
  buildingPercentage = computed(() => this.getValue(this.expectedCAPEXInvestmentFormGroup(), EMaterialsFormControls.buildingPercentage));
  machineryEquipmentPercentage = computed(() => this.getValue(this.expectedCAPEXInvestmentFormGroup(), EMaterialsFormControls.machineryEquipmentPercentage));
  othersPercentage = computed(() => this.getValue(this.expectedCAPEXInvestmentFormGroup(), EMaterialsFormControls.othersPercentage));
  othersDescription = computed(() => this.getValue(this.expectedCAPEXInvestmentFormGroup(), EMaterialsFormControls.othersDescription));

  targetedCustomer = computed(() => {
    const control = this.targetCustomersFormGroup()?.get(EMaterialsFormControls.targetedCustomer);
    if (control instanceof FormGroup) {
      const value = this.getValue(control, EMaterialsFormControls.value);
      return value ? value.map((i: any) => this.targetedCustomerOptions().find((option: any) => option.id === i)?.name).join(', ') : null;
    }
    return null;
  });

  namesOfTargetedSuppliers = computed(() => {
    const control = this.targetCustomersFormGroup()?.get(EMaterialsFormControls.namesOfTargetedSuppliers);
    if (control instanceof FormGroup) {
      return this.getValue(control, EMaterialsFormControls.value);
    }
    return control?.value ?? null;
  });

  productsUtilizeTargetedProduct = computed(() => {
    const control = this.targetCustomersFormGroup()?.get(EMaterialsFormControls.productsUtilizeTargetedProduct);
    if (control instanceof FormGroup) {
      return this.getValue(control, EMaterialsFormControls.value);
    }
    return control?.value ?? null;
  });

  productManufacturingExperience = computed(() => {
    const control = this.productManufacturingExperienceFormGroup()?.get(EMaterialsFormControls.productManufacturingExperience);
    if (control instanceof FormGroup) {
      const value = this.getValue(control, EMaterialsFormControls.value);
      if (!value) return null;
      // Convert to string for consistent comparison (options use id as string)
      const valueStr = String(value);
      const option = this.productManufacturingExperienceOptions().find((opt: any) => String(opt.id) === valueStr);
      return option?.name ?? null;
    }
    return null;
  });
  provideToSEC = computed(() => this.getValue(this.productManufacturingExperienceFormGroup(), EMaterialsFormControls.provideToSEC));
  qualifiedPlantLocationSEC = computed(() => this.getValue(this.productManufacturingExperienceFormGroup(), EMaterialsFormControls.qualifiedPlantLocationSEC));
  approvedVendorIDSEC = computed(() => this.getValue(this.productManufacturingExperienceFormGroup(), EMaterialsFormControls.approvedVendorIDSEC));
  yearsOfExperienceSEC = computed(() => this.getValue(this.productManufacturingExperienceFormGroup(), EMaterialsFormControls.yearsOfExperienceSEC));
  totalQuantitiesSEC = computed(() => this.getValue(this.productManufacturingExperienceFormGroup(), EMaterialsFormControls.totalQuantitiesSEC));
  provideToLocalSuppliers = computed(() => this.getValue(this.productManufacturingExperienceFormGroup(), EMaterialsFormControls.provideToLocalSuppliers));
  namesOfSECApprovedSuppliers = computed(() => this.getValue(this.productManufacturingExperienceFormGroup(), EMaterialsFormControls.namesOfSECApprovedSuppliers));
  qualifiedPlantLocation = computed(() => this.getValue(this.productManufacturingExperienceFormGroup(), EMaterialsFormControls.qualifiedPlantLocation));
  yearsOfExperience = computed(() => this.getValue(this.productManufacturingExperienceFormGroup(), EMaterialsFormControls.yearsOfExperience));
  totalQuantities = computed(() => this.getValue(this.productManufacturingExperienceFormGroup(), EMaterialsFormControls.totalQuantities));

  // Computed labels for complex strings
  productsUtilizeLabel = 'Which product(s) manufactured by SEC\'s approved local suppliers will utilize your "Targeted Product"';
  provideToLocalSuppliersLabel = 'Do you currently provide this product to SEC\'s approved local suppliers?';

  // Helper method to check if a field has comments
  hasFieldComment(fieldKey: string, fieldId?: string): boolean {
    return this.pageComments().some(comment =>
      comment.fields?.some(field =>
        field.inputKey === fieldKey &&
        (fieldId === undefined || field.id === fieldId)
      )
    );
  }

  // Helper method to get before value (original value from plan response) for a field
  getBeforeValue(fieldKey: string): any {
    const originalPlan = this.originalPlanResponse();
    if (!originalPlan?.productPlan?.productPlantOverview) return null;

    const productPlant = originalPlan.productPlan.productPlantOverview;

    // Map field keys to plan response paths
    switch (fieldKey) {
      // Overview fields
      case 'productName':
        return productPlant.overview?.productName ?? null;
      case 'productSpecifications':
        return productPlant.overview?.productSpecifications ?? null;
      case 'targetedAnnualPlantCapacity':
        return productPlant.overview?.targetedAnnualPlantCapacity ?? null;
      case 'timeRequiredToSetupFactory':
        return productPlant.overview?.timeRequiredToSetupFactory ?? null;
      
      // Expected CAPEX fields
      case 'landPercentage':
        return productPlant.expectedCapex?.landPercent ?? null;
      case 'buildingPercentage':
        return productPlant.expectedCapex?.buildingPercent ?? null;
      case 'machineryEquipmentPercentage':
        return productPlant.expectedCapex?.machineryPercent ?? null;
      case 'othersPercentage':
        return productPlant.expectedCapex?.othersPercent ?? null;
      case 'othersDescription':
        return productPlant.expectedCapex?.othersDescription ?? null;
      
      // Target Customers fields
      case 'targetedCustomer':
        // Convert ETargetedCustomer[] to display string
        const targetSEC = productPlant.targetCustomers?.targetSEC;
        if (targetSEC && Array.isArray(targetSEC) && targetSEC.length > 0) {
          return targetSEC.map(id => this.targetedCustomerOptions().find((option: any) => option.id === id.toString())?.name).filter(Boolean).join(', ');
        }
        return null;
      case 'namesOfTargetedSuppliers':
        return productPlant.targetCustomers?.targetedLocalSupplierNames ?? null;
      case 'productsUtilizeTargetedProduct':
        return productPlant.targetCustomers?.productsUtilizingTargetProduct ?? null;
      
      // Manufacturing Experience fields
      case 'productManufacturingExperience':
        const expRange = productPlant.manufacturingExperience?.experienceRange;
        if (expRange === null || expRange === undefined) return null;
        // Convert to string to match option id format (options use id as string)
        const expRangeStr = String(expRange);
        const option = this.productManufacturingExperienceOptions().find((opt: any) => String(opt.id) === expRangeStr);
        return option?.name ?? null;
      case 'qualifiedPlantLocationSEC':
        return productPlant.manufacturingExperience?.qualifiedPlantLocation_SEC ?? null;
      case 'approvedVendorIDSEC':
        return productPlant.manufacturingExperience?.approvedVendorId_SEC ?? null;
      case 'yearsOfExperienceSEC':
        return productPlant.manufacturingExperience?.yearsExperience_SEC ?? null;
      case 'totalQuantitiesSEC':
        return productPlant.manufacturingExperience?.totalQuantitiesToSEC ?? null;
      case 'namesOfSECApprovedSuppliers':
        return productPlant.manufacturingExperience?.localSupplierNames ?? null;
      case 'qualifiedPlantLocation':
        return productPlant.manufacturingExperience?.qualifiedPlantLocation_LocalSupplier ?? null;
      case 'yearsOfExperience':
        return productPlant.manufacturingExperience?.yearsExperience_LocalSupplier ?? null;
      case 'totalQuantities':
        return productPlant.manufacturingExperience?.totalQuantitiesToLocalSuppliers ?? null;
      
      default:
        return null;
    }
  }

  // Helper method to get after value (current form value) for a field
  getAfterValue(fieldKey: string): any {
    switch (fieldKey) {
      case 'productName':
        return this.productName();
      case 'productSpecifications':
        return this.productSpecifications();
      case 'targetedAnnualPlantCapacity':
        return this.targetedAnnualPlantCapacity();
      case 'timeRequiredToSetupFactory':
        return this.timeRequiredToSetupFactory();
      case 'landPercentage':
        return this.landPercentage();
      case 'buildingPercentage':
        return this.buildingPercentage();
      case 'machineryEquipmentPercentage':
        return this.machineryEquipmentPercentage();
      case 'othersPercentage':
        return this.othersPercentage();
      case 'othersDescription':
        return this.othersDescription();
      case 'targetedCustomer':
        return this.targetedCustomer();
      case 'namesOfTargetedSuppliers':
        return this.namesOfTargetedSuppliers();
      case 'productsUtilizeTargetedProduct':
        return this.productsUtilizeTargetedProduct();
      case 'productManufacturingExperience':
        return this.productManufacturingExperience();
      case 'qualifiedPlantLocationSEC':
        return this.qualifiedPlantLocationSEC();
      case 'approvedVendorIDSEC':
        return this.approvedVendorIDSEC();
      case 'yearsOfExperienceSEC':
        return this.yearsOfExperienceSEC();
      case 'totalQuantitiesSEC':
        return this.totalQuantitiesSEC();
      case 'namesOfSECApprovedSuppliers':
        return this.namesOfSECApprovedSuppliers();
      case 'qualifiedPlantLocation':
        return this.qualifiedPlantLocation();
      case 'yearsOfExperience':
        return this.yearsOfExperience();
      case 'totalQuantities':
        return this.totalQuantities();
      default:
        return null;
    }
  }

  // Helper method to check if field should show diff (has before and after values and they differ)
  shouldShowDiff(fieldKey: string): boolean {
    // Only show diff in resubmit mode
    if (this.planStore.wizardMode() !== 'resubmit') return false;
    // Only show diff if field has a comment
    if (!this.hasFieldComment(fieldKey)) return false;

    const beforeValue = this.getBeforeValue(fieldKey);
    const afterValue = this.getAfterValue(fieldKey);

    // If both values are null/undefined/empty, no diff
    if ((beforeValue === null || beforeValue === undefined || beforeValue === '') &&
        (afterValue === null || afterValue === undefined || afterValue === '')) {
      return false;
    }

    // Compare values - normalize to strings for comparison
    const beforeStr = beforeValue === null || beforeValue === undefined ? '' : String(beforeValue).trim();
    const afterStr = afterValue === null || afterValue === undefined ? '' : String(afterValue).trim();

    // Only show diff if values actually differ
    return beforeStr !== afterStr;
  }

  // Computed properties for comment status
  productNameHasComment = computed(() => this.hasFieldComment('productName'));
  productSpecificationsHasComment = computed(() => this.hasFieldComment('productSpecifications'));
  targetedAnnualPlantCapacityHasComment = computed(() => this.hasFieldComment('targetedAnnualPlantCapacity'));
  timeRequiredToSetupFactoryHasComment = computed(() => this.hasFieldComment('timeRequiredToSetupFactory'));
  landPercentageHasComment = computed(() => this.hasFieldComment('landPercentage'));
  buildingPercentageHasComment = computed(() => this.hasFieldComment('buildingPercentage'));
  machineryEquipmentPercentageHasComment = computed(() => this.hasFieldComment('machineryEquipmentPercentage'));
  othersPercentageHasComment = computed(() => this.hasFieldComment('othersPercentage'));
  othersDescriptionHasComment = computed(() => this.hasFieldComment('othersDescription'));
  targetedCustomerHasComment = computed(() => this.hasFieldComment('targetedCustomer'));
  namesOfTargetedSuppliersHasComment = computed(() => this.hasFieldComment('namesOfTargetedSuppliers'));
  productsUtilizeTargetedProductHasComment = computed(() => this.hasFieldComment('productsUtilizeTargetedProduct'));
  productManufacturingExperienceHasComment = computed(() => this.hasFieldComment('productManufacturingExperience'));
  qualifiedPlantLocationSECHasComment = computed(() => this.hasFieldComment('qualifiedPlantLocationSEC'));
  approvedVendorIDSECHasComment = computed(() => this.hasFieldComment('approvedVendorIDSEC'));
  yearsOfExperienceSECHasComment = computed(() => this.hasFieldComment('yearsOfExperienceSEC'));
  totalQuantitiesSECHasComment = computed(() => this.hasFieldComment('totalQuantitiesSEC'));
  namesOfSECApprovedSuppliersHasComment = computed(() => this.hasFieldComment('namesOfSECApprovedSuppliers'));
  qualifiedPlantLocationHasComment = computed(() => this.hasFieldComment('qualifiedPlantLocation'));
  yearsOfExperienceHasComment = computed(() => this.hasFieldComment('yearsOfExperience'));
  totalQuantitiesHasComment = computed(() => this.hasFieldComment('totalQuantities'));
}
