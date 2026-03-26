import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	input,
	signal,
	viewChild,
} from '@angular/core';
import { Popover, PopoverModule } from 'primeng/popover';
import { I18nService, SupportedLanguage } from '../../services/i18n/i18n.service';
import { UsersApiService } from '../../api/users/users-api-service';
import { ToasterService } from '../../services/toaster/toaster.service';
import { catchError, of } from 'rxjs';
import { AuthStore } from '../../stores/auth/auth.store';

export interface LanguageSwitcherOption {
	label: string;
	shortLabel: string;
	value: SupportedLanguage;
	icon: string;
}

@Component({
	selector: 'app-language-switcher',
	standalone: true,
	imports: [PopoverModule],
	templateUrl: './language-switcher.component.html',
	styleUrl: './language-switcher.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
	private readonly i18nService = inject(I18nService);
	private readonly usersApiService = inject(UsersApiService);
	private readonly toast = inject(ToasterService);
	private readonly authStore = inject(AuthStore);

	private readonly languagePopover = viewChild<Popover>('languagePopover');

	/** Extra Tailwind (or global) classes for the trigger, e.g. `!bg-white` on auth pages */
	public readonly styleClass = input<string>('');

	public readonly currentLanguage = this.i18nService.currentLanguage;

	public readonly languages: readonly LanguageSwitcherOption[] = [
		{
			label: 'English',
			shortLabel: 'En',
			value: 'en',
			icon: 'assets/images/uk.svg',
		},
		{
			label: 'العربية',
			shortLabel: 'Ar',
			value: 'ar',
			icon: 'assets/images/SA.svg',
		},
	];

	public readonly panelOpen = signal(false);

	/** Default light gray pill; merged with `styleClass` from parent */
	public readonly triggerClass = computed(() => {
		const base =
			'language-switcher__trigger inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-200/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900';
		const grayDefault = 'bg-gray-100';
		const extra = this.styleClass().trim();
		return extra ? `${base} ${grayDefault} ${extra}` : `${base} ${grayDefault}`;
	});

	public readonly currentOption = computed(() => {
		const code = this.currentLanguage();
		const found = this.languages.find((l) => l.value === code);
		return found ?? this.languages[0];
	});

	public readonly ariaLabel = computed(() =>
		this.i18nService.translate('common.language'),
	);

	public toggleLanguagePopover(event: Event): void {
		this.languagePopover()?.toggle(event);
	}

	public onPanelShow(): void {
		this.panelOpen.set(true);
	}

	public onPanelHide(): void {
		this.panelOpen.set(false);
	}

	public selectLanguage(lang: SupportedLanguage): void {
		if (lang !== this.currentLanguage()) {
			this.onLanguageChange(lang);
		}
		this.languagePopover()?.hide();
	}

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
