import { Injectable, inject, computed } from '@angular/core';
import { RoleService } from '../role/role-service';
import { ERoles } from '../../enums/roles.enum';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private readonly roleService = inject(RoleService);

  canViewOpportunityDetailsInCard =  this.roleService.hasAnyRoleSignal([ERoles.ADMIN]);
  canApplyOnOpportunityCard =  this.roleService.hasAnyRoleSignal([ERoles.INVESTOR]);
  canAccessOnOpportunityAdmin =  this.roleService.hasAnyRoleSignal([ERoles.ADMIN]);
  
}

