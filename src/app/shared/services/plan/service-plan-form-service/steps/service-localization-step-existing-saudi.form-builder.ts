import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';

export class ServiceLocalizationStepExistingSaudiFormBuilder {
  constructor(
    private readonly fb: FormBuilder
  ) { }

  /**
   * Create a FormGroup for a single Saudi company detail item
   */
  createSaudiCompanyDetailItem(): FormGroup {
    return this.fb.group({
      rowId: [null], // Hidden control to store the row ID (for edit mode)
      [EMaterialsFormControls.saudiCompanyName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
      }),
      [EMaterialsFormControls.registeredVendorIDwithSEC]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.maxLength(50)]),
      }),
      [EMaterialsFormControls.companyType]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null, [Validators.required]),
      }),
      [EMaterialsFormControls.qualificationStatus]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null, [Validators.required]),
      }),
      [EMaterialsFormControls.products]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.maxLength(255)]),
      }),
      [EMaterialsFormControls.companyOverview]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.maxLength(500)]),
      }),
    });
  }

  /**
   * Build Saudi Company Details FormArray
   */
  buildSaudiCompanyDetailsFormGroup(): FormArray {
    return this.fb.array(
      [this.createSaudiCompanyDetailItem()],
      [Validators.required]
    );
  }

  /**
   * Create a FormGroup for a single collaboration/partnership item
   */
  createCollaborationPartnershipItem(): FormGroup {
    return this.fb.group({
      rowId: [null], // Hidden control to store the row ID (for edit mode)
      [EMaterialsFormControls.agreementType]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null, [Validators.required]),
      }),
      [EMaterialsFormControls.agreementOtherDetails]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.maxLength(500)]),
      }),
      [EMaterialsFormControls.agreementSigningDate]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null),
      }),
      [EMaterialsFormControls.supervisionOversightEntity]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.maxLength(255)]),
      }),
      [EMaterialsFormControls.whyChoseThisCompany]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.maxLength(500)]),
      }),
      [EMaterialsFormControls.summaryOfKeyAgreementClauses]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.maxLength(1000)]),
      }),
      [EMaterialsFormControls.agreementCopy]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null), // File upload - optional
      }),
    });
  }

  /**
   * Build Collaboration/Partnership FormArray
   */
  buildCollaborationPartnershipFormGroup(): FormArray {
    return this.fb.array(
      [this.createCollaborationPartnershipItem()],
      [Validators.required]
    );
  }

  /**
   * Create a FormGroup for a single entity level headcount item
   * Contains years 2025-2030 with Expected Annual Headcount and Saudization % for each year
   */
  createEntityLevelItem(): FormGroup {
    const itemGroup: any = {
      rowId: [null], // Hidden control to store the row ID (for edit mode)
    };

    // Add year columns (2025-2030) with Expected Annual Headcount and Saudization %
    const yearControls = [
      EMaterialsFormControls.firstYear,
      EMaterialsFormControls.secondYear,
      EMaterialsFormControls.thirdYear,
      EMaterialsFormControls.fourthYear,
      EMaterialsFormControls.fifthYear,
    ];

    yearControls.forEach(yearControl => {
      itemGroup[`${yearControl}_headcount`] = this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.min(0)]],
      });
      itemGroup[`${yearControl}_saudization`] = this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.min(0), Validators.max(100)]],
      });
    });

    return this.fb.group(itemGroup);
  }

  /**
   * Build Entity Level FormArray
   */
  buildEntityLevelFormGroup(): FormArray {
    return this.fb.array(
      [this.createEntityLevelItem()],
      [Validators.required]
    );
  }

  /**
   * Create a FormGroup for a single service level item
   */
  createServiceLevelItem(): FormGroup {
    const itemGroup: any = {
      rowId: [null], // Hidden control to store the row ID (for edit mode)
      [EMaterialsFormControls.serviceName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: ['', [Validators.required, Validators.maxLength(100)]],
      }),
      [EMaterialsFormControls.expectedLocalizationDate]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: ['', [Validators.maxLength(50)]],
      }),
    };

    // Add year columns 5 years for Saudization %
    const yearControls = [
      EMaterialsFormControls.firstYear,
      EMaterialsFormControls.secondYear,
      EMaterialsFormControls.thirdYear,
      EMaterialsFormControls.fourthYear,
      EMaterialsFormControls.fifthYear,
    ];

    yearControls.forEach(yearControl => {
      itemGroup[`${yearControl}_saudization`] = this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.min(0), Validators.max(100)]],
      });
    });

    itemGroup[EMaterialsFormControls.keyRoadblocksPains] = this.fb.group({
      [EMaterialsFormControls.hasComment]: [false],
      [EMaterialsFormControls.value]: ['', [Validators.maxLength(1000)]],
    });

    itemGroup[EMaterialsFormControls.supportRequiredFromSECGDC] = this.fb.group({
      [EMaterialsFormControls.hasComment]: [false],
      [EMaterialsFormControls.value]: ['', [Validators.maxLength(500)]],
    });

    return this.fb.group(itemGroup);
  }

  /**
   * Build Service Level FormArray
   */
  buildServiceLevelFormGroup(): FormArray {
    return this.fb.array(
      [this.createServiceLevelItem()],
      [Validators.required]
    );
  }

  /**
   * Build Step 3 main form group
   */
  buildExistingSaudiFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.saudiCompanyDetailsFormGroup]: this.buildSaudiCompanyDetailsFormGroup(),
      [EMaterialsFormControls.collaborationPartnershipFormGroup]: this.buildCollaborationPartnershipFormGroup(),
      [EMaterialsFormControls.entityLevelFormGroup]: this.buildEntityLevelFormGroup(),
      [EMaterialsFormControls.serviceLevelFormGroup]: this.buildServiceLevelFormGroup(),
    });
  }

  /**
   * Get Saudi Company Details FormArray
   */
  getSaudiCompanyDetailsFormArray(formGroup: FormGroup): FormArray | null {
    return formGroup.get(EMaterialsFormControls.saudiCompanyDetailsFormGroup) as FormArray | null;
  }

  /**
   * Get Collaboration/Partnership FormArray
   */
  getCollaborationPartnershipFormArray(formGroup: FormGroup): FormArray | null {
    return formGroup.get(EMaterialsFormControls.collaborationPartnershipFormGroup) as FormArray | null;
  }

  /**
   * Get Entity Level FormArray
   */
  getEntityLevelFormArray(formGroup: FormGroup): FormArray | null {
    return formGroup.get(EMaterialsFormControls.entityLevelFormGroup) as FormArray | null;
  }

  /**
   * Get Service Level FormArray
   */
  getServiceLevelFormArray(formGroup: FormGroup): FormArray | null {
    return formGroup.get(EMaterialsFormControls.serviceLevelFormGroup) as FormArray | null;
  }

  /**
   * Add a new Saudi company detail item
   */
  addSaudiCompanyDetailItem(formGroup: FormGroup): void {
    const array = this.getSaudiCompanyDetailsFormArray(formGroup);
    if (!array) return;
    array.push(this.createSaudiCompanyDetailItem());
  }

  /**
   * Remove a Saudi company detail item
   */
  removeSaudiCompanyDetailItem(formGroup: FormGroup, index: number): void {
    const array = this.getSaudiCompanyDetailsFormArray(formGroup);
    if (!array) return;

    const currentLength = array.length;
    if (currentLength > 1) {
      array.removeAt(index);
    } else {
      array.clear();
      array.push(this.createSaudiCompanyDetailItem());
    }
  }

  /**
   * Add a new collaboration/partnership item
   */
  addCollaborationPartnershipItem(formGroup: FormGroup): void {
    const array = this.getCollaborationPartnershipFormArray(formGroup);
    if (!array) return;
    array.push(this.createCollaborationPartnershipItem());
  }

  /**
   * Remove a collaboration/partnership item
   */
  removeCollaborationPartnershipItem(formGroup: FormGroup, index: number): void {
    const array = this.getCollaborationPartnershipFormArray(formGroup);
    if (!array) return;

    const currentLength = array.length;
    if (currentLength > 1) {
      array.removeAt(index);
    } else {
      array.clear();
      array.push(this.createCollaborationPartnershipItem());
    }
  }

  /**
   * Add a new entity level item
   */
  addEntityLevelItem(formGroup: FormGroup): void {
    const array = this.getEntityLevelFormArray(formGroup);
    if (!array) return;
    array.push(this.createEntityLevelItem());
  }

  /**
   * Remove an entity level item
   */
  removeEntityLevelItem(formGroup: FormGroup, index: number): void {
    const array = this.getEntityLevelFormArray(formGroup);
    if (!array) return;

    const currentLength = array.length;
    if (currentLength > 1) {
      array.removeAt(index);
    } else {
      array.clear();
      array.push(this.createEntityLevelItem());
    }
  }

  /**
   * Add a new service level item
   */
  addServiceLevelItem(formGroup: FormGroup): void {
    const array = this.getServiceLevelFormArray(formGroup);
    if (!array) return;
    array.push(this.createServiceLevelItem());
  }

  /**
   * Remove a service level item
   */
  removeServiceLevelItem(formGroup: FormGroup, index: number): void {
    const array = this.getServiceLevelFormArray(formGroup);
    if (!array) return;

    const currentLength = array.length;
    if (currentLength > 1) {
      array.removeAt(index);
    } else {
      array.clear();
      array.push(this.createServiceLevelItem());
    }
  }

  /**
   * Toggle validation for Products field based on qualification status
   * If qualified or under pre-qualification, Products is required
   */
  toggleProductsValidation(formGroup: FormGroup, qualificationStatus: string | null, index: number): void {
    const array = this.getSaudiCompanyDetailsFormArray(formGroup);
    if (!array || index >= array.length) return;

    const itemFormGroup = array.at(index) as FormGroup;
    const productsControl = itemFormGroup.get(`${EMaterialsFormControls.products}.${EMaterialsFormControls.value}`);

    if (!productsControl) return;

    // Assuming qualification status values: "Qualified" or "Under Pre-Qualification" require products
    if (qualificationStatus === 'Qualified' || qualificationStatus === 'Under Pre-Qualification') {
      productsControl.setValidators([Validators.required, Validators.maxLength(255)]);
    } else {
      productsControl.clearValidators();
      productsControl.reset();
    }

    productsControl.updateValueAndValidity();
  }

  /**
   * Toggle validation for Company Overview field based on qualification status
   * If not qualified, Company Overview is required
   */
  toggleCompanyOverviewValidation(formGroup: FormGroup, qualificationStatus: string | null, index: number): void {
    const array = this.getSaudiCompanyDetailsFormArray(formGroup);
    if (!array || index >= array.length) return;

    const itemFormGroup = array.at(index) as FormGroup;
    const companyOverviewControl = itemFormGroup.get(`${EMaterialsFormControls.companyOverview}.${EMaterialsFormControls.value}`);

    if (!companyOverviewControl) return;

    if (qualificationStatus === 'Not Qualified') {
      companyOverviewControl.setValidators([Validators.required, Validators.maxLength(500)]);
    } else {
      companyOverviewControl.clearValidators();
      companyOverviewControl.reset();
    }

    companyOverviewControl.updateValueAndValidity();
  }

  /**
   * Toggle validation for Agreement Other Details field based on agreement type
   * If agreement type is "Other", details are required
   */
  toggleAgreementOtherDetailsValidation(formGroup: FormGroup, agreementType: string | null, index: number): void {
    const array = this.getCollaborationPartnershipFormArray(formGroup);
    if (!array || index >= array.length) return;

    const itemFormGroup = array.at(index) as FormGroup;
    const otherDetailsControl = itemFormGroup.get(`${EMaterialsFormControls.agreementOtherDetails}.${EMaterialsFormControls.value}`);

    if (!otherDetailsControl) return;

    if (agreementType === 'Other') {
      otherDetailsControl.setValidators([Validators.required, Validators.maxLength(500)]);
    } else {
      otherDetailsControl.clearValidators();
      otherDetailsControl.reset();
    }

    otherDetailsControl.updateValueAndValidity();
  }
}

