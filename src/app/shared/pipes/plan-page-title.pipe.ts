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

  transform(pageTitle: string): string {
    this.i18nService.currentLanguage(); // reactive to language change
    this.cdr.markForCheck();
    const translated = this.i18nService.translate(pageTitle ?? '');
    return translated || (pageTitle ?? '');
  }
}
