import { Routes } from '@angular/router';
import { internalPlansGuardGuard } from 'src/app/core/guards/plans/internal-plans-guard';
import { ERoutes } from 'src/app/shared/enums';

export const plans_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/plans-list/plans-list').then((m) => m.PlansList),
    pathMatch: 'full',
    canActivate: [internalPlansGuardGuard]
  },
  {
    path: ERoutes.investors,
    loadComponent: () =>
      import('./pages/investor-plans/investor-plans').then((m) => m.InvestorPlans),
  }
];