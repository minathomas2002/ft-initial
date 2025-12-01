
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { ERoles, ERoutes } from 'src/app/shared/enums';
import { RoleService } from 'src/app/shared/services/role/role-service';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';

export const adminGuard: CanActivateFn = (route, state) => {
  const roleService = inject(RoleService);
  return roleService.hasAnyRoleSignal([ERoles.ADMIN])();
};
