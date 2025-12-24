import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	OnInit,
	OnDestroy,
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
import { NotificationHubService } from "../../../../../shared/services/signalr/notification-hub.service";
import { Subject, takeUntil } from "rxjs";

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
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarNotificationsComponent implements OnInit, AfterViewInit, OnDestroy {
	private readonly notificationHubService = inject(NotificationHubService);
	private readonly destroy$ = new Subject<void>();

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
		// Start SignalR connection
		this.notificationHubService
			.startConnection()
			.catch((error) => {
				console.error("Failed to start SignalR connection:", error);
			});

		// Subscribe to ReceiveNotification event
		this.notificationHubService
			.onReceiveNotification()
			.pipe(takeUntil(this.destroy$))
			.subscribe((notification) => {
				console.log("Notification received in component:", notification);
				// Handle notification here
				// You can add your notification handling logic here
			});
	}

	ngAfterViewInit(): void {
		// this.notificationsActionsService.setPopoverRef(this.popoverRef);
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
		// Note: We're not stopping the connection here because it might be used by other components
		// If you want to stop it when this component is destroyed, uncomment the line below:
		// this.notificationHubService.stopConnection();
	}
}
