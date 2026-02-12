import { inject, Injectable } from '@angular/core';
import { IPageComment, IPlanCommentResponse } from 'src/app/shared/interfaces/plans.interface';
import { EPlanPageTitle } from 'src/app/shared/enums';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';

/**
 * Service that syncs page comments from wizard steps to the plan store.
 * When a step saves or edits a comment, it merges that page's comment into planComments,
 * preserving other pages' comments and using creator persona from AuthStore.
 */
@Injectable({ providedIn: 'root' })
export class PlanCommentSyncService {
  private readonly planStore = inject(PlanStore);

  /**
   * Merge the current page's comment into planComments.
   * - For the page being saved: replaces/updates with the new comment and fields (add/remove as user selected)
   * - For other pages: preserves existing comments
   * - creatorRole from current user's persona (AuthStore)
   */
  syncPageCommentToStore(currentPageComment: IPageComment): void {
    const existing = this.planStore.planComments();
    const existingComments = existing?.comments ?? [];

    // Merge: keep other pages (with their existing creatorRole), replace this page's entry
    const otherPages = existingComments.filter(
      (c) => c.pageTitleForTL !== currentPageComment.pageTitleForTL
    );

    const mergedComments: IPageComment[] = [...otherPages, { ...currentPageComment }];

    const payload: IPlanCommentResponse = {
      comments: mergedComments,
      creatorRole: existing?.creatorRole ?? 0
    };

    this.planStore.setPlanComments(payload);
    // Deduplicate: only add the page if not already tracked
    const currentPages = this.planStore.currentUserPageComments();
    if (!currentPages.includes(currentPageComment.pageTitleForTL)) {
      this.planStore.updateCurrentUserPageComments([...currentPages, currentPageComment.pageTitleForTL]);
    }
  }

  /**
   * Remove a page's comment entry from the store entirely.
   * Used when a non-resubmit user (e.g. employee) deletes their comment.
   * In resubmit mode with originalPlanComments set, restores planComments from original instead.
   * Also removes the page from currentUserPageComments (except when restoring).
   */
  removePageCommentFromStore(pageTitleForTL: EPlanPageTitle): void {
    if (this.planStore.wizardMode() === 'resubmit' && this.planStore.originalPlanComments()) {
      this.planStore.restorePlanCommentsFromOriginal();
      return;
    }

    const existing = this.planStore.planComments();
    if (!existing) return;

    const filtered = existing.comments.filter(
      (c) => c.pageTitleForTL !== pageTitleForTL
    );

    const payload: IPlanCommentResponse = {
      comments: filtered,
      creatorRole: existing.creatorRole
    };

    this.planStore.setPlanComments(payload);
    this.planStore.updateCurrentUserPageComments(
      this.planStore.currentUserPageComments().filter(c => c !== pageTitleForTL)
    );
  }

  /**
   * Clear only the comment text for a page in the store, keeping fields intact.
   * Used when an investor deletes their comment in resubmit mode —
   * fields must remain so the correctedFields derivation is not disrupted.
   * When originalPlanComments is set, restores planComments from original instead.
   * Also removes the page from currentUserPageComments (except when restoring).
   */
  clearPageCommentTextInStore(pageTitleForTL: EPlanPageTitle): void {
    const existing = this.planStore.planComments();
    if (!existing) return;

    const original = this.planStore.originalPlanComments();
    const originalPageComments = original?.comments?.find(oc => oc.pageTitleForTL === pageTitleForTL);

    const updatedComments = existing.comments.map(c =>
      c.pageTitleForTL === pageTitleForTL ? { ...c, comment: originalPageComments?.comment ?? '' } : c
    );
    const payload: IPlanCommentResponse = {
      comments: updatedComments,
      creatorRole: original?.creatorRole ?? 0
    };

    this.planStore.setPlanComments(payload);
    this.planStore.updateCurrentUserPageComments(
      this.planStore.currentUserPageComments().filter(c => c !== pageTitleForTL)
    );
  }
}
