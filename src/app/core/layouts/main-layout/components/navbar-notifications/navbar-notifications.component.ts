import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { Popover, PopoverModule } from 'primeng/popover';
import { ERoutes } from '../../../../../shared/enums';
import { NotificationHubService } from '../../../../../shared/services/signalr/notification-hub.service';
import { Subject, takeUntil } from 'rxjs';
import { NavbarNotificationsTabs } from '../navbar-notifications-tabs/navbar-notifications-tabs';
import { INotification } from 'src/app/core/layouts/main-layout/models/notifications.interface';
import { NotificationsStore } from 'src/app/shared/stores/notifications/notifications.store';

@Component({
  selector: 'app-navbar-notifications',
  imports: [
    ButtonModule,
    OverlayBadgeModule,
    BadgeModule,
    MenuModule,
    RouterLink,
    PopoverModule,
    NavbarNotificationsTabs,
  ],
  templateUrl: './navbar-notifications.component.html',
  styleUrl: './navbar-notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarNotificationsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly notificationHubService = inject(NotificationHubService);
  private readonly notificationStore = inject(NotificationsStore);

  private readonly destroy$ = new Subject<void>();
  readonly notifications = this.notificationStore.notifications;
  readonly unreadCount = this.notificationStore.unreadCount;
  readonly isLoading = this.notificationStore.loading;

  get ERoutes() {
    return ERoutes;
  }

  ngOnInit(): void {
    // Start SignalR connection
    this.notificationHubService.startConnection().catch((error) => {
      console.error('Failed to start SignalR connection:', error);
    });

    // Subscribe to ReceiveNotification event
    this.notificationHubService
      .onReceiveNotification()
      .pipe(takeUntil(this.destroy$))
      .subscribe((notification) => {
        console.log('Notification received in component:', notification);
        // Add the new notification to the store
        this.notificationStore.addNotification(notification as INotification);
      });

    this.loadUnreadNotifications();
  }

  loadNotifications() {
    this.notificationStore.getNotifications().pipe(takeUntil(this.destroy$)).subscribe();
  }

  loadUnreadNotifications() {
    this.notificationStore.getUnreadNotification().pipe(takeUntil(this.destroy$)).subscribe();
  }

  onNotificationClick(popover: any) {
    popover.hide();
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
