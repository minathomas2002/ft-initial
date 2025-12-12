import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';

export class Step2ProductPlantOverviewFormBuilder {
  constructor(
    private readonly fb: FormBuilder
  ) {}

  buildOverviewFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.productName]: ['', [Validators.required, Validators.maxLength(100)]],
      [EMaterialsFormControls.productSpecifications]: ['', [Validators.required, Validators.maxLength(500)]],
      [EMaterialsFormControls.targetedAnnualPlantCapacity]: ['', [Validators.required]],
      [EMaterialsFormControls.timeRequiredToSetupFactory]: ['', [Validators.required]],
    });
  }

  buildExpectedCAPEXInvestmentFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.landPercentage]: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      [EMaterialsFormControls.buildingPercentage]: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      [EMaterialsFormControls.machineryEquipmentPercentage]: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      [EMaterialsFormControls.othersPercentage]: [null, [Validators.min(0), Validators.max(100)]],
      [EMaterialsFormControls.othersDescription]: [''],
    });
  }

  buildTargetCustomersFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.targetedCustomer]: [[], [Validators.required]],
      [EMaterialsFormControls.namesOfTargetedSuppliers]: [''],
      [EMaterialsFormControls.productsUtilizeTargetedProduct]: [''],
    });
  }

  buildProductManufacturingExperienceFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.productManufacturingExperience]: [null, [Validators.required]],
      [EMaterialsFormControls.provideToSEC]: [null, [Validators.required]],
      [EMaterialsFormControls.qualifiedPlantLocationSEC]: [''],
      [EMaterialsFormControls.approvedVendorIDSEC]: [''],
      [EMaterialsFormControls.yearsOfExperienceSEC]: [null],
      [EMaterialsFormControls.totalQuantitiesSEC]: [null],
      [EMaterialsFormControls.provideToLocalSuppliers]: [null, [Validators.required]],
      [EMaterialsFormControls.namesOfSECApprovedSuppliers]: [''],
      [EMaterialsFormControls.qualifiedPlantLocation]: [''],
      [EMaterialsFormControls.yearsOfExperience]: [null],
      [EMaterialsFormControls.totalQuantities]: [null],
    });
  }

  buildStep2FormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.overviewFormGroup]: this.buildOverviewFormGroup(),
      [EMaterialsFormControls.expectedCAPEXInvestmentFormGroup]: this.buildExpectedCAPEXInvestmentFormGroup(),
      [EMaterialsFormControls.targetCustomersFormGroup]: this.buildTargetCustomersFormGroup(),
      [EMaterialsFormControls.productManufacturingExperienceFormGroup]: this.buildProductManufacturingExperienceFormGroup(),
    });
  }

  /**
   * Toggle validation for SEC-related fields based on provideToSEC value
   */
  toggleSECFieldsValidation(formGroup: FormGroup, provideToSEC: boolean): void {
    const experienceFormGroup = formGroup.get(EMaterialsFormControls.productManufacturingExperienceFormGroup) as FormGroup;
    
    if (!experienceFormGroup) {
      return;
    }

    if (provideToSEC) {
      experienceFormGroup.controls[EMaterialsFormControls.qualifiedPlantLocationSEC].setValidators([Validators.required]);
      experienceFormGroup.controls[EMaterialsFormControls.approvedVendorIDSEC].setValidators([Validators.required]);
      experienceFormGroup.controls[EMaterialsFormControls.yearsOfExperienceSEC].setValidators([Validators.required, Validators.pattern(/^\d+$/)]);
      experienceFormGroup.controls[EMaterialsFormControls.totalQuantitiesSEC].setValidators([Validators.required, Validators.pattern(/^\d+$/)]);
    } else {
      experienceFormGroup.controls[EMaterialsFormControls.qualifiedPlantLocationSEC].clearValidators();
      experienceFormGroup.controls[EMaterialsFormControls.approvedVendorIDSEC].clearValidators();
      experienceFormGroup.controls[EMaterialsFormControls.yearsOfExperienceSEC].clearValidators();
      experienceFormGroup.controls[EMaterialsFormControls.totalQuantitiesSEC].clearValidators();
    }

    experienceFormGroup.controls[EMaterialsFormControls.qualifiedPlantLocationSEC].updateValueAndValidity();
    experienceFormGroup.controls[EMaterialsFormControls.approvedVendorIDSEC].updateValueAndValidity();
    experienceFormGroup.controls[EMaterialsFormControls.yearsOfExperienceSEC].updateValueAndValidity();
    experienceFormGroup.controls[EMaterialsFormControls.totalQuantitiesSEC].updateValueAndValidity();
  }

  /**
   * Toggle validation for Local Suppliers-related fields based on provideToLocalSuppliers value
   */
  toggleLocalSuppliersFieldsValidation(formGroup: FormGroup, provideToLocalSuppliers: boolean): void {
    const experienceFormGroup = formGroup.get(EMaterialsFormControls.productManufacturingExperienceFormGroup) as FormGroup;
    
    if (!experienceFormGroup) {
      return;
    }

    if (provideToLocalSuppliers) {
      experienceFormGroup.controls[EMaterialsFormControls.namesOfSECApprovedSuppliers].setValidators([Validators.required]);
      experienceFormGroup.controls[EMaterialsFormControls.qualifiedPlantLocation].setValidators([Validators.required]);
      experienceFormGroup.controls[EMaterialsFormControls.yearsOfExperience].setValidators([Validators.required]);
      experienceFormGroup.controls[EMaterialsFormControls.totalQuantities].setValidators([Validators.required]);
    } else {
      experienceFormGroup.controls[EMaterialsFormControls.namesOfSECApprovedSuppliers].clearValidators();
      experienceFormGroup.controls[EMaterialsFormControls.qualifiedPlantLocation].clearValidators();
      experienceFormGroup.controls[EMaterialsFormControls.yearsOfExperience].clearValidators();
      experienceFormGroup.controls[EMaterialsFormControls.totalQuantities].clearValidators();
    }

    experienceFormGroup.controls[EMaterialsFormControls.namesOfSECApprovedSuppliers].updateValueAndValidity();
    experienceFormGroup.controls[EMaterialsFormControls.qualifiedPlantLocation].updateValueAndValidity();
    experienceFormGroup.controls[EMaterialsFormControls.yearsOfExperience].updateValueAndValidity();
    experienceFormGroup.controls[EMaterialsFormControls.totalQuantities].updateValueAndValidity();
  }

  /**
   * Toggle validation for Others percentage description based on othersPercentage value
   */
  toggleOthersDescriptionValidation(formGroup: FormGroup, othersPercentage: number | null): void {
    const capexFormGroup = formGroup.get(EMaterialsFormControls.expectedCAPEXInvestmentFormGroup) as FormGroup;
    
    if (!capexFormGroup) {
      return;
    }

    if (othersPercentage !== null && othersPercentage > 0) {
      capexFormGroup.controls[EMaterialsFormControls.othersDescription].setValidators([Validators.required]);
    } else {
      capexFormGroup.controls[EMaterialsFormControls.othersDescription].clearValidators();
    }

    capexFormGroup.controls[EMaterialsFormControls.othersDescription].updateValueAndValidity();
  }

  /**
   * Toggle validation for targeted suppliers fields based on targetedCustomer selection
   */
  toggleTargetedSuppliersFieldsValidation(formGroup: FormGroup, targetedCustomers: string[]): void {
    const targetCustomersFormGroup = formGroup.get(EMaterialsFormControls.targetCustomersFormGroup) as FormGroup;
    
    if (!targetCustomersFormGroup) {
      return;
    }

    const hasLocalSuppliers = targetedCustomers.includes('SEC\'s approved local suppliers');

    if (hasLocalSuppliers) {
      targetCustomersFormGroup.controls[EMaterialsFormControls.namesOfTargetedSuppliers].setValidators([Validators.required]);
      targetCustomersFormGroup.controls[EMaterialsFormControls.productsUtilizeTargetedProduct].setValidators([Validators.required]);
    } else {
      targetCustomersFormGroup.controls[EMaterialsFormControls.namesOfTargetedSuppliers].clearValidators();
      targetCustomersFormGroup.controls[EMaterialsFormControls.productsUtilizeTargetedProduct].clearValidators();
    }

    targetCustomersFormGroup.controls[EMaterialsFormControls.namesOfTargetedSuppliers].updateValueAndValidity();
    targetCustomersFormGroup.controls[EMaterialsFormControls.productsUtilizeTargetedProduct].updateValueAndValidity();
  }
}

