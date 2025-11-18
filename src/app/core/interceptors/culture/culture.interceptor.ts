import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { I18nService } from '../../../shared/services/i18n/i18n.service';

/**
 * Map language codes to Accept-Language format
 */
const getLanguageCode = (lang: string): string => {
  const languageMap: Record<string, string> = {
    'en': 'en-US',
    'ar': 'ar-SA',
  };
  return languageMap[lang] || lang;
};

export const cultureInterceptor: HttpInterceptorFn = (req, next) => {
  const i18nService = inject(I18nService);
  const currentLang = i18nService.currentLanguage();
  
  // Get the language code in Accept-Language format
  const languageCode = getLanguageCode(currentLang);
  
  // Clone the request and add Accept-Language header
  const clonedRequest = req.clone({
    setHeaders: {
      'Accept-Language': languageCode,
    },
  });

  return next(clonedRequest);
};

