import { inject, Injectable } from '@angular/core';
import { ManagerPlanStatus } from './manager-plan-status';
import { InvestorPlanStatus } from './investor-plan-status';
import { IPlanStatus } from 'src/app/shared/interfaces/plans.interface';
import { RoleService } from '../../role/role-service';
import { ERoles } from 'src/app/shared/enums';

@Injectable({
  providedIn: 'root',
})
export class HandlePlanStatusFactory {
   roleService = inject(RoleService);
   Investor;
  constructor(
		private managerPlanStatus: ManagerPlanStatus,
		private investorPlanStatus: InvestorPlanStatus,
	) {

    this.Investor = this.roleService.hasAnyRoleSignal([ERoles.INVESTOR])()
  }


  handleValidateStatus():IPlanStatus{
    if(this.Investor)
      return this.investorPlanStatus;
    else
      return this.managerPlanStatus;
  }
}
