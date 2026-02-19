import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { CoverPageStepSummary } from './summary-pages/cover-page-step-summary/cover-page-step-summary';
import { OverviewStepSummary } from './summary-pages/overview-step-summary/overview-step-summary';
import { ExistingSaudiStepSummary } from './summary-pages/existing-saudi-step-summary/existing-saudi-step-summary';
import { DirectLocalizationStepSummary } from './summary-pages/direct-localization-step-summary/direct-localization-step-summary';
import { Signature } from 'src/app/shared/interfaces/plans.interface';
import { ICommentsCountAndPhase } from 'src/app/shared/types/plan-comments.types';
import { SummarySectionSignature } from '../../summary-section-signature/summary-section-signature';
import { PageCommentBox } from "../../page-comment-box/page-comment-box";
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { EInternalUserPlanStatus } from 'src/app/shared/interfaces';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { RoleService } from 'src/app/shared/services/role/role-service';
import { ERoles } from 'src/app/shared/enums';

@Component({
  selector: 'app-service-plan-summary-page',
  imports: [
    CoverPageStepSummary,
    OverviewStepSummary,
    ExistingSaudiStepSummary,
    DirectLocalizationStepSummary,
    SummarySectionSignature,
    PageCommentBox
],
  templateUrl: './service-plan-summary-page.html',
  styleUrl: './service-plan-summary-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicePlanSummaryPage {
  readonly planStore = inject(PlanStore);
  readonly roleService = inject(RoleService)
  readonly planRejectionsStatus = signal([EInternalUserPlanStatus.DEPT_REJECTED, EInternalUserPlanStatus.DV_REJECTED, EInternalUserPlanStatus.REJECTED, EInternalUserPlanStatus.DV_REJECTION_ACKNOWLEDGED])
  readonly shouldShowActionNote = signal([EInternalUserPlanStatus.ReturnedByDV, EInternalUserPlanStatus.ReturnedByDEPTManager, EInternalUserPlanStatus.UNDER_REVIEW, EInternalUserPlanStatus.PENDING])

  readonly isRejected = computed(() => this.planRejectionsStatus().includes(this.planStore.planStatus() as EInternalUserPlanStatus));
  readonly planStatus = computed(() => this.planStore.planStatus() as EInternalUserPlanStatus);

  onEditStep = output<number>();

  includeExistingSaudi = input<boolean>(true);
  includeDirectLocalization = input<boolean>(true);
  signature = input<Signature | null>(null);

  /** From wizard: selectedInputs().length per step (indicator for selected/commented fields). */
  step1CommentsCountAndPhase = input<ICommentsCountAndPhase>({ count: 0, phase: 'none' });
  step2CommentsCountAndPhase = input<ICommentsCountAndPhase>({ count: 0, phase: 'none' });
  step3CommentsCountAndPhase = input<ICommentsCountAndPhase>({ count: 0, phase: 'none' });
  step4CommentsCountAndPhase = input<ICommentsCountAndPhase>({ count: 0, phase: 'none' });


  onEditStepClick(stepNumber: number): void {
    this.onEditStep.emit(stepNumber);
  }

  // Check if user is employee persona
  isEmployeePersona = computed(() => {
    console.log('yes')
    return this.roleService.hasAnyRoleSignal([ERoles.EMPLOYEE]);
  });
}
