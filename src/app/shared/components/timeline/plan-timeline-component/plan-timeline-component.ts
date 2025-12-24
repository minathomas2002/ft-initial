import { Component, computed, inject, input } from '@angular/core';
import { ITimeLineResponse } from 'src/app/shared/interfaces/plans.interface';
import { Timeline } from "../../utility-components/timeline/timeline";
import { EInvestorPlanStatus, TColors } from 'src/app/shared/interfaces';
import { Divider } from "primeng/divider";
import { DatePipe } from '@angular/common';
import { SystemEmployeeRoleMapper } from 'src/app/shared/classes/role.mapper';
import { ERoles } from 'src/app/shared/enums';
import { I18nService } from 'src/app/shared/services/i18n';
import { TranslatePipe } from 'src/app/shared/pipes';
import { ActionPlanMapper } from 'src/app/shared/classes/action-plan.mapper';
import { EActionPlanTimeLine } from 'src/app/shared/enums/action-plan-timeline.enum';
import { HandlePlanStatusFactory } from 'src/app/shared/services/plan/planStatusFactory/handle-plan-status-factory';
import { IdentifyUserComponent } from "../../utility-components/identify-user/identify-user.component";
import { EStatusPlanTimeLine } from 'src/app/shared/enums/status-plan-timline.enum';

@Component({
  selector: 'app-plan-timeline-component',
  imports: [Timeline, DatePipe, TranslatePipe, Divider, IdentifyUserComponent],
  templateUrl: './plan-timeline-component.html',
  styleUrl: './plan-timeline-component.scss',
})
export class TimelineComponent {
InvestorPlanStatus = EInvestorPlanStatus;
  timelineRequests = input.required<ITimeLineResponse[]>();
  i18nService = inject(I18nService);
  employeeRoleMapper = new SystemEmployeeRoleMapper(this.i18nService);
  actionPlanMapper = new ActionPlanMapper(this.i18nService);
  planStatusFactory = inject(HandlePlanStatusFactory);
 planStatus = computed(()=> this.planStatusFactory.handleValidateStatus());
  events = computed<{ color: TColors; item: ITimeLineResponse }[]>(() => {
    const requestData = this.timelineRequests();
    if (!this.timelineRequests) {
      // Get the current value of the signal.

      return []; // Return an empty array if request or timelineDetails is null/undefined.  Important for avoiding errors.
    }

    return requestData.map((detail) => {
      const color: TColors =
        detail.status === EInvestorPlanStatus.APPROVED ? 'green' : 'blue';

      return {
        color: color,
        item: {
          ...detail,
        },
      };
    });
  });

  getUserTranslatedRole(roleCode: number): string {
      return this.employeeRoleMapper.getTranslatedRole(roleCode as ERoles);
    }

  getUserTranslatedAction(actionCode: number): string {
      return this.actionPlanMapper.getTranslatedAction(actionCode as EActionPlanTimeLine);
    }



  getStatusBadgeClass(status: EStatusPlanTimeLine): string {
    const classMap = {
            [EStatusPlanTimeLine.Submitted]: 'bg-primary-50 text-primary-700 border-primary-200',
            [EStatusPlanTimeLine.Unassigned]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            [EStatusPlanTimeLine.UnderReview]: 'bg-blue-50 text-blue-700 border-blue-200',
            [EStatusPlanTimeLine.assigned]: 'bg-green-50 text-green-700 border-green-200',
            [EStatusPlanTimeLine.Reassigned]: 'bg-green-50 text-green-700 border-green-200',      
            [EStatusPlanTimeLine.PendingOnInvestor]: 'bg-red-50 text-red-700 border-red-200',
            [EStatusPlanTimeLine.Approved]: 'bg-green-50 text-green-700 border-green-200',
            [EStatusPlanTimeLine.Rejected]: 'bg-red-50 text-red-700 border-red-200',
            [EStatusPlanTimeLine.EmployeeApproved]: 'bg-red-50 text-red-700 border-red-200',
            [EStatusPlanTimeLine.DVApproved]: 'bg-red-50 text-red-700 border-red-200',
            [EStatusPlanTimeLine.DEPTApproved]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            [EStatusPlanTimeLine.DVRejected]: 'bg-red-50 text-red-700 border-red-200',
            [EStatusPlanTimeLine.DEPTRejected]: 'bg-orange-50 text-orange-700 border-red-200',
            [EStatusPlanTimeLine.DVRejectionAcknowledged]: 'bg-orange-50 text-orange-700 border-red-200',
          };
          return classMap[status] || '';
  }

  getStatusLabel(status: EStatusPlanTimeLine): string {
       const statusMap = {
              [EStatusPlanTimeLine.PendingOnInvestor]: this.i18nService.translate('plans.employee_status.pendingOnInvestor'),
              [EStatusPlanTimeLine.UnderReview]: this.i18nService.translate('plans.employee_status.underReview'),
              [EStatusPlanTimeLine.Approved]: this.i18nService.translate('plans.employee_status.approved'),
              [EStatusPlanTimeLine.Rejected]: this.i18nService.translate('plans.employee_status.rejected'),
              [EStatusPlanTimeLine.Unassigned]: this.i18nService.translate('plans.employee_status.unassigned'),
              [EStatusPlanTimeLine.DEPTApproved]: this.i18nService.translate('plans.employee_status.deptApproved'),
              [EStatusPlanTimeLine.DEPTRejected]: this.i18nService.translate('plans.employee_status.deptRejected'),
              [EStatusPlanTimeLine.DVApproved]: this.i18nService.translate('plans.employee_status.dvApproved'),
              [EStatusPlanTimeLine.DVRejected]: this.i18nService.translate('plans.employee_status.dvRejected'),
              [EStatusPlanTimeLine.DVRejectionAcknowledged]: this.i18nService.translate('plans.employee_status.dvRejectionAcknowledged'),
              [EStatusPlanTimeLine.EmployeeApproved]: this.i18nService.translate('plans.employee_status.employeeApproved'),
              [EStatusPlanTimeLine.Reassigned]: this.i18nService.translate('plans.employee_status.reassigned'),
              [EStatusPlanTimeLine.assigned]: this.i18nService.translate('plans.employee_status.assigned'),
              [EStatusPlanTimeLine.Submitted]: this.i18nService.translate('plans.employee_status.Submitted'),
            };
            return statusMap[status] || '';
  }

}
