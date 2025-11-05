import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SupportedLanguage } from './i18n.service';

@Injectable({
	providedIn: 'root',
})
export class TranslateService {
	private readonly translationsPath = '/assets/i18n';

	constructor(private http: HttpClient) {}

	/**
	 * Load translations for a specific language
	 */
	async loadTranslations(lang: SupportedLanguage): Promise<Record<string, any>> {
		try {
			const response = await firstValueFrom(
				this.http.get<Record<string, any>>(`${this.translationsPath}/${lang}.json`)
			);
			return response;
		} catch (error) {
			console.error(`Failed to load translations for ${lang}:`, error);
			// Return empty object if translation file doesn't exist
			return {};
		}
	}
}

