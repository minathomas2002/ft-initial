import {
	AfterViewInit,
	Component,
	OnInit,
	ViewChild,
	effect,
	inject,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { BadgeModule } from "primeng/badge";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";
import { OverlayBadgeModule } from "primeng/overlaybadge";
import { Popover, PopoverModule } from "primeng/popover";
import { ERoutes } from "../../../../../shared/enums";

@Component({
	selector: "app-navbar-notifications",
	imports: [
		ButtonModule,
		OverlayBadgeModule,
		BadgeModule,
		MenuModule,
		RouterLink,
		PopoverModule,
	],
	templateUrl: "./navbar-notifications.component.html",
	styleUrl: "./navbar-notifications.component.scss",
})
export class NavbarNotificationsComponent implements OnInit, AfterViewInit {


	lastSync: Date = new Date();

	constructor() {
		// effect(() => {
		// 	const notification = this.signalRStore.notification();
		// 	if (
		// 		notification &&
		// 		new Date(notification.actionDate ?? "").getTime() >
		// 			this.lastSync.getTime()
		// 	) {
		// 		this.notificationsActionsService.pushNotificationToWindows(
		// 			notification,
		// 		);
		// 		this.lastSync = new Date(notification.actionDate);
		// 		this.notificationsActionsService.getAll().subscribe();
		// 	}
		// });
	}

	get ERoutes() {
		return ERoutes;
	}
	ngOnInit(): void {
		// this.notificationsActionsService.getAll().subscribe();
	}
	ngAfterViewInit(): void {
		// this.notificationsActionsService.setPopoverRef(this.popoverRef);
	}
}
