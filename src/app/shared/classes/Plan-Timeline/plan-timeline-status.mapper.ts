import { EStatusPlanTimeLine } from "../../enums";
import { TColors } from "../../interfaces";
import { I18nService } from "../../services/i18n";

export class PlanTimelineStatusMapper {
  constructor(private i18nService: I18nService) {
  }

  getStatusBadgeColor(status: EStatusPlanTimeLine): TColors {
    const classMap: Record<EStatusPlanTimeLine, TColors> = {
      [EStatusPlanTimeLine.Submitted]: 'primary',
      [EStatusPlanTimeLine.Unassigned]: 'yellow',
      [EStatusPlanTimeLine.UnderReview]: 'blue',
      [EStatusPlanTimeLine.assigned]: 'yellow',
      [EStatusPlanTimeLine.Reassigned]: 'yellow',
      [EStatusPlanTimeLine.PendingOnInvestor]: 'yellow',
      [EStatusPlanTimeLine.Approved]: 'green',
      [EStatusPlanTimeLine.Rejected]: 'red',
      [EStatusPlanTimeLine.EmployeeApproved]: 'green',
      [EStatusPlanTimeLine.DVApproved]: 'green',
      [EStatusPlanTimeLine.DEPTApproved]: 'green',
      [EStatusPlanTimeLine.DVRejected]: 'red',
      [EStatusPlanTimeLine.DEPTRejected]: 'red',
      [EStatusPlanTimeLine.DVRejectionAcknowledged]: 'orange',
    };
    return classMap[status] as TColors || 'primary';
  }

  getStatusLabel(status: EStatusPlanTimeLine): string {
    const statusMap: Record<EStatusPlanTimeLine, string> = {
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
      [EStatusPlanTimeLine.Submitted]: this.i18nService.translate('plans.employee_status.submitted'),
    };
    return statusMap[status] || '';
  }
}
