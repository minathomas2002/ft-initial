import { Injectable, inject, signal, Injector } from '@angular/core';
import { AuthStore } from '../../stores/auth/auth.store';
import { DelegationStore } from '../../stores/system-employees/delegation.store';
import { I18nService } from '../i18n/i18n.service';
import { environment } from 'src/environments/environment';
import { take } from 'rxjs';
import { LocalStorage } from '../local-storage/local-storage';
import { ERoutes } from '../../enums';

@Injectable({ providedIn: 'root' })
export class DelegationCanceledService {
  private readonly injector = inject(Injector);
  isSecInternal = signal(window.location.origin == environment.secDomain);
  readonly visible = signal(false);

  get delegatorDisplayName(): string {
    const authStore = this.injector.get(AuthStore);
    const i18nService = this.injector.get(I18nService);
    const isAr = i18nService.currentLanguage() === 'ar';
    return isAr ? authStore.userProfile()?.nameAR ?? '' : authStore.userProfile()?.nameEN ?? '';
  }

  show(): void {
    this.visible.set(true);
  }

  hide(): void {
    this.visible.set(false);
  }

  onConfirm(): void {
    this.hide();
    this.switchBackToDelegator();
  }

  private switchBackToDelegator(): void {
    const authStore = this.injector.get(AuthStore);
    if (this.isSecInternal()) {
      authStore.windowsLogin({ skipPostLoginSync: true }).pipe(take(1)).subscribe(
        () => {
          setTimeout(() => {
            window.location.href = `/${ERoutes.dashboard}`;
          }, 0);
        }
      );
    } else {
      const userName = authStore.delegateeUserName() ?? '';
      if (!userName) return;
      authStore.fakeWindowsLogin(userName, { skipPostLoginSync: true }).pipe(take(1)).subscribe(
        () => {
          setTimeout(() => {
            window.location.href = `/${ERoutes.dashboard}`;
          }, 0);
        }
      );
    }
  }
}
