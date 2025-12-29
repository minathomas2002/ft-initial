import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { INotification, INotificationItem } from 'src/app/core/layouts/main-layout/models/notifications.interface';
import { TimeAgoPipe } from '../../../../../shared/pipes/time-ago.pipe';
import { Router } from '@angular/router';
import { ERoles, ERoutes } from 'src/app/shared/enums';
import { NotificationItemFactory } from 'src/app/shared/classes/notifications/notification-item.factory';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';

@Component({
  selector: 'app-navbar-notifications-tabs',
  imports: [TimeAgoPipe, ProgressSpinnerModule],
  templateUrl: './navbar-notifications-tabs.html',
  styleUrl: './navbar-notifications-tabs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarNotificationsTabs {
  private readonly router = inject(Router);

  notifications = input<INotification[]>();
  loading = input<boolean>();
  notificationClick = output<void>();
  authStore = inject(AuthStore);
  userRole = computed(() => {
    const role = this.authStore.jwtUserDetails()?.RoleCodes?.[0] as ERoles;
    return role;
  });
  notificationItems = computed<INotificationItem[]>(() => {
    return this.notifications()?.map((notification): INotificationItem => {
      const notificationItem = NotificationItemFactory.create(notification, this.userRole());
      return notificationItem;
    }) || [];
  })

  onNotificationClick(notification: INotificationItem) {
    this.notificationClick.emit();
    this.router.navigate(notification.route || [], { queryParams: notification.params });
  }
}
