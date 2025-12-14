import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';

export class Step2ProductPlantOverviewFormBuilder {
  constructor(
    private readonly fb: FormBuilder
  ) { }

  buildOverviewFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.productName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: ['', [Validators.required, Validators.maxLength(100)]],
      }),
      [EMaterialsFormControls.productSpecifications]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: ['', [Validators.required, Validators.maxLength(500)]],
      }),
      [EMaterialsFormControls.targetedAnnualPlantCapacity]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: ['', [Validators.required]],
      }),
      [EMaterialsFormControls.timeRequiredToSetupFactory]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: ['', [Validators.required]],
      }),
    });
  }

  buildExpectedCAPEXInvestmentFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.landPercentage]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      }),
      [EMaterialsFormControls.buildingPercentage]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      }),
      [EMaterialsFormControls.machineryEquipmentPercentage]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      }),
      [EMaterialsFormControls.othersPercentage]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.min(0), Validators.max(100)]],
      }),
      [EMaterialsFormControls.othersDescription]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [''],
      }),
    });
  }

  buildTargetCustomersFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.targetedCustomer]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [[], [Validators.required]],
      }),
      [EMaterialsFormControls.namesOfTargetedSuppliers]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [''],
      }),
      [EMaterialsFormControls.productsUtilizeTargetedProduct]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [''],
      }),
    });
  }

  buildProductManufacturingExperienceFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.productManufacturingExperience]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required]],
      }),
      [EMaterialsFormControls.provideToSEC]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required]],
      }),
      [EMaterialsFormControls.qualifiedPlantLocationSEC]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [''],
      }),
      [EMaterialsFormControls.approvedVendorIDSEC]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [''],
      }),
      [EMaterialsFormControls.yearsOfExperienceSEC]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null],
      }),
      [EMaterialsFormControls.totalQuantitiesSEC]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null],
      }),
      [EMaterialsFormControls.provideToLocalSuppliers]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required]],
      }),
      [EMaterialsFormControls.namesOfSECApprovedSuppliers]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [''],
      }),
      [EMaterialsFormControls.qualifiedPlantLocation]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [''],
      }),
      [EMaterialsFormControls.yearsOfExperience]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null],
      }),
      [EMaterialsFormControls.totalQuantities]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null],
      }),
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
      experienceFormGroup.get(`${EMaterialsFormControls.qualifiedPlantLocationSEC}.${EMaterialsFormControls.value}`)?.setValidators([Validators.required]);
      experienceFormGroup.get(`${EMaterialsFormControls.approvedVendorIDSEC}.${EMaterialsFormControls.value}`)?.setValidators([Validators.required]);
      experienceFormGroup.get(`${EMaterialsFormControls.yearsOfExperienceSEC}.${EMaterialsFormControls.value}`)?.setValidators([Validators.required, Validators.pattern(/^\d+$/)]);
      experienceFormGroup.get(`${EMaterialsFormControls.totalQuantitiesSEC}.${EMaterialsFormControls.value}`)?.setValidators([Validators.required, Validators.pattern(/^\d+$/)]);
    } else {
      experienceFormGroup.get(`${EMaterialsFormControls.qualifiedPlantLocationSEC}.${EMaterialsFormControls.value}`)?.clearValidators();
      experienceFormGroup.get(`${EMaterialsFormControls.approvedVendorIDSEC}.${EMaterialsFormControls.value}`)?.clearValidators();
      experienceFormGroup.get(`${EMaterialsFormControls.yearsOfExperienceSEC}.${EMaterialsFormControls.value}`)?.clearValidators();
      experienceFormGroup.get(`${EMaterialsFormControls.totalQuantitiesSEC}.${EMaterialsFormControls.value}`)?.clearValidators();
    }

    experienceFormGroup.get(`${EMaterialsFormControls.qualifiedPlantLocationSEC}.${EMaterialsFormControls.value}`)?.updateValueAndValidity();
    experienceFormGroup.get(`${EMaterialsFormControls.approvedVendorIDSEC}.${EMaterialsFormControls.value}`)?.updateValueAndValidity();
    experienceFormGroup.get(`${EMaterialsFormControls.yearsOfExperienceSEC}.${EMaterialsFormControls.value}`)?.updateValueAndValidity();
    experienceFormGroup.get(`${EMaterialsFormControls.totalQuantitiesSEC}.${EMaterialsFormControls.value}`)?.updateValueAndValidity();
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
      experienceFormGroup.get(`${EMaterialsFormControls.namesOfSECApprovedSuppliers}.${EMaterialsFormControls.value}`)?.setValidators([Validators.required]);
      experienceFormGroup.get(`${EMaterialsFormControls.qualifiedPlantLocation}.${EMaterialsFormControls.value}`)?.setValidators([Validators.required]);
      experienceFormGroup.get(`${EMaterialsFormControls.yearsOfExperience}.${EMaterialsFormControls.value}`)?.setValidators([Validators.required]);
      experienceFormGroup.get(`${EMaterialsFormControls.totalQuantities}.${EMaterialsFormControls.value}`)?.setValidators([Validators.required]);
    } else {
      experienceFormGroup.get(`${EMaterialsFormControls.namesOfSECApprovedSuppliers}.${EMaterialsFormControls.value}`)?.clearValidators();
      experienceFormGroup.get(`${EMaterialsFormControls.qualifiedPlantLocation}.${EMaterialsFormControls.value}`)?.clearValidators();
      experienceFormGroup.get(`${EMaterialsFormControls.yearsOfExperience}.${EMaterialsFormControls.value}`)?.clearValidators();
      experienceFormGroup.get(`${EMaterialsFormControls.totalQuantities}.${EMaterialsFormControls.value}`)?.clearValidators();
    }

    experienceFormGroup.get(`${EMaterialsFormControls.namesOfSECApprovedSuppliers}.${EMaterialsFormControls.value}`)?.updateValueAndValidity();
    experienceFormGroup.get(`${EMaterialsFormControls.qualifiedPlantLocation}.${EMaterialsFormControls.value}`)?.updateValueAndValidity();
    experienceFormGroup.get(`${EMaterialsFormControls.yearsOfExperience}.${EMaterialsFormControls.value}`)?.updateValueAndValidity();
    experienceFormGroup.get(`${EMaterialsFormControls.totalQuantities}.${EMaterialsFormControls.value}`)?.updateValueAndValidity();
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
      capexFormGroup.get(`${EMaterialsFormControls.othersDescription}.${EMaterialsFormControls.value}`)?.setValidators([Validators.required]);
    } else {
      capexFormGroup.get(`${EMaterialsFormControls.othersDescription}.${EMaterialsFormControls.value}`)?.clearValidators();
    }

    capexFormGroup.get(`${EMaterialsFormControls.othersDescription}.${EMaterialsFormControls.value}`)?.updateValueAndValidity();
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
      targetCustomersFormGroup.get(`${EMaterialsFormControls.namesOfTargetedSuppliers}.${EMaterialsFormControls.value}`)?.setValidators([Validators.required]);
      targetCustomersFormGroup.get(`${EMaterialsFormControls.productsUtilizeTargetedProduct}.${EMaterialsFormControls.value}`)?.setValidators([Validators.required]);
    } else {
      targetCustomersFormGroup.get(`${EMaterialsFormControls.namesOfTargetedSuppliers}.${EMaterialsFormControls.value}`)?.clearValidators();
      targetCustomersFormGroup.get(`${EMaterialsFormControls.productsUtilizeTargetedProduct}.${EMaterialsFormControls.value}`)?.clearValidators();
    }

    targetCustomersFormGroup.get(`${EMaterialsFormControls.namesOfTargetedSuppliers}.${EMaterialsFormControls.value}`)?.updateValueAndValidity();
    targetCustomersFormGroup.get(`${EMaterialsFormControls.productsUtilizeTargetedProduct}.${EMaterialsFormControls.value}`)?.updateValueAndValidity();
  }
}

