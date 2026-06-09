import { inject, provideAppInitializer, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ERoutes } from 'src/app/shared/enums';
import { AuthStore, VERIFICATION_EMAIL_STORAGE_KEY } from 'src/app/shared/stores/auth/auth.store';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';

export const isSecInternal = signal(window.location.origin === environment.secDomain);

export function provideSecInternalAuthInitializer() {
  return provideAppInitializer(() => {
    const authStore = inject(AuthStore);
    const router = inject(Router);
    const toast = inject(ToasterService);
    const i18nService = inject(I18nService);

    if (!isSecInternal() || authStore.isAuthenticated()) {
      return;
    }



    return authStore.windowsLogin().pipe(
      tap((response) => {
        if (response.success) {
          localStorage.removeItem(VERIFICATION_EMAIL_STORAGE_KEY);
          void router.navigate(['/', ERoutes.dashboard]);
        }
      }),
      catchError(() => {
        toast.error(i18nService.translate('auth.login.noPortalAccess'));
        return of(undefined);
      }),
    );
  });
}
