import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { EServiceProvidedTo } from 'src/app/shared/enums';
import { EYesNo } from 'src/app/shared/enums';
import { phoneNumberPatternValidator } from 'src/app/shared/validators/phone-number.validator';

export class ServiceLocalizationStepOverviewFormBuilder {
  constructor(
    private readonly fb: FormBuilder
  ) { }

  buildBasicInformationFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.opportunity]: [null, [Validators.required]],
      [EMaterialsFormControls.submissionDate]: this.fb.control({ value: new Date(), disabled: true }),
    });
  }

  buildCompanyInformationFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.companyName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control({ value: '', disabled: true }, [Validators.required, Validators.maxLength(100)]),
      }),
      [EMaterialsFormControls.ceoName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
      }),
      [EMaterialsFormControls.ceoEmailID]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.email]),
      }),
    });
  }

  buildLocationInformationFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.globalHQLocation]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(255)]),
      }),
      [EMaterialsFormControls.registeredVendorIDwithSEC]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(''), // Optional, disabled, auto-filled
      }),
      [EMaterialsFormControls.benaRegisteredVendorID]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required]), // Required, disabled, auto-filled
      }),
      [EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA]: this.fb.control(null, [Validators.required]),
    });
  }

  buildLocalAgentInformationFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.localAgentDetails]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(''), // Text area, conditional
      }),
      [EMaterialsFormControls.localAgentName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(''),
      }),
      [EMaterialsFormControls.contactPersonName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(''),
      }),
      [EMaterialsFormControls.emailID]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(''),
      }),
      [EMaterialsFormControls.contactNumber]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(''),
      }),
      [EMaterialsFormControls.companyLocation]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(''), // Required, not conditional
      }),
    });
  }

  /**
   * Create a FormGroup for a single service detail item
   */
  createServiceDetailItem(): FormGroup {
    return this.fb.group({
      rowId: [null], // Hidden control to store the row ID (for edit mode)
      [EMaterialsFormControls.serviceId]: this.fb.control(''), // Service GUID from cover page
      [EMaterialsFormControls.serviceName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control({value: '', disabled: true}, [Validators.required, Validators.maxLength(150)]),
      }),
      [EMaterialsFormControls.serviceType]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null, [Validators.required]),
      }),
      [EMaterialsFormControls.serviceCategory]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null, [Validators.required]),
      }),
      [EMaterialsFormControls.serviceDescription]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(255)]),
      }),
      [EMaterialsFormControls.serviceProvidedTo]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control([], [Validators.required]),
      }),
      [EMaterialsFormControls.serviceProvidedToCompanyNames]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.maxLength(255)]),
      }),
      [EMaterialsFormControls.totalBusinessDoneLast5Years]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(150)]),
      }),
      [EMaterialsFormControls.serviceTargetedForLocalization]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null, [Validators.required]),
      }),
      [EMaterialsFormControls.expectedLocalizationDate]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.maxLength(50)]),
      }),
      [EMaterialsFormControls.serviceLocalizationMethodology]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(null, [Validators.required]),
      }),
    });
  }

  /**
   * Build Service Details FormArray
   */
  buildServiceDetailsFormGroup(): FormArray {
    return this.fb.array(
      [this.createServiceDetailItem()],
      [Validators.required]
    );
  }

  /**
   * Build Step 2 main form group
   */
  buildOverviewFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.basicInformationFormGroup]: this.buildBasicInformationFormGroup(),
      [EMaterialsFormControls.overviewCompanyInformationFormGroup]: this.buildCompanyInformationFormGroup(),
      [EMaterialsFormControls.locationInformationFormGroup]: this.buildLocationInformationFormGroup(),
      [EMaterialsFormControls.localAgentInformationFormGroup]: this.buildLocalAgentInformationFormGroup(),
      [EMaterialsFormControls.serviceDetailsFormGroup]: this.buildServiceDetailsFormGroup(),
    });
  }

  /**
   * Get Service Details FormArray from overview form group
   */
  getServiceDetailsFormArray(formGroup: FormGroup): FormArray | null {
    return formGroup.get(EMaterialsFormControls.serviceDetailsFormGroup) as FormArray | null;
  }

  /**
   * Add a new service detail item to the FormArray
   */
  addServiceDetailItem(formGroup: FormGroup): void {
    const serviceDetailsArray = this.getServiceDetailsFormArray(formGroup);
    if (!serviceDetailsArray) return;

    serviceDetailsArray.push(this.createServiceDetailItem());
  }

  /**
   * Remove a service detail item from the FormArray
   */
  removeServiceDetailItem(formGroup: FormGroup, index: number): void {
    const serviceDetailsArray = this.getServiceDetailsFormArray(formGroup);
    if (!serviceDetailsArray) return;

    const currentLength = serviceDetailsArray.length;
    if (currentLength > 1) {
      serviceDetailsArray.removeAt(index);
    } else {
      // Keep at least one item with empty values
      serviceDetailsArray.clear();
      serviceDetailsArray.push(this.createServiceDetailItem());
    }
  }

  /**
   * Toggle validation for Local Agent Information fields based on doYouCurrentlyHaveLocalAgentInKSA value
   */
  toggleLocalAgentInformValidation(formGroup: FormGroup, value: boolean): void {
    const localAgentFormGroup = formGroup.get(EMaterialsFormControls.localAgentInformationFormGroup) as FormGroup;

    if (!localAgentFormGroup) {
      return;
    }

    if (value) {
      // Text area for local agent details (conditional)
      const localAgentDetailsValueControl = (localAgentFormGroup.get(EMaterialsFormControls.localAgentDetails) as FormGroup)?.get(EMaterialsFormControls.value);
      if (localAgentDetailsValueControl) {
        localAgentDetailsValueControl.addValidators([Validators.required]);
        localAgentDetailsValueControl.updateValueAndValidity();
      }

      // Individual fields (conditional)
      (localAgentFormGroup.controls[EMaterialsFormControls.localAgentName] as FormGroup).controls[EMaterialsFormControls.value].addValidators([Validators.required, Validators.maxLength(100)]);
      (localAgentFormGroup.controls[EMaterialsFormControls.contactPersonName] as FormGroup).controls[EMaterialsFormControls.value].addValidators([Validators.required, Validators.maxLength(100)]);
      (localAgentFormGroup.controls[EMaterialsFormControls.emailID] as FormGroup).controls[EMaterialsFormControls.value].addValidators([Validators.required, Validators.email]);
      (localAgentFormGroup.controls[EMaterialsFormControls.contactNumber] as FormGroup).controls[EMaterialsFormControls.value].addValidators([Validators.required, phoneNumberPatternValidator(), Validators.maxLength(15)]);
      (localAgentFormGroup.controls[EMaterialsFormControls.companyLocation] as FormGroup).controls[EMaterialsFormControls.value].addValidators([Validators.required, Validators.maxLength(255)]);
    } else {
      // Reset and clear validators for conditional fields
      const localAgentDetailsValueControl = (localAgentFormGroup.get(EMaterialsFormControls.localAgentDetails) as FormGroup)?.get(EMaterialsFormControls.value);
      if (localAgentDetailsValueControl) {
        localAgentDetailsValueControl.reset();
        localAgentDetailsValueControl.clearValidators();
        localAgentDetailsValueControl.updateValueAndValidity();
      }

      (localAgentFormGroup.controls[EMaterialsFormControls.localAgentName] as FormGroup).controls[EMaterialsFormControls.value].reset();
      (localAgentFormGroup.controls[EMaterialsFormControls.contactPersonName] as FormGroup).controls[EMaterialsFormControls.value].reset();
      (localAgentFormGroup.controls[EMaterialsFormControls.emailID] as FormGroup).controls[EMaterialsFormControls.value].reset();
      (localAgentFormGroup.controls[EMaterialsFormControls.contactNumber] as FormGroup).controls[EMaterialsFormControls.value].reset();
      (localAgentFormGroup.controls[EMaterialsFormControls.companyLocation] as FormGroup).controls[EMaterialsFormControls.value].reset();
      (localAgentFormGroup.controls[EMaterialsFormControls.localAgentName] as FormGroup).controls[EMaterialsFormControls.value].clearValidators();
      (localAgentFormGroup.controls[EMaterialsFormControls.contactPersonName] as FormGroup).controls[EMaterialsFormControls.value].clearValidators();
      (localAgentFormGroup.controls[EMaterialsFormControls.emailID] as FormGroup).controls[EMaterialsFormControls.value].clearValidators();
      (localAgentFormGroup.controls[EMaterialsFormControls.contactNumber] as FormGroup).controls[EMaterialsFormControls.value].clearValidators();
      (localAgentFormGroup.controls[EMaterialsFormControls.companyLocation] as FormGroup).controls[EMaterialsFormControls.value].clearValidators();
    }

    // Update validity for conditional fields
    (localAgentFormGroup.controls[EMaterialsFormControls.localAgentName] as FormGroup).controls[EMaterialsFormControls.value].updateValueAndValidity();
    (localAgentFormGroup.controls[EMaterialsFormControls.contactPersonName] as FormGroup).controls[EMaterialsFormControls.value].updateValueAndValidity();
    (localAgentFormGroup.controls[EMaterialsFormControls.emailID] as FormGroup).controls[EMaterialsFormControls.value].updateValueAndValidity();
    (localAgentFormGroup.controls[EMaterialsFormControls.contactNumber] as FormGroup).controls[EMaterialsFormControls.value].updateValueAndValidity();
    (localAgentFormGroup.controls[EMaterialsFormControls.companyLocation] as FormGroup).controls[EMaterialsFormControls.value].updateValueAndValidity();
  }

  /**
   * Toggle validation for Service Provided To Company Names field based on serviceProvidedTo value
   * Required if "Others" is selected
   */
  toggleServiceProvidedToCompanyNamesValidation(formGroup: FormGroup, serviceProvidedTo: Array<string | number> | null, index: number): void {
    const serviceDetailsArray = this.getServiceDetailsFormArray(formGroup);
    if (!serviceDetailsArray || index >= serviceDetailsArray.length) return;

    const itemFormGroup = serviceDetailsArray.at(index) as FormGroup;
    const companyNamesControl = itemFormGroup.get(`${EMaterialsFormControls.serviceProvidedToCompanyNames}.${EMaterialsFormControls.value}`);

    if (!companyNamesControl) return;

    const selected = (serviceProvidedTo ?? []).map((v) => String(v));
    const hasOthers = selected.includes(EServiceProvidedTo.Others.toString()) || selected.includes('Others');

    if (hasOthers) {
      companyNamesControl.setValidators([Validators.required, Validators.maxLength(255)]);
    } else {
      companyNamesControl.clearValidators();
      companyNamesControl.reset();
    }

    companyNamesControl.updateValueAndValidity();
  }

  /**
   * Toggle validation for Expected Localization Date field based on serviceTargetedForLocalization value
   * Required if "Yes" is selected
   */
  toggleExpectedLocalizationDateValidation(formGroup: FormGroup, serviceTargetedForLocalization: string | boolean | number | null, index: number): void {
    const serviceDetailsArray = this.getServiceDetailsFormArray(formGroup);
    if (!serviceDetailsArray || index >= serviceDetailsArray.length) return;

    const itemFormGroup = serviceDetailsArray.at(index) as FormGroup;
    const expectedDateControl = itemFormGroup.get(`${EMaterialsFormControls.expectedLocalizationDate}.${EMaterialsFormControls.value}`);

    if (!expectedDateControl) return;

    const normalized = serviceTargetedForLocalization == null ? '' : String(serviceTargetedForLocalization);
    const isYes = normalized === 'Yes' || normalized === 'true' || normalized === EYesNo.Yes.toString();
    if (isYes) {
      expectedDateControl.setValidators([Validators.required, Validators.maxLength(50)]);
    } else {
      expectedDateControl.clearValidators();
      expectedDateControl.reset();
    }

    expectedDateControl.updateValueAndValidity();
  }

  /**
   * Sync services from cover page to overview details
   * Creates a service detail row for each service entered in the cover page
   * and pre-fills the service name
   * Only syncs if the services have changed or are not yet initialized
   */
  syncServicesFromCoverPage(overviewFormGroup: FormGroup, servicesArray: FormArray): void {
    const serviceDetailsArray = this.getServiceDetailsFormArray(overviewFormGroup);
    if (!serviceDetailsArray) return;

    // Get service IDs and names from cover page
    const coverPageServices = servicesArray.controls.map(control => {
      const serviceFormGroup = control as FormGroup;
      const serviceIdControl = serviceFormGroup.get(EMaterialsFormControls.serviceId);
      const serviceNameControl = serviceFormGroup.get(`${EMaterialsFormControls.serviceName}.${EMaterialsFormControls.value}`);
      return {
        id: serviceIdControl?.value || '',
        name: serviceNameControl?.value || ''
      };
    });

    // Get service IDs from overview details
    const overviewServiceIds = serviceDetailsArray.controls.map(control => {
      const serviceFormGroup = control as FormGroup;
      const serviceIdControl = serviceFormGroup.get(EMaterialsFormControls.serviceId);
      return serviceIdControl?.value || '';
    });

    // Check if services match (same count and same IDs in order).
    // If IDs are missing/empty (legacy data), force sync so service names are populated.
    const idsAreValid =
      coverPageServices.every((s) => !!s.id) &&
      overviewServiceIds.every((id) => !!id);

    const servicesMatch =
      idsAreValid &&
      coverPageServices.length === overviewServiceIds.length &&
      coverPageServices.every((service, index) => service.id === overviewServiceIds[index]);

    if (servicesMatch) {
      // Services already match: keep existing row data, but refresh service names
      serviceDetailsArray.controls.forEach((control, index) => {
        const serviceFormGroup = control as FormGroup;
        const serviceNameValueControl = serviceFormGroup.get(
          `${EMaterialsFormControls.serviceName}.${EMaterialsFormControls.value}`
        );
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
    const existingDataByIndex = serviceDetailsArray.controls.map(control => {
      const serviceFormGroup = control as FormGroup;
      return serviceFormGroup.getRawValue();
    });
    serviceDetailsArray.controls.forEach(control => {
      const serviceFormGroup = control as FormGroup;
      const serviceId = serviceFormGroup.get(EMaterialsFormControls.serviceId)?.value;
      if (serviceId) {
        existingDataMap.set(serviceId, serviceFormGroup.getRawValue());
      }
    });

    // Clear existing service details
    serviceDetailsArray.clear();

    // Create a service detail item for each service
    coverPageServices.forEach((service, index) => {

      // Create new service detail item
      const newServiceDetail = this.createServiceDetailItem();

      // Set the service ID
      const serviceIdControl = newServiceDetail.get(EMaterialsFormControls.serviceId);
      if (serviceIdControl) {
        serviceIdControl.setValue(service.id);
      }

      // Pre-fill the service name (value only, not the comment)
      const serviceNameValueControl = newServiceDetail.get(`${EMaterialsFormControls.serviceName}.${EMaterialsFormControls.value}`);
      if (serviceNameValueControl) {
        serviceNameValueControl.setValue(service.name);
      }

      // Restore existing data if this service ID was already present; otherwise fallback by index
      const existingData = service.id ? existingDataMap.get(service.id) : existingDataByIndex[index];
      if (existingData) {
        // Restore all fields except serviceName and serviceId
        Object.keys(existingData).forEach(key => {
          if (key !== EMaterialsFormControls.rowId && key !== EMaterialsFormControls.serviceName && key !== EMaterialsFormControls.serviceId) {
            const targetControl = newServiceDetail.get(key);
            if (targetControl) {
              targetControl.patchValue(existingData[key]);
            }
          }
        });
      }

      // Add the new service detail to the array
      serviceDetailsArray.push(newServiceDetail);
    });

    // Ensure at least one empty item if no services provided
    if (serviceDetailsArray.length === 0) {
      serviceDetailsArray.push(this.createServiceDetailItem());
    }
  }

  // /**
  //  * Check if a service detail row is empty (no user input)
  //  */
  // private isServiceDetailEmpty(serviceDetailFormGroup: FormGroup): boolean {
  //   const fields = [
  //     EMaterialsFormControls.serviceName,
  //     EMaterialsFormControls.serviceType,
  //     EMaterialsFormControls.serviceCategory,
  //     EMaterialsFormControls.serviceDescription,
  //     EMaterialsFormControls.serviceProvidedTo,
  //     EMaterialsFormControls.serviceProvidedToCompanyNames,
  //     EMaterialsFormControls.totalBusinessDoneLast5Years,
  //     EMaterialsFormControls.serviceTargetedForLocalization,
  //     EMaterialsFormControls.expectedLocalizationDate,
  //     EMaterialsFormControls.serviceLocalizationMethodology,
  //   ];

  //   for (const field of fields) {
  //     const control = serviceDetailFormGroup.get(`${field}.${EMaterialsFormControls.value}`);
  //     if (control && control.value) {
  //       // Has a value, not empty
  //       return false;
  //     }
  //   }

  //   return true;
  // }
}

