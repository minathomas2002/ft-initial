import { inject, Injectable } from '@angular/core';
import { EInvestorPlanStatus, TColors } from 'src/app/shared/interfaces';
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
      [EInvestorPlanStatus.PENDING]: 'Pending with Investor',
      [EInvestorPlanStatus.UNDER_REVIEW]: this.i18nService.translate('plans.status.underReview'),
      [EInvestorPlanStatus.APPROVED]: this.i18nService.translate('plans.status.approved'),
      [EInvestorPlanStatus.REJECTED]: this.i18nService.translate('plans.status.rejected'),
      [EInvestorPlanStatus.DRAFT]: this.i18nService.translate('plans.status.draft'),
    };
    return statusMap[status] || this.i18nService.translate('plans.status.submitted');
  }

  getStatusBadgeClass(status: EInvestorPlanStatus): TColors {
    const classMap: Record<EInvestorPlanStatus, TColors> = {
      [EInvestorPlanStatus.SUBMITTED]: 'primary',
      [EInvestorPlanStatus.PENDING]: 'yellow',
      [EInvestorPlanStatus.UNDER_REVIEW]: 'blue',
      [EInvestorPlanStatus.APPROVED]: 'green',
      [EInvestorPlanStatus.REJECTED]: 'red',
      [EInvestorPlanStatus.DRAFT]: 'gray',
    };
    return classMap[status] as TColors || classMap[EInvestorPlanStatus.SUBMITTED] as TColors;
  }

}
