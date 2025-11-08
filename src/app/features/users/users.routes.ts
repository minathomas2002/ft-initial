import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: `list`,
    pathMatch: 'full',
  },
  {
    path: 'list',
    loadComponent: () => import('./pages/users-view/users-view').then((m) => m.UsersView),
  },
];
