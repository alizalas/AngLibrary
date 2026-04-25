import { Routes } from '@angular/router';
import { ShellPage } from './components/shell.page';

export const SHELL_ROUTES: Routes = [
  {
    path: '',
    component: ShellPage,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'library'
      },
      {
        path: 'library',
        loadChildren: () =>
          import('../library/library.routes').then((m) => m.LIBRARY_ROUTES)
      },
      {
        path: 'recommendations',
        loadChildren: () =>
          import('../recommendations/recommendations.routes').then(
            (m) => m.RECOMMENDATIONS_ROUTES
          )
      },
      {
        path: 'stats',
        loadChildren: () => import('../stats/stats.routes').then((m) => m.STATS_ROUTES)
      },
      {
        path: 'import',
        loadChildren: () =>
          import('../import-data/import-data.routes').then((m) => m.IMPORT_DATA_ROUTES)
      },
      {
        path: 'share',
        loadChildren: () => import('../share/share.routes').then((m) => m.SHARE_ROUTES)
      }
    ]
  }
];
