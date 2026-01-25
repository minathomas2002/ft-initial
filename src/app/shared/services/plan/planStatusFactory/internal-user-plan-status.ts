import { inject, Injectable } from '@angular/core';
import { EInternalUserPlanStatus, TColors } from 'src/app/shared/interfaces';
import { IPlanStatus } from 'src/app/shared/interfaces/plans.interface';
import { I18nService } from '../../i18n';

@Injectable({
  providedIn: 'root',
})
export class InternalUserPlanStatus implements IPlanStatus {
  i18nService = inject(I18nService);


  getStatusLabel(status: EInternalUserPlanStatus): string {

    const statusMap = {
      [EInternalUserPlanStatus.PENDING]: this.i18nService.translate('plans.employee_status.pendingWithInvestor'),
      [EInternalUserPlanStatus.UNDER_REVIEW]: this.i18nService.translate('plans.employee_status.underReview'),
      [EInternalUserPlanStatus.APPROVED]: this.i18nService.translate('plans.employee_status.approved'),
      [EInternalUserPlanStatus.REJECTED]: this.i18nService.translate('plans.employee_status.rejected'),
      [EInternalUserPlanStatus.UNASSIGNED]: this.i18nService.translate('plans.employee_status.unassigned'),
      [EInternalUserPlanStatus.DEPT_APPROVED]: this.i18nService.translate('plans.employee_status.deptApproved'),
      [EInternalUserPlanStatus.DEPT_REJECTED]: this.i18nService.translate('plans.employee_status.deptRejected'),
      [EInternalUserPlanStatus.DV_APPROVED]: this.i18nService.translate('plans.employee_status.dvApproved'),
      [EInternalUserPlanStatus.DV_REJECTED]: this.i18nService.translate('plans.employee_status.dvRejected'),
      [EInternalUserPlanStatus.DV_REJECTION_ACKNOWLEDGED]: this.i18nService.translate('plans.employee_status.dvRejectionAcknowledged'),
      [EInternalUserPlanStatus.EMPLOYEE_APPROVED]: this.i18nService.translate('plans.employee_status.employeeApproved'),
      [EInternalUserPlanStatus.EMPLOYEE_REJECTED]: this.i18nService.translate('plans.employee_status.employeeRejected'),
      [EInternalUserPlanStatus.ASSIGNED]: this.i18nService.translate('plans.employee_status.assigned'),
    };
    return statusMap[status] || '';
  }

  getStatusBadgeClass(status: EInternalUserPlanStatus): TColors {
    const classMap: Record<EInternalUserPlanStatus, TColors> = {
      [EInternalUserPlanStatus.EMPLOYEE_APPROVED]: 'green',
      [EInternalUserPlanStatus.UNASSIGNED]: 'yellow',
      [EInternalUserPlanStatus.UNDER_REVIEW]: 'blue',
      [EInternalUserPlanStatus.APPROVED]: 'green',
      [EInternalUserPlanStatus.DEPT_APPROVED]: 'green',
      [EInternalUserPlanStatus.DEPT_REJECTED]: 'red',
      [EInternalUserPlanStatus.DV_APPROVED]: 'green',
      [EInternalUserPlanStatus.DV_REJECTED]: 'red',
      [EInternalUserPlanStatus.DV_REJECTION_ACKNOWLEDGED]: 'red',
      [EInternalUserPlanStatus.EMPLOYEE_REJECTED]: 'red',
      [EInternalUserPlanStatus.PENDING]: 'yellow',
      [EInternalUserPlanStatus.REJECTED]: 'red',
      [EInternalUserPlanStatus.ASSIGNED]: 'orange',
    };
    return classMap[status] as TColors || classMap[EInternalUserPlanStatus.PENDING] as TColors;
  }

}
