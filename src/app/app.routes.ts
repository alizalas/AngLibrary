import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
  },
  {
    path: 'shared/:userId',
    loadComponent: () =>
      import('./features/shared-library/pages/shared-library.page').then(
        (m) => m.SharedLibraryPage
      )
  },
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./features/shell/shell.routes').then((m) => m.SHELL_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
