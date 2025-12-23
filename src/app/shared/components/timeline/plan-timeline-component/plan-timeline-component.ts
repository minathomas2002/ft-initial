import { Component, computed, inject, input } from '@angular/core';
import { ITimeLineResponse } from 'src/app/shared/interfaces/plans.interface';
import { Timeline } from "../../utility-components/timeline/timeline";
import { EInvestorPlanStatus, TColors } from 'src/app/shared/interfaces';
import { UserIdentify } from "../user-identify/user-identify";
import { Divider } from "primeng/divider";
import { BaseLabelComponent } from "../../base-components/base-label/base-label.component";
import { DatePipe } from '@angular/common';
import { SystemEmployeeRoleMapper } from 'src/app/shared/classes/role.mapper';
import { ERoles } from 'src/app/shared/enums';
import { I18nService } from 'src/app/shared/services/i18n';
import { TranslatePipe } from 'src/app/shared/pipes';
import { ActionPlanMapper } from 'src/app/shared/classes/action-plan.mapper';
import { EActionPlanTimeLine } from 'src/app/shared/enums/action-plan-timeline.enum';

@Component({
  selector: 'app-plan-timeline-component',
  imports: [Timeline, UserIdentify,DatePipe,TranslatePipe],
  templateUrl: './plan-timeline-component.html',
  styleUrl: './plan-timeline-component.scss',
})
export class TimelineComponent {
InvestorPlanStatus = EInvestorPlanStatus;
  timelineRequests = input.required<ITimeLineResponse[]>();
  i18nService = inject(I18nService);
  employeeRoleMapper = new SystemEmployeeRoleMapper(this.i18nService);
  actionPlanMapper = new ActionPlanMapper(this.i18nService);

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


// investor labels 
  getStatusBadgeClass(status: EInvestorPlanStatus): string {
    const classMap = {
      [EInvestorPlanStatus.SUBMITTED]: 'bg-primary-50 text-primary-700 border-primary-200',
      [EInvestorPlanStatus.PENDING]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      [EInvestorPlanStatus.UNDER_REVIEW]: 'bg-blue-50 text-blue-700 border-blue-200',
      [EInvestorPlanStatus.APPROVED]: 'bg-green-50 text-green-700 border-green-200',
      [EInvestorPlanStatus.REJECTED]: 'bg-red-50 text-red-700 border-red-200',
      [EInvestorPlanStatus.DRAFT]: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return classMap[status] || classMap[EInvestorPlanStatus.SUBMITTED] ;
  }

    getStatusLabel(status: EInvestorPlanStatus): string {
    const statusMap = {
      [EInvestorPlanStatus.SUBMITTED]: this.i18nService.translate('plans.status.submitted'),
      [EInvestorPlanStatus.PENDING]: this.i18nService.translate('plans.status.pending'),
      [EInvestorPlanStatus.UNDER_REVIEW]: this.i18nService.translate('plans.status.underReview'),
      [EInvestorPlanStatus.APPROVED]: this.i18nService.translate('plans.status.approved'),
      [EInvestorPlanStatus.REJECTED]: this.i18nService.translate('plans.status.rejected'),
      [EInvestorPlanStatus.DRAFT]: this.i18nService.translate('plans.status.draft'),
    };
    return statusMap[status] || this.i18nService.translate('plans.status.submitted');
  }

}
