import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';

export class ServiceLocalizationStepDirectLocalizationFormBuilder {
  constructor(
    private readonly fb: FormBuilder
  ) { }

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
        [EMaterialsFormControls.value]: ['', [Validators.required, Validators.maxLength(150)]], // Auto-populated, dimmed
      }),
      [EMaterialsFormControls.expectedLocalizationDate]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: ['', [Validators.required, Validators.maxLength(50)]], // Required, quarters and years only, future date
      }),
      [EMaterialsFormControls.localizationApproach]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required]], // Required dropdown
      }),
      [EMaterialsFormControls.localizationApproachOtherDetails]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: ['', [Validators.maxLength(250)]], // Conditional - if "Other"
      }),
      [EMaterialsFormControls.location]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required]], // Required dropdown
      }),
      [EMaterialsFormControls.locationOtherDetails]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: ['', [Validators.maxLength(255)]], // Conditional - if "Other"
      }),
      [EMaterialsFormControls.capexRequired]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required]], // Required, numeric only
      }),
      [EMaterialsFormControls.supervisionOversightEntity]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: ['', [Validators.maxLength(255)]], // Optional
      }),
      [EMaterialsFormControls.willBeAnyProprietaryToolsSystems]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required]], // Required dropdown Yes/No
      }),
      [EMaterialsFormControls.proprietaryToolsSystemsDetails]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: ['', [Validators.maxLength(255)]], // Conditional - if "Yes"
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
    itemGroup[EMaterialsFormControls.mentionSupportRequiredFromSEC] = this.fb.group({
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
   * Build Attachments FormGroup
   */
  buildAttachmentsFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.attachments]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null], // File upload - optional
      }),
    });
  }

  /**
   * Build Step 4 main form group
   */
  buildDirectLocalizationFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.entityLevelFormGroup]: this.buildEntityLevelFormGroup(),
      [EMaterialsFormControls.serviceLevelFormGroup]: this.buildServiceLevelFormGroup(),
      [EMaterialsFormControls.attachmentsFormGroup]: this.buildAttachmentsFormGroup(),
    });
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
   * Toggle validation for Localization Approach Other Details field based on localizationApproach value
   * Required if "Other" is selected
   */
  toggleLocalizationApproachOtherDetailsValidation(formGroup: FormGroup, localizationApproach: string | null, index: number): void {
    const array = this.getServiceLevelFormArray(formGroup);
    if (!array || index >= array.length) return;

    const itemFormGroup = array.at(index) as FormGroup;
    const otherDetailsControl = itemFormGroup.get(`${EMaterialsFormControls.localizationApproachOtherDetails}.${EMaterialsFormControls.value}`);

    if (!otherDetailsControl) return;

    if (localizationApproach === 'Other') {
      otherDetailsControl.setValidators([Validators.required, Validators.maxLength(250)]);
    } else {
      otherDetailsControl.clearValidators();
      otherDetailsControl.reset();
    }

    otherDetailsControl.updateValueAndValidity();
  }

  /**
   * Toggle validation for Location Other Details field based on location value
   * Required if "Other" is selected
   */
  toggleLocationOtherDetailsValidation(formGroup: FormGroup, location: string | null, index: number): void {
    const array = this.getServiceLevelFormArray(formGroup);
    if (!array || index >= array.length) return;

    const itemFormGroup = array.at(index) as FormGroup;
    const otherDetailsControl = itemFormGroup.get(`${EMaterialsFormControls.locationOtherDetails}.${EMaterialsFormControls.value}`);

    if (!otherDetailsControl) return;

    if (location === 'Other') {
      otherDetailsControl.setValidators([Validators.required, Validators.maxLength(255)]);
    } else {
      otherDetailsControl.clearValidators();
      otherDetailsControl.reset();
    }

    otherDetailsControl.updateValueAndValidity();
  }

  /**
   * Toggle validation for Proprietary Tools/Systems Details field based on willBeAnyProprietaryToolsSystems value
   * Required if "Yes" is selected
   */
  toggleProprietaryToolsSystemsDetailsValidation(formGroup: FormGroup, willBeAnyProprietaryToolsSystems: string | boolean | null, index: number): void {
    const array = this.getServiceLevelFormArray(formGroup);
    if (!array || index >= array.length) return;

    const itemFormGroup = array.at(index) as FormGroup;
    const detailsControl = itemFormGroup.get(`${EMaterialsFormControls.proprietaryToolsSystemsDetails}.${EMaterialsFormControls.value}`);

    if (!detailsControl) return;

    const isYes = willBeAnyProprietaryToolsSystems === 'Yes' || willBeAnyProprietaryToolsSystems === true || willBeAnyProprietaryToolsSystems === 'true';
    if (isYes) {
      detailsControl.setValidators([Validators.required, Validators.maxLength(255)]);
    } else {
      detailsControl.clearValidators();
      detailsControl.reset();
    }

    detailsControl.updateValueAndValidity();
  }

  /**
   * Sync services from cover page to service level
   * Creates a service level row for each service entered in the cover page
   * and pre-fills the service name
   * Only syncs if the services have changed or are not yet initialized
   */
  syncServicesFromCoverPage(directLocalizationFormGroup: FormGroup, servicesArray: FormArray): void {
    const serviceLevelArray = this.getServiceLevelFormArray(directLocalizationFormGroup);
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

