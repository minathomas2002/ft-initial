import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { I18nService, SupportedLanguage } from '../../services/i18n/i18n.service';
import { SelectModule } from 'primeng/select';
import { TranslatePipe } from '../../pipes';
import { UsersApiService } from '../../api/users/users-api-service';
import { ToasterService } from '../../services/toaster/toaster.service';
import { catchError, of } from 'rxjs';

@Component({
	selector: 'app-language-switcher',
	standalone: true,
	imports: [FormsModule, SelectModule, TranslatePipe],
	templateUrl: './language-switcher.component.html',
	styleUrl: './language-switcher.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
	private readonly i18nService = inject(I18nService);
	private readonly usersApiService = inject(UsersApiService);
	private readonly toast = inject(ToasterService);

	public readonly currentLanguage = this.i18nService.currentLanguage;

	public readonly languages = [
		{ label: 'English', value: 'en' as SupportedLanguage },
		{ label: 'العربية', value: 'ar' as SupportedLanguage },
	];

	public onLanguageChange(lang: SupportedLanguage): void {
		this.i18nService.setLanguage(lang);

		this.usersApiService
			.changeLanguage(lang)
			.pipe(catchError(() => of(null)))
			.subscribe((response) => {
				if (!response?.success) {
					this.toast.error(this.i18nService.translate('common.error'));
				}
			});
	}
}

