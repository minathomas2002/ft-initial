import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { ServiceLocalizationStepCoverPageFormBuilder } from './steps/service-localization-step-cover-page.form-builder';
import { ServiceLocalizationStepOverviewFormBuilder } from './steps/service-localization-step-overview.form-builder';
import { ServiceLocalizationStepExistingSaudiFormBuilder } from './steps/service-localization-step-existing-saudi.form-builder';
import { ServiceLocalizationStepDirectLocalizationFormBuilder } from './steps/service-localization-step-direct-localization.form-builder';

@Injectable({
  providedIn: 'root'
})
export class ServicePlanFormService {
  private readonly _fb = inject(FormBuilder);
  private readonly _planStore = inject(PlanStore);

  // Step builders
  private readonly _step1Builder = new ServiceLocalizationStepCoverPageFormBuilder(this._fb);
  private readonly _step2Builder = new ServiceLocalizationStepOverviewFormBuilder(this._fb);
  private readonly _step3Builder = new ServiceLocalizationStepExistingSaudiFormBuilder(this._fb);
  private readonly _step4Builder = new ServiceLocalizationStepDirectLocalizationFormBuilder(this._fb);

  // Step 1: Cover Page
  private readonly _step1FormGroup = this._step1Builder.buildCoverPageFormGroup();

  // Step 2: Overview
  private readonly _step2FormGroup = this._step2Builder.buildOverviewFormGroup();

  // Step 3: Existing Saudi Co.
  private readonly _step3FormGroup = this._step3Builder.buildExistingSaudiFormGroup();

  // Step 4: Direct Localization
  private readonly _step4FormGroup = this._step4Builder.buildDirectLocalizationFormGroup();

  // Expose step form groups
  step1_coverPage = this._step1FormGroup;
  step2_overview = this._step2FormGroup;
  step3_existingSaudi = this._step3FormGroup;
  step4_directLocalization = this._step4FormGroup;

  // Expose sub-form groups for Step 1
  get coverPageCompanyInformationFormGroup(): FormGroup {
    return this._step1FormGroup.get(EMaterialsFormControls.coverPageCompanyInformationFormGroup) as FormGroup;
  }

  getServicesFormArray(): FormArray | null {
    return this._step1Builder.getServicesFormArray(this._step1FormGroup);
  }

  // Expose sub-form groups for Step 2
  get basicInformationFormGroup(): FormGroup {
    return this._step2FormGroup.get(EMaterialsFormControls.basicInformationFormGroup) as FormGroup;
  }

  get overviewCompanyInformationFormGroup(): FormGroup {
    return this._step2FormGroup.get(EMaterialsFormControls.overviewCompanyInformationFormGroup) as FormGroup;
  }

  get locationInformationFormGroup(): FormGroup {
    return this._step2FormGroup.get(EMaterialsFormControls.locationInformationFormGroup) as FormGroup;
  }

  get localAgentInformationFormGroup(): FormGroup {
    return this._step2FormGroup.get(EMaterialsFormControls.localAgentInformationFormGroup) as FormGroup;
  }

  getServiceDetailsFormArray(): FormArray | null {
    return this._step2Builder.getServiceDetailsFormArray(this._step2FormGroup);
  }

  // Expose sub-form groups for Step 3
  get saudiCompanyDetailsFormGroup(): FormArray | null {
    return this._step3Builder.getSaudiCompanyDetailsFormArray(this._step3FormGroup);
  }

  get collaborationPartnershipFormGroup(): FormArray | null {
    return this._step3Builder.getCollaborationPartnershipFormArray(this._step3FormGroup);
  }

  get entityLevelFormGroup(): FormArray | null {
    return this._step3Builder.getEntityLevelFormArray(this._step3FormGroup);
  }

  get serviceLevelFormGroup(): FormArray | null {
    return this._step3Builder.getServiceLevelFormArray(this._step3FormGroup);
  }

  // Expose sub-form groups for Step 4
  get directLocalizationEntityLevelFormGroup(): FormArray | null {
    return this._step4Builder.getEntityLevelFormArray(this._step4FormGroup);
  }

  get directLocalizationServiceLevelFormGroup(): FormArray | null {
    return this._step4Builder.getServiceLevelFormArray(this._step4FormGroup);
  }

  get attachmentsFormGroup(): FormGroup {
    return this._step4FormGroup.get(EMaterialsFormControls.attachmentsFormGroup) as FormGroup;
  }

  // Step-specific methods delegate to builders

  // Step 1 methods
  createServiceItem(): FormGroup {
    return this._step1Builder.createServiceItem();
  }

  addServiceItem(): void {
    this._step1Builder.addServiceItem(this._step1FormGroup);
  }

  removeServiceItem(index: number): void {
    this._step1Builder.removeServiceItem(this._step1FormGroup, index);
  }

  // Step 2 methods
  toggleLocalAgentInformValidation(value: boolean): void {
    this._step2Builder.toggleLocalAgentInformValidation(this._step2FormGroup, value);
  }

  createServiceDetailItem(): FormGroup {
    return this._step2Builder.createServiceDetailItem();
  }

  addServiceDetailItem(): void {
    this._step2Builder.addServiceDetailItem(this._step2FormGroup);
  }

  removeServiceDetailItem(index: number): void {
    this._step2Builder.removeServiceDetailItem(this._step2FormGroup, index);
  }

  toggleServiceProvidedToCompanyNamesValidation(serviceProvidedTo: string | null, index: number): void {
    this._step2Builder.toggleServiceProvidedToCompanyNamesValidation(this._step2FormGroup, serviceProvidedTo, index);
  }

  toggleExpectedLocalizationDateValidation(serviceTargetedForLocalization: string | boolean | null, index: number): void {
    this._step2Builder.toggleExpectedLocalizationDateValidation(this._step2FormGroup, serviceTargetedForLocalization, index);
  }

  // Step 3 methods
  createSaudiCompanyDetailItem(): FormGroup {
    return this._step3Builder.createSaudiCompanyDetailItem();
  }

  addSaudiCompanyDetailItem(): void {
    this._step3Builder.addSaudiCompanyDetailItem(this._step3FormGroup);
  }

  removeSaudiCompanyDetailItem(index: number): void {
    this._step3Builder.removeSaudiCompanyDetailItem(this._step3FormGroup, index);
  }

  createCollaborationPartnershipItem(): FormGroup {
    return this._step3Builder.createCollaborationPartnershipItem();
  }

  addCollaborationPartnershipItem(): void {
    this._step3Builder.addCollaborationPartnershipItem(this._step3FormGroup);
  }

  removeCollaborationPartnershipItem(index: number): void {
    this._step3Builder.removeCollaborationPartnershipItem(this._step3FormGroup, index);
  }

  createEntityLevelItem(): FormGroup {
    return this._step3Builder.createEntityLevelItem();
  }

  addEntityLevelItem(): void {
    this._step3Builder.addEntityLevelItem(this._step3FormGroup);
  }

  removeEntityLevelItem(index: number): void {
    this._step3Builder.removeEntityLevelItem(this._step3FormGroup, index);
  }

  createServiceLevelItem(): FormGroup {
    return this._step3Builder.createServiceLevelItem();
  }

  addServiceLevelItem(): void {
    this._step3Builder.addServiceLevelItem(this._step3FormGroup);
  }

  removeServiceLevelItem(index: number): void {
    this._step3Builder.removeServiceLevelItem(this._step3FormGroup, index);
  }

  toggleCompanyTypeFieldsValidation(companyTypes: string[], index: number): void {
    this._step3Builder.toggleCompanyTypeFieldsValidation(this._step3FormGroup, companyTypes, index);
  }

  toggleProductsValidation(companyTypes: string[], qualificationStatus: string | null, index: number): void {
    this._step3Builder.toggleProductsValidation(this._step3FormGroup, companyTypes, qualificationStatus, index);
  }

  toggleCompanyOverviewValidation(companyTypes: string[], qualificationStatus: string | null, index: number): void {
    this._step3Builder.toggleCompanyOverviewValidation(this._step3FormGroup, companyTypes, qualificationStatus, index);
  }

  toggleAgreementOtherDetailsValidation(agreementType: string | null, index: number): void {
    this._step3Builder.toggleAgreementOtherDetailsValidation(this._step3FormGroup, agreementType, index);
  }

  toggleAgreementCopyValidation(provideAgreementCopy: string | boolean | null, index: number): void {
    this._step3Builder.toggleAgreementCopyValidation(this._step3FormGroup, provideAgreementCopy, index);
  }

  // Step 4 methods
  createDirectLocalizationEntityLevelItem(): FormGroup {
    return this._step4Builder.createEntityLevelItem();
  }

  addDirectLocalizationEntityLevelItem(): void {
    this._step4Builder.addEntityLevelItem(this._step4FormGroup);
  }

  removeDirectLocalizationEntityLevelItem(index: number): void {
    this._step4Builder.removeEntityLevelItem(this._step4FormGroup, index);
  }

  createDirectLocalizationServiceLevelItem(): FormGroup {
    return this._step4Builder.createServiceLevelItem();
  }

  addDirectLocalizationServiceLevelItem(): void {
    this._step4Builder.addServiceLevelItem(this._step4FormGroup);
  }

  removeDirectLocalizationServiceLevelItem(index: number): void {
    this._step4Builder.removeServiceLevelItem(this._step4FormGroup, index);
  }

  // Helper methods
  getHasCommentControl(formGroup: AbstractControl): FormControl<boolean> {
    if (formGroup instanceof FormGroup) {
      return formGroup.controls[EMaterialsFormControls.hasComment] as FormControl<boolean>;
    }
    throw new Error('Form group is not a valid form group');
  }

  getValueControl(formGroup: AbstractControl): FormControl<any> {
    if (formGroup instanceof FormGroup) {
      return formGroup.controls[EMaterialsFormControls.value] as FormControl<any>;
    }
    throw new Error('Form group is not a valid form group');
  }

  getFormControl(formControl: AbstractControl): FormControl<any> {
    if (formControl instanceof FormControl) {
      return formControl as FormControl<any>;
    }
    throw new Error('Form control is not a valid form control');
  }

  /**
   * Mark all form controls as dirty recursively
   */
  markAllControlsAsDirty(): void {
    this.markControlAsDirty(this._step1FormGroup);
    this.markControlAsDirty(this._step2FormGroup);
    this.markControlAsDirty(this._step3FormGroup);
    this.markControlAsDirty(this._step4FormGroup);
  }

  /**
   * Recursively mark a control and all its nested controls as dirty
   */
  private markControlAsDirty(control: AbstractControl): void {
    if (control instanceof FormGroup) {
      Object.keys(control.controls).forEach(key => {
        this.markControlAsDirty(control.controls[key]);
      });
    } else if (control instanceof FormArray) {
      control.controls.forEach(arrayControl => {
        this.markControlAsDirty(arrayControl);
      });
    } else if (control instanceof FormControl) {
      control.markAsDirty();
      control.updateValueAndValidity();
    }
  }

  /**
   * Check if all forms are valid
   */
  areAllFormsValid(): boolean {
    return this._step1FormGroup.valid &&
      this._step2FormGroup.valid &&
      this._step3FormGroup.valid &&
      this._step4FormGroup.valid;
  }

  /**
   * Reset all form controls to their initial state
   */
  resetAllForms(): void {
    // Reset Step 1: Cover Page
    // Need to clear FormArrays and add back initial items
    const servicesArray = this.getServicesFormArray();
    if (servicesArray) {
      while (servicesArray.length > 0) {
        servicesArray.removeAt(0);
      }
      servicesArray.push(this._step1Builder.createServiceItem());
    }
    this._step1FormGroup.reset();

    // Reset Step 2: Overview
    // Need to clear FormArrays and add back initial items
    const serviceDetailsArray = this.getServiceDetailsFormArray();
    if (serviceDetailsArray) {
      while (serviceDetailsArray.length > 0) {
        serviceDetailsArray.removeAt(0);
      }
      serviceDetailsArray.push(this._step2Builder.createServiceDetailItem());
    }
    this._step2FormGroup.reset();

    // Ensure disabled controls maintain their disabled state and values
    const basicInfo = this.basicInformationFormGroup;
    if (basicInfo) {
      const submissionDateControl = basicInfo.get(EMaterialsFormControls.submissionDate);
      if (submissionDateControl) {
        submissionDateControl.setValue(new Date());
        submissionDateControl.disable({ emitEvent: false });
      }
    }

    // Reset Step 3: Existing Saudi Co.
    // Need to clear FormArrays and add back initial items
    const step3Sections = [
      EMaterialsFormControls.saudiCompanyDetailsFormGroup,
      EMaterialsFormControls.collaborationPartnershipFormGroup,
      EMaterialsFormControls.entityLevelFormGroup,
      EMaterialsFormControls.serviceLevelFormGroup,
    ];

    step3Sections.forEach(sectionName => {
      const sectionArray = this._step3FormGroup.get(sectionName) as FormArray;
      if (sectionArray) {
        // Clear all items
        while (sectionArray.length > 0) {
          sectionArray.removeAt(0);
        }
        // Add back one empty item based on section type
        if (sectionName === EMaterialsFormControls.saudiCompanyDetailsFormGroup) {
          sectionArray.push(this._step3Builder.createSaudiCompanyDetailItem());
        } else if (sectionName === EMaterialsFormControls.collaborationPartnershipFormGroup) {
          sectionArray.push(this._step3Builder.createCollaborationPartnershipItem());
        } else if (sectionName === EMaterialsFormControls.entityLevelFormGroup) {
          sectionArray.push(this._step3Builder.createEntityLevelItem());
        } else if (sectionName === EMaterialsFormControls.serviceLevelFormGroup) {
          sectionArray.push(this._step3Builder.createServiceLevelItem());
        }
      }
    });

    // Reset Step 4: Direct Localization
    // Need to clear FormArrays and add back initial items
    const step4Sections = [
      EMaterialsFormControls.entityLevelFormGroup,
      EMaterialsFormControls.serviceLevelFormGroup,
    ];

    step4Sections.forEach(sectionName => {
      const sectionArray = this._step4FormGroup.get(sectionName) as FormArray;
      if (sectionArray) {
        // Clear all items
        while (sectionArray.length > 0) {
          sectionArray.removeAt(0);
        }
        // Add back one empty item based on section type
        if (sectionName === EMaterialsFormControls.entityLevelFormGroup) {
          sectionArray.push(this._step4Builder.createEntityLevelItem());
        } else if (sectionName === EMaterialsFormControls.serviceLevelFormGroup) {
          sectionArray.push(this._step4Builder.createServiceLevelItem());
        }
      }
    });

    this._step4FormGroup.reset();

    // Mark all forms as pristine and untouched
    this._step1FormGroup.markAsPristine();
    this._step1FormGroup.markAsUntouched();
    this._step2FormGroup.markAsPristine();
    this._step2FormGroup.markAsUntouched();
    this._step3FormGroup.markAsPristine();
    this._step3FormGroup.markAsUntouched();
    this._step4FormGroup.markAsPristine();
    this._step4FormGroup.markAsUntouched();
  }

  /* ------------------------------------------------ */
}

