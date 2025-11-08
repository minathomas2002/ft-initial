import { Routes } from '@angular/router';

export const OPPORTUNITIES_ROUTES: Routes = [
  {
    path: '',
    redirectTo: `list`,
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./pages/opportunities-list/opportunities-list').then((m) => m.OpportunitiesList),
  },
];
