import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../../services/i18n';
import { AuthStore } from '../../stores/auth/auth.store';

@Component({
  selector: 'app-impersonation-message',
  imports: [],
  template: `
  @if(isImpersonating()) {
    <div class="fixed top-0 left-0 right-0 z-10000 bg-primary-500 py-3">
      <p class="text-center text-white">{{ impersonationMessage() }}</p>
    </div>
    <div class="h-[45px] shrink-0" aria-hidden="true"></div>
  }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImpersonationMessage {
  private authStore = inject(AuthStore);
  private i18nService = inject(I18nService);
  protected isImpersonating = computed(() => this.authStore.isImpersonating());
  protected delegatorUserName = computed(() => this.i18nService.currentLanguage() === 'ar' ? this.authStore.userProfile()?.nameAR : this.authStore.userProfile()?.nameEN);
  protected impersonationMessage = computed(() => {
    this.i18nService.currentLanguage(); // reactive to language change
    return this.i18nService.translate('common.loggedInOnBehalfOf', { name: this.delegatorUserName() ?? '' });
  });
}
