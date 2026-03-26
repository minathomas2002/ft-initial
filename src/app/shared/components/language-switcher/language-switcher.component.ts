import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { I18nService, SupportedLanguage } from '../../services/i18n/i18n.service';
import { UsersApiService } from '../../api/users/users-api-service';
import { ToasterService } from '../../services/toaster/toaster.service';
import { catchError, of } from 'rxjs';
import { AuthStore } from '../../stores/auth/auth.store';

@Component({
	selector: 'app-language-switcher',
	standalone: true,
	imports: [],
	templateUrl: './language-switcher.component.html',
	styleUrl: './language-switcher.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
	private readonly i18nService = inject(I18nService);
	private readonly usersApiService = inject(UsersApiService);
	private readonly toast = inject(ToasterService);
	private readonly authStore = inject(AuthStore);

	public readonly currentLanguage = this.i18nService.currentLanguage;

	public readonly languages = [
		{ label: 'English', value: 'en' as SupportedLanguage, icon: 'assets/images/uk.svg' },
		{ label: 'عربي', value: 'ar' as SupportedLanguage, icon: 'assets/images/SA.svg' },
	];

	public readonly otherLanguage = computed<SupportedLanguage>(() =>
		this.currentLanguage() === 'en' ? 'ar' : 'en',
	);

	public readonly otherLanguageOption = computed(() => {
		const code = this.otherLanguage();
		const option = this.languages.find((l) => l.value === code);
		if (!option) {
			throw new Error(`Unknown language: ${code}`);
		}
		return option;
	});

	public readonly ariaLabel = computed(() =>
		this.otherLanguage() === 'ar' ? 'Switch to Arabic' : 'Switch to English',
	);

	public onLanguageChange(lang: SupportedLanguage): void {
		this.i18nService.setLanguage(lang);
		if (this.authStore.isAuthenticated()) {
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
}
