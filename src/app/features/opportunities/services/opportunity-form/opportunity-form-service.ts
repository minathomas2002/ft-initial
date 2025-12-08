import { Injectable, computed, inject, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject } from 'rxjs';
import { IOpportunityInformationFrom, ISelectItem, IOpportunityLocalizationFrom, IKeyActivityRecord, IOpportunityDetails, IOpportunityActivity } from 'src/app/shared/interfaces';

export interface IBasicInformation {
  title: string;
  shortDescription: string;
  opportunityType: ISelectItem | null;
}

@Injectable({
  providedIn: 'root',
})
export class OpportunityFormService {
  private OpportunityInformationFormInitialState: IOpportunityInformationFrom = {
    id: null,
    title: '',
    opportunityType: null,
    shortDescription: '',
    opportunityCategory: '',
    spendSAR: '',
    minQuantity: '',
    maxQuantity: '',
    localSuppliers: '',
    globalSuppliers: '',
    dateRange: null,
    image: null,
  }
  private OpportunityLocalizationFormInitialState: IOpportunityLocalizationFrom = {
    designEngineerings: [
      {
        keyActivity: '',
      }
    ],
    sourcings: [
      {
        keyActivity: '',
      }
    ],
    manufacturings: [
      {
        keyActivity: '',
      }
    ],
    assemblyTestings: [
      {
        keyActivity: '',
      }
    ],
    afterSalesServices: [
      {
        keyActivity: '',
      }
    ],
  }

  formUpdated = new Subject<void>();

  private fb = inject(FormBuilder);

  // Store original date range for validation when plans are linked
  private originalDateRange: [Date, Date] | null = null;
  private hasActivePlans: boolean = false;

  constructor() {
    this.initializeForms();
  }

  // Main opportunity form with nested FormGroups
  opportunityForm!: FormGroup;

  // Getters for backward compatibility and easier access
  get opportunityInformationForm(): FormGroup {
    return this.opportunityForm.get('opportunityInformation') as FormGroup;
  }

  get opportunityLocalizationForm(): FormGroup {
    return this.opportunityForm.get('opportunityLocalization') as FormGroup;
  }

  private initializeForms() {
    // Initialize Opportunity Form with nested FormGroups
    this.opportunityForm = this.fb.group({
      opportunityInformation: this.fb.group({
        id: [null],
        title: ['', [Validators.required, Validators.maxLength(150)]],
        opportunityType: [null, Validators.required],
        shortDescription: ['', [Validators.required, Validators.maxLength(255)]],
        opportunityCategory: ['', Validators.required],
        spendSAR: ['', Validators.required],
        minQuantity: ['', [Validators.required, Validators.min(0)]],
        maxQuantity: ['', [Validators.required, Validators.min(0)]],
        localSuppliers: ['', [Validators.required, Validators.min(0)]],
        globalSuppliers: ['', [Validators.required, Validators.min(0)]],
        dateRange: [null, [Validators.required, this.dateRangeValidator]],
        image: [null, Validators.required],
      }, { validators: [this.quantityRangeValidator] }),
      opportunityLocalization: this.fb.group({
        designEngineerings: this.fb.array(
          [this.createKeyActivityControl()],
          [this.keyActivityArrayValidator('Design engineering is required')]
        ),
        sourcings: this.fb.array(
          [this.createKeyActivityControl()],
          [this.keyActivityArrayValidator('Sourcing is required')]
        ),
        manufacturings: this.fb.array(
          [this.createKeyActivityControl()],
          [this.keyActivityArrayValidator('Manufacturing is required')]
        ),
        assemblyTestings: this.fb.array(
          [this.createKeyActivityControl()],
          [this.keyActivityArrayValidator('Assembly testing is required')]
        ),
        afterSalesServices: this.fb.array(
          [this.createKeyActivityControl()],
          [this.keyActivityArrayValidator('After sales services is required')]
        ),
      }),
    });
  }

  // Custom validators
  private dateRangeValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return { required: { message: 'Date range is required' } };
    }
    if (Array.isArray(value) && value.length === 2 && value[0] && value[1]) {
      return null;
    }
    return { invalidRange: { message: 'You should select a date range' } };
  };

  private quantityRangeValidator = (group: AbstractControl): ValidationErrors | null => {
    const minQuantityControl = group.get('minQuantity');
    const maxQuantityControl = group.get('maxQuantity');
    const minQuantity = minQuantityControl?.value;
    const maxQuantity = maxQuantityControl?.value;

    if (minQuantity && maxQuantity && parseFloat(minQuantity) >= parseFloat(maxQuantity)) {
      // Merge errors instead of overwriting
      const minErrors = minQuantityControl?.errors || {};
      const maxErrors = maxQuantityControl?.errors || {};
      minQuantityControl?.setErrors({ ...minErrors, minQuantityError: { message: 'Min quantity must be less than max quantity' } });
      maxQuantityControl?.setErrors({ ...maxErrors, maxQuantityError: { message: 'Max quantity must be greater than min quantity' } });
      return { quantityRange: true };
    }

    // Clear errors if valid
    if (minQuantityControl?.hasError('minQuantityError')) {
      const errors = { ...minQuantityControl.errors };
      delete errors['minQuantityError'];
      minQuantityControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
    if (maxQuantityControl?.hasError('maxQuantityError')) {
      const errors = { ...maxQuantityControl.errors };
      delete errors['maxQuantityError'];
      maxQuantityControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }

    return null;
  };

  private keyActivityArrayValidator = (errorMessage: string) => {
    return (control: AbstractControl): ValidationErrors | null => {
      const array = control.value as IKeyActivityRecord[];
      if (!array || array.length === 0) {
        return { required: { message: errorMessage } };
      }
      const isValid = array.every(item => item.keyActivity && item.keyActivity.trim() !== '');
      return isValid ? null : { invalidArray: { message: errorMessage } };
    };
  };

  // Create a FormGroup for a single key activity record
  createKeyActivityControl(): FormGroup {
    return this.fb.group({
      keyActivity: ['', Validators.required]
    });
  }

  isFormValid(): boolean {
    return this.opportunityForm.valid;
  }

  formValue() {
    return {
      opportunityInformationFrom: this.opportunityInformationForm.value,
      opportunityLocalizationForm: this.opportunityLocalizationForm.value,
    };
  }

  resetForm() {
    this.opportunityInformationForm.reset(this.OpportunityInformationFormInitialState);
    this.opportunityLocalizationForm.reset();

    // Reset form arrays to initial state
    this.resetFormArray('designEngineerings');
    this.resetFormArray('sourcings');
    this.resetFormArray('manufacturings');
    this.resetFormArray('assemblyTestings');
    this.resetFormArray('afterSalesServices');

    // Reset original date range and hasActivePlans
    this.originalDateRange = null;
    this.hasActivePlans = false;

    this.opportunityForm.updateValueAndValidity();
    this.opportunityInformationForm.updateValueAndValidity();
    this.opportunityLocalizationForm.updateValueAndValidity();
  }

  private resetFormArray(controlName: keyof IOpportunityLocalizationFrom) {
    const formArray = this.opportunityLocalizationForm.get(controlName) as FormArray;
    formArray.clear();
    const initialArray = this.OpportunityLocalizationFormInitialState[controlName];
    initialArray.forEach(() => {
      formArray.push(this.createKeyActivityControl());
    });
  }

  // Factory method to create new key activity records
  createNewKeyActivity = () => ({ keyActivity: '' });

  markAsDirty() {
    this.opportunityForm.markAllAsDirty();
    this.opportunityForm.updateValueAndValidity();
  }

  updateImageField(image: File | null) {
    this.opportunityInformationForm.patchValue({ image });
    this.opportunityInformationForm.get('image')?.markAsDirty();
  }

  updateDateRange(dateRange: [Date, Date] | null) {
    this.opportunityInformationForm.patchValue({ dateRange });
  }

  handleDateRangeChange(event: any, hasActivePlans: boolean = false) {
    // Handle date range selection from PrimeNG DatePicker
    // PrimeNG DatePicker emits different formats depending on selection state
    if (event === null || event === undefined) {
      // Clear the value
      this.updateDateRange(null);
      return;
    }

    if (Array.isArray(event)) {
      // Check if we have a complete date range (both start and end dates)
      // event[0] and event[1] must be truthy and not null/undefined
      if (event.length === 2 && event[0] != null && event[1] != null) {
        // Ensure dates are Date objects and valid
        let startDate: Date;
        let endDate: Date;

        if (event[0] instanceof Date) {
          startDate = event[0];
        } else if (typeof event[0] === 'string' || typeof event[0] === 'number') {
          startDate = new Date(event[0]);
        } else {
          // Invalid start date
          return;
        }

        if (event[1] instanceof Date) {
          endDate = event[1];
        } else if (typeof event[1] === 'string' || typeof event[1] === 'number') {
          endDate = new Date(event[1]);
        } else {
          // Invalid end date
          return;
        }

        // Validate dates are not invalid (NaN)
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          const normalizedDates: [Date, Date] = [startDate, endDate];
          const dateRangeControl = this.opportunityInformationForm.get('dateRange');

          // Validate date changes if plans are linked
          if (hasActivePlans && this.originalDateRange) {
            const [originalStart, originalEnd] = this.originalDateRange;
            let hasError = false;
            const restrictionErrors: any = {};

            // Start Date validation: Can only be moved earlier (not later)
            if (startDate > originalStart) {
              restrictionErrors.startDateRestriction = {
                message: 'Start date can only be changed to an earlier date when plans are linked'
              };
              hasError = true;
            }

            // End Date validation: Can only be moved later (not earlier)
            if (endDate < originalEnd) {
              restrictionErrors.endDateRestriction = {
                message: 'End date can only be changed to a later date when plans are linked'
              };
              hasError = true;
            }

            if (hasError) {
              // Update the date range first (so datepicker shows user's selection)
              this.updateDateRange(normalizedDates);
              // Then set errors on the control (preserving existing errors from dateRangeValidator)
              const existingErrors = dateRangeControl?.errors || {};
              // Remove any existing restriction errors before adding new ones
              const cleanedErrors = { ...existingErrors };
              delete cleanedErrors['startDateRestriction'];
              delete cleanedErrors['endDateRestriction'];
              dateRangeControl?.setErrors({ ...cleanedErrors, ...restrictionErrors });
              dateRangeControl?.markAsTouched();
            } else {
              // Clear date restriction errors if validation passes
              if (dateRangeControl?.errors) {
                const errors = { ...dateRangeControl.errors };
                delete errors['startDateRestriction'];
                delete errors['endDateRestriction'];
                dateRangeControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
              }
              // Update the form field value
              this.updateDateRange(normalizedDates);
            }
          } else {
            // No restrictions, update normally
            this.updateDateRange(normalizedDates);
          }

          // Mark the field as touched
          dateRangeControl?.markAsTouched();
        }
      } else if (event.length === 1 && event[0] != null) {
        // Only start date selected, don't update yet (wait for end date)
        // This is normal behavior when user is selecting a range
        return;
      } else {
        // Empty array or invalid format
        this.updateDateRange(null);
      }
    } else {
      // Single date or other format - treat as null
      this.updateDateRange(null);
    }
  }

  async setFormValue(value: IOpportunityDetails) {
    // Patch opportunity information form
    const dateRange: [Date, Date] | null = value.startDate && value.endDate
      ? [new Date(value.startDate), new Date(value.endDate)]
      : null;

    // Store original date range and hasActivePlans for validation
    this.originalDateRange = dateRange;
    this.hasActivePlans = value.hasActivePlans ?? false;

    // Get image from attachments (first attachment if available) and convert to File
    let image: File | null = null;
    // For now, use placeholder image
    if (value.attachments && value.attachments.length > 0) {
      image = await this.createFileFromUrl('/assets/images/opportunity-placeholder.png', 'opportunity-placeholder.png');
    }
    // if (value.attachments && value.attachments.length > 0) {
    //   const fileUrl = value.attachments[0].fileUrl;
    //   const fileName = value.attachments[0].fileName || 'image';
    //   image = await this.createFileFromUrl(fileUrl, fileName);
    // }



    this.opportunityInformationForm.patchValue({
      id: value.id,
      title: value.title,
      shortDescription: value.shortDescription,
      opportunityType: value.opportunityType?.toString(),
      opportunityCategory: value.opportunityCategory?.toString(), // TODO: Remove this once the API is updated
      spendSAR: value.spendSAR?.toString() || '',
      minQuantity: value.minQuantity?.toString() || '',
      maxQuantity: value.maxQuantity?.toString() || '',
      localSuppliers: value.localSuppliers?.toString() || '',
      globalSuppliers: value.globalSuppliers?.toString() || '',
      dateRange: dateRange,
      image: image,
    });

    // Patch opportunity localization form arrays
    this.patchFormArray('designEngineerings', value.designEngineerings);
    this.patchFormArray('sourcings', value.sourcings);
    this.patchFormArray('manufacturings', value.manufacturings);
    this.patchFormArray('assemblyTestings', value.assemblyTestings);
    this.patchFormArray('afterSalesServices', value.afterSalesServices);

    this.formUpdated.next();
  }

  enableDraftValidators() {
    const infoGroup = this.opportunityForm.get('opportunityInformation') as FormGroup;
    const locGroup = this.opportunityForm.get('opportunityLocalization') as FormGroup;

    Object.values(infoGroup.controls).forEach(control => {
      control.clearValidators();
      control.updateValueAndValidity({ emitEvent: false });
    });

    infoGroup.clearValidators();
    infoGroup.updateValueAndValidity({ emitEvent: false });

    Object.values(locGroup.controls).forEach(control => {
      control.clearValidators(); // removes keyActivityArrayValidator
      control.updateValueAndValidity({ emitEvent: false });
    });
    infoGroup.get('title')?.setValidators([Validators.required]);
    infoGroup.get('title')?.updateValueAndValidity({ emitEvent: false });

    this.opportunityForm.updateValueAndValidity({ emitEvent: false });
  }

  enableFullValidators() {
    const infoGroup = this.opportunityForm.get('opportunityInformation') as FormGroup;
    const locGroup = this.opportunityForm.get('opportunityLocalization') as FormGroup;

    // -------- Opportunity Information --------
    infoGroup.get('title')?.setValidators([Validators.required, Validators.maxLength(150)]);
    infoGroup.get('opportunityType')?.setValidators([Validators.required]);
    infoGroup.get('shortDescription')?.setValidators([Validators.required, Validators.maxLength(255)]);
    infoGroup.get('opportunityCategory')?.setValidators([Validators.required]);
    infoGroup.get('spendSAR')?.setValidators([Validators.required]);
    infoGroup.get('minQuantity')?.setValidators([Validators.required, Validators.min(0)]);
    infoGroup.get('maxQuantity')?.setValidators([Validators.required, Validators.min(0)]);
    infoGroup.get('localSuppliers')?.setValidators([Validators.required, Validators.min(0)]);
    infoGroup.get('globalSuppliers')?.setValidators([Validators.required, Validators.min(0)]);
    infoGroup.get('dateRange')?.setValidators([Validators.required, this.dateRangeValidator]);
    infoGroup.get('image')?.setValidators([Validators.required]);

    //Group-level validator
    infoGroup.setValidators([this.quantityRangeValidator]);

    // -------- Opportunity Localization Arrays --------
    const arrays = [
      'designEngineerings',
      'sourcings',
      'manufacturings',
      'assemblyTestings',
      'afterSalesServices'
    ];

    arrays.forEach(key => {
      const arr = locGroup.get(key);
      arr?.setValidators([
        this.keyActivityArrayValidator(`${key} is required`)
      ]);
      arr?.updateValueAndValidity({ emitEvent: false });
    });

    //  Update validation for all controls
    Object.values(infoGroup.controls).forEach(control => {
      control.updateValueAndValidity({ emitEvent: false });
    });

    infoGroup.updateValueAndValidity({ emitEvent: false });

  }

  private async createFileFromUrl(
    fileUrl: string,
    fileName: string = "image.jpg"
  ): Promise<File> {
    const response = await fetch(fileUrl);
    const blob = await response.blob();

    // Ensure file has correct extension based on blob type
    let finalFileName = fileName;
    const blobType = blob.type.toLowerCase();

    // Determine extension from MIME type if fileName doesn't have valid extension
    if (!fileName.match(/\.(jpg|jpeg|png)$/i)) {
      if (blobType.includes('jpeg') || blobType.includes('jpg')) {
        finalFileName = fileName.replace(/\.[^.]*$/, '') + '.jpg';
      } else if (blobType.includes('png')) {
        finalFileName = fileName.replace(/\.[^.]*$/, '') + '.png';
      } else {
        // Default to jpg if type is unknown
        finalFileName = fileName.replace(/\.[^.]*$/, '') + '.jpg';
      }
    }

    // Ensure the blob type matches the extension
    let finalBlobType = blob.type;
    if (finalFileName.endsWith('.jpg') || finalFileName.endsWith('.jpeg')) {
      finalBlobType = blobType.includes('jpeg') || blobType.includes('jpg')
        ? blob.type
        : 'image/jpeg';
    } else if (finalFileName.endsWith('.png')) {
      finalBlobType = blobType.includes('png') ? blob.type : 'image/png';
    }

    return new File([blob], finalFileName, { type: finalBlobType });
  }

  private patchFormArray(controlName: keyof IOpportunityLocalizationFrom, activities: IOpportunityActivity[]) {
    const formArray = this.opportunityLocalizationForm.get(controlName) as FormArray;

    // Clear existing controls
    formArray.clear();

    // Add controls for each activity
    if (activities && activities.length > 0) {
      activities.forEach(activity => {
        const control = this.createKeyActivityControl();
        control.patchValue({ keyActivity: activity.keyActivity || '' });
        formArray.push(control);
      });
    } else {
      // If no activities, add one empty control
      formArray.push(this.createKeyActivityControl());
    }
  }
}
