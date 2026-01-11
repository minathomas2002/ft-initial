import { Routes } from '@angular/router';
import { ERoutes } from 'src/app/shared/enums/routes.enum';
import { internalDashboardGuard } from 'src/app/core/guards/dashboard/internal-dashboard.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard-view/dashboard-view').then((m) => m.DashboardView),
    canActivate: [internalDashboardGuard],
    pathMatch: 'full',
  },
  {
    path: ERoutes.investors,
    loadComponent: () =>
      import('./pages/investor-dashboard/investor-dashboard').then((m) => m.InvestorDashboard),
  }
];
