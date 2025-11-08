import { Component, computed, inject, model, signal } from "@angular/core";
import { RouterModule } from "@angular/router";
import { PanelModule } from "primeng/panel";
import { SidebarDropdownComponent } from "../sidebar-dropdown/sidebar-dropdown.component";
import { SidebarLinkComponent } from "../sidebar-link/sidebar-link.component";
import type { ISideBarLink } from "./../../models/sidebar.interface";
import { ERoutes } from "../../../../../shared/enums";
import { I18nService } from "../../../../../shared/services/i18n/i18n.service";

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
	private readonly i18nService = inject(I18nService);

	contactUsFormVisibility = signal(false);
	sidebarDrawerVisibility = model(false);

	sidebarLinks = computed<ISideBarLink[]>((): ISideBarLink[] => {
		// Access currentLanguage to make computed reactive to language changes
		this.i18nService.currentLanguage();
		return [
			{
				label: this.i18nService.translate("navigation.dashboard"),
				icon: "icon-home",
				routerLink: ERoutes.dashboard,
				show: true,
			},
      		{
				label: this.i18nService.translate("navigation.users"),
				icon: "icon-users",
				routerLink: ERoutes.users,
				show: true,
			},
			{
				label: this.i18nService.translate("navigation.opportunities"),
				icon: "icon-idea",
				routerLink: ERoutes.opportunities,
				show: true,
			}
		];
	});

	helpLink = computed<ISideBarLink>(() => {
		// Access currentLanguage to make computed reactive to language changes
		this.i18nService.currentLanguage();
		return {
			label: this.i18nService.translate("navigation.help"),
			icon: "icon-help",
			routerLink: "https://rmgsegypt.sharepoint.com/sites/PalantyrKB",
			external: true,
			show: true,
		};
	});

	get DashboardLink() {
		return ERoutes.dashboard;
	}

	closeSidebarDrawer() {
		this.sidebarDrawerVisibility.set(false);
	}
}
