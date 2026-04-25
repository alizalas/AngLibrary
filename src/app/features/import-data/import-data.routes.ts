import { Routes } from '@angular/router';

export const IMPORT_DATA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/import-data.page').then((m) => m.ImportDataPage)
  }
];
