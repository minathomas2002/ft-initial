import { inject, Injectable } from '@angular/core';
import { InternalUserPlanStatus } from './internal-user-plan-status';
import { InvestorPlanStatus } from './investor-plan-status';
import { IPlanStatus } from 'src/app/shared/interfaces/plans.interface';
import { RoleService } from '../../role/role-service';
import { ERoles } from 'src/app/shared/enums';

@Injectable({
  providedIn: 'root',
})
export class HandlePlanStatusFactory {
  private readonly roleService = inject(RoleService);

  constructor(
    private readonly managerPlanStatus: InternalUserPlanStatus,
    private readonly investorPlanStatus: InvestorPlanStatus,
  ) {}

  handleValidateStatus(): IPlanStatus {
    return this.roleService.hasAnyRoleSignal([ERoles.INVESTOR])()
      ? this.investorPlanStatus
      : this.managerPlanStatus;
  }
}
