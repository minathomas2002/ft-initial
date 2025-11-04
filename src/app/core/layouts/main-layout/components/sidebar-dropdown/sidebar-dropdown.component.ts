import { Component, input, output } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { PanelModule } from "primeng/panel";
import { PanelMenuModule } from "primeng/panelmenu";
import type { ISideBarLink } from "../../models/sidebar.interface";
@Component({
	selector: "app-sidebar-dropdown",
	imports: [PanelModule, RouterLink, RouterLinkActive, PanelMenuModule],
	templateUrl: "./sidebar-dropdown.component.html",
	styleUrl: "./sidebar-dropdown.component.scss",
})
export class SidebarDropdownComponent {
	link = input.required<ISideBarLink>();
	onCloseSidebarDrawer = output<void>();
}
