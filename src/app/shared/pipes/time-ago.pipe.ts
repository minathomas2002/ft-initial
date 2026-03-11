import { inject, Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../services/i18n/i18n.service';

@Pipe({
  name: 'timeAgo',
  pure: false,
})
export class TimeAgoPipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(value: Date | string | number): string {
    if (!value) return '';

    const now = new Date().getTime();
    let time: number;

    if (value instanceof Date) {
      time = value.getTime();
    } else if (typeof value === 'string') {
      const isoString = value.includes('Z') ? value : value + 'Z';
      time = new Date(isoString).getTime();
    } else {
      time = value;
    }

    const diff = now - time;

    if (diff < 0) return this.i18n.translate('common.timeAgo.justNow');

    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return this.i18n.translate('common.timeAgo.justNow');

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)
      return this.i18n.translate('common.timeAgo.minutesAgo', { count: minutes });

    const hours = Math.floor(minutes / 60);
    if (hours < 24)
      return this.i18n.translate('common.timeAgo.hoursAgo', { count: hours });

    const days = Math.floor(hours / 24);
    if (days < 7)
      return this.i18n.translate('common.timeAgo.daysAgo', { count: days });

    const weeks = Math.floor(days / 7);
    if (weeks < 4)
      return this.i18n.translate('common.timeAgo.weeksAgo', { count: weeks });

    const months = Math.floor(days / 30);
    if (months < 12)
      return this.i18n.translate('common.timeAgo.monthsAgo', { count: months });

    const years = Math.floor(days / 365);
    return this.i18n.translate('common.timeAgo.yearsAgo', { count: years });
  }
}
