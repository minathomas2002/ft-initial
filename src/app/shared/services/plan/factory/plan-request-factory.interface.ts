import { Signature, ReviewPlanRequest, IPageComment } from 'src/app/shared/interfaces/plans.interface';

/**
 * Factory interface for creating plan request objects
 * Uses Factory pattern to encapsulate request creation logic
 */
export interface IPlanRequestFactory {
  /**
   * Create a submission request with signature
   */
  createSubmissionRequest(signature?: Signature): FormData;

  /**
   * Create a draft request without signature
   */
  createDraftRequest(): FormData;

  /**
   * Create a review request with comments
   */
  createReviewRequest(comments: IPageComment[]): ReviewPlanRequest;
}
