import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Dates and numbers in Spanish format (docs/analisis.md §6).
registerLocaleData(localeEs);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
