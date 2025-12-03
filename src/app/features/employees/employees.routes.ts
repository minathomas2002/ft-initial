import { Routes } from '@angular/router';

export const EMPLOYEES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/employees-view/employees-view').then((m) => m.EmployeesView),
    pathMatch: 'full',
  },
];
