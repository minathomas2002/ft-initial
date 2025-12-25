import { EEmployeePlanStatus, TColors } from "src/app/shared/interfaces";
import { I18nService } from "src/app/shared/services/i18n";

export class EmployeePlanStatusMapper {
  constructor(private i18nService: I18nService) {
  }

  getStatusBadgeColor(status: EEmployeePlanStatus): TColors {
    const classMap: Record<EEmployeePlanStatus, TColors> = {
      [EEmployeePlanStatus.EMPLOYEE_APPROVED]: 'primary',
      [EEmployeePlanStatus.UNASSIGNED]: 'yellow',
      [EEmployeePlanStatus.UNDER_REVIEW]: 'blue',
      [EEmployeePlanStatus.APPROVED]: 'green',
      [EEmployeePlanStatus.DEPT_APPROVED]: 'green',
      [EEmployeePlanStatus.DEPT_REJECTED]: 'red',
      [EEmployeePlanStatus.DV_APPROVED]: 'green',
      [EEmployeePlanStatus.DV_REJECTED]: 'red',
      [EEmployeePlanStatus.DV_REJECTION_ACKNOWLEDGED]: 'red',
      [EEmployeePlanStatus.EMPLOYEE_REJECTED]: 'red',
      [EEmployeePlanStatus.PENDING]: 'yellow',
      [EEmployeePlanStatus.REJECTED]: 'red',
      [EEmployeePlanStatus.ASSIGNED]: 'orange'
    };
    return classMap[status] || 'primary';
  }

  getStatusLabel(status: EEmployeePlanStatus): string {
    const statusMap: Record<EEmployeePlanStatus, string> = {
      [EEmployeePlanStatus.PENDING]: this.i18nService.translate('plans.employee_status.pending'),
      [EEmployeePlanStatus.UNDER_REVIEW]: this.i18nService.translate('plans.employee_status.underReview'),
      [EEmployeePlanStatus.APPROVED]: this.i18nService.translate('plans.employee_status.approved'),
      [EEmployeePlanStatus.REJECTED]: this.i18nService.translate('plans.employee_status.rejected'),
      [EEmployeePlanStatus.UNASSIGNED]: this.i18nService.translate('plans.employee_status.unassigned'),
      [EEmployeePlanStatus.DEPT_APPROVED]: this.i18nService.translate('plans.employee_status.deptApproved'),
      [EEmployeePlanStatus.DEPT_REJECTED]: this.i18nService.translate('plans.employee_status.deptRejected'),
      [EEmployeePlanStatus.DV_APPROVED]: this.i18nService.translate('plans.employee_status.dvApproved'),
      [EEmployeePlanStatus.DV_REJECTED]: this.i18nService.translate('plans.employee_status.dvRejected'),
      [EEmployeePlanStatus.DV_REJECTION_ACKNOWLEDGED]: this.i18nService.translate('plans.employee_status.dvRejectionAcknowledged'),
      [EEmployeePlanStatus.EMPLOYEE_APPROVED]: this.i18nService.translate('plans.employee_status.employeeApproved'),
      [EEmployeePlanStatus.EMPLOYEE_REJECTED]: this.i18nService.translate('plans.employee_status.employeeRejected'),
      [EEmployeePlanStatus.ASSIGNED]: this.i18nService.translate('plans.employee_status.assigned'),
    };
    return statusMap[status] || '';
  }
}