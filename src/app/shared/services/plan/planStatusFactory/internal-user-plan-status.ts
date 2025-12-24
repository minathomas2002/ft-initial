import { inject, Injectable } from '@angular/core';
import { EEmployeePlanStatus, EInvestorPlanStatus } from 'src/app/shared/interfaces';
import { IPlanStatus } from 'src/app/shared/interfaces/plans.interface';
import { I18nService } from '../../i18n';

@Injectable({
  providedIn: 'root',
})
export class InternalUserPlanStatus implements IPlanStatus{
i18nService = inject(I18nService);


   getStatusLabel(status: EEmployeePlanStatus): string {
    
      const statusMap = {
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
  
    getStatusBadgeClass(status: EEmployeePlanStatus): string {
      const classMap = {
        [EEmployeePlanStatus.EMPLOYEE_APPROVED]: 'bg-primary-50 text-primary-700 border-primary-200',
        [EEmployeePlanStatus.UNASSIGNED]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        [EEmployeePlanStatus.UNDER_REVIEW]: 'bg-blue-50 text-blue-700 border-blue-200',
        [EEmployeePlanStatus.APPROVED]: 'bg-green-50 text-green-700 border-green-200',
        [EEmployeePlanStatus.DEPT_APPROVED]: 'bg-green-50 text-green-700 border-green-200',      
        [EEmployeePlanStatus.DEPT_REJECTED]: 'bg-red-50 text-red-700 border-red-200',
        [EEmployeePlanStatus.DV_APPROVED]: 'bg-green-50 text-green-700 border-green-200',
        [EEmployeePlanStatus.DV_REJECTED]: 'bg-red-50 text-red-700 border-red-200',
        [EEmployeePlanStatus.DV_REJECTION_ACKNOWLEDGED]: 'bg-red-50 text-red-700 border-red-200',
        [EEmployeePlanStatus.EMPLOYEE_REJECTED]: 'bg-red-50 text-red-700 border-red-200',
        [EEmployeePlanStatus.PENDING]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        [EEmployeePlanStatus.REJECTED]: 'bg-red-50 text-red-700 border-red-200',
        [EEmployeePlanStatus.ASSIGNED]: 'bg-orange-50 text-orange-700 border-red-200'
      };
      return classMap[status] || 'bg-gray-50 text-gray-700 border-gray-200';
    }
  
}
