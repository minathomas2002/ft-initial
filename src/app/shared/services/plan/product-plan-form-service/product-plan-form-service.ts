import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { EMaterialsFormControls, EOpportunityType } from 'src/app/shared/enums';
import { PlanLocalizationStep1OverviewFormBuilder } from './steps/plan-localization-step1-overview.form-builder';
import { PlanLocalizationStep2ProductPlantOverviewFormBuilder } from './steps/plan-localization-step2-product-plant-overview.form-builder';
import { PlanLocalizationStep3ValueChainFormBuilder } from './steps/plan-localization-step3-value-chain.form-builder';
import { PlanLocalizationStep4SaudizationFormBuilder } from './steps/plan-localization-step4-saudization.form-builder';

@Injectable({
  providedIn: 'root'
})
export class ProductPlanFormService {
  private readonly _fb = inject(FormBuilder);
  private readonly _planStore = inject(PlanStore);
  private initialFormValue!: any;
  
  // Step builders
  private readonly _step1Builder = new PlanLocalizationStep1OverviewFormBuilder(this._fb, this._planStore.newPlanTitle());
  private readonly _step2Builder = new PlanLocalizationStep2ProductPlantOverviewFormBuilder(this._fb);
  private readonly _step3Builder = new PlanLocalizationStep3ValueChainFormBuilder(this._fb);
  private readonly _step4Builder = new PlanLocalizationStep4SaudizationFormBuilder(this._fb);

  // Step 1: Overview Company Information
  private readonly _step1FormGroup = this._step1Builder.buildStep1FormGroup();

  // Step 2: Product & Plant Overview
  private readonly _step2FormGroup = this._step2Builder.buildStep2FormGroup();

  // Step 3: Value Chain
  private readonly _step3FormGroup = this._step3Builder.buildStep3FormGroup();

  // Step 4: Saudization
  private readonly _step4FormGroup = this._step4Builder.buildStep4FormGroup();

  // Expose step 1 form group
  step1_overviewCompanyInformation = this._step1FormGroup;

  // Expose step 2 form group
  step2_productPlantOverview = this._step2FormGroup;

  // Expose step 3 form group
  step3_valueChain = this._step3FormGroup;

  // Expose step 4 form group
  step4_saudization = this._step4FormGroup;

  // Alias for backward compatibility
  overviewCompanyInformation = this._step1FormGroup;

  // Expose sub-form groups for backward compatibility and convenience
  get basicInformationFormGroup(): FormGroup {
    return this._step1FormGroup.get(EMaterialsFormControls.basicInformationFormGroup) as FormGroup;
  }

  get companyInformationFormGroup(): FormGroup {
    return this._step1FormGroup.get(EMaterialsFormControls.companyInformationFormGroup) as FormGroup;
  }

  get locationInformationFormGroup(): FormGroup {
    return this._step1FormGroup.get(EMaterialsFormControls.locationInformationFormGroup) as FormGroup;
  }

  get localAgentInformationFormGroup(): FormGroup {
    return this._step1FormGroup.get(EMaterialsFormControls.localAgentInformationFormGroup) as FormGroup;
  }

  // Step-specific methods delegate to builders
  toggleLocalAgentInformValidation(value: boolean): void {
    this._step1Builder.toggleLocalAgentInformValidation(this._step1FormGroup, value);
  }

  // Step 2 methods
  toggleSECFieldsValidation(provideToSEC: boolean): void {
    this._step2Builder.toggleSECFieldsValidation(this._step2FormGroup, provideToSEC);
  }

  toggleLocalSuppliersFieldsValidation(provideToLocalSuppliers: boolean): void {
    this._step2Builder.toggleLocalSuppliersFieldsValidation(this._step2FormGroup, provideToLocalSuppliers);
  }

  toggleOthersDescriptionValidation(othersPercentage: number | null): void {
    this._step2Builder.toggleOthersDescriptionValidation(this._step2FormGroup, othersPercentage);
  }

  toggleTargetedSuppliersFieldsValidation(targetedCustomers: string[]): void {
    this._step2Builder.toggleTargetedSuppliersFieldsValidation(this._step2FormGroup, targetedCustomers);
  }

  // Expose Step 2 sub-form groups for convenience
  get overviewFormGroup(): FormGroup {
    return this._step2FormGroup.get(EMaterialsFormControls.overviewFormGroup) as FormGroup;
  }

  get expectedCAPEXInvestmentFormGroup(): FormGroup {
    return this._step2FormGroup.get(EMaterialsFormControls.expectedCAPEXInvestmentFormGroup) as FormGroup;
  }

  get targetCustomersFormGroup(): FormGroup {
    return this._step2FormGroup.get(EMaterialsFormControls.targetCustomersFormGroup) as FormGroup;
  }

  get productManufacturingExperienceFormGroup(): FormGroup {
    return this._step2FormGroup.get(EMaterialsFormControls.productManufacturingExperienceFormGroup) as FormGroup;
  }

  // Expose Step 3 sub-form groups for convenience
  get designEngineeringFormGroup(): FormGroup {
    return this._step3FormGroup.get(EMaterialsFormControls.designEngineeringFormGroup) as FormGroup;
  }

  get sourcingFormGroup(): FormGroup {
    return this._step3FormGroup.get(EMaterialsFormControls.sourcingFormGroup) as FormGroup;
  }

  get manufacturingFormGroup(): FormGroup {
    return this._step3FormGroup.get(EMaterialsFormControls.manufacturingFormGroup) as FormGroup;
  }

  get assemblyTestingFormGroup(): FormGroup {
    return this._step3FormGroup.get(EMaterialsFormControls.assemblyTestingFormGroup) as FormGroup;
  }

  get afterSalesFormGroup(): FormGroup {
    return this._step3FormGroup.get(EMaterialsFormControls.afterSalesFormGroup) as FormGroup;
  }

  // Step 3 methods
  addValueChainItem(sectionName: string): void {
    this._step3Builder.addItemToSection(this._step3FormGroup, sectionName);
  }

  removeValueChainItem(sectionName: string, index: number): void {
    this._step3Builder.removeItemFromSection(this._step3FormGroup, sectionName, index);
  }

  getValueChainSectionFormArray(sectionName: string): FormArray | null {
    return this._step3Builder.getSectionFormArray(this._step3FormGroup, sectionName);
  }

  calculateYearTotalLocalization(year: number): number {
    return this._step3Builder.calculateYearTotalLocalization(this._step3FormGroup, year);
  }

  calculateSectionTotalCostPercentage(sectionName: string): number {
    return this._step3Builder.calculateSectionTotalCostPercentage(this._step3FormGroup, sectionName);
  }

  createValueChainItem(): FormGroup {
    return this._step3Builder.createValueChainItemFormGroup();
  }

  // Expose Step 4 sub-form groups for convenience
  get saudizationFormGroup(): FormGroup {
    return this._step4FormGroup.get(EMaterialsFormControls.saudizationFormGroup) as FormGroup;
  }

  get attachmentsFormGroup(): FormGroup {
    return this._step4FormGroup.get(EMaterialsFormControls.attachmentsFormGroup) as FormGroup;
  }

  // Step 4 methods
  getYearFormGroup(year: number): FormGroup | null {
    return this._step4Builder.getYearFormGroup(this.saudizationFormGroup, year);
  }

  getRowValueForYear(year: number, rowName: string): any {
    return this._step4Builder.getRowValueForYear(this.saudizationFormGroup, year, rowName);
  }

  getRowHasErrorForYear(year: number, rowName: string): any {
    return this._step4Builder.getRowHasErrorForYear(this.saudizationFormGroup, year, rowName);
  }

  setRowValueForYear(year: number, rowName: string, value: any): void {
    this._step4Builder.setRowValueForYear(this.saudizationFormGroup, year, rowName, value);
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
    // Get current plan title from store
    const currentPlanTitle = this._planStore.newPlanTitle();

    // Reset Step 1: Overview Company Information
    this._step1FormGroup.reset();

    // Update plan title from store after reset
    if (currentPlanTitle) {
      const basicInfoFormGroup = this.basicInformationFormGroup;
      if (basicInfoFormGroup) {
        const planTitleControl = basicInfoFormGroup.get(EMaterialsFormControls.planTitle);
        if (planTitleControl) {
          planTitleControl.setValue(currentPlanTitle);
        }
      }
    }

    // Ensure disabled controls maintain their disabled state and values
    const basicInfo = this.basicInformationFormGroup;
    if (basicInfo) {
      const opportunityTypeControl = basicInfo.get(EMaterialsFormControls.opportunityType);
      if (opportunityTypeControl) {
        // Always set value and disable for create mode
        opportunityTypeControl.setValue(EOpportunityType.PRODUCT.toString());
        opportunityTypeControl.disable({ emitEvent: false });
      }
      const submissionDateControl = basicInfo.get(EMaterialsFormControls.submissionDate);
      if (submissionDateControl) {
        // Always set value and disable for create mode
        submissionDateControl.setValue(new Date());
        submissionDateControl.disable({ emitEvent: false });
      }
    }

    // Reset Step 2: Product & Plant Overview
    this._step2FormGroup.reset();

    // Reset Step 3: Value Chain
    // Need to clear FormArrays and add back initial items
    const step3Sections = [
      EMaterialsFormControls.designEngineeringFormGroup,
      EMaterialsFormControls.sourcingFormGroup,
      EMaterialsFormControls.manufacturingFormGroup,
      EMaterialsFormControls.assemblyTestingFormGroup,
      EMaterialsFormControls.afterSalesFormGroup,
    ];

    step3Sections.forEach(sectionName => {
      const sectionFormGroup = this._step3FormGroup.get(sectionName) as FormGroup;
      if (sectionFormGroup) {
        const itemsArray = sectionFormGroup.get('items') as FormArray;
        if (itemsArray) {
          // Clear all items
          while (itemsArray.length > 0) {
            itemsArray.removeAt(0);
          }
          // Add back one empty item
          itemsArray.push(this._step3Builder.createValueChainItemFormGroup());
        }
      }
    });

    // Reset Step 4: Saudization
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


  private getAllFormsRawValue() {
    return {
      step1: this._step1FormGroup.getRawValue(),
      step2: this._step2FormGroup.getRawValue(),
      step3: this._step3FormGroup.getRawValue(),
      step4: this._step4FormGroup.getRawValue(),
    };
  }

  initiateFormValue():void{
    this.initialFormValue = this.getAllFormsRawValue();
  }

  
  hasFormChanged(): boolean {
  return JSON.stringify(this.initialFormValue) !==
          JSON.stringify(this.getAllFormsRawValue());
  }

  /* ------------------------------------------------ */
}
