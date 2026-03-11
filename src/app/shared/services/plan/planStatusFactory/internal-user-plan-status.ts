import { inject, Injectable } from '@angular/core';
import { EInternalUserPlanStatus, TColors } from 'src/app/shared/interfaces';
import { IPlanStatus } from 'src/app/shared/interfaces/plans.interface';
import { I18nService } from '../../i18n';

@Injectable({
  providedIn: 'root',
})
export class InternalUserPlanStatus implements IPlanStatus {
  i18nService = inject(I18nService);


  private readonly statusKeyMap: Record<EInternalUserPlanStatus, string> = {
    [EInternalUserPlanStatus.PENDING]: 'plans.employee_status.pendingWithInvestor',
    [EInternalUserPlanStatus.UNDER_REVIEW]: 'plans.employee_status.underReview',
    [EInternalUserPlanStatus.APPROVED]: 'plans.employee_status.approved',
    [EInternalUserPlanStatus.REJECTED]: 'plans.employee_status.rejected',
    [EInternalUserPlanStatus.UNASSIGNED]: 'plans.employee_status.unassigned',
    [EInternalUserPlanStatus.DEPT_APPROVED]: 'plans.employee_status.deptApproved',
    [EInternalUserPlanStatus.DEPT_REJECTED]: 'plans.employee_status.deptRejected',
    [EInternalUserPlanStatus.DV_APPROVED]: 'plans.employee_status.dvApproved',
    [EInternalUserPlanStatus.DV_REJECTED]: 'plans.employee_status.dvRejected',
    [EInternalUserPlanStatus.DV_REJECTION_ACKNOWLEDGED]: 'plans.employee_status.dvRejectionAcknowledged',
    [EInternalUserPlanStatus.EMPLOYEE_APPROVED]: 'plans.employee_status.employeeApproved',
    [EInternalUserPlanStatus.ReturnedByDV]: 'plans.employee_status.returnedByDV',
    [EInternalUserPlanStatus.ReturnedByDEPTManager]: 'plans.employee_status.returnedByDEPTManager',
  };

  getStatusLabel(status: EInternalUserPlanStatus): string {
    return this.i18nService.translate(this.getStatusLabelKey(status));
  }

  getStatusLabelKey(status: EInternalUserPlanStatus): string {
    return this.statusKeyMap[status] ?? 'plans.employee_status.pending';
  }

  getStatusBadgeClass(status: EInternalUserPlanStatus): TColors {
    const classMap: Record<EInternalUserPlanStatus, TColors> = {
      [EInternalUserPlanStatus.EMPLOYEE_APPROVED]: 'fadedBlue',
      [EInternalUserPlanStatus.UNASSIGNED]: 'yellow',
      [EInternalUserPlanStatus.UNDER_REVIEW]: 'blue',
      [EInternalUserPlanStatus.APPROVED]: 'fadeGreen',
      [EInternalUserPlanStatus.DEPT_APPROVED]: 'fadeGreen',
      [EInternalUserPlanStatus.DEPT_REJECTED]: 'red',
      [EInternalUserPlanStatus.DV_APPROVED]: 'fadedBlue',
      [EInternalUserPlanStatus.DV_REJECTED]: 'red',
      [EInternalUserPlanStatus.DV_REJECTION_ACKNOWLEDGED]: 'red',
      //[EInternalUserPlanStatus.EMPLOYEE_REJECTED]: 'red',
      [EInternalUserPlanStatus.PENDING]: 'yellow',
      [EInternalUserPlanStatus.REJECTED]: 'red',
      [EInternalUserPlanStatus.ReturnedByDV]: 'cloudBlue',
      [EInternalUserPlanStatus.ReturnedByDEPTManager]: 'cloudBlue'
    };
    return classMap[status] as TColors || classMap[EInternalUserPlanStatus.PENDING] as TColors;
  }

}
