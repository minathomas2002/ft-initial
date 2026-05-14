import { computed, DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { ReviewPlanRequest, IFieldInformation, IPageComment } from 'src/app/shared/interfaces/plans.interface';
import { EMaterialsFormControls, EPlanPageTitle, ERoles } from 'src/app/shared/enums';
import { TCommentPhase, IPlanWizardStepCommentDescriptor } from 'src/app/shared/types/plan-comments.types';
import { EInternalUserPlanStatus } from 'src/app/shared/interfaces/dashboard-plans.interface';
import { RoleService } from 'src/app/shared/services/role/role-service';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { I18nService } from 'src/app/shared/services/i18n';
import { getCommentColorKeyForStep } from 'src/app/shared/utils/plan-wizard-comment-color';

/**
 * Abstract base class for plan wizard components using Template Method pattern.
 * Provides common review/approval/rejection functionality that is identical
 * across product and service localization wizards.
 */
export abstract class BasePlanWizard {
  protected readonly planStore = inject(PlanStore);
  protected readonly toasterService = inject(ToasterService);
  protected readonly i18nService = inject(I18nService);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly roleService = inject(RoleService);
  protected readonly authStore = inject(AuthStore);

  // Common signals - subclasses should initialize these
  protected isProcessing = signal(false);
  protected showSendBackConfirmationDialog = signal<boolean>(false);
  protected showApproveConfirmationDialog = signal<boolean>(false);
  protected showRejectReasonDialog = signal<boolean>(false);
  protected showRejectConfirmationDialog = signal<boolean>(false);
  protected showAcknowledgeRejectDialog = signal<boolean>(false);
  protected showInvestorResubmitConfirmationDialog = signal<boolean>(false);
  protected approvalNote = signal<string>('');
  protected rejectionReason = signal<string>('');
  protected acknowledgeReason = signal<string>('');
  protected deptManagerSignature = signal<string | null>(null);

  // Check if user is employee persona
  isEmployeePersona = computed(() => {
    const userProfile = this.authStore.userProfile();
    if (!userProfile) return false;
    // Check if user has employeeID or has EMPLOYEE role
    const hasEmployeeRole = userProfile.roleCodes?.includes(ERoles.EMPLOYEE) ?? false;
    return hasEmployeeRole;
  });

  // Check if user is Division MANAGER persona
  isDVManagerPersona = computed(() => {
    const userProfile = this.authStore.userProfile();
    if (!userProfile) return false;
    // Check if user has employeeID or has EMPLOYEE role
    const hasMangerRole = userProfile.roleCodes?.includes(ERoles.Division_MANAGER) ?? false;
    return hasMangerRole;
  });

  sendBackSuccessMessage = computed(() => {
    this.i18nService.currentLanguage(); // reactive to language change
    if (this.isDVManagerPersona()) {
      return this.i18nService.translate('plans.wizard.sendBackToEmployeeSuccess');
    }
    if (this.isEmployeePersona()) {
      return this.i18nService.translate('plans.wizard.sendBackToInvestorSuccess');
    }
    return this.i18nService.translate('plans.wizard.sendBackToDivisionManagerSuccess');
  })

  protected readonly commentTitle = this.planStore.commentPersona;

  /**
   * Snapshot of plan comments captured when entering resubmit mode.
   * Used for: (1) restoring comments when investor deletes (via PlanStore.restorePlanCommentsFromOriginal),
   * (2) retrieving corrected fields from original when collecting investor page comments for resubmit payload.
   * Cleared when exiting resubmit (resetWizardState).
   */
  protected readonly originalPlanComment = this.planStore.originalPlanComments;

  /**
   * Captures current plan comments as the original snapshot when entering resubmit mode.
   * Call this after plan comments are loaded (e.g. in getPlanComments subscribe) when in resubmit mode.
   * Uses immutable copy to avoid accidental mutation.
   */
  protected captureOriginalPlanCommentsForResubmit(): void {
    if (!this.getIsResubmitMode()) return;
    const current = this.planStore.planComments();
    if (!current) return;
    this.planStore.setOriginalPlanComments({
      ...current,
      comments: current.comments.map(c => ({ ...c, fields: [...c.fields] }))
    });
  }

  /**
   * Abstract methods for component-specific behavior
   * Subclasses must implement these to handle their specific signals/models/outputs
   */
  protected abstract closeWizard(): void;
  protected abstract refresh(): void;

  /**
   * Template method: Collect all page comments from step forms.
   * Subclasses must implement this with their step-specific logic.
   */
  abstract collectAllPageComments(): IPageComment[];

  /**
   * Template method: Validate that steps with selected inputs have submitted comments.
   * Subclasses must implement this with their step-specific validation logic.
   */
  protected abstract validateCommentSubmission(): string | null;

  /**
   * Template method: Check if the wizard can approve or reject.
   * Subclasses must implement this as a computed signal or method.
   * When implemented as a computed signal, it can be called like a method: canApproveOrReject()
   */
  abstract canApproveOrReject(): boolean;
  /**
 * Template method: Check if the wizard can Acknowledge.
 * Subclasses must implement this as a computed signal or method.
 * When implemented as a computed signal, it can be called like a method: canAcknowledgeRejection()
 */
  abstract canAcknowledgeRejection(): boolean;

  /**
   * Template method: Check if investor can submit resubmission.
   * Subclasses must implement this to check if all required corrected fields have been updated.
   */
  abstract canInvestorSubmit(): boolean;

  /**
   * Template method: Build FormData for resubmission including comments JSON.
   * Subclasses must implement this to build the FormData with all plan data plus investor page comments.
   */
  abstract buildResubmitFormData(): FormData;

  /**
   * Template method: Get the plan type for resubmission.
   * Subclasses must implement this to return 'product' or 'service'.
   */
  abstract getResubmitPlanType(): 'product' | 'service';

  /** Whether the wizard is in resubmit mode. Used by onAddComment. */
  protected abstract getIsResubmitMode(): boolean;

  /** Whether the current user is an investor. Used by onAddComment. */
  protected abstract getIsInvestorPersona(): boolean;

  /** Signal controlling comment panel visibility. Used by onAddComment. */
  protected abstract getShowCommentState(): WritableSignal<boolean>;

  /** Current 1-based step index. Used by onAddComment. */
  protected abstract getActiveStep(): number;

  /** Form for the given 1-based step, or null if the step has no form (e.g. summary). */
  protected abstract getStepFormForComment(step: number): FormGroup | null;

  /** Step id for the given 1-based step index. */
  protected abstract getStepIdFromStepIndex(step: number): string | undefined;

  /** Comment phase signal for the given step id, or null for steps without comments (e.g. summary). */
  protected abstract getCommentPhaseSignalForStepId(stepId: string): WritableSignal<TCommentPhase> | null;

  /** Reset selected inputs and hasComment controls for the given step. Used when employee starts a new comment. */
  protected abstract resetCurrentStepCommentSelections(stepId: string | undefined): void;

  /** Comment phase for the given step id. Used by getCommentColorForStep. */
  protected abstract getCommentPhaseForStepId(stepId: string): TCommentPhase;

  /**
   * Comment color for the stepper badge: 'green' when done/not active, 'orange' when in focus or under review.
   * Centralized for product and service wizards.
   */
  protected getCommentColorForStep(stepCommentPhase: TCommentPhase): 'green' | 'orange' {
    return getCommentColorKeyForStep(stepCommentPhase, {
      planStatus: this.planStore.planStatus(),
      wizardMode: this.planStore.wizardMode(),
      isEmployee: this.roleService.hasAnyRoleSignal([ERoles.EMPLOYEE])(),
    });
  }

  /**
   * Whether the Add Comments button should be disabled.
   * Disabled when: comment panel is open (showCommentState) OR active step's comment phase is not 'none'.
   * Centralized for product and service wizards.
   */
  isAddCommentButtonDisabled(): boolean {
    if (this.getShowCommentState()()) return true;
    const step = this.getActiveStep();
    const stepId = this.getStepIdFromStepIndex(step);
    const phase = this.getCommentPhaseForStepId(stepId ?? '');
    return phase !== 'none';
  }

  /**
   * Handle Add Comment action - centralized for resubmit and non-resubmit flows.
   * Resubmit: show comment panel and set phase from existing comment (viewing/none).
   * Non-resubmit: reset step selections when not investor, then set phase to 'adding'.
   */
  onAddComment(stepCommentColor: 'green' | 'orange'): void {
    if (this.getIsResubmitMode()) {
      this.getShowCommentState().set(true);
      // const step = this.getActiveStep();
      // const stepForm = this.getStepFormForComment(step);
      // if (!stepForm) return;

      // const commentControl = stepForm.get(EMaterialsFormControls.comment) as FormControl<string> | null;
      // const hasComment = !!(commentControl?.value && commentControl.value.trim().length > 0);
      // const stepId = this.getStepIdFromStepIndex(step);
      // const phaseSignal = stepId ? this.getCommentPhaseSignalForStepId(stepId) : null;
      // if (phaseSignal?.() === 'none') {
      //   phaseSignal.set(hasComment ? 'viewing' : 'none');
      // }
      return;
    }

    const step = this.getActiveStep();
    const stepId = this.getStepIdFromStepIndex(step);

    // reset all current selection for the employee only that received a plan
    // from investor with fixed inputs
    if (stepCommentColor === 'green') {
      this.resetCurrentStepCommentSelections(stepId);
    }

    const phaseSignal = stepId ? this.getCommentPhaseSignalForStepId(stepId) : null;
    if (phaseSignal) {
      phaseSignal.set('adding');
    }
  }

  /**
   * Handle Send Back to Investor action - Template Method
   * Validates comment submission and shows confirmation dialog
   */
  onSendBack(): void {
    // Validate that steps with selected inputs have submitted comments
    const validationError = this.validateCommentSubmission();
    if (validationError) {
      this.toasterService.error(validationError);
      return;
    }

    // Show confirmation dialog
    this.showSendBackConfirmationDialog.set(true);
  }


  protected getSendBackErrorMessage(pageTitle: string, commentPhase: TCommentPhase): string {
    return `${pageTitle} has selected fields but the comment has not been submitted. Please ${commentPhase === 'adding' ? 'add' : 'save'} the comment before sending back.`;
  }

  /**
   * Shared: collect all page comments from step descriptors.
   * Used by product and service wizards to avoid duplicated per-step logic.
   */
  protected collectAllPageCommentsFromDescriptors(
    descriptors: IPlanWizardStepCommentDescriptor[],
    isResubmitMode: boolean
  ): IPageComment[] {
    const comments: IPageComment[] = [];
    for (const d of descriptors) {
      if (d.isVisible && !d.isVisible()) continue;
      const form = d.getForm();
      if (!form) continue;
      const commentControl = isResubmitMode
        ? (form.get('comment') as FormControl<string> | null)
        : (form.get(EMaterialsFormControls.comment) as FormControl<string> | null);
      const fields = d.getSelectedInputs();
      const commentValue = commentControl?.value?.trim() || '';
      if (commentValue && (fields.length > 0)) {
        comments.push({
          pageTitleForTL: d.getStepTitle() as EPlanPageTitle,
          comment: commentValue,
          fields,
        });
      }
    }
    return comments;
  }

  /**
   * Shared: validate that steps with selected inputs have submitted comments.
   * Returns error message or null if valid.
   */
  protected validateCommentSubmissionFromDescriptors(
    descriptors: IPlanWizardStepCommentDescriptor[],
    getSendBackErrorMessage: (pageTitle: string, phase: TCommentPhase) => string
  ): string | null {
    const currentUserPageComments = this.planStore.currentUserPageComments();

    for (const descriptor of descriptors) {
      if (descriptor.isVisible && !descriptor.isVisible()) continue;
      const selected = descriptor.getSelectedInputs();
      if (selected.length === 0) continue;

      const pageTitle = descriptor.getStepTitle() as EPlanPageTitle;
      const phase = descriptor.getCommentPhase();
      const hasCurrentUserComment = currentUserPageComments.includes(pageTitle);
      const isCurrentUserEditingComment = phase === 'adding' || phase === 'editing';

      // Ignore preloaded selections that came from incoming API comments and were not touched
      // by the current user in this session.
      if (!hasCurrentUserComment && !isCurrentUserEditingComment) {
        continue;
      }

      if (!hasCurrentUserComment) {
        return getSendBackErrorMessage(pageTitle, phase);
      }
    }
    return null;
  }

  /**
   * Shared: collect investor page comments for resubmit (corrected fields + investor comment or empty).
   * When in resubmit mode for investor, retrieves fields from OriginalPlanComment for each page
   * instead of current selectedInputs/commentFields, ensuring consistency after delete/restore flows.
   */
  protected collectInvestorPageCommentsFromDescriptors(
    descriptors: IPlanWizardStepCommentDescriptor[]
  ): IPageComment[] {
    const isResubmitInvestor = this.getIsResubmitMode() && this.getIsInvestorPersona();
    const original = isResubmitInvestor ? this.planStore.originalPlanComments() : null;

    const result: IPageComment[] = [];
    for (const d of descriptors) {
      if (d.isVisible && !d.isVisible()) continue;
      const form = d.getForm();
      if (!form) continue;
      const investorCommentControl = form.get('comment') as FormControl<string> | null;
      const investorComment = investorCommentControl?.value?.trim() || '';
      const pageTitle = d.getStepTitle() as EPlanPageTitle;

      // In resubmit mode for investor: use fields from OriginalPlanComment for this page
      let correctedFields = d.getCommentFields();
      if (original?.comments?.length) {
        const originalPageComments = original.comments.filter(c => c.pageTitleForTL === pageTitle);
        const originalFields = originalPageComments.flatMap(c => c.fields ?? []);
        if (originalFields.length > 0) {
          correctedFields = originalFields;
        }
      }

      if (!correctedFields?.length) continue;
      if (investorComment.length > 0) {
        result.push({ pageTitleForTL: pageTitle, comment: investorComment, fields: correctedFields });
      } else {
        const employeeComments = d.getComments();
        if (employeeComments.length > 0) {
          employeeComments.forEach(ec => {
            if (ec.fields?.length) {
              result.push({ pageTitleForTL: ec.pageTitleForTL, comment: '', fields: ec.fields });
            }
          });
        } else if (isResubmitInvestor && correctedFields.length > 0) {
          result.push({ pageTitleForTL: pageTitle, comment: '', fields: correctedFields });
        }
      }
    }
    return result;
  }

  /**
   * Shared: append comments to FormData in nested structure for API.
   * Format: Comments[index].pageTitleForTL, Comments[index].comment, Comments[index].fields[index].*
   */
  protected appendCommentsToFormData(formData: FormData, comments: IPageComment[]): void {
    const filtered = (comments ?? []).filter(c => (c.fields?.length ?? 0) > 0);
    filtered.forEach((comment, i) => {
      formData.append(`Comments[${i}].pageTitleForTL`, comment.pageTitleForTL || '');
      formData.append(`Comments[${i}].comment`, comment.comment || '');
      if (comment.fields?.length) {
        comment.fields.forEach((field, fi) => {
          formData.append(`Comments[${i}].fields[${fi}].section`, field.section || '');
          formData.append(`Comments[${i}].fields[${fi}].inputKey`, field.inputKey || '');
          formData.append(`Comments[${i}].fields[${fi}].label`, field.label || '');
          if (field.id) formData.append(`Comments[${i}].fields[${fi}].id`, field.id);
          if (field.value) formData.append(`Comments[${i}].fields[${fi}].value`, field.value);
        });
      }
    });
  }

  /**
   * Shared: hydrate each step form's comment control from loaded plan comments.
   * Keeps form state aligned with displayed incoming comments.
   */
  // protected fillStepsFormsWithIncomingComments(
  //   descriptors: IPlanWizardStepCommentDescriptor[]
  // ): void {
  //   for (const d of descriptors) {
  //     if (d.isVisible && !d.isVisible()) continue;

  //     const form = d.getForm();
  //     if (!form) continue;

  //     const commentText = d.getComments()
  //       .map(c => c.comment?.trim())
  //       .filter((c): c is string => !!c)
  //       .join('\n\n');

  //     const commentControl =
  //       (form.get(EMaterialsFormControls.comment) as FormControl<string> | null) ??
  //       (form.get('comment') as FormControl<string> | null);

  //     if (commentControl) {
  //       commentControl.setValue(commentText, { emitEvent: false });
  //       commentControl.markAsPristine();
  //       commentControl.markAsUntouched();
  //     }
  //   }
  // }

  /**
   * Shared: hydrate per-field hasComment controls from incoming comment fields.
   * This makes highlighted fields appear checked when comment mode is enabled.
   */
  protected markSelectedFieldsWithCheckboxes(
    descriptors: IPlanWizardStepCommentDescriptor[]
  ): void {
    for (const d of descriptors) {
      if (d.isVisible && !d.isVisible()) continue;
      const form = d.getForm();
      if (!form) continue;
      const commentFields = d.getCommentFields();
      this.syncHasCommentControls(form, commentFields);

      // Keep selected inputs aligned with programmatically restored checked fields,
      // same effect as manual user checkbox selection in UI.
      d.setSelectedInputs?.([...(commentFields ?? [])]);
    }
  }

  private syncHasCommentControls(form: FormGroup, fields: IFieldInformation[]): void {
    this.setAllHasCommentControls(form, false);
    if (!fields?.length) return;

    const keysWithoutRowId = new Set<string>();
    const keyedRowIds = new Map<string, Set<string>>();

    fields.forEach(field => {
      const key = this.normalizeInputKey(field.inputKey);
      if (!field.id) {
        keysWithoutRowId.add(key);
        return;
      }

      const rowIds = keyedRowIds.get(key) ?? new Set<string>();
      rowIds.add(String(field.id));
      keyedRowIds.set(key, rowIds);
    });

    this.applyMatchingHasCommentControls(form, undefined, undefined, undefined, keysWithoutRowId, keyedRowIds);
  }

  private setAllHasCommentControls(control: AbstractControl, value: boolean): void {
    if (control instanceof FormGroup) {
      const hasCommentControl = control.get(EMaterialsFormControls.hasComment) as FormControl<boolean> | null;
      if (hasCommentControl) {
        hasCommentControl.setValue(value, { emitEvent: false });
      }
      Object.keys(control.controls).forEach(key => {
        this.setAllHasCommentControls(control.controls[key], value);
      });
      return;
    }

    if (control instanceof FormArray) {
      control.controls.forEach(child => this.setAllHasCommentControls(child, value));
    }
  }

  private applyMatchingHasCommentControls(
    control: AbstractControl,
    fieldKey: string | undefined,
    inheritedRowId: string | undefined,
    inheritedYearKey: string | undefined,
    keysWithoutRowId: Set<string>,
    keyedRowIds: Map<string, Set<string>>
  ): void {
    if (control instanceof FormArray) {
      control.controls.forEach(child => {
        this.applyMatchingHasCommentControls(
          child,
          fieldKey,
          inheritedRowId,
          inheritedYearKey,
          keysWithoutRowId,
          keyedRowIds
        );
      });
      return;
    }

    if (!(control instanceof FormGroup)) return;

    const rowIdControl = control.get('rowId');
    const currentRowId = rowIdControl?.value != null ? String(rowIdControl.value) : inheritedRowId;
    const hasCommentControl = control.get(EMaterialsFormControls.hasComment) as FormControl<boolean> | null;
    const hasValueControl = !!control.get(EMaterialsFormControls.value);

    // Leaf commentable field pattern: { hasComment, value }
    if (hasCommentControl && hasValueControl && fieldKey) {
      const normalizedKey = this.normalizeInputKey(fieldKey);
      const normalizedYearKey = inheritedYearKey ? this.normalizeInputKey(inheritedYearKey) : undefined;
      const matchedByKey = keysWithoutRowId.has(normalizedKey)
        || (!!normalizedYearKey && keysWithoutRowId.has(normalizedYearKey));
      const matchedByRowId = !!currentRowId && (
        (keyedRowIds.get(normalizedKey)?.has(currentRowId) ?? false)
        || (!!normalizedYearKey && (keyedRowIds.get(normalizedYearKey)?.has(currentRowId) ?? false))
      );
      hasCommentControl.setValue(matchedByKey || matchedByRowId, { emitEvent: false });
      return;
    }

    Object.keys(control.controls).forEach(key => {
      const isYearKey = /^year\d+$/.test(key);
      const nextYearKey = isYearKey ? key : inheritedYearKey;
      this.applyMatchingHasCommentControls(
        control.controls[key],
        key,
        currentRowId,
        nextYearKey,
        keysWithoutRowId,
        keyedRowIds
      );
    });
  }

  private normalizeInputKey(inputKey: string): string {
    const key = inputKey ?? '';
    return key.replace(/^.+\./, '').replace(/_\d+$/, '');
  }

  /**
   * Confirm sending plan back to investor - Template Method
   * Common implementation for both wizards
   */
  onConfirmSendBack(): void {
    const planId = this.planStore.selectedPlanId();
    if (!planId) {
      this.toasterService.error(this.i18nService.translate('plans.validation.planIdRequired'));
      return;
    }

    const comments = this.collectAllPageComments();
    const request: ReviewPlanRequest = {
      planId: planId,
      comments: comments,
    };

    this.isProcessing.set(true);
    this.planStore.sendPlanBack(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.showSendBackConfirmationDialog.set(false);
          this.toasterService.success(this.sendBackSuccessMessage());
          this.refresh();
          this.closeWizard();
          this.planStore.resetWizardState();
        },
        error: (error) => {
          this.isProcessing.set(false);
          console.error('Error sending plan back:', error);
        }
      });
  }

  /**
   * Cancel sending plan back - Common implementation
   */
  onCancelSendBack(): void {
    this.showSendBackConfirmationDialog.set(false);
  }

  /**
   * Handle Approve and Forward action - Template Method
   */
  onApproveAndForward(): void {
    if (!this.canApproveOrReject()) {
      return;
    }

    const status = this.planStore.planStatus();
    const isEmployee = this.roleService.hasAnyRoleSignal([ERoles.EMPLOYEE])();
    const shouldPrefillFromActionNote = isEmployee && [
      EInternalUserPlanStatus.DEPT_APPROVED,
    ].includes(status as EInternalUserPlanStatus);

    this.approvalNote.set(shouldPrefillFromActionNote ? (this.planStore.actionNote() ?? '') : '');
    this.showApproveConfirmationDialog.set(true);
  }

  /**
   * Confirm approval with optional note - Common implementation
   */
  onConfirmApprove(): void {
    const planId = this.planStore.selectedPlanId();
    if (!planId) {
      this.toasterService.error(this.i18nService.translate('plans.validation.planIdRequired'));
      return;
    }

    const note = this.approvalNote().trim();
    const signature = this.deptManagerSignature();
    this.isProcessing.set(true);
    this.planStore.employeeApprovePlan(planId, note || undefined, signature || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.showApproveConfirmationDialog.set(false);
          this.approvalNote.set('');
          this.deptManagerSignature.set(null);
          this.toasterService.success(this.i18nService.translate('plans.messages.approvedForwarded'));
          this.refresh();
          this.closeWizard();
          this.planStore.resetWizardState();
        },
        error: (error) => {
          this.isProcessing.set(false);
          console.error('Error approving plan:', error);
        }
      });
  }

  /**
   * Cancel approval - Common implementation
   */
  onCancelApprove(): void {
    this.showApproveConfirmationDialog.set(false);
    this.approvalNote.set('');
    this.deptManagerSignature.set(null);
  }

  /**
   * Handle Reject action - Template Method
   */
  onReject(): void {
    if (!this.canApproveOrReject()) {
      return;
    }

    const status = this.planStore.planStatus();
    const isEmployee = this.roleService.hasAnyRoleSignal([ERoles.EMPLOYEE])();
    const shouldPrefillFromActionNote = isEmployee && [
      EInternalUserPlanStatus.DV_REJECTED,
      EInternalUserPlanStatus.DV_REJECTION_ACKNOWLEDGED,
      EInternalUserPlanStatus.DEPT_REJECTED,
    ].includes(status as EInternalUserPlanStatus);

    this.rejectionReason.set(shouldPrefillFromActionNote ? (this.planStore.actionNote() ?? '') : '');
    this.showRejectReasonDialog.set(true);
  }


  /**
   * Proceed to rejection confirmation after entering reason - Common implementation
   */
  onProceedReject(): void {
    const reason = this.rejectionReason().trim();
    if (!reason) {
      this.toasterService.error(this.i18nService.translate('plans.validation.rejectionReasonRequired'));
      return;
    }
    if (reason.length > 255) {
      this.toasterService.error(this.i18nService.translate('plans.validation.rejectionReasonMaxLength'));
      return;
    }
    this.showRejectReasonDialog.set(false);
    this.showRejectConfirmationDialog.set(true);
  }

  /**
   * Cancel rejection reason entry - Common implementation
   */
  onCancelRejectReason(): void {
    this.showRejectReasonDialog.set(false);
    this.rejectionReason.set('');
  }

  /**
   * Confirm final rejection - Common implementation
   */
  onConfirmReject(): void {
    const planId = this.planStore.selectedPlanId();
    if (!planId) {
      this.toasterService.error(this.i18nService.translate('plans.validation.planIdRequired'));
      return;
    }

    const reason = this.rejectionReason().trim();
    if (!reason) {
      this.toasterService.error(this.i18nService.translate('plans.validation.rejectionReasonRequired'));
      return;
    }

    this.isProcessing.set(true);
    this.planStore.employeeRejectPlan(planId, reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.showRejectConfirmationDialog.set(false);
          this.rejectionReason.set('');
          this.toasterService.success(this.i18nService.translate('plans.messages.rejected'));
          this.refresh();
          this.closeWizard();
          this.planStore.resetWizardState();
        },
        error: (error) => {
          this.isProcessing.set(false);
          console.error('Error rejecting plan:', error);
        }
      });
  }

  /**
   * Cancel final rejection confirmation - Common implementation
   */
  onCancelRejectConfirmation(): void {
    this.showRejectConfirmationDialog.set(false);
    // Return to reason entry dialog
    this.showRejectReasonDialog.set(true);
  }

  /**
   * Handle Investor Resubmit action - Template Method
   * Validates that all required fields are updated and shows confirmation dialog
   */
  onInvestorResubmit(): void {
    if (!this.canInvestorSubmit()) {
      this.toasterService.error(this.i18nService.translate('plans.validation.updateRequiredFields'));
      return;
    }

    // Show confirmation dialog
    this.showInvestorResubmitConfirmationDialog.set(true);
  }

  /**
   * Confirm investor resubmission - Template Method
   * Common implementation for both wizards
   */
  onConfirmInvestorResubmit(): void {
    const planId = this.planStore.selectedPlanId();
    if (!planId) {
      this.toasterService.error(this.i18nService.translate('plans.validation.planIdRequired'));
      return;
    }

    const formData = this.buildResubmitFormData();
    const planType = this.getResubmitPlanType();

    this.isProcessing.set(true);
    const resubmitObservable = planType === 'product'
      ? this.planStore.investorResubmitProductPlan(formData)
      : this.planStore.investorResubmitServicePlan(formData);

    resubmitObservable
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.showInvestorResubmitConfirmationDialog.set(false);
          this.toasterService.success(this.i18nService.translate('plans.messages.resubmitted'));
          this.refresh();
          this.closeWizard();
          this.planStore.resetWizardState();
        },
        error: (error) => {
          this.isProcessing.set(false);
          console.error('Error resubmitting plan:', error);
        }
      });
  }

  /**
   * Cancel investor resubmission - Common implementation
   */
  onCancelInvestorResubmit(): void {
    this.showInvestorResubmitConfirmationDialog.set(false);
  }


  /**
   * dv acknowledge rejection
   */
  onAcknowledgeReject(): void {
    const planId = this.planStore.selectedPlanId();
    if (!planId) {
      this.toasterService.error(this.i18nService.translate('plans.validation.planIdRequired'));
      return;
    }

    const reason = this.acknowledgeReason().trim();

    this.isProcessing.set(true);
    this.planStore.DvRejecttionAcknowledgePlan(planId, reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.showAcknowledgeRejectDialog.set(false);
          this.acknowledgeReason.set('');
          this.toasterService.success(this.i18nService.translate('plans.messages.rejectionAcknowledged'));
          this.refresh();
          this.closeWizard();
          this.planStore.resetWizardState();
        },
        error: (error) => {
          this.isProcessing.set(false);
          this.toasterService.error(this.i18nService.translate('plans.messages.rejectionAcknowledgeError'));
          console.error('Error rejecting acknowledge plan:', error);
        }
      });
  }

  /**
 * Cancel rejection acknowledge confirmation -
 */
  onCancelRejectAcknowledgment(): void {
    this.showRejectConfirmationDialog.set(false);
    // Return to reason entry dialog
    this.rejectionReason.set('');
  }

  /**
   * Handle Reject Acknowledge action - Template Method
   */
  onAcknowledge(): void {
    if (!this.canAcknowledgeRejection()) {
      return;
    }
    this.rejectionReason.set('');
    this.showAcknowledgeRejectDialog.set(true);
  }
}
