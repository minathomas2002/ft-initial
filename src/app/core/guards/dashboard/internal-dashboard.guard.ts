import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { ERoutes, ERoles } from 'src/app/shared/enums';
import { RoleService } from 'src/app/shared/services/role/role-service';

export const internalDashboardGuard: CanActivateFn = (route, state) => {
    const roleService = inject(RoleService);
    const router = inject(Router);

    if (roleService.hasAnyRoleSignal([ERoles.ADMIN])()) {
        return router.navigate([ERoutes.opportunities, ERoutes.admin]);
    }
    else if (roleService.hasAnyRoleSignal([ERoles.INVESTOR, ERoles.Division_MANAGER, ERoles.DEPARTMENT_MANAGER, ERoles.EMPLOYEE])()) {
        return true;
    }
    else {
        throw new Error('Unauthorized: User does not have access to internal dashboard');
    }
};
