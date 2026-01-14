import { Routes } from '@angular/router';
import { internalPlansGuardGuard } from 'src/app/core/guards/plans/internal-plans-guard';

export const plans_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/plans-list/plans-list').then((m) => m.PlansList),
    canActivate: [internalPlansGuardGuard],
    pathMatch: 'full',
  }
];