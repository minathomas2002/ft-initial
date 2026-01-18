import { inject, Injectable } from '@angular/core';
import { EInternalUserPlanStatus } from 'src/app/shared/interfaces';
import { IPlanStatus } from 'src/app/shared/interfaces/plans.interface';
import { I18nService } from '../../i18n';

@Injectable({
  providedIn: 'root',
})
export class InternalUserPlanStatus implements IPlanStatus {
  i18nService = inject(I18nService);


  getStatusLabel(status: EInternalUserPlanStatus): string {

    const statusMap = {
      [EInternalUserPlanStatus.PENDING]: 'Pending with Investor',
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

  getStatusBadgeClass(status: EInternalUserPlanStatus): string {
    const classMap = {
      [EInternalUserPlanStatus.EMPLOYEE_APPROVED]: 'bg-primary-50 text-primary-700 border-primary-200',
      [EInternalUserPlanStatus.UNASSIGNED]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      [EInternalUserPlanStatus.UNDER_REVIEW]: 'bg-blue-50 text-blue-700 border-blue-200',
      [EInternalUserPlanStatus.APPROVED]: 'bg-green-50 text-green-700 border-green-200',
      [EInternalUserPlanStatus.DEPT_APPROVED]: 'bg-green-50 text-green-700 border-green-200',
      [EInternalUserPlanStatus.DEPT_REJECTED]: 'bg-red-50 text-red-700 border-red-200',
      [EInternalUserPlanStatus.DV_APPROVED]: 'bg-green-50 text-green-700 border-green-200',
      [EInternalUserPlanStatus.DV_REJECTED]: 'bg-red-50 text-red-700 border-red-200',
      [EInternalUserPlanStatus.DV_REJECTION_ACKNOWLEDGED]: 'bg-red-50 text-red-700 border-red-200',
      [EInternalUserPlanStatus.EMPLOYEE_REJECTED]: 'bg-red-50 text-red-700 border-red-200',
      [EInternalUserPlanStatus.PENDING]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      [EInternalUserPlanStatus.REJECTED]: 'bg-red-50 text-red-700 border-red-200',
      [EInternalUserPlanStatus.ASSIGNED]: 'bg-orange-50 text-orange-700 border-red-200'
    };
    return classMap[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  }

}
