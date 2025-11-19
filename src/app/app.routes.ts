import { Routes } from '@angular/router';

/**
 * Application Routes
 * Uses lazy loading with loadChildren for better code splitting
 * Each feature module is loaded only when needed
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/layout/main-layout/main-layout.component').then(
        m => m.MainLayoutComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadChildren: () =>
          import('./presentation/features/home/home.routes').then(
            m => m.HOME_ROUTES
          ),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./presentation/features/users/users.routes').then(
            m => m.USERS_ROUTES
          ),
      },
      {
        path: '**',
        redirectTo: 'home'
      }
    ]
  }
];
