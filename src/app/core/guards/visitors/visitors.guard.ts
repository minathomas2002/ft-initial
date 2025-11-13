
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { ERoutes } from 'src/app/shared/enums';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';

export const visitorsGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  if (!authStore.isAuthenticated()) {
    return true;
  } else {
    return router.navigate(['/', ERoutes.dashboard]);
  }
};
