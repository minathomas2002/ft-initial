import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { fileSizeValidator } from 'src/app/shared/validators/file-size.validator';

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
      rowId: [null], // Hidden control to store the localization strategy row ID (for edit mode)
      serviceHeadcountRowId: [null], // Hidden control to store the service headcount row ID (for edit mode)
      [EMaterialsFormControls.serviceId]: this.fb.control(''), // Service GUID from cover page
      [EMaterialsFormControls.serviceName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(150)]], // Auto-populated, dimmed
      }),
      // expectedLocalizationDate is for the Localization Strategy table
      [EMaterialsFormControls.expectedLocalizationDate]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: ['', [Validators.required, Validators.maxLength(50)]], // Required, quarters and years only, future date
      }),
      // serviceLevelLocalizationDate is for the Service Level table (sent as LocalizationDate to backend)
      [EMaterialsFormControls.serviceLevelLocalizationDate]: this.fb.group({
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
      [EMaterialsFormControls.supervisionOversightByGovernmentEntity]: this.fb.group({
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
      EMaterialsFormControls.sixthYear,
    ];

    // Expected Annual Headcount (required, integer only)
    yearControls.forEach((yearControl) => {
      itemGroup[`${yearControl}_headcount`] = this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required, Validators.min(0)]],
      });
    });

    // Y-o-Y Expected Saudization % (required, 0-100%)
    yearControls.forEach((yearControl) => {
      itemGroup[`${yearControl}_saudization`] = this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
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
        [EMaterialsFormControls.value]: [null, [fileSizeValidator(30 * 1024 * 1024)]], // File upload - optional, max 30 MB total
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
  syncServicesFromCoverPage(
    directLocalizationFormGroup: FormGroup,
    servicesArray: FormArray,
    includeServiceIds?: string[] | null,
    cache?: Map<string, any>
  ): void {
    const serviceLevelArray = this.getServiceLevelFormArray(directLocalizationFormGroup);
    if (!serviceLevelArray) return;

    // Get service IDs and names from cover page
    const coverPageServicesAll = servicesArray.controls.map(control => {
      const serviceFormGroup = control as FormGroup;
      const serviceIdControl = serviceFormGroup.get(EMaterialsFormControls.serviceId);
      const serviceNameControl = serviceFormGroup.get(`${EMaterialsFormControls.serviceName}.${EMaterialsFormControls.value}`);
      return {
        id: serviceIdControl?.value || '',
        name: serviceNameControl?.value || ''
      };
    });

    const coverPageServices = Array.isArray(includeServiceIds)
      ? coverPageServicesAll.filter((s) => includeServiceIds.includes(s.id))
      : coverPageServicesAll;

    // Get service IDs from service level
    const serviceLevelServiceIds = serviceLevelArray.controls.map(control => {
      const serviceFormGroup = control as FormGroup;
      const serviceIdControl = serviceFormGroup.get(EMaterialsFormControls.serviceId);
      return serviceIdControl?.value || '';
    });

    // Check if services match (same count and same IDs in order).
    // If IDs are missing/empty (legacy data), force sync so service names are populated.
    const idsAreValid =
      coverPageServices.every((s) => !!s.id) &&
      serviceLevelServiceIds.every((id) => !!id);

    const servicesMatch =
      idsAreValid &&
      coverPageServices.length === serviceLevelServiceIds.length &&
      coverPageServices.every((service, index) => service.id === serviceLevelServiceIds[index]);

    if (servicesMatch) {
      // Services already match: keep existing row data, but refresh service names
      serviceLevelArray.controls.forEach((control, index) => {
        const serviceFormGroup = control as FormGroup;
        const serviceNameValueControl = serviceFormGroup.get(
          `${EMaterialsFormControls.serviceName}.${EMaterialsFormControls.value}`
        );
        if (serviceNameValueControl) {
          // Enforce non-editable service name (auto-populated from cover page)
          serviceNameValueControl.disable({ emitEvent: false });
        }
        if (serviceNameValueControl && coverPageServices[index]) {
          const nextName = coverPageServices[index].name || '';
          if (serviceNameValueControl.value !== nextName) {
            serviceNameValueControl.setValue(nextName);
          }
        }
      });
      return;
    }

    // Services don't match, need to sync
    // Save any existing data that can be matched by service ID (and also keep index fallback)
    const existingDataMap = new Map<string, any>();
    const existingDataByIndex = serviceLevelArray.controls.map(control => {
      const serviceFormGroup = control as FormGroup;
      return serviceFormGroup.getRawValue();
    });
    serviceLevelArray.controls.forEach(control => {
      const serviceFormGroup = control as FormGroup;
      const serviceId = serviceFormGroup.get(EMaterialsFormControls.serviceId)?.value;
      if (serviceId) {
        existingDataMap.set(serviceId, serviceFormGroup.getRawValue());
      }
    });

    // Preserve removed rows across filtering toggles.
    if (cache) {
      existingDataMap.forEach((val, key) => cache.set(key, val));
    }

    // Clear existing service level items
    serviceLevelArray.clear();

    // Create a service level item for each service
    coverPageServices.forEach((service, index) => {

      // Create new service level item
      const newServiceLevel = this.createServiceLevelItem();

      // Set the service ID
      const serviceIdControl = newServiceLevel.get(EMaterialsFormControls.serviceId);
      if (serviceIdControl) {
        serviceIdControl.setValue(service.id);
      }

      // Pre-fill the service name (value only, not the comment)
      const serviceNameValueControl = newServiceLevel.get(`${EMaterialsFormControls.serviceName}.${EMaterialsFormControls.value}`);
      if (serviceNameValueControl) {
        serviceNameValueControl.setValue(service.name);
        // Enforce non-editable service name (auto-populated from cover page)
        serviceNameValueControl.disable({ emitEvent: false });
      }

      // Restore existing data if this service ID was already present; otherwise fallback by index
      const existingData = service.id
        ? (existingDataMap.get(service.id) ?? cache?.get(service.id))
        : existingDataByIndex[index];
      if (existingData) {
        // Restore all fields except serviceName and serviceId
        Object.keys(existingData).forEach(key => {
          if (key !== EMaterialsFormControls.rowId && key !== EMaterialsFormControls.serviceName && key !== EMaterialsFormControls.serviceId) {
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

