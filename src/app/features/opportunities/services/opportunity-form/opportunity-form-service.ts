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
    startDate: null,
    endDate: null,
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
  private initialFormValue!: any;

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
        spendSAR: ['', [Validators.required, Validators.max(10)]],
        minQuantity: ['', [Validators.required]],
        maxQuantity: ['', [Validators.required]],
        localSuppliers: ['', [Validators.required, Validators.max(1000000000)]],
        globalSuppliers: ['', [Validators.required, Validators.max(1000000000)]],
        startDate: [null, [Validators.required, this.startDateRestrictionValidator]],
        endDate: [null, [Validators.required, this.endDateAfterStartDateValidator, this.endDateRestrictionValidator]],
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
  private toDateOnly(value: unknown): Date | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value as string | number | Date);
    if (isNaN(date.getTime())) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private getTodayDateOnly(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  private lockStartDateIfPast(startDate: Date | null) {
    const startDateControl = this.opportunityInformationForm.get('startDate');
    if (!startDateControl) return;

    const today = this.getTodayDateOnly();
    const normalized = startDate ? this.toDateOnly(startDate) : null;

    if (normalized && normalized < today) {
      startDateControl.disable({ emitEvent: false });
      startDateControl.setErrors(null);
    } else {
      startDateControl.enable({ emitEvent: false });
    }
  }

  private endDateAfterStartDateValidator = (control: AbstractControl): ValidationErrors | null => {
    const endDateValue = control.value;
    const parent = control.parent as FormGroup | null;
    const startDateValue = parent?.get('startDate')?.value;

    if (!startDateValue || !endDateValue) return null;

    const startDate = startDateValue instanceof Date ? startDateValue : new Date(startDateValue);
    const endDate = endDateValue instanceof Date ? endDateValue : new Date(endDateValue);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;

    return endDate >= startDate ? null : { dateRangeInvalid: true };
  };

  private startDateRestrictionValidator = (control: AbstractControl): ValidationErrors | null => {
    if (!this.hasActivePlans || !this.originalDateRange) return null;
    const value = control.value;
    if (!value) return null;

    const startDate = this.toDateOnly(value);
    if (!startDate) return null;

    const [originalStartRaw] = this.originalDateRange;
    const originalStart = this.toDateOnly(originalStartRaw);
    if (!originalStart) return null;

    const today = this.getTodayDateOnly();

    // If the opportunity already started in the past, allow moving startDate forward,
    // but never allow setting a past date (user can only choose today or later).
    if (originalStart < today) {
      return startDate < today ? { startDateRestriction: true } : null;
    }

    // Original behavior for future opportunities with linked plans:
    // startDate can only move earlier (not later than original).
    return startDate > originalStart ? { startDateRestriction: true } : null;
  };

  private endDateRestrictionValidator = (control: AbstractControl): ValidationErrors | null => {
    if (!this.hasActivePlans || !this.originalDateRange) return null;
    const value = control.value;
    if (!value) return null;

    const endDate = value instanceof Date ? value : new Date(value);
    if (isNaN(endDate.getTime())) return null;

    const [, originalEnd] = this.originalDateRange;
    return endDate < originalEnd ? { endDateRestriction: true } : null;
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
      keyActivity: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]]
    });
  }

  isFormValid(): boolean {
    return this.opportunityForm.valid;
  }

  formValue() {
    return {
      opportunityInformationFrom: this.opportunityInformationForm.getRawValue(),
      opportunityLocalizationForm: this.opportunityLocalizationForm.getRawValue(),
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

    // Ensure all fields are enabled when resetting (especially when switching from edit to create mode)
    this.opportunityInformationForm.get('title')?.enable({ emitEvent: false });
    this.opportunityInformationForm.get('opportunityType')?.enable({ emitEvent: false });
    this.opportunityInformationForm.get('startDate')?.enable({ emitEvent: false });

    this.opportunityForm.updateValueAndValidity();
    this.opportunityInformationForm.updateValueAndValidity();
    this.opportunityLocalizationForm.updateValueAndValidity();

    // Reset initial form value tracking
    this.initiateFormValue();
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
    this.markControlAsDirty(this.opportunityForm);
  }

  private markControlAsDirty(control: AbstractControl): void {
    if (control instanceof FormControl) {
      control.markAsDirty();
      control.updateValueAndValidity();
    } else if (control instanceof FormGroup) {
      Object.keys(control.controls).forEach(key => {
        const childControl = control.get(key);
        if (childControl) {
          this.markControlAsDirty(childControl);
        }
      });
      control.markAsDirty();
      control.updateValueAndValidity();
    } else if (control instanceof FormArray) {
      control.controls.forEach(childControl => {
        this.markControlAsDirty(childControl);
      });
      control.markAsDirty();
      control.updateValueAndValidity();
    }
  }

  updateImageField(image: File | null) {
    this.opportunityInformationForm.patchValue({ image });
    this.opportunityInformationForm.get('image')?.markAsDirty();
  }

  updateStartDate(startDate: Date | null) {
    this.opportunityInformationForm.patchValue({ startDate });
    this.opportunityInformationForm.get('startDate')?.markAsTouched();
    this.opportunityInformationForm.get('endDate')?.updateValueAndValidity({ emitEvent: false });
  }

  updateEndDate(endDate: Date | null) {
    this.opportunityInformationForm.patchValue({ endDate });
    this.opportunityInformationForm.get('endDate')?.markAsTouched();
    this.opportunityInformationForm.get('endDate')?.updateValueAndValidity({ emitEvent: false });
  }

  handleStartDateChange(event: Date, hasActivePlans: boolean = false) {
    this.hasActivePlans = hasActivePlans;
    if (this.opportunityInformationForm.get('startDate')?.disabled) return;

    const startDate = event instanceof Date ? event : (event ? new Date(event) : null);
    const normalized = startDate && !isNaN(startDate.getTime()) ? startDate : null;

    if (!normalized) {
      this.updateStartDate(null);
    } else {
      const candidate = this.toDateOnly(normalized);
      const today = this.getTodayDateOnly();
      // Prevent manual typing of past dates
      this.updateStartDate(candidate && candidate < today ? today : candidate);
    }

    this.opportunityInformationForm.get('startDate')?.updateValueAndValidity({ emitEvent: false });
  }

  handleEndDateChange(event: Date, hasActivePlans: boolean = false) {
    this.hasActivePlans = hasActivePlans;
    const endDate = event instanceof Date ? event : (event ? new Date(event) : null);
    this.updateEndDate(endDate && !isNaN(endDate.getTime()) ? endDate : null);
    this.opportunityInformationForm.get('endDate')?.updateValueAndValidity({ emitEvent: false });
  }

  async setFormValue(value: IOpportunityDetails) {
    // Patch opportunity information form
    const startDate = value.startDate ? new Date(value.startDate) : null;
    const endDate = value.endDate ? new Date(value.endDate) : null;
    const normalizedStartDate = startDate && !isNaN(startDate.getTime()) ? startDate : null;
    const normalizedEndDate = endDate && !isNaN(endDate.getTime()) ? endDate : null;

    const originalDateRange: [Date, Date] | null = normalizedStartDate && normalizedEndDate
      ? [normalizedStartDate, normalizedEndDate]
      : null;

    // Store original date range and hasActivePlans for validation
    this.originalDateRange = originalDateRange;
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


    // disable title and opportunityType if has active plans
    if (this.hasActivePlans) {
      this.opportunityInformationForm.get("title")?.disable({ emitEvent: false });
      this.opportunityInformationForm.get("opportunityType")?.disable({ emitEvent: false });
    } else {
      this.opportunityInformationForm.get("title")?.enable({ emitEvent: false });
      this.opportunityInformationForm.get("opportunityType")?.enable({ emitEvent: false });
    }
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
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
      image: image,
    });

    // If the current start date is already in the past, lock it (edit mode).
    this.lockStartDateIfPast(normalizedStartDate);

    // Patch opportunity localization form arrays
    this.patchFormArray('designEngineerings', value.designEngineerings);
    this.patchFormArray('sourcings', value.sourcings);
    this.patchFormArray('manufacturings', value.manufacturings);
    this.patchFormArray('assemblyTestings', value.assemblyTestings);
    this.patchFormArray('afterSalesServices', value.afterSalesServices);

    this.formUpdated.next();

    // Initialize form value tracking after setting form values
    this.initiateFormValue();
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
    infoGroup.get('spendSAR')?.setValidators([Validators.required, Validators.max(10)]);
    infoGroup.get('minQuantity')?.setValidators([Validators.required]);
    infoGroup.get('maxQuantity')?.setValidators([Validators.required]);
    infoGroup.get('localSuppliers')?.setValidators([Validators.required, Validators.max(1000000000)]);
    infoGroup.get('globalSuppliers')?.setValidators([Validators.required, Validators.max(1000000000)]);
    infoGroup.get('startDate')?.setValidators([Validators.required, this.startDateRestrictionValidator]);
    infoGroup.get('endDate')?.setValidators([Validators.required, this.endDateAfterStartDateValidator, this.endDateRestrictionValidator]);
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

  private getAllFormsRawValue() {
    return {
      opportunityInformation: this.opportunityInformationForm.getRawValue(),
      opportunityLocalization: this.opportunityLocalizationForm.getRawValue(),
    };
  }

  initiateFormValue(): void {
    this.initialFormValue = this.getAllFormsRawValue();
  }

  hasFormChanged(): boolean {
    return JSON.stringify(this.initialFormValue) !==
      JSON.stringify(this.getAllFormsRawValue());
  }
}
