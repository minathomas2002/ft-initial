import { Routes } from '@angular/router';
import { adminOpportunitiesGuard } from 'src/app/core/guards/opportunities/admin-opportunities.guard';

export const LOGGED_IN_OPPORTUNITIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/opportunities-list/opportunities-list').then((m) => m.OpportunitiesList),

    pathMatch: 'full',
    data: {
      isAnonymous: false
    }
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin-opportunities-view/admin-opportunities-view').then((m) => m.AdminOpportunitiesView),
    canActivate: [adminOpportunitiesGuard],
    pathMatch: 'full',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/opportunity-details/opportunity-details').then((m) => m.OpportunityDetails),
  },
];

export const ANONYMOUS_OPPORTUNITIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/opportunities-list/opportunities-list').then((m) => m.OpportunitiesList),
    pathMatch: 'full',
    data: {
      isAnonymous: true
    }
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/opportunity-details/opportunity-details').then((m) => m.OpportunityDetails),
  },
];
