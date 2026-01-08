import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { ERoutes, ERoles } from 'src/app/shared/enums';
import { RoleService } from 'src/app/shared/services/role/role-service';

export const internalDashboardGuard: CanActivateFn = (route, state) => {
  const roleService = inject(RoleService);
  const router = inject(Router);

  // Redirect ADMIN to opportunities/admin
  if (roleService.hasAnyRoleSignal([ERoles.ADMIN])()) {
    return router.navigate([ERoutes.opportunities, ERoutes.admin]);
  }

  // Redirect INVESTOR to investor dashboard
  if (roleService.hasAnyRoleSignal([ERoles.INVESTOR])()) {
    return router.navigate([ERoutes.dashboard, ERoutes.investors]);
  }

  // Allow internal users (Division Manager, Department Manager, Employee) to access dashboard
  if (roleService.hasAnyRoleSignal([ERoles.Division_MANAGER, ERoles.DEPARTMENT_MANAGER, ERoles.EMPLOYEE])()) {
    return true;
  }

  // Default fallback: redirect to dv-manager dashboard (for backward compatibility)
  return router.navigate([ERoutes.dashboard, ERoutes.dvManager]);
};
