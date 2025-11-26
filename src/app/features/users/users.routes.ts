import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: `employees`,
    pathMatch: 'full',
  },
  {
    path: 'employees',
    loadComponent: () => import('./pages/users-view/users-view').then((m) => m.UsersView),
  },
  {
    path: 'investors',
    loadComponent: () => import('./pages/investors-list/investors-list').then((m) => m.InvestorsList),
  },
];
