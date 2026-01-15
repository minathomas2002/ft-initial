import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { INotification, INotificationItem } from 'src/app/core/layouts/main-layout/models/notifications.interface';
import { TimeAgoPipe } from '../../../../../shared/pipes/time-ago.pipe';
import { Router } from '@angular/router';
import { ERoles, ERoutes } from 'src/app/shared/enums';
import { NotificationItemFactory } from 'src/app/shared/classes/notifications/notification-item.factory';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { NotificationsStore } from 'src/app/shared/stores/notifications/notifications.store';

@Component({
  selector: 'app-navbar-notifications-tabs',
  imports: [TimeAgoPipe, ProgressSpinnerModule],
  templateUrl: './navbar-notifications-tabs.html',
  styleUrl: './navbar-notifications-tabs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarNotificationsTabs {
  notifications = input<INotification[]>();
  loading = input<boolean>();
  notificationClick = output<INotificationItem>();
  authStore = inject(AuthStore);
  notificationStore = inject(NotificationsStore);
  userRole = computed(() => {
    const role = this.authStore.jwtUserDetails()?.RoleCodes?.[0] as ERoles;
    return role;
  });
  notificationItems = computed<INotificationItem[]>(() => {
    return this.notifications()?.map((notification): INotificationItem => {
      const notificationItem = NotificationItemFactory.create(notification, Number(this.userRole()));
      return notificationItem;
    }) || [];
  })

  onNotificationClick(notification: INotificationItem) {
    this.notificationClick.emit(notification)
  }
}
