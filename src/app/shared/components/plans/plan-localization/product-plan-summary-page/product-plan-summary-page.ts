import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { OverviewCompanyStepSummary } from '../product-localization-plan-wizard/summary-pages/overview-company-step-summary/overview-company-step-summary';
import { ProductPlantOverviewStepSummary } from '../product-localization-plan-wizard/summary-pages/product-plant-overview-step-summary/product-plant-overview-step-summary';
import { ValueChainStepSummary } from '../product-localization-plan-wizard/summary-pages/value-chain-step-summary/value-chain-step-summary';
import { SaudizationStepSummary } from '../product-localization-plan-wizard/summary-pages/saudization-step-summary/saudization-step-summary';
import { ICommentsCountAndPhase } from 'src/app/shared/types/plan-comments.types';
import { Signature } from 'src/app/shared/interfaces/plans.interface';
import { SummarySectionSignature } from '../../summary-section-signature/summary-section-signature';
import { EInternalUserPlanStatus, EInvestorPlanStatus } from 'src/app/shared/interfaces';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { PageCommentBox } from "../../page-comment-box/page-comment-box";
import { ERoles } from 'src/app/shared/enums';
import { RoleService } from 'src/app/shared/services/role/role-service';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-product-plan-summary-page',
  imports: [
    TranslatePipe,
    OverviewCompanyStepSummary,
    ProductPlantOverviewStepSummary,
    ValueChainStepSummary,
    SaudizationStepSummary,
    SummarySectionSignature,
    PageCommentBox
],
  templateUrl: './product-plan-summary-page.html',
  styleUrl: './product-plan-summary-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPlanSummaryPage {
  readonly planStore = inject(PlanStore);
  readonly roleService = inject(RoleService)
  readonly planRejectionsStatus = signal([EInternalUserPlanStatus.DEPT_REJECTED, EInternalUserPlanStatus.DV_REJECTED, EInternalUserPlanStatus.REJECTED, EInternalUserPlanStatus.DV_REJECTION_ACKNOWLEDGED])
  readonly shouldHideActionNoteForInternal = signal([EInternalUserPlanStatus.ReturnedByDV, EInternalUserPlanStatus.ReturnedByDEPTManager, EInternalUserPlanStatus.UNDER_REVIEW, EInternalUserPlanStatus.PENDING, EInternalUserPlanStatus.UNASSIGNED])
  readonly shouldHideActionNoteForInvestor = signal([EInvestorPlanStatus.SUBMITTED, EInvestorPlanStatus.UNDER_REVIEW, EInvestorPlanStatus.PENDING])
  readonly planStatus = computed(() => this.planStore.planStatus() as EInternalUserPlanStatus | EInvestorPlanStatus);
  readonly shouldShowActionNote = computed(() => {
    const status = this.planStatus();

    if (this.isInvestorPersona()) {
      return !this.shouldHideActionNoteForInvestor().includes(status as EInvestorPlanStatus);
    }

    return !this.shouldHideActionNoteForInternal().includes(status as EInternalUserPlanStatus);
  });

  readonly isRejected = computed(() => this.isInvestorPersona()
  ? this.planStore.planStatus() === EInvestorPlanStatus.REJECTED
  : this.planRejectionsStatus().includes(this.planStore.planStatus() as EInternalUserPlanStatus));

  signature = input<Signature | null>(null);
  approvalDepartmentSignature = input<string | null>(null);

  /** From wizard: selectedInputs().length per step (indicator for selected/commented fields). */
  step1CommentsCountAndPhase = input<ICommentsCountAndPhase>({ count: 0, phase: 'none' });
  step2CommentsCountAndPhase = input<ICommentsCountAndPhase>({ count: 0, phase: 'none' });
  step3CommentsCountAndPhase = input<ICommentsCountAndPhase>({ count: 0, phase: 'none' });
  step4CommentsCountAndPhase = input<ICommentsCountAndPhase>({ count: 0, phase: 'none' });

  onEditStep = output<number>();

  onEditStepClick(stepNumber: number): void {
    this.onEditStep.emit(stepNumber);
  }

  // Check if user is employee persona
  isEmployeePersona = computed(() => {
    return this.roleService.hasAnyRoleSignal([ERoles.EMPLOYEE])();
  });

  isInvestorPersona = computed(() => {
    return this.roleService.hasAnyRoleSignal([ERoles.INVESTOR])();
  });

  isDvAcknowledgedStatus = computed(() => {
    return this.planStatus() === EInternalUserPlanStatus.DV_REJECTION_ACKNOWLEDGED;
  })

    hasComments = computed(() => {
    // // Check if any step has saved comments
    const currentUserPageComments = this.planStore.currentUserPageComments();
    return currentUserPageComments.length > 0;
  });
}
