import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ERoutes } from 'src/app/shared/enums';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { environment } from 'src/environments/environment';

let hasTriedSecDomainAutoLogin = false;

export const secDomainAutoLoginGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return true;
  }

  const isSecDomain = window.location.origin === environment.secDomain;
  if (!isSecDomain || hasTriedSecDomainAutoLogin) {
    return true;
  }

  hasTriedSecDomainAutoLogin = true;

  return authStore.windowsLogin().pipe(
    map((response) => {
      if (response.success) {
        return router.createUrlTree(['/', ERoutes.dashboard]);
      }

      return router.createUrlTree(['/', ERoutes.anonymous, ERoutes.opportunities]);
    }),
    catchError(() => {
      return of(router.createUrlTree(['/', ERoutes.anonymous, ERoutes.opportunities]));
    })
  );
};
