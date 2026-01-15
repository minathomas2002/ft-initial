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
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';

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
  pageComments = input<IPageComment[]>([]);

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
  private readonly planStore = inject(PlanStore);

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
    const comments = this.step1Comments().length > 0 ? this.step1Comments() :
      this.pageComments().filter(c => c.pageTitleForTL === 'Cover Page');
    return comments.map(c => c.comment).join('\n\n');
  }

  getStep2CommentText(): string {
    const comments = this.step2Comments().length > 0 ? this.step2Comments() :
      this.pageComments().filter(c => c.pageTitleForTL === 'Overview');
    return comments.map(c => c.comment).join('\n\n');
  }

  getStep3CommentText(): string {
    const comments = this.step3Comments().length > 0 ? this.step3Comments() :
      this.pageComments().filter(c => c.pageTitleForTL === 'Existing Saudi Co.');
    return comments.map(c => c.comment).join('\n\n');
  }

  getStep4CommentText(): string {
    const comments = this.step4Comments().length > 0 ? this.step4Comments() :
      this.pageComments().filter(c => c.pageTitleForTL === 'Direct Localization');
    return comments.map(c => c.comment).join('\n\n');
  }

  // Computed signals to get comments (fallback to pageComments if step comments not provided)
  step1CommentsComputed = computed(() => {
    return this.step1Comments().length > 0 ? this.step1Comments() :
      this.pageComments().filter(c => c.pageTitleForTL === 'Cover Page');
  });

  step2CommentsComputed = computed(() => {
    return this.step2Comments().length > 0 ? this.step2Comments() :
      this.pageComments().filter(c => c.pageTitleForTL === 'Overview');
  });

  step3CommentsComputed = computed(() => {
    return this.step3Comments().length > 0 ? this.step3Comments() :
      this.pageComments().filter(c => c.pageTitleForTL === 'Existing Saudi Co.');
  });

  step4CommentsComputed = computed(() => {
    return this.step4Comments().length > 0 ? this.step4Comments() :
      this.pageComments().filter(c => c.pageTitleForTL === 'Direct Localization');
  });

  // Computed signals to check if comments exist and have content
  hasStep1Comments = computed(() => {
    const comments = this.step1CommentsComputed();
    return comments.length > 0 && comments.some(c => c.comment && c.comment.trim().length > 0);
  });

  hasStep1OutComingComments = computed(() => {
    return this.pageComments().filter(c => c.pageTitleForTL === 'Cover Page').length > 0;
  });

  hasStep2OutComingComments = computed(() => {
    return this.pageComments().filter(c => c.pageTitleForTL === 'Overview').length > 0;
  });

  hasStep3OutComingComments = computed(() => {
    return this.pageComments().filter(c => c.pageTitleForTL === 'Existing Saudi Co.').length > 0;
  });

  hasStep4OutComingComments = computed(() => {
    return this.pageComments().filter(c => c.pageTitleForTL === 'Direct Localization').length > 0;
  });

  hasStep2Comments = computed(() => {
    const comments = this.step2CommentsComputed();
    return comments.length > 0 && comments.some(c => c.comment && c.comment.trim().length > 0);
  });

  hasStep3Comments = computed(() => {
    const comments = this.step3CommentsComputed();
    return comments.length > 0 && comments.some(c => c.comment && c.comment.trim().length > 0);
  });

  hasStep4Comments = computed(() => {
    const comments = this.step4CommentsComputed();
    return comments.length > 0 && comments.some(c => c.comment && c.comment.trim().length > 0);
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
    return comments.filter(c => c.pageTitleForTL === 'Cover Page');
  });

  incomingStep2Comments = computed(() => {
    const comments = this.planComments()?.comments || [];
    return comments.filter(c => c.pageTitleForTL === 'Overview');
  });

  incomingStep3Comments = computed(() => {
    const comments = this.planComments()?.comments || [];
    return comments.filter(c => c.pageTitleForTL === 'Existing Saudi Co.');
  });

  incomingStep4Comments = computed(() => {
    const comments = this.planComments()?.comments || [];
    return comments.filter(c => c.pageTitleForTL === 'Direct Localization');
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
