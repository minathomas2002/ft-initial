import { inject, Injectable } from '@angular/core';
import { EInvestorPlanStatus, TColors } from 'src/app/shared/interfaces';
import { IPlanStatus } from 'src/app/shared/interfaces/plans.interface';
import { I18nService } from '../../i18n';

@Injectable({
  providedIn: 'root',
})

export class InvestorPlanStatus implements IPlanStatus {
  i18nService = inject(I18nService);

  private readonly statusKeyMap: Record<EInvestorPlanStatus, string> = {
    [EInvestorPlanStatus.SUBMITTED]: 'plans.status.submitted',
    [EInvestorPlanStatus.PENDING]: 'plans.status.pendingWithInvestor',
    [EInvestorPlanStatus.UNDER_REVIEW]: 'plans.status.underReview',
    [EInvestorPlanStatus.APPROVED]: 'plans.status.approved',
    [EInvestorPlanStatus.REJECTED]: 'plans.status.rejected',
    [EInvestorPlanStatus.DRAFT]: 'plans.status.draft',
  };

  getStatusLabel(status: EInvestorPlanStatus): string {
    return this.i18nService.translate(this.getStatusLabelKey(status));
  }

  getStatusLabelKey(status: EInvestorPlanStatus): string {
    return this.statusKeyMap[status] ?? 'plans.status.submitted';
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
