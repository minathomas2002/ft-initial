import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EMaterialsFormControls, ETargetedCustomer } from 'src/app/shared/enums';
import { IStepValidationErrors } from 'src/app/shared/services/plan/validation/product-plan-validation.service';
import { SummarySectionHeader } from '../../shared/summary-section-header/summary-section-header';
import { SummaryField } from '../../shared/summary-field/summary-field';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';

@Component({
  selector: 'app-summary-section-product-plant',
  imports: [SummarySectionHeader, SummaryField],
  templateUrl: './summary-section-product-plant.html',
  styleUrl: './summary-section-product-plant.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionProductPlant {
  formGroup = input.required<FormGroup>();
  validationErrors = input<IStepValidationErrors | undefined>();
  hasErrors = input<boolean>(false);
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
      return value ? this.productManufacturingExperienceOptions().find((option: any) => option.id === value)?.name : null;
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
}
