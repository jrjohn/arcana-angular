import { Routes } from '@angular/router';

/**
 * User Feature Routes
 * Lazy-loaded routes for user management
 */
export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./user-list/user-list.component').then(m => m.UserListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./user-form/user-form.component').then(m => m.UserFormComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./user-form/user-form.component').then(m => m.UserFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./user-detail/user-detail.component').then(m => m.UserDetailComponent),
  },
];
