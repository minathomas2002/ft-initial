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



  getStatusBadgeClass(status: number): string {
    return this.planStatus().getStatusBadgeClass(status);
  }

    getStatusLabel(status: number): string {
    return this.planStatus().getStatusLabel(status);
  }

}
