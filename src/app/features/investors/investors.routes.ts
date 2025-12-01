import { Routes } from '@angular/router';

export const INVESTORS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/investors-list/investors-list').then((m) => m.InvestorsList), pathMatch: 'full',
  },
];
