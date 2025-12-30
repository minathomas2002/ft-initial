import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';
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
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
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
      [EMaterialsFormControls.localAgentDetails]: this.fb.control(''), // Text area, conditional
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
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(255)]), // Required, not conditional
      }),
    });
  }

  /**
   * Create a FormGroup for a single service detail item
   */
  createServiceDetailItem(): FormGroup {
    return this.fb.group({
      rowId: [null], // Hidden control to store the row ID (for edit mode)
      [EMaterialsFormControls.serviceName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(150)]),
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
        [EMaterialsFormControls.value]: this.fb.control(null, [Validators.required]),
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
      const localAgentDetailsControl = localAgentFormGroup.get(EMaterialsFormControls.localAgentDetails);
      if (localAgentDetailsControl) {
        localAgentDetailsControl.addValidators([Validators.required]);
      }

      // Individual fields (conditional)
      (localAgentFormGroup.controls[EMaterialsFormControls.localAgentName] as FormGroup).controls[EMaterialsFormControls.value].addValidators([Validators.required, Validators.maxLength(100)]);
      (localAgentFormGroup.controls[EMaterialsFormControls.contactPersonName] as FormGroup).controls[EMaterialsFormControls.value].addValidators([Validators.required, Validators.maxLength(100)]);
      (localAgentFormGroup.controls[EMaterialsFormControls.emailID] as FormGroup).controls[EMaterialsFormControls.value].addValidators([Validators.required, Validators.email]);
      (localAgentFormGroup.controls[EMaterialsFormControls.contactNumber] as FormGroup).controls[EMaterialsFormControls.value].addValidators([Validators.required, phoneNumberPatternValidator(), Validators.maxLength(15)]);
    } else {
      // Reset and clear validators for conditional fields
      const localAgentDetailsControl = localAgentFormGroup.get(EMaterialsFormControls.localAgentDetails);
      if (localAgentDetailsControl) {
        localAgentDetailsControl.reset();
        localAgentDetailsControl.clearValidators();
        localAgentDetailsControl.updateValueAndValidity();
      }

      (localAgentFormGroup.controls[EMaterialsFormControls.localAgentName] as FormGroup).controls[EMaterialsFormControls.value].reset();
      (localAgentFormGroup.controls[EMaterialsFormControls.contactPersonName] as FormGroup).controls[EMaterialsFormControls.value].reset();
      (localAgentFormGroup.controls[EMaterialsFormControls.emailID] as FormGroup).controls[EMaterialsFormControls.value].reset();
      (localAgentFormGroup.controls[EMaterialsFormControls.contactNumber] as FormGroup).controls[EMaterialsFormControls.value].reset();
      (localAgentFormGroup.controls[EMaterialsFormControls.localAgentName] as FormGroup).controls[EMaterialsFormControls.value].clearValidators();
      (localAgentFormGroup.controls[EMaterialsFormControls.contactPersonName] as FormGroup).controls[EMaterialsFormControls.value].clearValidators();
      (localAgentFormGroup.controls[EMaterialsFormControls.emailID] as FormGroup).controls[EMaterialsFormControls.value].clearValidators();
      (localAgentFormGroup.controls[EMaterialsFormControls.contactNumber] as FormGroup).controls[EMaterialsFormControls.value].clearValidators();
    }

    // Update validity for conditional fields
    (localAgentFormGroup.controls[EMaterialsFormControls.localAgentName] as FormGroup).controls[EMaterialsFormControls.value].updateValueAndValidity();
    (localAgentFormGroup.controls[EMaterialsFormControls.contactPersonName] as FormGroup).controls[EMaterialsFormControls.value].updateValueAndValidity();
    (localAgentFormGroup.controls[EMaterialsFormControls.emailID] as FormGroup).controls[EMaterialsFormControls.value].updateValueAndValidity();
    (localAgentFormGroup.controls[EMaterialsFormControls.contactNumber] as FormGroup).controls[EMaterialsFormControls.value].updateValueAndValidity();
  }

  /**
   * Toggle validation for Service Provided To Company Names field based on serviceProvidedTo value
   * Required if "Others" is selected
   */
  toggleServiceProvidedToCompanyNamesValidation(formGroup: FormGroup, serviceProvidedTo: string | null, index: number): void {
    const serviceDetailsArray = this.getServiceDetailsFormArray(formGroup);
    if (!serviceDetailsArray || index >= serviceDetailsArray.length) return;

    const itemFormGroup = serviceDetailsArray.at(index) as FormGroup;
    const companyNamesControl = itemFormGroup.get(`${EMaterialsFormControls.serviceProvidedToCompanyNames}.${EMaterialsFormControls.value}`);

    if (!companyNamesControl) return;

    if (serviceProvidedTo === 'Others') {
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
  toggleExpectedLocalizationDateValidation(formGroup: FormGroup, serviceTargetedForLocalization: string | boolean | null, index: number): void {
    const serviceDetailsArray = this.getServiceDetailsFormArray(formGroup);
    if (!serviceDetailsArray || index >= serviceDetailsArray.length) return;

    const itemFormGroup = serviceDetailsArray.at(index) as FormGroup;
    const expectedDateControl = itemFormGroup.get(`${EMaterialsFormControls.expectedLocalizationDate}.${EMaterialsFormControls.value}`);

    if (!expectedDateControl) return;

    const isYes = serviceTargetedForLocalization === 'Yes' || serviceTargetedForLocalization === true || serviceTargetedForLocalization === 'true';
    if (isYes) {
      expectedDateControl.setValidators([Validators.required, Validators.maxLength(50)]);
    } else {
      expectedDateControl.clearValidators();
      expectedDateControl.reset();
    }

    expectedDateControl.updateValueAndValidity();
  }
}

