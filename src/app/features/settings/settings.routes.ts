import { Routes } from '@angular/router';
import { adminGuard } from 'src/app/core/guards/opportunities/admin.guard';

export const setting_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/admin-setting-view/admin-setting-view/admin-setting-view').then((m) => m.AdminSettingView),
    pathMatch: 'full',
  },
  {
    path: 'holidays-management',
    loadComponent: () =>
      import('./pages/admin-setting-view/admin-holidays-management-view/admin-holidays-management-view')
        .then((m) => m.AdminHolidaysManagementView),
    canActivate: [adminGuard],
  },
];