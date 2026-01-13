import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ERoles, ERoutes } from 'src/app/shared/enums';
import { RoleService } from 'src/app/shared/services/role/role-service';

export const internalPlansGuardGuard: CanActivateFn = (route, state) => {
  const roleService = inject(RoleService);
  const router = inject(Router);

  if (roleService.hasAnyRoleSignal([ERoles.INVESTOR])()) {
    return router.navigate([ERoutes.plans, ERoutes.investors]);
  }
  else if (roleService.hasAnyRoleSignal([ERoles.Division_MANAGER, ERoles.DEPARTMENT_MANAGER, ERoles.EMPLOYEE, ERoles.ADMIN])()) {
    return true;
  }
  else {
    throw new Error('Unauthorized: User does not have access to internal plans');
  }
};
