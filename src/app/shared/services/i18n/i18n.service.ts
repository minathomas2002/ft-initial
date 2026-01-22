import { Injectable, signal, computed, effect } from '@angular/core';
import { TranslateService } from './translate.service';

export type SupportedLanguage = 'en' | 'ar';

@Injectable({
	providedIn: 'root',
})
export class I18nService {
	private readonly _currentLanguage = signal<SupportedLanguage>('en');
	public readonly currentLanguage = this._currentLanguage.asReadonly();

	public readonly translations = signal<Record<string, any>>({});

	constructor(private translateService: TranslateService) {
		// Load initial language
		this.loadLanguage(this._currentLanguage());

		// Load language when it changes
		effect(() => {
			const lang = this._currentLanguage();
			this.loadLanguage(lang);
		});
	}

	/**
	 * Set the current language
	 */
	setLanguage(lang: SupportedLanguage): void {
		this._currentLanguage.set(lang);
		// Store preference in localStorage
		if (typeof window !== 'undefined' && window.localStorage) {
			localStorage.setItem('preferred-language', lang);
		}
		// Update document direction for RTL/LTR
		this.updateDocumentDirection(lang);
	}

	/**
	 * Get translation by key
	 */
	translate(key: string, params?: Record<string, any>): string {
		const translation = this.getNestedTranslation(key);
		if (!translation) {
			return key;
		}

		if (params) {
			return this.interpolate(translation, params);
		}

		return translation;
	}

	/**
	 * Get translation by key (alias for translate)
	 */
	t(key: string, params?: Record<string, any>): string {
		return this.translate(key, params);
	}

	/**
	 * Load language translations
	 */
	private async loadLanguage(lang: SupportedLanguage): Promise<void> {
		try {
			const translations = await this.translateService.loadTranslations(lang);
			this.translations.set(translations);
		} catch (error) {
			console.error(`Failed to load translations for language: ${lang}`, error);
		}
	}

	/**
	 * Get nested translation value using dot notation
	 */
	private getNestedTranslation(key: string): string | null {
		const keys = key.split('.');
		let value: any = this.translations();

		for (const k of keys) {
			if (value && typeof value === 'object' && k in value) {
				value = value[k];
			} else {
				return null;
			}
		}

		return typeof value === 'string' ? value : null;
	}

	/**
	 * Interpolate parameters in translation string
	 */
	private interpolate(text: string, params: Record<string, any>): string {
		return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
			return params[key] !== undefined ? String(params[key]) : match;
		});
	}

	/**
	 * Initialize language from localStorage or browser preference
	 */
	initialize(): void {
		if (typeof window !== 'undefined' && window.localStorage) {
			const saved = localStorage.getItem('preferred-language') as SupportedLanguage;
			if (saved && (saved === 'en' || saved === 'ar')) {
				this.setLanguage(saved);
				return;
			}
		}

		// TODO: Uncomment this when finishing all localization work
		// Try to detect from browser
		// if (typeof window !== 'undefined' && window.navigator) {
		// 	const browserLang = navigator.language.split('-')[0];
		// 	if (browserLang === 'ar') {
		// 		this.setLanguage('ar');
		// 		return;
		// 	}
		// }

		// Default to English
		this.setLanguage('en');
	}

	/**
	 * Update document direction based on language
	 */
	private updateDocumentDirection(lang: SupportedLanguage): void {
		if (typeof document === 'undefined') {
			return;
		}

		const htmlElement = document.documentElement;
		const bodyElement = document.body;

		if (lang === 'ar') {
			// Set RTL for Arabic
			htmlElement.setAttribute('dir', 'rtl');
			htmlElement.setAttribute('lang', 'ar');
			bodyElement.classList.add('rtl');
			bodyElement.classList.remove('ltr');
		} else {
			// Set LTR for English and other languages
			htmlElement.setAttribute('dir', 'ltr');
			htmlElement.setAttribute('lang', 'en');
			bodyElement.classList.add('ltr');
			bodyElement.classList.remove('rtl');
		}
	}
}

