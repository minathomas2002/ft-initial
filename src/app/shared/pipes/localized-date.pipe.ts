import { Pipe, PipeTransform, inject, ChangeDetectorRef } from '@angular/core';
import { formatDate } from '@angular/common';
import { I18nService } from '../services/i18n/i18n.service';

/**
 * Date pipe that formats dates according to the current application language.
 * Use this instead of the standard DatePipe when dates should display in Arabic
 * when the user has selected Arabic as their language.
 */
@Pipe({
  name: 'localizedDate',
  standalone: true,
  pure: false, // Must be impure to react to language changes
})
export class LocalizedDatePipe implements PipeTransform {
  private readonly i18nService = inject(I18nService);
  private readonly cdr = inject(ChangeDetectorRef);

  transform(
    value: string | number | Date | null | undefined,
    format: string = 'dd MMM yyyy',
    timezone?: string
  ): string {
    this.i18nService.currentLanguage(); // Mark for check when language changes
    this.cdr.markForCheck();

    if (value == null || value === '') {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      return '';
    }

    const locale = this.i18nService.currentLanguage() === 'ar' ? 'ar-SA' : 'en-US';
    return formatDate(date, format, locale, timezone);
  }
}
