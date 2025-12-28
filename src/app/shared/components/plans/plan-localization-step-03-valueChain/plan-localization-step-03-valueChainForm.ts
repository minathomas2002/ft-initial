import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductPlanFormService } from 'src/app/shared/services/plan/materials-form-service/product-plan-form-service';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { BaseErrorMessages } from '../../base-components/base-error-messages/base-error-messages';
import { FormArrayInput } from '../../utility-components/form-array-input/form-array-input';
import { GroupInputWithCheckbox } from '../../form/group-input-with-checkbox/group-input-with-checkbox';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { ValueChainSummaryComponent } from './value-chain-summary/value-chain-summary.component';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { JsonPipe } from '@angular/common';
import { TrimOnBlurDirective } from 'src/app/shared/directives';

@Component({
  selector: 'app-plan-localization-step-03-valueChain-form',
  imports: [
    ReactiveFormsModule,
    BaseErrorMessages,
    FormArrayInput,
    GroupInputWithCheckbox,
    SelectModule,
    InputNumberModule,
    InputTextModule,
    TooltipModule,
    ButtonModule,
    ValueChainSummaryComponent,
    BaseErrorMessages,
    TrimOnBlurDirective
  ],
  templateUrl: './plan-localization-step-03-valueChainForm.html',
  styleUrl: './plan-localization-step-03-valueChainForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanLocalizationStep03ValueChainForm {

  isViewMode = input<boolean>(false);
  private readonly productPlanFormService = inject(ProductPlanFormService);
  private readonly planStore = inject(PlanStore);

  formGroup = this.productPlanFormService.step3_valueChain;
  readonly EMaterialsFormControls = EMaterialsFormControls;

  // Dropdown options
  inHouseOrProcuredOptions = this.planStore.inHouseProcuredOptions;
  localizationStatusOptions = this.planStore.localizationStatusOptions;

  // Show checkbox signal (controls visibility of comment checkboxes)
  showCheckbox = signal(false);

  // Helper methods - delegate to ProductPlanFormService
  getValueControl(formGroup: AbstractControl): FormControl<any> {
    return this.productPlanFormService.getValueControl(formGroup);
  }

  getHasCommentControl(formGroup: AbstractControl): FormControl<boolean> {
    return this.productPlanFormService.getHasCommentControl(formGroup);
  }

  // Get section FormArrays
  getDesignEngineeringFormArray(): FormArray | null {
    return this.productPlanFormService.getValueChainSectionFormArray(EMaterialsFormControls.designEngineeringFormGroup);
  }

  getSourcingFormArray(): FormArray | null {
    return this.productPlanFormService.getValueChainSectionFormArray(EMaterialsFormControls.sourcingFormGroup);
  }

  getManufacturingFormArray(): FormArray | null {
    return this.productPlanFormService.getValueChainSectionFormArray(EMaterialsFormControls.manufacturingFormGroup);
  }

  getAssemblyTestingFormArray(): FormArray | null {
    return this.productPlanFormService.getValueChainSectionFormArray(EMaterialsFormControls.assemblyTestingFormGroup);
  }

  getAfterSalesFormArray(): FormArray | null {
    return this.productPlanFormService.getValueChainSectionFormArray(EMaterialsFormControls.afterSalesFormGroup);
  }

  // Factory functions for creating new items (used by form-array-input component)
  createDesignEngineeringItem = (): FormGroup => {
    return this.productPlanFormService.createValueChainItem();
  };

  createSourcingItem = (): FormGroup => {
    return this.productPlanFormService.createValueChainItem();
  };

  createManufacturingItem = (): FormGroup => {
    return this.productPlanFormService.createValueChainItem();
  };

  createAssemblyTestingItem = (): FormGroup => {
    return this.productPlanFormService.createValueChainItem();
  };

  createAfterSalesItem = (): FormGroup => {
    return this.productPlanFormService.createValueChainItem();
  };
}

