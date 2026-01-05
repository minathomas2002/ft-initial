import { Pipe, PipeTransform, inject, ChangeDetectorRef } from '@angular/core';
import { I18nService } from '../services/i18n/i18n.service';

@Pipe({
	name: 'slaCountdownNoun',
	standalone: true,
	pure: false,
})
export class SlaCountdownNounPipe implements PipeTransform {
	private readonly i18nService = inject(I18nService);
	private readonly cdr = inject(ChangeDetectorRef);

	transform(numberInDays: number): string {
		// Mark for check to ensure updates when language changes
		this.i18nService.currentLanguage();
		this.cdr.markForCheck();

		const absoluteValue = Math.abs(numberInDays);
		let noun: string;

		if (numberInDays > 1) {
			noun = this.i18nService.translate('plans.table.days');
		} else if (numberInDays == -1) {
			noun = this.i18nService.translate('plans.table.dayOverdue');
		} else if (numberInDays == 1 || numberInDays == 0) {
			noun = this.i18nService.translate('plans.table.day');
		} else {
			noun = this.i18nService.translate('plans.table.daysOverdue');
		}

		return `${absoluteValue} ${noun}`;
	}
}

