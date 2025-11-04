import { Routes } from '@angular/router';
import { ERoutes } from './shared/enums';
import { AuthLayout } from './core/layouts/auth-layout/auth-layout';
const MAIN_LAYOUT_ROUTES: Routes = [
	{
		path: "",
		loadComponent: () =>
			import("./core/layouts/main-layout/main-layout.component").then(
				(m) => m.MainLayoutComponent,
			),
		children: [
			{
				path: "",
				redirectTo: `${ERoutes.dashboard}`,
				pathMatch: "full",
			},
			{
				path: ERoutes.dashboard,
				loadComponent: () =>
					import(
						"./features/dashboard/pages/dashboard-view/dashboard-view"
					).then((c) => c.DashboardView),
				data: { animation: ERoutes.dashboard },
			},
		],
	},
];
export const routes: Routes = [
  {
    path: '',
    children: [...MAIN_LAYOUT_ROUTES],
  },
  {
	path: 'auth',
	component: AuthLayout,
	loadChildren: () =>
		import('./features/authentication/authentication.routes').then((m) => m.AUTHENTICATION_ROUTES),
  }
];
