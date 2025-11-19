import { Routes } from '@angular/router';

/**
 * Home Feature Routes
 * Lazy-loaded routes for home page
 */
export const HOME_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home.component').then(m => m.HomeComponent),
  },
];
