import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import type { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { EActionPlanTimeLine } from 'src/app/shared/enums/action-plan-timeline.enum';
import { EInvestorPlanStatus, IPlanRecord } from 'src/app/shared/interfaces';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { InvestorPlanActionsMapper } from '../../classes/investor-plan-actions.mapper';

@Component({
  selector: 'app-investor-dashboard-plan-action-menu',
  imports: [MenuModule, ButtonModule],
  templateUrl: './investor-dashboard-plan-action-menu.html',
  styleUrl: './investor-dashboard-plan-action-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvestorDashboardPlanActionMenu {
  plan = input.required<IPlanRecord>();
  private readonly i18nService = inject(I18nService);
  readonly planStore = inject(PlanStore);
  private readonly actionsMapper = new InvestorPlanActionsMapper(this.i18nService);

  // Outputs for each action
  onEdit = output<IPlanRecord>();
  onViewDetails = output<IPlanRecord>();
  onDownload = output<IPlanRecord>();
  onSubmit = output<IPlanRecord>();
  onAssignToEmployee = output<IPlanRecord>();
  onReAssign = output<IPlanRecord>();
  onCommentSubmitted = output<IPlanRecord>();
  onResubmitted = output<IPlanRecord>();
  onApproved = output<IPlanRecord>();
  onRejected = output<IPlanRecord>();
  onEmployeeApproved = output<IPlanRecord>();
  onDVApproved = output<IPlanRecord>();
  onDeptApproved = output<IPlanRecord>();
  onDVRejected = output<IPlanRecord>();
  onDeptRejected = output<IPlanRecord>();
  onDVRejectionAcknowledged = output<IPlanRecord>();
  onReturnedForMoreInfo = output<IPlanRecord>();
  onViewTimeLine = output<IPlanRecord>();
  onAutoAssign = output<IPlanRecord>();
  onInternalReview = output<IPlanRecord>();
  onRemoveAssignee = output<IPlanRecord>();
  onDelete = output<IPlanRecord>();

  handleEventsMapper = {
    [EActionPlanTimeLine.EditPlan]: this.onEdit,
    [EActionPlanTimeLine.ViewDetails]: this.onViewDetails,
    [EActionPlanTimeLine.DownloadPDF]: this.onDownload,
    [EActionPlanTimeLine.Submitted]: this.onSubmit,
    [EActionPlanTimeLine.Assigned]: this.onAssignToEmployee,
    [EActionPlanTimeLine.Reassigned]: this.onReAssign,
    [EActionPlanTimeLine.CommentSubmitted]: this.onCommentSubmitted,
    [EActionPlanTimeLine.Resubmitted]: this.onResubmitted,
    [EActionPlanTimeLine.Approved]: this.onApproved,
    [EActionPlanTimeLine.Rejected]: this.onRejected,
    [EActionPlanTimeLine.EmployeeApproved]: this.onEmployeeApproved,
    [EActionPlanTimeLine.DVApproved]: this.onDVApproved,
    [EActionPlanTimeLine.DeptApproved]: this.onDeptApproved,
    [EActionPlanTimeLine.DVRejected]: this.onDVRejected,
    [EActionPlanTimeLine.DeptRejected]: this.onDeptRejected,
    [EActionPlanTimeLine.DVRejectionAcknowledged]: this.onDVRejectionAcknowledged,
    [EActionPlanTimeLine.ReturnedForMoreInfo]: this.onReturnedForMoreInfo,
    [EActionPlanTimeLine.ViewTimeLine]: this.onViewTimeLine,
    [EActionPlanTimeLine.AutoAssign]: this.onAutoAssign,
    [EActionPlanTimeLine.InternalReview]: this.onInternalReview,
    [EActionPlanTimeLine.RemoveAssignee]: this.onRemoveAssignee,
    [EActionPlanTimeLine.Delete]: this.onDelete,
  };

  menuItems = computed<MenuItem[]>(() => {
    const plan = this.plan();
    // Build actions array: always include ViewDetails, conditionally add ViewTimeLine and EditPlan, always add DownloadPDF
    const actions: EActionPlanTimeLine[] = [
      EActionPlanTimeLine.ViewDetails,
    ];

    if (plan.actions?.includes(EActionPlanTimeLine.ViewTimeLine)) {
      actions.push(EActionPlanTimeLine.ViewTimeLine);
    }

    if (plan.actions?.includes(EActionPlanTimeLine.EditPlan)) {
      actions.push(EActionPlanTimeLine.EditPlan);
    }

    actions.push(EActionPlanTimeLine.DownloadPDF);

    return this.actionsMapper
      .getActions(actions)
      .map((mItem) => {
        return {
          ...mItem,
          command: () => {
            this.handleEventsMapper[mItem.key]?.emit(plan);
          },
        };
      });
  });
}

