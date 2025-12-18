import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { ProductPlanFormService } from 'src/app/shared/services/plan/materials-form-service/product-plan-form-service';
import { ProductPlanValidationService, IStepValidationErrors } from 'src/app/shared/services/plan/validation/product-plan-validation.service';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { SummarySectionOverview } from './summary-sections/summary-section-overview/summary-section-overview';
import { SummarySectionProductPlant } from './summary-sections/summary-section-product-plant/summary-section-product-plant';
import { SummarySectionValueChain } from './summary-sections/summary-section-value-chain/summary-section-value-chain';
import { SummarySectionSaudization } from './summary-sections/summary-section-saudization/summary-section-saudization';

@Component({
  selector: 'app-step-05-summary',
  imports: [
    SummarySectionOverview,
    SummarySectionProductPlant,
    SummarySectionValueChain,
    SummarySectionSaudization,
  ],
  templateUrl: './step-05-summary.html',
  styleUrl: './step-05-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Step05Summary {
  private readonly formService = inject(ProductPlanFormService);
  private readonly validationService = inject(ProductPlanValidationService);
  private readonly toasterService = inject(ToasterService);

  onEditStep = output<number>();
  onSubmit = output<void>();
  onValidationErrorsChange = output<Map<number, IStepValidationErrors>>();

  // Validation errors state
  validationErrors = signal<Map<number, IStepValidationErrors>>(new Map());

  // Computed signals for error states
  hasAnyErrors = computed(() => {
    return this.validationService.hasAnyErrors(this.validationErrors());
  });

  hasStep1Errors = computed(() => {
    return this.validationService.hasStepErrors(this.validationErrors(), 1);
  });

  hasStep2Errors = computed(() => {
    return this.validationService.hasStepErrors(this.validationErrors(), 2);
  });

  hasStep3Errors = computed(() => {
    return this.validationService.hasStepErrors(this.validationErrors(), 3);
  });

  hasStep4Errors = computed(() => {
    return this.validationService.hasStepErrors(this.validationErrors(), 4);
  });

  // Form groups
  step1FormGroup = this.formService.step1_overviewCompanyInformation;
  step2FormGroup = this.formService.step2_productPlantOverview;
  step3FormGroup = this.formService.step3_valueChain;
  step4FormGroup = this.formService.step4_saudization;

  /**
   * Handles edit button click for a specific step
   */
  onEditStepClick(stepNumber: number): void {
    // Mark the step's form as touched to show errors when navigating
    this.markStepAsTouched(stepNumber);
    this.onEditStep.emit(stepNumber);
  }

  /**
   * Handles submit button click
   */
  onSubmitClick(): void {
    // Mark all fields as touched to trigger validation
    this.validationService.markAllFieldsAsTouched();

    // Validate all forms
    const errors = this.validationService.validateAllForms();
    this.validationErrors.set(errors);

    // Notify parent component of validation errors for stepper indicators
    this.onValidationErrorsChange.emit(errors);

    // Check if there are any errors
    if (this.validationService.hasAnyErrors(errors)) {
      // Block submission and show error message
      this.toasterService.error('Please correct the highlighted sections before submitting.');
      return;
    }

    // If no errors, proceed with submission
    this.onSubmit.emit();
  }

  /**
   * Marks a specific step's form as touched
   */
  private markStepAsTouched(stepNumber: number): void {
    switch (stepNumber) {
      case 1:
        this.markFormGroupAsTouched(this.step1FormGroup);
        break;
      case 2:
        this.markFormGroupAsTouched(this.step2FormGroup);
        break;
      case 3:
        this.markFormGroupAsTouched(this.step3FormGroup);
        break;
      case 4:
        this.markFormGroupAsTouched(this.step4FormGroup);
        break;
    }
  }

  /**
   * Marks a form group and all nested controls as touched
   */
  private markFormGroupAsTouched(formGroup: any): void {
    if (!formGroup || !formGroup.markAsTouched) {
      return;
    }

    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        if (control.controls) {
          // It's a FormGroup or FormArray
          this.markFormGroupAsTouched(control);
        } else {
          control.markAsTouched();
        }
      }
    });
    formGroup.markAsTouched();
  }

  /**
   * Gets validation errors for a specific step
   */
  getStepErrors(stepNumber: number): IStepValidationErrors | undefined {
    return this.validationService.getStepErrors(this.validationErrors(), stepNumber);
  }
}
