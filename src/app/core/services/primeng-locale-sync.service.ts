import { Injectable, inject, effect } from '@angular/core';
import { PrimeNG } from 'primeng/config';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { PRIMENG_LOCALE_AR, PRIMENG_LOCALE_EN } from '../configs/primeng-locale';

/**
 * Syncs PrimeNG translation (DatePicker, etc.) with the current app language.
 * Must be instantiated (e.g. in App) to activate.
 */
@Injectable({ providedIn: 'root' })
export class PrimengLocaleSyncService {
  private readonly primeng = inject(PrimeNG);
  private readonly i18n = inject(I18nService);

  constructor() {
    effect(() => {
      const lang = this.i18n.currentLanguage();
      this.primeng.setTranslation(lang === 'ar' ? PRIMENG_LOCALE_AR : PRIMENG_LOCALE_EN);
    });
  }
}
