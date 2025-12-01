import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: `employees`,
    pathMatch: 'full',
  },
  {
    path: 'employees',
    loadComponent: () => import('./pages/employee-management/employee-management').then((m) => m.EmployeeManagement),
  },
  {
    path: 'investors',
    loadComponent: () => import('./pages/investors-list/investors-list').then((m) => m.InvestorsList),
  },
];
