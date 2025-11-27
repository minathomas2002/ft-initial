import type { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
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

/**
 * Check if the request is for loading translation files
 * We skip the interceptor for these requests to avoid circular dependency
 */
const isTranslationRequest = (url: string): boolean => {
  return url.includes('/assets/i18n/');
};

export const cultureInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip interceptor for translation file requests to avoid circular dependency
  if (isTranslationRequest(req.url)) {
    return next(req);
  }
  
  // Use Injector to lazily get the service to avoid circular dependency
  // This ensures the service is only resolved when the interceptor actually runs,
  // not during HTTP client initialization
  const injector = inject(Injector);
  
  try {
    const i18nService = injector.get(I18nService, null);
    if (i18nService) {
      const currentLang = i18nService.currentLanguage();
      const languageCode = getLanguageCode(currentLang);
      
      // Clone the request and add Accept-Language header
      const clonedRequest = req.clone({
        setHeaders: {
          'Accept-Language': languageCode,
        },
      });
      
      return next(clonedRequest);
    }
  } catch (error) {
    // If service is not available yet, proceed without the header
    // This can happen during initial bootstrap when I18nService is still initializing
  }
  
  // Fallback: proceed without Accept-Language header if service is unavailable
  return next(req);
};

