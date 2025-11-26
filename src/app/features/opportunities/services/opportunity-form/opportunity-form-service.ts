import { Injectable, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { IOpportunityInformationFrom, ISelectItem, IOpportunityLocalizationFrom, IKeyActivityRecord, SafeObjectUrl } from 'src/app/shared/interfaces';

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

  constructor(private fb: FormBuilder) {
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
        title: ['', [Validators.required, Validators.maxLength(100)]],
        opportunityType: [null, Validators.required],
        shortDescription: ['', [Validators.required, Validators.maxLength(250)]],
        opportunityCategory: ['', Validators.required],
        spendSAR: ['', Validators.required],
        minQuantity: ['', Validators.required],
        maxQuantity: ['', Validators.required],
        localSuppliers: ['', Validators.required],
        globalSuppliers: ['', Validators.required],
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

  // Helper function to validate a single array
  private validateKeyActivityArray = (array: IKeyActivityRecord[]): boolean => {
    return array.every(item => item.keyActivity && item.keyActivity.trim() !== '');
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

  markAsTouched() {
    this.opportunityForm.markAllAsTouched();
  }

  updateImageField(image: SafeObjectUrl | null) {
    this.opportunityInformationForm.patchValue({ image });
  }

  updateDateRange(dateRange: [Date, Date] | null) {
    this.opportunityInformationForm.patchValue({ dateRange });
  }

  handleDateRangeChange(event: any) {
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
          // Update the form field value
          this.updateDateRange(normalizedDates);
          // Mark the field as touched
          this.opportunityInformationForm.get('dateRange')?.markAsTouched();
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
}
