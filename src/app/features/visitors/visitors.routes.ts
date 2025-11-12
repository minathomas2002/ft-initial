import { Routes } from '@angular/router';

export const VISITORS_ROUTES: Routes = [
  {
    path: 'opportunities',
    loadComponent: () => import('./pages/visitors-opportunities/visitors-opportunities').then((m) => m.VisitorsOpportunities),
  },
  {
    path: 'opportunities/:id',
    loadComponent: () => import('./pages/visitors-opportunity-details/visitors-opportunity-details').then((m) => m.VisitorsOpportunityDetails),
  },
  {
    path: '',
    redirectTo: 'opportunities',
    pathMatch: 'full',
  },
];
