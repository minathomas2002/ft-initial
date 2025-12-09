import { Routes } from '@angular/router';

export const setting_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/admin-setting-view/admin-setting-view').then((m) => m.AdminSettingView),
    pathMatch: 'full',
  },
];