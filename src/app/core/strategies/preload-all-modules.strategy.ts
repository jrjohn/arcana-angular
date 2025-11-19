import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

/**
 * Preloading Strategy: Preload All Modules
 *
 * Preloads all lazy-loaded modules after the initial application load.
 * This improves navigation performance for subsequent route changes.
 *
 * Benefits:
 * - Faster navigation after initial load
 * - Better user experience
 * - Optimizes bundle loading
 *
 * Trade-offs:
 * - Slightly more initial bandwidth usage
 * - Good for small/medium apps where all routes are likely to be visited
 *
 * For more granular control, consider using data-driven preloading:
 * - Add `data: { preload: true }` to routes you want to preload
 * - Implement custom logic in this strategy
 */
@Injectable({
  providedIn: 'root'
})
export class PreloadAllModulesStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Preload all lazy-loaded routes
    return load();
  }
}

/**
 * Selective Preloading Strategy (Optional Alternative)
 *
 * Use this if you want to selectively preload only certain routes.
 * Add `data: { preload: true }` to routes you want to preload.
 *
 * Example:
 * {
 *   path: 'users',
 *   loadChildren: () => import('./features/users/users.routes'),
 *   data: { preload: true }
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Only preload if route has preload flag set to true
    if (route.data && route.data['preload']) {
      console.log('Preloading: ' + route.path);
      return load();
    }
    return of(null);
  }
}
