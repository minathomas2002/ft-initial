import { EInternalUserPlanStatus, EInvestorPlanStatus } from 'src/app/shared/interfaces/dashboard-plans.interface';
import { TWizardMode } from 'src/app/shared/stores/plan/plan.store';
import { TCommentPhase } from 'src/app/shared/types/plan-comments.types';

/** Default Tailwind text class for plan section titles (matches summary section header). */
export const DEFAULT_PLAN_SECTION_TITLE_TEXT_CLASS = 'text-[#1D1E23]';

export interface PlanCommentTitleColorOptions {
  planStatus: EInternalUserPlanStatus | EInvestorPlanStatus | number | null;
  wizardMode: TWizardMode;
  isEmployee: boolean;
}

/**
 * Same rules as {@link BasePlanWizard.getCommentColorForStep} — stepper / comment highlight key.
 */
export function getCommentColorKeyForStep(
  stepCommentPhase: TCommentPhase,
  options: PlanCommentTitleColorOptions,
): 'green' | 'orange' {
  const isViewOrReview = options.wizardMode === 'view' || options.wizardMode === 'Review';
  const showGreenColor =
    isViewOrReview &&
    options.planStatus === EInternalUserPlanStatus.UNDER_REVIEW &&
    options.isEmployee &&
    stepCommentPhase === 'none';
  return showGreenColor ? 'green' : 'orange';
}

export function commentColorKeyToTitleTextClass(key: 'green' | 'orange'): string {
  return key === 'green' ? 'text-success-500' : 'text-orange-500';
}

/** Title text class when the step has comment selections; otherwise default title color. */
export function resolvePlanStepTitleTextClassForComments(
  commentsCount: number,
  stepCommentPhase: TCommentPhase,
  options: PlanCommentTitleColorOptions,
): string {
  if (commentsCount <= 0) {
    return DEFAULT_PLAN_SECTION_TITLE_TEXT_CLASS;
  }
  return commentColorKeyToTitleTextClass(getCommentColorKeyForStep(stepCommentPhase, options));
}
