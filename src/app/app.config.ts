import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withPreloading } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { OfflineSyncService } from './data/sync/offline-sync.service';
import { AnalyticsService } from './domain/services/analytics.service';
import { PreloadAllModulesStrategy } from './core/strategies/preload-all-modules.strategy';
import { authInterceptor } from './data/interceptors/auth.interceptor';
import { errorInterceptor } from './data/interceptors/error.interceptor';

// ── Repository layer ─────────────────────────────────────────────────────────
import { USER_REPOSITORY_TOKEN } from './repository/repository.tokens';
import { UserRepositoryImpl } from './repository/impl/user.repository.impl';

/**
 * Initialize offline sync service on app startup
 */
function initializeOfflineSync(_syncService: OfflineSyncService) {
  return () => {
    // Service is instantiated and monitoring starts automatically via DI
    return Promise.resolve();
  };
}

/**
 * Initialize analytics service on app startup
 */
function initializeAnalytics(_analyticsService: AnalyticsService) {
  return () => {
    // Service is instantiated and starts tracking automatically via DI
    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withPreloading(PreloadAllModulesStrategy)
    ),
    provideAnimations(),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeOfflineSync,
      deps: [OfflineSyncService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAnalytics,
      deps: [AnalyticsService],
      multi: true,
    },
    // ── Repository providers ───────────────────────────────────────────────
    { provide: USER_REPOSITORY_TOKEN, useClass: UserRepositoryImpl },
  ]
};
