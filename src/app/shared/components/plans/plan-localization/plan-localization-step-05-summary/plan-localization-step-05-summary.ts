import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, input, output, signal } from '@angular/core';
import { ProductPlanFormService } from 'src/app/shared/services/plan/materials-form-service/product-plan-form-service';
import { ProductPlanValidationService, IStepValidationErrors } from 'src/app/shared/services/plan/validation/product-plan-validation.service';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { SummarySectionOverview } from './summary-sections/summary-section-overview/summary-section-overview';
import { SummarySectionProductPlant } from './summary-sections/summary-section-product-plant/summary-section-product-plant';
import { SummarySectionValueChain } from './summary-sections/summary-section-value-chain/summary-section-value-chain';
import { SummarySectionSaudization } from './summary-sections/summary-section-saudization/summary-section-saudization';
import { SummarySectionSignature } from './summary-sections/summary-section-signature/summary-section-signature';
import { Signature } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-plan-localization-step-05-summary',
  imports: [
    SummarySectionOverview,
    SummarySectionProductPlant,
    SummarySectionValueChain,
    SummarySectionSaudization,
    SummarySectionSignature,
  ],
  templateUrl: './plan-localization-step-05-summary.html',
  styleUrl: './plan-localization-step-05-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanLocalizationStep05Summary {
  isViewMode = input<boolean>(false);
  signature = input<Signature | null>(null);
  private readonly formService = inject(ProductPlanFormService);
  private readonly validationService = inject(ProductPlanValidationService);
  private readonly toasterService = inject(ToasterService);
  private readonly changeDetectionRef = inject(ChangeDetectorRef);
  private readonly i18nService = inject(I18nService);

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

    // Trigger change detection to update the DOM with validation errors
    this.changeDetectionRef.markForCheck();

    // Check if there are any errors
    if (this.validationService.hasAnyErrors(errors)) {
      // Block submission and show error message
      this.toasterService.error(this.i18nService.translate('plans.wizard.messages.fixHighlightedSections'));
      return;
    }
    // If no errors, proceed with submission
    this.onSubmit.emit();
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

}
