import { Routes } from '@angular/router';

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
        loadComponent: () =>
          import('./presentation/features/home/home.component').then(
            m => m.HomeComponent
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./presentation/features/users/user-list/user-list.component').then(
            m => m.UserListComponent
          ),
      },
      // More specific routes must come before parameterized routes
      {
        path: 'users/new',
        loadComponent: () =>
          import('./presentation/features/users/user-form/user-form.component').then(
            m => m.UserFormComponent
          ),
      },
      {
        path: 'users/:id/edit',
        loadComponent: () =>
          import('./presentation/features/users/user-form/user-form.component').then(
            m => m.UserFormComponent
          ),
      },
      {
        path: 'users/:id',
        loadComponent: () =>
          import('./presentation/features/users/user-detail/user-detail.component').then(
            m => m.UserDetailComponent
          ),
      },
      {
        path: '**',
        redirectTo: 'home'
      }
    ]
  }
];
