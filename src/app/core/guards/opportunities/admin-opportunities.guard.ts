
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { ERoutes } from 'src/app/shared/enums';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';

export const adminOpportunitiesGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  return true
};
