import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nService, SupportedLanguage } from '../../services/i18n/i18n.service';
import { SelectModule } from 'primeng/select';

@Component({
	selector: 'app-language-switcher',
	standalone: true,
	imports: [CommonModule, FormsModule, SelectModule],
	templateUrl: './language-switcher.component.html',
	styleUrl: './language-switcher.component.scss',
})
export class LanguageSwitcherComponent {
	private readonly i18nService = inject(I18nService);
	
	public readonly currentLanguage = this.i18nService.currentLanguage;
	
	public readonly languages = [
		{ label: 'English', value: 'en' as SupportedLanguage },
		{ label: 'العربية', value: 'ar' as SupportedLanguage },
	];

	public onLanguageChange(lang: SupportedLanguage): void {
		this.i18nService.setLanguage(lang);
	}
}

