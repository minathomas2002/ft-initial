import { Routes } from '@angular/router';
import { internalDashboardGuard } from 'src/app/core/guards/dashboard/internal-dashboard.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/user-dashboard/user-dashboard').then((m) => m.UserDashboard),
    canActivate: [internalDashboardGuard],
    pathMatch: 'full',
  }
];
