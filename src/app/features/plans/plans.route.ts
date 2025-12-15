import { Routes } from '@angular/router';
import { adminGuard } from 'src/app/core/guards/opportunities/admin.guard';

export const plans_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/plans-list/plans-list').then((m) => m.PlansList),
    pathMatch: 'full',
    canActivate: [adminGuard]
  },
  
];