import { Component, computed, inject, input } from '@angular/core';
import { ITimeLineResponse } from 'src/app/shared/interfaces/plans.interface';
import { Timeline } from "../../utility-components/timeline/timeline";
import { EInvestorPlanStatus, TColors } from 'src/app/shared/interfaces';
import { Divider } from "primeng/divider";
import { DatePipe } from '@angular/common';
import { SystemEmployeeRoleMapper } from 'src/app/shared/classes/role.mapper';
import { ERoles } from 'src/app/shared/enums';
import { I18nService } from 'src/app/shared/services/i18n';
import { CamelCaseToWordPipe, TranslatePipe } from 'src/app/shared/pipes';
import { HandlePlanStatusFactory } from 'src/app/shared/services/plan/planStatusFactory/handle-plan-status-factory';
import { IdentifyUserComponent } from "../../utility-components/identify-user/identify-user.component";
import { EStatusPlanTimeLine } from 'src/app/shared/enums';
import { BaseTagComponent } from "../../base-components/base-tag/base-tag.component";
import { PlanTimelineActionsMapper } from 'src/app/shared/classes/Plan-Timeline/plan-timeline-actions.mapper';
import { PlanTimelineStatusMapper } from 'src/app/shared/classes/Plan-Timeline/plan-timeline-status.mapper';
import { EActionPlanTimeLine } from 'src/app/shared/enums/action-plan-timeline.enum';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-plan-timeline-component',
  imports: [
    Timeline,
    DatePipe,
    TranslatePipe,
    Divider,
    IdentifyUserComponent,
    BaseTagComponent,
    CamelCaseToWordPipe,
    TextareaModule
  ],
  templateUrl: './plan-timeline-component.html',
  styleUrl: './plan-timeline-component.scss',
})
export class TimelineComponent {
  timelineRequests = input.required<ITimeLineResponse[]>();
  private readonly i18nService = inject(I18nService);
  private readonly employeeRoleMapper = new SystemEmployeeRoleMapper(this.i18nService);
  private readonly actionPlanMapper = new PlanTimelineActionsMapper(this.i18nService);
  private readonly planTimelineStatusMapper = new PlanTimelineStatusMapper(this.i18nService);
  private readonly planStatusFactory = inject(HandlePlanStatusFactory);
  planStatus = computed(() => this.planStatusFactory.handleValidateStatus());
  events = computed<{ color: TColors; item: ITimeLineResponse }[]>(() => {
    const requestData = this.timelineRequests();
    if (!this.timelineRequests) {
      return []; // Return an empty array if request or timelineDetails is null/undefined.  Important for avoiding errors.
    }

    return requestData.map((detail) => {
      const color: TColors =
        detail.status === EStatusPlanTimeLine.Rejected ? 'red' : 'blue';

      return {
        color: color,
        item: {
          ...detail,
        },
      };
    });
  });

  get InvestorPlanStatus() {
    return EInvestorPlanStatus;
  }

  get planApprovedActionsEnum() {
    return [EActionPlanTimeLine.Approved, EActionPlanTimeLine.DeptApproved, EActionPlanTimeLine.DVApproved, EActionPlanTimeLine.EmployeeApproved];
  }

  get planRejectedActionsEnum() {
    return [EActionPlanTimeLine.Rejected, EActionPlanTimeLine.DeptRejected, EActionPlanTimeLine.DVRejected, EActionPlanTimeLine.DVRejectionAcknowledged];
  }

  getUserTranslatedRole(roleCode: ERoles): string {
    return this.employeeRoleMapper.getTranslatedRole(roleCode);
  }

  getUserTranslatedAction(item: ITimeLineResponse): string {
    return this.actionPlanMapper.getTranslatedAction(item.actionType, this.actionPlanMapper.getActionParam(item));
  }

  getStatusBadgeColor(status: EStatusPlanTimeLine): TColors {
    return this.planTimelineStatusMapper.getStatusBadgeColor(status);
  }

  getStatusLabel(status: EStatusPlanTimeLine): string {
    return this.planTimelineStatusMapper.getStatusLabel(status);
  }

}
