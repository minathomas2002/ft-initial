import { Routes } from '@angular/router';
import { ERoutes } from './shared/enums';
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
  }
];
