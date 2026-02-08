import { inject, Injectable } from '@angular/core';
import { IPageComment, IPlanCommentResponse } from 'src/app/shared/interfaces/plans.interface';
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

    const mergedComments: IPageComment[] = [...otherPages, { ...currentPageComment } ];

    const payload: IPlanCommentResponse = {
      comments: mergedComments,
      creatorRole: existing!.creatorRole
    };

    this.planStore.setPlanComments(payload);
    this.planStore.updateCurrentUserPageComments([...this.planStore.currentUserPageComments(), currentPageComment.pageTitleForTL]);
  }
}
