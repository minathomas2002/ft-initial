import { DestroyRef, inject, Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  private readonly _destroyRef = inject(DestroyRef);

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

  constructor() {
    // Keep all downstream service-name usages in sync with cover page services.
    this.syncServicesFromCoverPageToOverview();
    this.syncServicesFromCoverPageToExistingSaudi();
    this.syncServicesFromCoverPageToDirectLocalization();

    const servicesArray = this.getServicesFormArray();
    servicesArray?.valueChanges
      ?.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this.syncServicesFromCoverPageToOverview();
        this.syncServicesFromCoverPageToExistingSaudi();
        this.syncServicesFromCoverPageToDirectLocalization();
      });
  }

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

  syncServicesFromCoverPageToOverview(): void {
    const servicesArray = this.getServicesFormArray();
    if (servicesArray) {
      this._step2Builder.syncServicesFromCoverPage(this._step2FormGroup, servicesArray);
    }
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

  syncServicesFromCoverPageToExistingSaudi(): void {
    const servicesArray = this.getServicesFormArray();
    if (servicesArray) {
      this._step3Builder.syncServicesFromCoverPage(this._step3FormGroup, servicesArray);
    }
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

  toggleLocalizationApproachOtherDetailsValidation(localizationApproach: string | null, index: number): void {
    this._step4Builder.toggleLocalizationApproachOtherDetailsValidation(this._step4FormGroup, localizationApproach, index);
  }

  toggleLocationOtherDetailsValidation(location: string | null, index: number): void {
    this._step4Builder.toggleLocationOtherDetailsValidation(this._step4FormGroup, location, index);
  }

  toggleProprietaryToolsSystemsDetailsValidation(willBeAnyProprietaryToolsSystems: string | boolean | null, index: number): void {
    this._step4Builder.toggleProprietaryToolsSystemsDetailsValidation(this._step4FormGroup, willBeAnyProprietaryToolsSystems, index);
  }

  syncServicesFromCoverPageToDirectLocalization(): void {
    const servicesArray = this.getServicesFormArray();
    if (servicesArray) {
      this._step4Builder.syncServicesFromCoverPage(this._step4FormGroup, servicesArray);
    }
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
  markAllControlsAsDirty(options?: { includeExistingSaudi?: boolean; includeDirectLocalization?: boolean }): void {
    const includeExistingSaudi = options?.includeExistingSaudi ?? true;
    const includeDirectLocalization = options?.includeDirectLocalization ?? true;

    // Mark controls (deep) so validation messages become visible.
    // Then force an emitting validity update on each root form so stepper badges
    // (which listen to value/status changes) recompute even if the user never
    // interacted with a step.
    const rootForms = [
      this._step1FormGroup,
      this._step2FormGroup,
      ...(includeExistingSaudi ? [this._step3FormGroup] : []),
      ...(includeDirectLocalization ? [this._step4FormGroup] : []),
    ];

    rootForms.forEach((fg) => {
      this.markControlAsDirty(fg);
      fg.markAllAsTouched();
      fg.updateValueAndValidity({ emitEvent: true });
    });
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
  areAllFormsValid(options?: { includeExistingSaudi?: boolean; includeDirectLocalization?: boolean }): boolean {
    const includeExistingSaudi = options?.includeExistingSaudi ?? true;
    const includeDirectLocalization = options?.includeDirectLocalization ?? true;

    return (
      this._step1FormGroup.valid &&
      this._step2FormGroup.valid &&
      (!includeExistingSaudi || this._step3FormGroup.valid) &&
      (!includeDirectLocalization || this._step4FormGroup.valid)
    );
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

  /**
   * Generate quarters for future years only (from current quarter onwards)
   * @param yearsAhead Number of years to include in the future (default 5)
   * @returns Array of quarter options with id and name
   */
  getAvailableQuarters(yearsAhead: number = 5): { id: string; name: string }[] {
    const quarters: { id: string; name: string }[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3) + 1;

    for (let yearOffset = 0; yearOffset <= yearsAhead; yearOffset++) {
      const year = currentYear + yearOffset;
      const startQuarter = yearOffset === 0 ? currentQuarter : 1;

      for (let quarter = startQuarter; quarter <= 4; quarter++) {
        const quarterLabel = `Q${quarter} ${year}`;
        quarters.push({
          id: quarterLabel,
          name: quarterLabel,
        });
      }
    }

    return quarters;
  }

  /**
   * Generate quarters including past years
   * @param yearsPast Number of past years to include (default 5)
   * @param yearsFuture Number of future years to include (default 5)
   * @returns Array of quarter options with id and name (sorted most recent first)
   */
  getAvailableQuartersWithPast(yearsPast: number = 5, yearsFuture: number = 5): { id: string; name: string }[] {
    const quarters: { id: string; name: string }[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3) + 1;

    for (let yearOffset = -yearsPast; yearOffset <= yearsFuture; yearOffset++) {
      const year = currentYear + yearOffset;
      const startQuarter = 1;
      const endQuarter = yearOffset === 0 ? currentQuarter : 4;

      for (let quarter = startQuarter; quarter <= endQuarter; quarter++) {
        const quarterLabel = `Q${quarter} ${year}`;
        quarters.push({
          id: quarterLabel,
          name: quarterLabel,
        });
      }
    }

    return quarters.reverse();
  }

  /**
   * Generate an array of upcoming years (inclusive of startYear)
   * @param count Number of years to generate (default 5)
   * @param startYear Starting year (default current year)
   */
  upcomingYears(count = 5, startYear = new Date().getFullYear()): number[] {
    const years: number[] = [];
    for (let i = 0; i < count; i++) {
      years.push(startYear + i);
    }
    return years;
  }
}

