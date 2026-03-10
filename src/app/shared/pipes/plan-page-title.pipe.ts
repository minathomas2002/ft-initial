import { Pipe, PipeTransform, inject, ChangeDetectorRef } from '@angular/core';
import { I18nService } from '../services/i18n/i18n.service';

/**
 * Translates EPlanPageTitle enum values (localization keys) for display.
 * Use when displaying step titles or comment.pageTitleForTL from the API.
 */
@Pipe({
  name: 'planPageTitle',
  standalone: true,
  pure: false,
})
export class PlanPageTitlePipe implements PipeTransform {
  private readonly i18nService = inject(I18nService);
  private readonly cdr = inject(ChangeDetectorRef);

  /** Map display strings (e.g. from API) to translation keys */
  private static readonly DISPLAY_TO_KEY: Record<string, string> = {
    'Attachments': 'plans.form.attachments',
    'attachments': 'plans.form.attachments',
  };

  transform(pageTitle: string): string {
    this.i18nService.currentLanguage(); // reactive to language change
    this.cdr.markForCheck();
    const key = PlanPageTitlePipe.DISPLAY_TO_KEY[pageTitle ?? ''] ?? (pageTitle ?? '');
    const translated = this.i18nService.translate(key);
    return translated || (pageTitle ?? '');
  }
}
