import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { InMemoryScrollingOptions, provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { PRIMENG_CONFIG } from './core/configs/primeng-config';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error/error.interceptor';
import { MessageService } from 'primeng/api';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
const scrollConfig: InMemoryScrollingOptions = {
	scrollPositionRestoration: "disabled",
};
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    		provideRouter(
			routes,
			withInMemoryScrolling(scrollConfig),
			withComponentInputBinding(),
		),
    ...PRIMENG_CONFIG,
    provideHttpClient(
			withFetch(),
			withInterceptors([authInterceptor, errorInterceptor]),
		),
    MessageService,
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: { dateFormat: "dd MMM yyyy" },
    },
  ]
};
