import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeArSA from '@angular/common/locales/ar-SA';
import { appConfig } from './app/app.config';
import { App } from './app/app';

registerLocaleData(localeArSA, 'ar-SA');

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
