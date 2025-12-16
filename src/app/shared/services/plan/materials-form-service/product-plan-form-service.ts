import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { Step1OverviewFormBuilder } from './steps/step1-overview.form-builder';
import { Step2ProductPlantOverviewFormBuilder } from './steps/step2-product-plant-overview.form-builder';
import { Step3ValueChainFormBuilder } from './steps/step3-value-chain.form-builder';
import { Step4SaudizationFormBuilder } from './steps/step4-saudization.form-builder';

@Injectable({
  providedIn: 'root'
})
export class ProductPlanFormService {
  private readonly _fb = inject(FormBuilder);
  private readonly _planStore = inject(PlanStore);

  // Step builders
  private readonly _step1Builder = new Step1OverviewFormBuilder(this._fb, this._planStore.newPlanTitle());
  private readonly _step2Builder = new Step2ProductPlantOverviewFormBuilder(this._fb);
  private readonly _step3Builder = new Step3ValueChainFormBuilder(this._fb);
  private readonly _step4Builder = new Step4SaudizationFormBuilder(this._fb);

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
  addValueChainItem(sectionName: string, includeYears: boolean = true): void {
    this._step3Builder.addItemToSection(this._step3FormGroup, sectionName, includeYears);
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

  createValueChainItem(includeYears: boolean = true): FormGroup {
    return this._step3Builder.createValueChainItemFormGroup(includeYears);
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

  /* ------------------------------------------------ */
}
