import { ApplicationConfig, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([jwtInterceptor])),

    // Root-level NgRx store. Feature state is registered per-feature via
    // provideState()/signalStoreFeature at the route level as each
    // feature is implemented in Phase 3 — kept empty here at scaffold time.
    provideStore({}),
    provideEffects([]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
};
