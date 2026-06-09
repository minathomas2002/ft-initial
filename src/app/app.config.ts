import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { InMemoryScrollingOptions, provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { PRIMENG_CONFIG } from './core/configs/primeng-config';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error/error.interceptor';
import { cultureInterceptor } from './core/interceptors/culture/culture.interceptor';
import { MessageService } from 'primeng/api';
import { DatePipe, DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { provideSecInternalAuthInitializer } from './core/initializers/sec-internal-auth.initializer';
const scrollConfig: InMemoryScrollingOptions = {
  scrollPositionRestoration: "disabled",
};
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideSecInternalAuthInitializer(),
    provideRouter(
      routes,
      withInMemoryScrolling(scrollConfig),
      withComponentInputBinding(),
    ),
    ...PRIMENG_CONFIG,
    provideHttpClient(
      withFetch(),
      withInterceptors(
        [authInterceptor, errorInterceptor, cultureInterceptor]
      ),
    ),
    MessageService,
    DatePipe,
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: { dateFormat: "dd MMM yyyy" },
    },
    {
      provide: LOCALE_ID,
      useFactory: () => {
        if (typeof window !== 'undefined' && window.localStorage) {
          const lang = localStorage.getItem('preferred-language');
          return lang === 'ar' ? 'ar' : 'en-US';
        }
        return 'en-US';
      },
    },
  ]
};
