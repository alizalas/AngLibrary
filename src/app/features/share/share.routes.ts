import { Routes } from '@angular/router';

export const SHARE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/share.page').then((m) => m.SharePage)
  }
];
