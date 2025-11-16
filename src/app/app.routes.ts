import { Routes } from '@angular/router';
import { ERoutes } from './shared/enums';
import { AuthLayout } from './core/layouts/auth-layout/auth-layout';
import { visitorsGuard } from './core/guards/visitors/visitors.guard';
import { authGuard } from './core/guards/auth/auth.guard';
const MAIN_LAYOUT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: ERoutes.dashboard,
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((c) => c.DASHBOARD_ROUTES),
        data: { animation: ERoutes.dashboard },
      },
      {
        path: ERoutes.users,
        loadChildren: () => import('./features/users/users.routes').then((c) => c.USERS_ROUTES),
        data: { animation: ERoutes.users },
      },
      {
        path: ERoutes.opportunities,
        loadChildren: () =>
          import('./features/opportunities/opportunities.routes').then(
            (m) => m.OPPORTUNITIES_ROUTES
          ),
        data: { animation: ERoutes.opportunities },
      },
    ],
    canActivate: [authGuard],
  },
];

export const routes: Routes = [
  {
    path: '',
    children: [...MAIN_LAYOUT_ROUTES],
  },
  {
    path: ERoutes.auth,
    component: AuthLayout,
    loadChildren: () =>
      import('./features/authentication/authentication.routes').then(
        (m) => m.AUTHENTICATION_ROUTES
      ),
  },
  {
    path: ERoutes.visitors,
    canActivate: [visitorsGuard],
    loadComponent: () =>
      import('./core/layouts/visitor-layout/visitor-layout').then((m) => m.VisitorLayout),
    children: [
      {
        path: 'opportunities',
        loadChildren: () =>
          import('./features/opportunities/opportunities.routes').then(
            (m) => m.OPPORTUNITIES_ROUTES
          ),
      },
      {
        path: '',
        redirectTo: `${ERoutes.opportunities}`,
        pathMatch: 'full',
      }
    ],
  }      
];
