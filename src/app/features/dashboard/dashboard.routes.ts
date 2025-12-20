import { Routes } from '@angular/router';
import { ERoutes } from 'src/app/shared/enums/routes.enum';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard-view/dashboard-view').then((m) => m.DashboardView),
    pathMatch: 'full',
  },
  {
    path: ERoutes.investors,
    loadComponent: () =>
      import('./pages/investor-dashboard/investor-dashboard').then((m) => m.InvestorDashboard),
  },
  {
    path: ERoutes.dvManager,
    loadComponent: () =>
      import('./pages/dv-manager-dashboard/dv-manager-dashboard').then((m) => m.DvManagerDashboard),
  },
];
