import { Pipe, PipeTransform, inject, ChangeDetectorRef } from '@angular/core';
import { I18nService } from '../services/i18n/i18n.service';

@Pipe({
	name: 'translate',
	standalone: true,
	pure: false,
})
export class TranslatePipe implements PipeTransform {
	private readonly i18nService = inject(I18nService);
	private readonly cdr = inject(ChangeDetectorRef);

	transform(key: string, params?: Record<string, any>): string {
		// Mark for check to ensure updates when language changes
		this.i18nService.currentLanguage();
		this.cdr.markForCheck();
		
		return this.i18nService.translate(key, params);
	}
}

