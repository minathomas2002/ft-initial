import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, input, output, signal } from '@angular/core';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { ServicePlanValidationService, IStepValidationErrors } from 'src/app/shared/services/plan/validation/service-plan-validation.service';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { SummarySectionCoverPage } from './summary-sections/summary-section-cover-page/summary-section-cover-page';
import { SummarySectionOverview } from './summary-sections/summary-section-overview/summary-section-overview';
import { SummarySectionExistingSaudi } from './summary-sections/summary-section-existing-saudi/summary-section-existing-saudi';
import { SummarySectionDirectLocalization } from './summary-sections/summary-section-direct-localization/summary-section-direct-localization';
import { SummarySectionSignature } from './summary-sections/summary-section-signature/summary-section-signature';
import { Signature, IPageComment } from 'src/app/shared/interfaces/plans.interface';
import { PageCommentBox } from '../../page-comment-box/page-comment-box';

@Component({
  selector: 'app-service-localization-step-summary',
  imports: [
    SummarySectionCoverPage,
    SummarySectionOverview,
    SummarySectionExistingSaudi,
    SummarySectionDirectLocalization,
    SummarySectionSignature,
    PageCommentBox,
  ],
  templateUrl: './service-localization-step-summary.html',
  styleUrl: './service-localization-step-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceLocalizationStepSummary {
  isViewMode = input<boolean>(false);
  commentTitle = input<string>('Comments');
  signature = input<Signature | null>(null);
  includeExistingSaudi = input<boolean>(true);
  includeDirectLocalization = input<boolean>(true);

  // Wizard step numbers (can shift when optional steps are hidden)
  coverStepNumber = input<number>(1);
  overviewStepNumber = input<number>(2);
  existingSaudiStepNumber = input<number>(3);
  directLocalizationStepNumber = input<number>(4);

  private readonly formService = inject(ServicePlanFormService);
  private readonly validationService = inject(ServicePlanValidationService);
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

  // Helper methods to get combined comment text for each step
  getStep1CommentText(): string {
    return this.step1Comments().map(c => c.comment).join('\n\n');
  }

  getStep2CommentText(): string {
    return this.step2Comments().map(c => c.comment).join('\n\n');
  }

  getStep3CommentText(): string {
    return this.step3Comments().map(c => c.comment).join('\n\n');
  }

  getStep4CommentText(): string {
    return this.step4Comments().map(c => c.comment).join('\n\n');
  }

  // Form groups
  step1FormGroup = this.formService.step1_coverPage;
  step2FormGroup = this.formService.step2_overview;
  step3FormGroup = this.formService.step3_existingSaudi;
  step4FormGroup = this.formService.step4_directLocalization;

  // Comments and corrected fields inputs
  step1Comments = input<IPageComment[]>([]);
  step2Comments = input<IPageComment[]>([]);
  step3Comments = input<IPageComment[]>([]);
  step4Comments = input<IPageComment[]>([]);
  step1CorrectedFields = input<string[]>([]);
  step2CorrectedFields = input<string[]>([]);
  step3CorrectedFields = input<string[]>([]);
  step4CorrectedFields = input<string[]>([]);

  /**
   * Handles edit button click for a specific step
   */
  onEditStepClick(stepNumber: number): void {
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
}
