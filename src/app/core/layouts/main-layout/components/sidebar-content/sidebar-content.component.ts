import { Component, computed, inject, model, signal } from "@angular/core";
import { RouterModule } from "@angular/router";
import { PanelModule } from "primeng/panel";
import { SidebarDropdownComponent } from "../sidebar-dropdown/sidebar-dropdown.component";
import { SidebarLinkComponent } from "../sidebar-link/sidebar-link.component";
import type { ISideBarLink } from "./../../models/sidebar.interface";
import { ERoutes } from "../../../../../shared/enums";

@Component({
	selector: "app-sidebar-content",
	imports: [
		SidebarLinkComponent,
		PanelModule,
		SidebarDropdownComponent,
		RouterModule,
	],
	templateUrl: "./sidebar-content.component.html",
	styleUrl: "./sidebar-content.component.scss",
})
export class SidebarContentComponent {

	contactUsFormVisibility = signal(false);
	sidebarDrawerVisibility = model(false);
	sidebarLinks = computed<ISideBarLink[]>((): ISideBarLink[] => {
		return [
			{
				label: "Dashboard",
				icon: "icon-dashboard",
				routerLink: ERoutes.dashboard,
				show: true,
			}
		];
	});

	helpLink = signal<ISideBarLink>({
		label: "Help",
		icon: "icon-help",
		routerLink: "https://rmgsegypt.sharepoint.com/sites/PalantyrKB",
		external: true,
		show: true,
	});

	get DashboardLink() {
		return ERoutes.dashboard;
	}

	closeSidebarDrawer() {
		this.sidebarDrawerVisibility.set(false);
	}
}
