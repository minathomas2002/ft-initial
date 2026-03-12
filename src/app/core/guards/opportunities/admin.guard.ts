import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { ERoles, ERoutes } from 'src/app/shared/enums';
import { RoleService } from 'src/app/shared/services/role/role-service';

export const adminGuard: CanActivateFn = (route, state) => {
  const roleService = inject(RoleService);
  const router = inject(Router);
  if (roleService.hasAnyRoleSignal([ERoles.ADMIN])()) {
    return true;
  }
  return router.navigate(['/', ERoutes.dashboard]);
};
