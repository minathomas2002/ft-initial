import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { Step1OverviewFormBuilder } from './steps/step1-overview.form-builder';
import { Step2ProductPlantOverviewFormBuilder } from './steps/step2-product-plant-overview.form-builder';

@Injectable({
  providedIn: 'root'
})
export class MaterialsFormService {
  private readonly _fb = inject(FormBuilder);
  private readonly _planStore = inject(PlanStore);

  // Step builders
  private readonly _step1Builder = new Step1OverviewFormBuilder(this._fb, this._planStore.newPlanTitle());
  private readonly _step2Builder = new Step2ProductPlantOverviewFormBuilder(this._fb);
  // TODO: Add step 3, 4 builders when implemented
  // private readonly _step3Builder = new Step3FormBuilder(this._fb, this._planStore);
  // private readonly _step4Builder = new Step4FormBuilder(this._fb, this._planStore);

  // Step 1: Overview Company Information
  private readonly _step1FormGroup = this._step1Builder.buildStep1FormGroup();

  // Step 2: Product & Plant Overview
  private readonly _step2FormGroup = this._step2Builder.buildStep2FormGroup();

  // Expose step 1 form group
  step1_overviewCompanyInformation = this._step1FormGroup;

  // Expose step 2 form group
  step2_productPlantOverview = this._step2FormGroup;

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

  // TODO: Add step 3, 4 form groups when implemented
  // step3_... = this._step3Builder.buildStep3FormGroup();
  // step4_... = this._step4Builder.buildStep4FormGroup();

  /* ------------------------------------------------ */
}
