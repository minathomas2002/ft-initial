import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ServiceLocalizationStepCoverPageFormBuilder } from './steps/service-localization-step-cover-page.form-builder';
import { ServiceLocalizationStepOverviewFormBuilder } from './steps/service-localization-step-overview.form-builder';
import { ServiceLocalizationStepExistingSaudiFormBuilder } from './steps/service-localization-step-existing-saudi.form-builder';
import { ServiceLocalizationStepDirectLocalizationFormBuilder } from './steps/service-localization-step-direct-localization.form-builder';
import { ServiceLocalizationStepSummaryFormBuilder } from './steps/service-localization-step-summary.form-builder';

@Injectable({
  providedIn: 'root',
})
export class ServiceLocalizationFormService {
  private readonly fb = inject(FormBuilder);

  // Step builders
  private readonly _coverPageBuilder = new ServiceLocalizationStepCoverPageFormBuilder(this.fb);
  private readonly _overviewBuilder = new ServiceLocalizationStepOverviewFormBuilder(this.fb);
  private readonly _existingSaudiBuilder = new ServiceLocalizationStepExistingSaudiFormBuilder(
    this.fb
  );
  private readonly _directLocalizationBuilder =
    new ServiceLocalizationStepDirectLocalizationFormBuilder(this.fb);
  private readonly _summaryBuilder = new ServiceLocalizationStepSummaryFormBuilder(this.fb);

  // Step form groups
  private readonly _coverPageFormGroup = this._coverPageBuilder.buildCoverPageFormGroup();
  private readonly _overviewFormGroup = this._overviewBuilder.buildStepOverviewFormGroup();
  private readonly _existingSaudiFormGroup =
    this._existingSaudiBuilder.buildStepExistingSaudiFormGroup();
  private readonly _directLocalizationFormGroup =
    this._directLocalizationBuilder.buildStepDirectLocalizationFormGroup();
  private readonly _summaryFormGroup = this._summaryBuilder.buildStepSummaryFormGroup();

  // Expose step form groups
  get coverPageFormGroup(): FormGroup {
    return this._coverPageFormGroup;
  }

  get overviewFormGroup(): FormGroup {
    return this._overviewFormGroup;
  }

  get existingSaudiFormGroup(): FormGroup {
    return this._existingSaudiFormGroup;
  }

  get directLocalizationFormGroup(): FormGroup {
    return this._directLocalizationFormGroup;
  }

  get summaryFormGroup(): FormGroup {
    return this._summaryFormGroup;
  }

  // Get company information form group (from cover page)
  get companyInformationFormGroup(): FormGroup {
    return this._coverPageFormGroup.get('companyInformation') as FormGroup;
  }

  // Get services form group (from cover page)
  get servicesFormGroup(): FormGroup {
    return this._coverPageFormGroup.get('services') as FormGroup;
  }

  // Get services form array
  getServicesFormArray(): FormArray {
    const servicesFormGroup = this._coverPageFormGroup.get('services') as FormGroup;
    return servicesFormGroup.get('services') as FormArray;
  }

  // Create service item
  createServiceItem(): FormGroup {
    return this._coverPageBuilder.createServiceItem();
  }

  // Add service item
  addServiceItem(): void {
    this.getServicesFormArray().push(this.createServiceItem());
  }

  // Remove service item
  removeServiceItem(index: number): void {
    const servicesArray = this.getServicesFormArray();
    if (servicesArray.length > 1) {
      servicesArray.removeAt(index);
    }
  }

  /**
   * Mark all form controls as dirty recursively
   */
  markAllControlsAsDirty(): void {
    this.markControlAsDirty(this._coverPageFormGroup);
    this.markControlAsDirty(this._overviewFormGroup);
    this.markControlAsDirty(this._existingSaudiFormGroup);
    this.markControlAsDirty(this._directLocalizationFormGroup);
    this.markControlAsDirty(this._summaryFormGroup);
  }

  /**
   * Recursively mark a control and all its nested controls as dirty
   */
  private markControlAsDirty(control: any): void {
    if (control instanceof FormGroup) {
      Object.keys(control.controls).forEach((key) => {
        this.markControlAsDirty(control.controls[key]);
      });
    } else if (control instanceof FormArray) {
      control.controls.forEach((arrayControl) => {
        this.markControlAsDirty(arrayControl);
      });
    } else if (control) {
      control.markAsDirty();
      control.updateValueAndValidity();
    }
  }

  /**
   * Check if all forms are valid
   */
  areAllFormsValid(): boolean {
    return (
      this._coverPageFormGroup.valid &&
      this._overviewFormGroup.valid &&
      this._existingSaudiFormGroup.valid &&
      this._directLocalizationFormGroup.valid &&
      this._summaryFormGroup.valid
    );
  }

  /**
   * Reset all form controls to their initial state
   */
  resetAllForms(): void {
    this._coverPageFormGroup.reset();
    this._overviewFormGroup.reset();
    this._existingSaudiFormGroup.reset();
    this._directLocalizationFormGroup.reset();
    this._summaryFormGroup.reset();

    // Ensure services array has at least one item
    const servicesArray = this.getServicesFormArray();
    while (servicesArray.length > 0) {
      servicesArray.removeAt(0);
    }
    servicesArray.push(this.createServiceItem());

    // Mark all forms as pristine and untouched
    this._coverPageFormGroup.markAsPristine();
    this._coverPageFormGroup.markAsUntouched();
    this._overviewFormGroup.markAsPristine();
    this._overviewFormGroup.markAsUntouched();
    this._existingSaudiFormGroup.markAsPristine();
    this._existingSaudiFormGroup.markAsUntouched();
    this._directLocalizationFormGroup.markAsPristine();
    this._directLocalizationFormGroup.markAsUntouched();
    this._summaryFormGroup.markAsPristine();
    this._summaryFormGroup.markAsUntouched();
  }
}
