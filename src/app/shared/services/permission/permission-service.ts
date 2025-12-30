import { Injectable, inject, computed } from '@angular/core';
import { RoleService } from '../role/role-service';
import { ERoles } from '../../enums/roles.enum';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private readonly roleService = inject(RoleService);

  canViewOpportunityDetailsInCard = this.roleService.hasAnyRoleSignal([ERoles.ADMIN]);
  canApplyOnOpportunityCard = this.roleService.hasAnyRoleSignal([ERoles.INVESTOR]);
  canAccessOnOpportunityAdmin = this.roleService.hasAnyRoleSignal([ERoles.ADMIN]);
  canAccessDashboard = this.roleService.hasAnyRoleSignal([ERoles.INVESTOR, ERoles.EMPLOYEE, ERoles.Division_MANAGER, ERoles.DEPARTMENT_MANAGER]);
  canAccessInvestorDashboard = this.roleService.hasAnyRoleSignal([ERoles.INVESTOR]);
  canAccessDvManagerDashboard = this.roleService.hasAnyRoleSignal([ERoles.Division_MANAGER]);
  canAccessUsers = this.roleService.hasAnyRoleSignal([ERoles.ADMIN]);
  canAccessInvestors = this.roleService.hasAnyRoleSignal([ERoles.ADMIN]);
}

