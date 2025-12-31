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
        [EMaterialsFormControls.value]: this.fb.control({value:'', disabled:true}), // Optional, auto-filled, dimmed
      }),
      [EMaterialsFormControls.benaRegisteredVendorID]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control({value:'', disabled:true}, [Validators.required]), // Required, auto-filled, dimmed
      }),
      [EMaterialsFormControls.companyType]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control([], [Validators.required]), // Multi-select array
      }),
      [EMaterialsFormControls.qualificationStatus]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null), // Conditional - only if Manufacturer selected
      }),
      [EMaterialsFormControls.products]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.maxLength(255)]), // Conditional - Manufacturer + Qualified/Under Pre-Qualification
      }),
      [EMaterialsFormControls.companyOverview]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.maxLength(255)]), // Conditional - Manufacturer + Not Qualified
      }),
      [EMaterialsFormControls.keyProjectsExecutedByContractorForSEC]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.maxLength(255)]), // Conditional - Contractor
      }),
      [EMaterialsFormControls.companyOverviewKeyProjectDetails]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.maxLength(255)]), // Conditional - Contractor
      }),
      [EMaterialsFormControls.companyOverviewOther]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.maxLength(255)]), // Conditional - Other
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
      [EMaterialsFormControls.agreementSigningDate]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null, [Validators.required]), // Required, quarters and years only
      }),
      [EMaterialsFormControls.agreementOtherDetails]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.maxLength(100)]), // Conditional - required if "Other"
      }),
      [EMaterialsFormControls.supervisionOversightEntity]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.maxLength(100)]), // Optional
      }),
      [EMaterialsFormControls.whyChoseThisCompany]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(255)]),
      }),
      [EMaterialsFormControls.summaryOfKeyAgreementClauses]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(255)]),
      }),
      [EMaterialsFormControls.provideAgreementCopy]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null, [Validators.required]), // Dropdown Yes/No, required
      }),
      [EMaterialsFormControls.agreementCopy]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null), // File upload - conditional if provideAgreementCopy is Yes
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
      EMaterialsFormControls.sixthYear,
    ];

    yearControls.forEach(yearControl => {
      itemGroup[`${yearControl}_headcount`] = this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required, Validators.min(0)]], // Required, Integer only
      });
      itemGroup[`${yearControl}_saudization`] = this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required, Validators.min(0), Validators.max(100)]], // Required, Percentage 0-100
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
        [EMaterialsFormControls.value]: ['', [Validators.required, Validators.maxLength(150)]], // Read-only, auto-populated from Step 1
      }),
      [EMaterialsFormControls.expectedLocalizationDate]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: ['', [Validators.required, Validators.maxLength(50)]], // Required, Quarter & Year
      }),
    };

    // Add year columns (5 years) for Expected Annual Headcount and Saudization %
    const yearControls = [
      EMaterialsFormControls.firstYear,
      EMaterialsFormControls.secondYear,
      EMaterialsFormControls.thirdYear,
      EMaterialsFormControls.fourthYear,
      EMaterialsFormControls.fifthYear,
    ];

    yearControls.forEach(yearControl => {
      // Expected Annual Headcount (required, integer only)
      itemGroup[`${yearControl}_headcount`] = this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required, Validators.min(0)]], // Required, Integer only
      });
      // Y-o-Y Expected Saudization % (required, 0-100%)
      itemGroup[`${yearControl}_saudization`] = this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required, Validators.min(0), Validators.max(100)]], // Required, Percentage 0-100
      });
    });

    // Key Measures to Upskill Saudis (required)
    itemGroup[EMaterialsFormControls.keyMeasuresToUpskillSaudis] = this.fb.group({
      [EMaterialsFormControls.hasComment]: [false],
      [EMaterialsFormControls.value]: ['', [Validators.required]], // Required, Description of training/hiring plans
    });

    // Mention Support Required from SEC (optional)
    itemGroup[EMaterialsFormControls.supportRequiredFromSECGDC] = this.fb.group({
      [EMaterialsFormControls.hasComment]: [false],
      [EMaterialsFormControls.value]: ['', [Validators.maxLength(500)]], // Optional, Max 500
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
   * Toggle validation and visibility for fields based on Company Type
   * Company Type is multi-select, so we need to check if specific types are selected
   */
  toggleCompanyTypeFieldsValidation(formGroup: FormGroup, companyTypes: string[], index: number): void {
    const array = this.getSaudiCompanyDetailsFormArray(formGroup);
    if (!array || index >= array.length) return;

    const itemFormGroup = array.at(index) as FormGroup;
    const hasManufacturer = companyTypes.includes('Manufacturer');
    const hasContractor = companyTypes.includes('Contractor');
    const hasOther = companyTypes.includes('Other');

    // Qualification Status - only available if Manufacturer is selected
    const qualificationStatusControl = itemFormGroup.get(`${EMaterialsFormControls.qualificationStatus}.${EMaterialsFormControls.value}`);
    if (qualificationStatusControl) {
      if (hasManufacturer) {
        qualificationStatusControl.setValidators([Validators.required]);
      } else {
        qualificationStatusControl.clearValidators();
        qualificationStatusControl.reset();
      }
      qualificationStatusControl.updateValueAndValidity();
    }

    // Products - only if Manufacturer + (Qualified or Under Pre-Qualification)
    // This will be handled separately by toggleProductsValidation

    // Company Overview (Manufacturer + Not Qualified) - handled separately

    // Key Projects Executed by Contractor - only if Contractor is selected
    const keyProjectsControl = itemFormGroup.get(`${EMaterialsFormControls.keyProjectsExecutedByContractorForSEC}.${EMaterialsFormControls.value}`);
    if (keyProjectsControl) {
      if (hasContractor) {
        keyProjectsControl.setValidators([Validators.maxLength(255)]);
      } else {
        keyProjectsControl.clearValidators();
        keyProjectsControl.reset();
      }
      keyProjectsControl.updateValueAndValidity();
    }

    // Company Overview Key Project Details - only if Contractor is selected
    const companyOverviewKeyProjectControl = itemFormGroup.get(`${EMaterialsFormControls.companyOverviewKeyProjectDetails}.${EMaterialsFormControls.value}`);
    if (companyOverviewKeyProjectControl) {
      if (hasContractor) {
        companyOverviewKeyProjectControl.setValidators([Validators.maxLength(255)]);
      } else {
        companyOverviewKeyProjectControl.clearValidators();
        companyOverviewKeyProjectControl.reset();
      }
      companyOverviewKeyProjectControl.updateValueAndValidity();
    }

    // Company Overview Other - only if Other is selected
    const companyOverviewOtherControl = itemFormGroup.get(`${EMaterialsFormControls.companyOverviewOther}.${EMaterialsFormControls.value}`);
    if (companyOverviewOtherControl) {
      if (hasOther) {
        companyOverviewOtherControl.setValidators([Validators.required, Validators.maxLength(255)]);
      } else {
        companyOverviewOtherControl.clearValidators();
        companyOverviewOtherControl.reset();
      }
      companyOverviewOtherControl.updateValueAndValidity();
    }
  }

  /**
   * Toggle validation for Products field based on qualification status
   * Only available if Company Type includes 'Manufacturer' AND qualification status is 'Qualified' or 'Under Pre-Qualification'
   */
  toggleProductsValidation(formGroup: FormGroup, companyTypes: string[], qualificationStatus: string | null, index: number): void {
    const array = this.getSaudiCompanyDetailsFormArray(formGroup);
    if (!array || index >= array.length) return;

    const itemFormGroup = array.at(index) as FormGroup;
    const productsControl = itemFormGroup.get(`${EMaterialsFormControls.products}.${EMaterialsFormControls.value}`);

    if (!productsControl) return;

    const hasManufacturer = companyTypes.includes('Manufacturer');
    const isQualifiedOrPreQualified = qualificationStatus === 'Qualified' || qualificationStatus === 'Under Pre-Qualification';

    if (hasManufacturer && isQualifiedOrPreQualified) {
      productsControl.setValidators([Validators.required, Validators.maxLength(255)]);
    } else {
      productsControl.clearValidators();
      productsControl.reset();
    }

    productsControl.updateValueAndValidity();
  }

  /**
   * Toggle validation for Company Overview field (Manufacturer + Not Qualified)
   * Only available if Company Type includes 'Manufacturer' AND qualification status is 'Not Qualified'
   */
  toggleCompanyOverviewValidation(formGroup: FormGroup, companyTypes: string[], qualificationStatus: string | null, index: number): void {
    const array = this.getSaudiCompanyDetailsFormArray(formGroup);
    if (!array || index >= array.length) return;

    const itemFormGroup = array.at(index) as FormGroup;
    const companyOverviewControl = itemFormGroup.get(`${EMaterialsFormControls.companyOverview}.${EMaterialsFormControls.value}`);

    if (!companyOverviewControl) return;

    const hasManufacturer = companyTypes.includes('Manufacturer');
    const isNotQualified = qualificationStatus === 'Not Qualified';

    if (hasManufacturer && isNotQualified) {
      companyOverviewControl.setValidators([Validators.required, Validators.maxLength(255)]);
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
      otherDetailsControl.setValidators([Validators.required, Validators.maxLength(100)]);
    } else {
      otherDetailsControl.clearValidators();
      otherDetailsControl.reset();
    }

    otherDetailsControl.updateValueAndValidity();
  }

  /**
   * Toggle validation for Agreement Copy file upload based on provideAgreementCopy value
   * Required if provideAgreementCopy is "Yes"
   */
  toggleAgreementCopyValidation(formGroup: FormGroup, provideAgreementCopy: string | boolean | null, index: number): void {
    const array = this.getCollaborationPartnershipFormArray(formGroup);
    if (!array || index >= array.length) return;

    const itemFormGroup = array.at(index) as FormGroup;
    const agreementCopyControl = itemFormGroup.get(`${EMaterialsFormControls.agreementCopy}.${EMaterialsFormControls.value}`);

    if (!agreementCopyControl) return;

    const isYes = provideAgreementCopy === 'Yes' || provideAgreementCopy === true || provideAgreementCopy === 'true';
    if (isYes) {
      agreementCopyControl.setValidators([Validators.required]);
    } else {
      agreementCopyControl.clearValidators();
      agreementCopyControl.reset();
    }

    agreementCopyControl.updateValueAndValidity();
  }

  /**
   * Sync services from cover page to service level
   * Creates a service level row for each service entered in the cover page
   * and pre-fills the service name
   * Only syncs if the services have changed or are not yet initialized
   */
  syncServicesFromCoverPage(existingSaudiFormGroup: FormGroup, servicesArray: FormArray): void {
    const serviceLevelArray = this.getServiceLevelFormArray(existingSaudiFormGroup);
    if (!serviceLevelArray) return;

    // Get service names from cover page
    const coverPageServiceNames = servicesArray.controls.map(control => {
      const serviceFormGroup = control as FormGroup;
      const serviceNameControl = serviceFormGroup.get(`${EMaterialsFormControls.serviceName}.${EMaterialsFormControls.value}`);
      return serviceNameControl?.value || '';
    });

    // Get service names from service level
    const serviceLevelServiceNames = serviceLevelArray.controls.map(control => {
      const serviceFormGroup = control as FormGroup;
      const serviceNameControl = serviceFormGroup.get(`${EMaterialsFormControls.serviceName}.${EMaterialsFormControls.value}`);
      return serviceNameControl?.value || '';
    });

    // Check if services match (same count and same names in order)
    const servicesMatch = coverPageServiceNames.length === serviceLevelServiceNames.length &&
      coverPageServiceNames.every((name, index) => name === serviceLevelServiceNames[index]);

    if (servicesMatch) {
      // Services already match, don't overwrite existing data
      return;
    }

    // Services don't match, need to sync
    // Save any existing data that can be matched by service name
    const existingDataMap = new Map<string, any>();
    serviceLevelArray.controls.forEach(control => {
      const serviceFormGroup = control as FormGroup;
      const serviceName = serviceFormGroup.get(`${EMaterialsFormControls.serviceName}.${EMaterialsFormControls.value}`)?.value;
      if (serviceName) {
        existingDataMap.set(serviceName, serviceFormGroup.getRawValue());
      }
    });

    // Clear existing service level items
    serviceLevelArray.clear();

    // Create a service level item for each service
    servicesArray.controls.forEach((serviceControl) => {
      const serviceFormGroup = serviceControl as FormGroup;
      const serviceNameControl = serviceFormGroup.get(`${EMaterialsFormControls.serviceName}.${EMaterialsFormControls.value}`);
      const serviceName = serviceNameControl?.value || '';

      // Create new service level item
      const newServiceLevel = this.createServiceLevelItem();

      // Pre-fill the service name (value only, not the comment)
      const serviceNameValueControl = newServiceLevel.get(`${EMaterialsFormControls.serviceName}.${EMaterialsFormControls.value}`);
      if (serviceNameValueControl) {
        serviceNameValueControl.setValue(serviceName);
      }

      // Restore existing data if this service name was already present
      const existingData = existingDataMap.get(serviceName);
      if (existingData) {
        // Restore all fields except serviceName
        Object.keys(existingData).forEach(key => {
          if (key !== 'rowId' && key !== EMaterialsFormControls.serviceName) {
            const targetControl = newServiceLevel.get(key);
            if (targetControl) {
              targetControl.patchValue(existingData[key]);
            }
          }
        });
      }

      // Add the new service level to the array
      serviceLevelArray.push(newServiceLevel);
    });

    // Ensure at least one empty item if no services provided
    if (serviceLevelArray.length === 0) {
      serviceLevelArray.push(this.createServiceLevelItem());
    }
  }
}

