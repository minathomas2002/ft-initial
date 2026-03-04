import { Pipe, PipeTransform, inject, ChangeDetectorRef } from '@angular/core';
import { PlanPageTitleMapper } from '../classes/plans/plan-page-title.mapper';
import { I18nService } from '../services/i18n/i18n.service';

/**
 * Translates EPlanPageTitle enum values for display.
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
  private readonly mapper = new PlanPageTitleMapper(this.i18nService);

  transform(pageTitle: string): string {
    this.i18nService.currentLanguage(); // reactive to language change
    this.cdr.markForCheck();
    return this.mapper.getTranslatedTitle(pageTitle ?? '');
  }
}
