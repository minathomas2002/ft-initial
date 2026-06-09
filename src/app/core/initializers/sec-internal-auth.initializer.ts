import { inject, provideAppInitializer, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ERoutes } from 'src/app/shared/enums';
import { AuthStore, VERIFICATION_EMAIL_STORAGE_KEY } from 'src/app/shared/stores/auth/auth.store';

export const isSecInternal = signal(window.location.origin === environment.secDomain);

export function provideSecInternalAuthInitializer() {
  return provideAppInitializer(() => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    if (!isSecInternal() || authStore.isAuthenticated()) {
      return;
    }



    return authStore.windowsLogin().pipe(
      tap((response) => {
        if (response.success) {
          localStorage.removeItem(VERIFICATION_EMAIL_STORAGE_KEY);
          void router.navigate(['/', ERoutes.dashboard]);
          return;
        }

        void router.navigate(['/', ERoutes.auth, ERoutes.unauthorizedInternalUser]);
      }),
      catchError(() => {
        void router.navigate(['/', ERoutes.auth, ERoutes.unauthorizedInternalUser]);
        return of(undefined);
      }),
    );
  });
}
