import { DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { ReviewPlanRequest, IPageComment } from 'src/app/shared/interfaces/plans.interface';
import { TCommentPhase } from '../plan-localization/product-localization-plan-wizard/product-localization-plan-wizard';

/**
 * Abstract base class for plan wizard components using Template Method pattern.
 * Provides common review/approval/rejection functionality that is identical
 * across product and service localization wizards.
 */
export abstract class BasePlanWizard {
  protected readonly planStore = inject(PlanStore);
  protected readonly toasterService = inject(ToasterService);
  protected readonly destroyRef = inject(DestroyRef);

  // Common signals - subclasses should initialize these
  protected isProcessing = signal(false);
  protected showSendBackConfirmationDialog = signal<boolean>(false);
  protected showApproveConfirmationDialog = signal<boolean>(false);
  protected showRejectReasonDialog = signal<boolean>(false);
  protected showRejectConfirmationDialog = signal<boolean>(false);
  protected approvalNote = signal<string>('');
  protected rejectionReason = signal<string>('');

  protected readonly commentTitle = this.planStore.commentPersona

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
   * Handle Send Back to Investor action - Template Method
   * Validates comment submission and shows confirmation dialog
   */
  onSendBackToInvestor(): void {
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
   * Confirm sending plan back to investor - Template Method
   * Common implementation for both wizards
   */
  onConfirmSendBack(): void {
    const planId = this.planStore.selectedPlanId();
    if (!planId) {
      this.toasterService.error('Plan ID is required.');
      return;
    }

    const comments = this.collectAllPageComments();
    const request: ReviewPlanRequest = {
      planId: planId,
      comments: comments,
    };

    this.isProcessing.set(true);
    this.planStore.sendPlanBackToInvestor(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.showSendBackConfirmationDialog.set(false);
          this.toasterService.success('Plan has been sent back to investor successfully.');
          this.refresh();
          this.closeWizard();
          this.planStore.resetWizardState();
        },
        error: (error) => {
          this.isProcessing.set(false);
          this.toasterService.error('Error sending plan back to investor. Please try again.');
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
    this.approvalNote.set('');
    this.showApproveConfirmationDialog.set(true);
  }

  /**
   * Confirm approval with optional note - Common implementation
   */
  onConfirmApprove(): void {
    const planId = this.planStore.selectedPlanId();
    if (!planId) {
      this.toasterService.error('Plan ID is required.');
      return;
    }

    const note = this.approvalNote().trim();
    this.isProcessing.set(true);
    this.planStore.employeeApprovePlan(planId, note || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.showApproveConfirmationDialog.set(false);
          this.approvalNote.set('');
          this.toasterService.success('Plan has been approved and forwarded successfully.');
          this.refresh();
          this.closeWizard();
          this.planStore.resetWizardState();
        },
        error: (error) => {
          this.isProcessing.set(false);
          this.toasterService.error('Error approving plan. Please try again.');
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
  }

  /**
   * Handle Reject action - Template Method
   */
  onReject(): void {
    if (!this.canApproveOrReject()) {
      return;
    }
    this.rejectionReason.set('');
    this.showRejectReasonDialog.set(true);
  }

  /**
   * Proceed to rejection confirmation after entering reason - Common implementation
   */
  onProceedReject(): void {
    const reason = this.rejectionReason().trim();
    if (!reason) {
      this.toasterService.error('Rejection reason is required.');
      return;
    }
    if (reason.length > 255) {
      this.toasterService.error('Rejection reason must not exceed 255 characters.');
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
      this.toasterService.error('Plan ID is required.');
      return;
    }

    const reason = this.rejectionReason().trim();
    if (!reason) {
      this.toasterService.error('Rejection reason is required.');
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
          this.toasterService.success('Plan has been rejected successfully.');
          this.refresh();
          this.closeWizard();
          this.planStore.resetWizardState();
        },
        error: (error) => {
          this.isProcessing.set(false);
          this.toasterService.error('Error rejecting plan. Please try again.');
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
}