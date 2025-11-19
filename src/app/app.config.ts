import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { OfflineSyncService } from './data/sync/offline-sync.service';
import { AnalyticsService } from './domain/services/analytics.service';

/**
 * Initialize offline sync service on app startup
 */
function initializeOfflineSync(syncService: OfflineSyncService) {
  return () => {
    console.log('[App] Offline sync service initialized');
    // Service is instantiated and monitoring starts automatically
    return Promise.resolve();
  };
}

/**
 * Initialize analytics service on app startup
 */
function initializeAnalytics(analyticsService: AnalyticsService) {
  return () => {
    console.log('[App] Analytics service initialized');
    // Service is instantiated and starts tracking automatically
    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withFetch()),
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
  ]
};
