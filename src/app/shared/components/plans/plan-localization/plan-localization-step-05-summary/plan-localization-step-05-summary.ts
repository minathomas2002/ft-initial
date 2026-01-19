import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, input, output, signal } from '@angular/core';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { ProductPlanValidationService, IStepValidationErrors } from 'src/app/shared/services/plan/validation/product-plan-validation.service';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { SummarySectionOverview } from './summary-sections/summary-section-overview/summary-section-overview';
import { SummarySectionProductPlant } from './summary-sections/summary-section-product-plant/summary-section-product-plant';
import { SummarySectionValueChain } from './summary-sections/summary-section-value-chain/summary-section-value-chain';
import { SummarySectionSaudization } from './summary-sections/summary-section-saudization/summary-section-saudization';
import { IPageComment, IProductPlanResponse } from 'src/app/shared/interfaces/plans.interface';
import { SummarySectionSignature } from './summary-sections/summary-section-signature/summary-section-signature';
import { Signature } from 'src/app/shared/interfaces/plans.interface';
import { PageCommentBox } from '../../page-comment-box/page-comment-box';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';

@Component({
  selector: 'app-plan-localization-step-05-summary',
  imports: [
    SummarySectionOverview,
    SummarySectionProductPlant,
    SummarySectionValueChain,
    SummarySectionSaudization,
    SummarySectionSignature,
    PageCommentBox,
  ],
  templateUrl: './plan-localization-step-05-summary.html',
  styleUrl: './plan-localization-step-05-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanLocalizationStep05Summary {
  isViewMode = input<boolean>(false);
  pageComments = input<IPageComment[]>([]);
  commentTitle = input<string>('Comments');
  signature = input<Signature | null>(null);

  // Comments and corrected fields inputs (from wizard)
  step1Comments = input<IPageComment[]>([]);
  step2Comments = input<IPageComment[]>([]);
  step3Comments = input<IPageComment[]>([]);
  step4Comments = input<IPageComment[]>([]);

  // Original plan response for before/after comparison
  originalPlanResponse = input<IProductPlanResponse | null>(null);

  private readonly formService = inject(ProductPlanFormService);
  private readonly validationService = inject(ProductPlanValidationService);
  private readonly toasterService = inject(ToasterService);
  private readonly changeDetectionRef = inject(ChangeDetectorRef);
  private readonly i18nService = inject(I18nService);
  private readonly planStore = inject(PlanStore);

  onEditStep = output<number>();
  onSubmit = output<void>();
  onValidationErrorsChange = output<Map<number, IStepValidationErrors>>();

  // Helper methods to get combined comment text for each step
  getStep1CommentText(): string {
    const comments = this.step1Comments().length > 0 ? this.step1Comments() :
      this.pageComments().filter(c => c.pageTitleForTL === this.i18nService.translate('plans.wizard.step1.title'));
    return comments.map(c => c.comment).join('\n\n');
  }

  getStep2CommentText(): string {
    const comments = this.step2Comments().length > 0 ? this.step2Comments() :
      this.pageComments().filter(c => c.pageTitleForTL === this.i18nService.translate('plans.wizard.step2.title'));
    return comments.map(c => c.comment).join('\n\n');
  }

  getStep3CommentText(): string {
    const comments = this.step3Comments().length > 0 ? this.step3Comments() :
      this.pageComments().filter(c => c.pageTitleForTL === this.i18nService.translate('plans.wizard.step3.title'));
    return comments.map(c => c.comment).join('\n\n');
  }

  getStep4CommentText(): string {
    const comments = this.step4Comments().length > 0 ? this.step4Comments() :
      this.pageComments().filter(c => c.pageTitleForTL === this.i18nService.translate('plans.wizard.step4.title'));
    return comments.map(c => c.comment).join('\n\n');
  }

  // Computed signals to get comments (fallback to pageComments if step comments not provided)
  step1CommentsComputed = computed(() => {
    return this.step1Comments().length > 0 ? this.step1Comments() :
      this.pageComments().filter(c => c.pageTitleForTL === this.i18nService.translate('plans.wizard.step1.title'));
  });

  step2CommentsComputed = computed(() => {
    return this.step2Comments().length > 0 ? this.step2Comments() :
      this.pageComments().filter(c => c.pageTitleForTL === this.i18nService.translate('plans.wizard.step2.title'));
  });

  step3CommentsComputed = computed(() => {
    return this.step3Comments().length > 0 ? this.step3Comments() :
      this.pageComments().filter(c => c.pageTitleForTL === this.i18nService.translate('plans.wizard.step3.title'));
  });

  step4CommentsComputed = computed(() => {
    return this.step4Comments().length > 0 ? this.step4Comments() :
      this.pageComments().filter(c => c.pageTitleForTL === this.i18nService.translate('plans.wizard.step4.title'));
  });

  hasStep1OutComingComments = computed(() => {
    return this.pageComments().filter(c => c.pageTitleForTL === this.i18nService.translate('plans.wizard.step1.title')).length > 0;
  });

  hasStep2OutComingComments = computed(() => {
    return this.pageComments().filter(c => c.pageTitleForTL === this.i18nService.translate('plans.wizard.step2.title')).length > 0;
  });

  hasStep3OutComingComments = computed(() => {
    return this.pageComments().filter(c => c.pageTitleForTL === this.i18nService.translate('plans.wizard.step3.title')).length > 0;
  });

  hasStep4OutComingComments = computed(() => {
    return this.pageComments().filter(c => c.pageTitleForTL === this.i18nService.translate('plans.wizard.step4.title')).length > 0;
  });

  // Incoming comments from plan store (API response)
  planComments = this.planStore.planComments;
  incomingCommentPersona = this.planStore.commentPersona;

  // Computed signal to check if incoming comments should be shown
  shouldShowIncomingComments = computed(() => {
    const mode = this.planStore.wizardMode();
    return mode === 'view' || mode === 'Review' || mode === 'resubmit';
  });

  // Computed signals for incoming comments per step
  incomingStep1Comments = computed(() => {
    const comments = this.planComments()?.comments || [];
    const step1Title = this.i18nService.translate('plans.wizard.step1.title');
    return comments.filter(c => c.pageTitleForTL === step1Title);
  });

  incomingStep2Comments = computed(() => {
    const comments = this.planComments()?.comments || [];
    const step2Title = this.i18nService.translate('plans.wizard.step2.title');
    return comments.filter(c => c.pageTitleForTL === step2Title);
  });

  incomingStep3Comments = computed(() => {
    const comments = this.planComments()?.comments || [];
    const step3Title = this.i18nService.translate('plans.wizard.step3.title');
    return comments.filter(c => c.pageTitleForTL === step3Title);
  });

  incomingStep4Comments = computed(() => {
    const comments = this.planComments()?.comments || [];
    const step4Title = this.i18nService.translate('plans.wizard.step4.title');
    return comments.filter(c => c.pageTitleForTL === step4Title);
  });

  // Computed signals to check if incoming comments exist and have content
  hasIncomingStep1Comments = computed(() => {
    const comments = this.incomingStep1Comments();
    return comments.length > 0 && comments.some(c => c.comment && c.comment.trim().length > 0);
  });

  hasIncomingStep2Comments = computed(() => {
    const comments = this.incomingStep2Comments();
    return comments.length > 0 && comments.some(c => c.comment && c.comment.trim().length > 0);
  });

  hasIncomingStep3Comments = computed(() => {
    const comments = this.incomingStep3Comments();
    return comments.length > 0 && comments.some(c => c.comment && c.comment.trim().length > 0);
  });

  hasIncomingStep4Comments = computed(() => {
    const comments = this.incomingStep4Comments();
    return comments.length > 0 && comments.some(c => c.comment && c.comment.trim().length > 0);
  });

  // Helper methods to get combined incoming comment text for each step
  getIncomingStep1CommentText(): string {
    const comments = this.incomingStep1Comments();
    return comments.map(c => c.comment).join('\n\n');
  }

  getIncomingStep2CommentText(): string {
    const comments = this.incomingStep2Comments();
    return comments.map(c => c.comment).join('\n\n');
  }

  getIncomingStep3CommentText(): string {
    const comments = this.incomingStep3Comments();
    return comments.map(c => c.comment).join('\n\n');
  }

  getIncomingStep4CommentText(): string {
    const comments = this.incomingStep4Comments();
    return comments.map(c => c.comment).join('\n\n');
  }

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
