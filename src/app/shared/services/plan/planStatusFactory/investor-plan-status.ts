import { inject, Injectable } from '@angular/core';
import { EInvestorPlanStatus } from 'src/app/shared/interfaces';
import { IPlanStatus } from 'src/app/shared/interfaces/plans.interface';
import { I18nService } from '../../i18n';

@Injectable({
  providedIn: 'root',
})

export class InvestorPlanStatus implements IPlanStatus {
  i18nService = inject(I18nService);

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
  
}
