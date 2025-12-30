import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { finalize, tap } from 'rxjs';
import { INotification } from '../../../core/layouts/main-layout/models/notifications.interface';
import { NotificationsApiService } from '../../api/notifications/notifications-api-service';

const initialState: {
  notifications: INotification[];
  totalCount: number;
  unreadCount: number;
  loading: boolean;
  currentPage: number;
  pageSize: number;
} = {
  notifications: [],
  totalCount: 0,
  unreadCount: 0,
  loading: false,
  currentPage: 0,
  pageSize: 20,
};

export const NotificationsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const notificationsApiService = inject(NotificationsApiService);

    return {
      getNotifications(pageIndex: number = 0, pageSize: number = 20) {
        patchState(store, { loading: true, currentPage: pageIndex, pageSize });
        return notificationsApiService.getNotifications(pageIndex, pageSize).pipe(
          tap((response) => {
            const notificationsList = response?.body?.data || [];

            patchState(store, {
              notifications: notificationsList || [],
              totalCount: response.body?.pagination?.totalCount || notificationsList.length || 0,
            });
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        );
      },

      addNotification(notification: INotification): void {
        patchState(store, (state) => ({
          notifications: [notification, ...state.notifications],
          totalCount: state.totalCount + 1,
          unreadCount: state.unreadCount + 1,
        }));
      },

      getUnreadNotification() {
        patchState(store, { loading: true });
        return notificationsApiService.getUnreadNotifications().pipe(
          tap((response: any) => {

            const unreadNotificationsList = response?.body?.data || [];

            patchState(store, {
              notifications: unreadNotificationsList,
              unreadCount: response.body?.pagination?.totalCount || unreadNotificationsList?.length || 0,
            });
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        );
      },
    };
  })
);
