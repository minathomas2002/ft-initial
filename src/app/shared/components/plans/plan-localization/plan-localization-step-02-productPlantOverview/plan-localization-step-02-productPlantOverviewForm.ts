import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { GroupInputWithCheckbox } from 'src/app/shared/components/form/group-input-with-checkbox/group-input-with-checkbox';
import { EMaterialsFormControls, ETargetedCustomer } from 'src/app/shared/enums';
import { toSignal } from '@angular/core/rxjs-interop';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { InputNumberModule } from 'primeng/inputnumber';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { TrimOnBlurDirective } from 'src/app/shared/directives';

@Component({
  selector: 'app-plan-localization-step-02-product-plant-overview-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    RadioButtonModule,
    GroupInputWithCheckbox,
    BaseErrorMessages,
    TextareaModule,
    TooltipModule,
    InputNumberModule,
    BaseErrorMessages,
    BaseLabelComponent,
    TrimOnBlurDirective
  ],
  templateUrl: './plan-localization-step-02-productPlantOverviewForm.html',
  styleUrl: './plan-localization-step-02-productPlantOverviewForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanLocalizationStep02ProductPlantOverviewForm {
  private readonly productPlanFormService = inject(ProductPlanFormService);
  private readonly planStore = inject(PlanStore)

  // Expose enum to template
  readonly EMaterialsFormControls = EMaterialsFormControls;

  formGroup = this.productPlanFormService.step2_productPlantOverview;
  showCheckbox = signal(false);

  // Form group accessors
  get overviewFormGroupControls() {
    return this.productPlanFormService.overviewFormGroup.controls;
  }

  get expectedCAPEXInvestmentFormGroupControls() {
    return this.productPlanFormService.expectedCAPEXInvestmentFormGroup.controls;
  }

  get targetCustomersFormGroupControls() {
    return this.productPlanFormService.targetCustomersFormGroup.controls;
  }

  get productManufacturingExperienceFormGroupControls() {
    return this.productPlanFormService.productManufacturingExperienceFormGroup.controls;
  }

  // Form control signals
  private provideToSECControl = this.getFormControl(
    this.productManufacturingExperienceFormGroupControls[EMaterialsFormControls.provideToSEC]
  );
  private provideToSECSignal = toSignal(
    this.provideToSECControl.valueChanges,
    {
      initialValue: this.provideToSECControl.value
    }
  );

  private provideToLocalSuppliersControl = this.getFormControl(
    this.productManufacturingExperienceFormGroupControls[EMaterialsFormControls.provideToLocalSuppliers]
  );
  private provideToLocalSuppliersSignal = toSignal(
    this.provideToLocalSuppliersControl.valueChanges,
    {
      initialValue: this.provideToLocalSuppliersControl.value
    }
  );

  private targetedCustomerControl = this.getValueControl(
    this.targetCustomersFormGroupControls[EMaterialsFormControls.targetedCustomer]
  );
  private targetedCustomerSignal = toSignal(
    this.targetedCustomerControl.valueChanges,
    {
      initialValue: this.targetedCustomerControl.value
    }
  );

  private othersPercentageControl = this.getValueControl(
    this.expectedCAPEXInvestmentFormGroupControls[EMaterialsFormControls.othersPercentage]
  );
  private othersPercentageSignal = toSignal(
    this.othersPercentageControl.valueChanges,
    {
      initialValue: this.othersPercentageControl.value
    }
  );

  // Conditional visibility computed signals
  showSECFields = computed(() => {
    return this.provideToSECSignal() === true;
  });

  showLocalSuppliersFields = computed(() => {
    return this.provideToLocalSuppliersSignal() === true;
  });

  showTargetedSuppliersFields = computed(() => {
    const value = this.targetedCustomerSignal();
    return value?.includes(ETargetedCustomer.SEC_APPROVED_LOCAL_SUPPLIERS.toString()) || false;
  });

  showOthersDescription = computed(() => {
    const value = this.othersPercentageSignal();
    return value !== null && value > 0;
  });

  constructor() {
    // Effect to handle validation toggles
    effect(() => {
      const provideToSECValue = this.provideToSECSignal();
      this.productPlanFormService.toggleSECFieldsValidation(provideToSECValue === true);
    });

    effect(() => {
      const provideToLocalSuppliersValue = this.provideToLocalSuppliersSignal();
      this.productPlanFormService.toggleLocalSuppliersFieldsValidation(provideToLocalSuppliersValue === true);
    });

    effect(() => {
      const targetedCustomerValue = this.targetedCustomerSignal();
      this.productPlanFormService.toggleTargetedSuppliersFieldsValidation(targetedCustomerValue || []);
    });

    effect(() => {
      const othersPercentageValue = this.othersPercentageSignal();
      this.productPlanFormService.toggleOthersDescriptionValidation(othersPercentageValue);
    });
  }

  // Helper methods - delegate to service
  getHasCommentControl(formGroup: AbstractControl): FormControl<boolean> {
    return this.productPlanFormService.getHasCommentControl(formGroup);
  }

  getValueControl(formGroup: AbstractControl): FormControl<any> {
    return this.productPlanFormService.getValueControl(formGroup);
  }

  getFormControl(formControl: AbstractControl): FormControl<any> {
    return this.productPlanFormService.getFormControl(formControl);
  }

  // Dropdown options
  targetedCustomerOptions = this.planStore.targetedCustomerOptions;
  productManufacturingExperienceOptions = this.planStore.productManufacturingExperienceOptions;
}

