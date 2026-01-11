import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMaterialsFormControls, ETargetedCustomer } from 'src/app/shared/enums';
import { BasicPlanBuilder } from './basicPlanBuilder';

export class PlanLocalizationStep2ProductPlantOverviewFormBuilder extends BasicPlanBuilder {
  constructor(fb: FormBuilder) {
    super(fb);
  }

  buildOverviewFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.productName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
      }),
      [EMaterialsFormControls.productSpecifications]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(500)]),
      }),
      [EMaterialsFormControls.targetedAnnualPlantCapacity]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(50)]),
      }),
      [EMaterialsFormControls.timeRequiredToSetupFactory]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(50)]),
      }),
    });
  }

  buildExpectedCAPEXInvestmentFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.landPercentage]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null, [Validators.required, Validators.min(0), Validators.max(100)]),
      }),
      [EMaterialsFormControls.buildingPercentage]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null, [Validators.required, Validators.min(0), Validators.max(100)]),
      }),
      [EMaterialsFormControls.machineryEquipmentPercentage]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null, [Validators.required, Validators.min(0), Validators.max(100)]),
      }),
      [EMaterialsFormControls.othersPercentage]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null, [Validators.min(0), Validators.max(100)]),
      }),
      [EMaterialsFormControls.othersDescription]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(''),
      }),
    });
  }

  buildTargetCustomersFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.targetedCustomer]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control([], [Validators.required]),
      }),
      [EMaterialsFormControls.namesOfTargetedSuppliers]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(''),
      }),
      [EMaterialsFormControls.productsUtilizeTargetedProduct]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(''),
      }),
    });
  }

  buildProductManufacturingExperienceFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.productManufacturingExperience]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null, [Validators.required]),
      }),
      [EMaterialsFormControls.provideToSEC]: this.fb.control(null, [Validators.required]),
      [EMaterialsFormControls.qualifiedPlantLocationSEC]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(''),
      }),
      [EMaterialsFormControls.approvedVendorIDSEC]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(''),
      }),
      [EMaterialsFormControls.yearsOfExperienceSEC]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null),
      }),
      [EMaterialsFormControls.totalQuantitiesSEC]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null),
      }),
      [EMaterialsFormControls.provideToLocalSuppliers]: this.fb.control(null, [Validators.required]),
      [EMaterialsFormControls.namesOfSECApprovedSuppliers]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(''),
      }),
      [EMaterialsFormControls.qualifiedPlantLocation]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(''),
      }),
      [EMaterialsFormControls.yearsOfExperience]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null),
      }),
      [EMaterialsFormControls.totalQuantities]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null),
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
      experienceFormGroup.get(`${EMaterialsFormControls.qualifiedPlantLocationSEC}.${EMaterialsFormControls.value}`)?.setValidators([Validators.required, Validators.maxLength(255)]);
      experienceFormGroup.get(`${EMaterialsFormControls.approvedVendorIDSEC}.${EMaterialsFormControls.value}`)?.setValidators([Validators.required, Validators.maxLength(255)]);
      experienceFormGroup.get(`${EMaterialsFormControls.yearsOfExperienceSEC}.${EMaterialsFormControls.value}`)?.setValidators([Validators.required, Validators.min(1)]);
      experienceFormGroup.get(`${EMaterialsFormControls.totalQuantitiesSEC}.${EMaterialsFormControls.value}`)?.setValidators([Validators.required, Validators.min(1), Validators.max(1000000000)]);
    } else {
      experienceFormGroup.get(`${EMaterialsFormControls.qualifiedPlantLocationSEC}.${EMaterialsFormControls.value}`)?.clearValidators();
      experienceFormGroup.get(`${EMaterialsFormControls.approvedVendorIDSEC}.${EMaterialsFormControls.value}`)?.clearValidators();
      experienceFormGroup.get(`${EMaterialsFormControls.yearsOfExperienceSEC}.${EMaterialsFormControls.value}`)?.clearValidators();
      experienceFormGroup.get(`${EMaterialsFormControls.totalQuantitiesSEC}.${EMaterialsFormControls.value}`)?.clearValidators();

      experienceFormGroup.get(`${EMaterialsFormControls.qualifiedPlantLocationSEC}.${EMaterialsFormControls.value}`)?.reset();
      experienceFormGroup.get(`${EMaterialsFormControls.approvedVendorIDSEC}.${EMaterialsFormControls.value}`)?.reset();
      experienceFormGroup.get(`${EMaterialsFormControls.yearsOfExperienceSEC}.${EMaterialsFormControls.value}`)?.reset();
      experienceFormGroup.get(`${EMaterialsFormControls.totalQuantitiesSEC}.${EMaterialsFormControls.value}`)?.reset();
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
      experienceFormGroup.get(`${EMaterialsFormControls.namesOfSECApprovedSuppliers}.${EMaterialsFormControls.value}`)?.setValidators([Validators.required, Validators.maxLength(255)]);
      experienceFormGroup.get(`${EMaterialsFormControls.qualifiedPlantLocation}.${EMaterialsFormControls.value}`)?.setValidators([Validators.required, Validators.maxLength(255)]);
      experienceFormGroup.get(`${EMaterialsFormControls.yearsOfExperience}.${EMaterialsFormControls.value}`)?.setValidators([Validators.required]);
      experienceFormGroup.get(`${EMaterialsFormControls.totalQuantities}.${EMaterialsFormControls.value}`)?.setValidators([Validators.required, Validators.min(1), Validators.max(1000000000)]);
    } else {
      experienceFormGroup.get(`${EMaterialsFormControls.namesOfSECApprovedSuppliers}.${EMaterialsFormControls.value}`)?.clearValidators();
      experienceFormGroup.get(`${EMaterialsFormControls.qualifiedPlantLocation}.${EMaterialsFormControls.value}`)?.clearValidators();
      experienceFormGroup.get(`${EMaterialsFormControls.yearsOfExperience}.${EMaterialsFormControls.value}`)?.clearValidators();
      experienceFormGroup.get(`${EMaterialsFormControls.totalQuantities}.${EMaterialsFormControls.value}`)?.clearValidators();

      experienceFormGroup.get(`${EMaterialsFormControls.namesOfSECApprovedSuppliers}.${EMaterialsFormControls.value}`)?.reset();
      experienceFormGroup.get(`${EMaterialsFormControls.qualifiedPlantLocation}.${EMaterialsFormControls.value}`)?.reset();
      experienceFormGroup.get(`${EMaterialsFormControls.yearsOfExperience}.${EMaterialsFormControls.value}`)?.reset();
      experienceFormGroup.get(`${EMaterialsFormControls.totalQuantities}.${EMaterialsFormControls.value}`)?.reset();
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

    const othersDescriptionControl = capexFormGroup.get(`${EMaterialsFormControls.othersDescription}.${EMaterialsFormControls.value}`);

    if (othersPercentage !== null && othersPercentage > 0) {
      othersDescriptionControl?.setValidators([Validators.required, Validators.maxLength(255)]);
    } else {
      othersDescriptionControl?.clearValidators();
      othersDescriptionControl?.reset();
    }

    othersDescriptionControl?.updateValueAndValidity();
  }

  /**
   * Toggle validation for targeted suppliers fields based on targetedCustomer selection
   */
  toggleTargetedSuppliersFieldsValidation(formGroup: FormGroup, targetedCustomers: string[]): void {
    const targetCustomersFormGroup = formGroup.get(EMaterialsFormControls.targetCustomersFormGroup) as FormGroup;

    if (!targetCustomersFormGroup) {
      return;
    }

    const hasLocalSuppliers = targetedCustomers.includes(ETargetedCustomer.SEC_APPROVED_LOCAL_SUPPLIERS.toString());

    if (hasLocalSuppliers) {
      targetCustomersFormGroup.get(`${EMaterialsFormControls.namesOfTargetedSuppliers}.${EMaterialsFormControls.value}`)?.setValidators([Validators.required, Validators.maxLength(255)]);
      targetCustomersFormGroup.get(`${EMaterialsFormControls.productsUtilizeTargetedProduct}.${EMaterialsFormControls.value}`)?.setValidators([Validators.required, Validators.maxLength(255)]);
    } else {
      targetCustomersFormGroup.get(`${EMaterialsFormControls.namesOfTargetedSuppliers}.${EMaterialsFormControls.value}`)?.clearValidators();
      targetCustomersFormGroup.get(`${EMaterialsFormControls.productsUtilizeTargetedProduct}.${EMaterialsFormControls.value}`)?.clearValidators();
      targetCustomersFormGroup.get(`${EMaterialsFormControls.namesOfTargetedSuppliers}.${EMaterialsFormControls.value}`)?.reset();
      targetCustomersFormGroup.get(`${EMaterialsFormControls.productsUtilizeTargetedProduct}.${EMaterialsFormControls.value}`)?.reset();
    }

    targetCustomersFormGroup.get(`${EMaterialsFormControls.namesOfTargetedSuppliers}.${EMaterialsFormControls.value}`)?.updateValueAndValidity();
    targetCustomersFormGroup.get(`${EMaterialsFormControls.productsUtilizeTargetedProduct}.${EMaterialsFormControls.value}`)?.updateValueAndValidity();
  }
}

