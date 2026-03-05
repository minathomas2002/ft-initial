import en from '../../../assets/i18n/en.json';
import ar from '../../../assets/i18n/ar.json';

export type EnglishTranslations = typeof en;
export type ArabicTranslations = typeof ar;

/**
 * Valid dot-notation keys for translations (e.g. 'common.yes', 'plans.wizard.title').
 * Uses string to avoid "Type instantiation is excessively deep" with large translation files.
 * For strict typing, consider using a smaller/shallow translation type.
 */
export type TranslationKey<T extends object = object> = string;