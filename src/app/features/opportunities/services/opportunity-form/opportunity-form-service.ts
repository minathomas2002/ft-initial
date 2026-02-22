import { Injectable, computed, inject, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject } from 'rxjs';
import { EOpportunityQuantity } from 'src/app/shared/enums';
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
    spendSAR: 0 as unknown as string,
    minQuantity: 0 as unknown as string,
    maxQuantity: 0 as unknown as string,
    localSuppliers: 0 as unknown as string,
    globalSuppliers: 0 as unknown as string,
    startDate: null,
    endDate: null,
    image: null,
    quantityUnit: null
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
        quantityUnit :[null],
        spendSAR: [0, [Validators.min(0), Validators.max(10)]],
        minQuantity: [0, [Validators.min(0)]],
        maxQuantity: [0, [Validators.min(0)]],
        localSuppliers: [0, [Validators.min(0), Validators.max(1000000000)]],
        globalSuppliers: [0, [Validators.min(0), Validators.max(1000000000)]],
        startDate: [null, [Validators.required, this.startDateRestrictionValidator]],
        endDate: [null, [Validators.required, this.endDateAfterStartDateValidator, this.endDateRestrictionValidator]],
        image: [null, Validators.required],
      }, { validators: [this.quantityRangeValidator, , this.quantityUnitRequiredValidator] }),
      opportunityLocalization: this.fb.group({
        designEngineerings: this.fb.array(
          [this.createKeyActivityControl()]
        ),
        sourcings: this.fb.array(
          [this.createKeyActivityControl()]
        ),
        manufacturings: this.fb.array(
          [this.createKeyActivityControl()]
        ),
        assemblyTestings: this.fb.array(
          [this.createKeyActivityControl()]
        ),
        afterSalesServices: this.fb.array(
          [this.createKeyActivityControl()]
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

    const startDate = this.toDateOnly(startDateValue);
    const endDate = this.toDateOnly(endDateValue);
    if (!startDate || !endDate) return null;

    // Strict ordering: endDate must be AFTER startDate (not equal).
    return endDate > startDate ? null : { dateRangeInvalid: true };
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

    if ((minQuantity || maxQuantity )&& parseFloat(minQuantity) >= parseFloat(maxQuantity)) {
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

  // Create a FormGroup for a single key activity record
  createKeyActivityControl(): FormGroup {
    return this.fb.group({
      keyActivity: ['', [Validators.minLength(3), Validators.maxLength(500)]]
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
    if (value.attachments && value.attachments.length > 0) {
      var attachment = value.attachments[0];
      const fileUrl = `data:${attachment?.ibmFileBase64?.fileBase64MimeType};base64,${attachment?.ibmFileBase64?.fileBase64}`;
      const fileName = attachment.fileName || 'image';
      image = await this.createFileFromUrl(fileUrl, fileName);
    }

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
      quantityUnit: value.quantityUnit?.toString(),
      spendSAR: value.spendSAR != null ? Number(value.spendSAR) : 0,
      minQuantity: value.minQuantity != null ? Number(value.minQuantity) : 0,
      maxQuantity: value.maxQuantity != null ? Number(value.maxQuantity) : 0,
      localSuppliers: value.localSuppliers != null ? Number(value.localSuppliers) : 0,
      globalSuppliers: value.globalSuppliers != null ? Number(value.globalSuppliers) : 0,
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

    // Keep strict date ordering validation active even in draft mode.
    infoGroup.get('endDate')?.setValidators([this.endDateAfterStartDateValidator]);
    infoGroup.get('endDate')?.updateValueAndValidity({ emitEvent: false });

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
    //infoGroup.get('quantityUnit')?.setValidators([Validators.required]);
    infoGroup.get('spendSAR')?.setValidators([Validators.required, Validators.max(10)]);
    infoGroup.get('minQuantity')?.setValidators([Validators.required]);
    infoGroup.get('maxQuantity')?.setValidators([Validators.required]);
    infoGroup.get('localSuppliers')?.setValidators([Validators.required, Validators.max(1000000000)]);
    infoGroup.get('globalSuppliers')?.setValidators([Validators.required, Validators.max(1000000000)]);
    infoGroup.get('startDate')?.setValidators([Validators.required, this.startDateRestrictionValidator]);
    infoGroup.get('endDate')?.setValidators([Validators.required, this.endDateAfterStartDateValidator, this.endDateRestrictionValidator]);
    infoGroup.get('image')?.setValidators([Validators.required]);

    //Group-level validator
    infoGroup.setValidators([this.quantityRangeValidator, this.quantityUnitRequiredValidator ]);

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

  private quantityUnitRequiredValidator = (group: AbstractControl): ValidationErrors | null => {
  const minQuantity = Number(group.get('minQuantity')?.value) || 0;
  const maxQuantity = Number(group.get('maxQuantity')?.value) || 0;
  const quantityUnitControl = group.get('quantityUnit');

  const shouldRequire = minQuantity > 0 || maxQuantity > 0;

  if (shouldRequire && !quantityUnitControl?.value) {
    //const errors = quantityUnitControl?.errors || {};
    // quantityUnitControl?.setErrors({
    //   ...errors,
    //   quantityUnitRequired: true
    // });
    const quantityErrors = quantityUnitControl?.errors || {};
    quantityUnitControl?.setErrors({ ...quantityErrors, quantityUnitRequired: { message: 'Measure Unit is required' } });
    quantityUnitControl?.markAsDirty({ onlySelf: true });
    quantityUnitControl?.markAsTouched({ onlySelf: true });
    return null;
    //return { quantityUnitRequired: true };
  }

  //Clear only this error (do not remove others)
  if (quantityUnitControl?.hasError('quantityUnitRequired')) {
    const errors = { ...quantityUnitControl.errors };
    delete errors['quantityUnitRequired'];
    quantityUnitControl.setErrors(Object.keys(errors).length ? errors : null);
  }

  return null;
};
}
