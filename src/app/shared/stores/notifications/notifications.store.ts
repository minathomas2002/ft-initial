import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { finalize, switchMap, tap } from 'rxjs';
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
      getNotifications(pageIndex: number = 0, pageSize: number = 5) {
        patchState(store, { loading: true, currentPage: pageIndex, pageSize });
        return notificationsApiService.getNotifications(pageIndex, pageSize).pipe(
          tap((response) => {
            const notificationsList = response?.body?.data || [];

            patchState(store, {
              notifications: notificationsList || [],
              totalCount: response.body?.totalCount || notificationsList.length || 0,
            });
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        );
      },

      /**
       * Fetch next page of notifications and append to existing list
       */
      getMoreNotifications(pageIndex?: number, pageSize?: number) {
        const nextPage = pageIndex ?? (store.currentPage() + 1);
        const size = pageSize ?? store.pageSize();
        patchState(store, { loading: true, currentPage: nextPage, pageSize: size });
        return notificationsApiService.getNotifications(nextPage, size).pipe(
          tap((response) => {
            const notificationsList = response?.body?.data || [];
            patchState(store, (state) => ({
              notifications: [...state.notifications, ...(notificationsList || [])],
              totalCount: response.body?.totalCount || (state.totalCount || 0),
            }));
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
          tap((response) => {

            const unreadNotificationsList = response?.body?.data || [];

            patchState(store, {
              notifications: unreadNotificationsList,
              unreadCount: response.body?.totalCount || unreadNotificationsList?.length || 0,
            });
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        );
      },

      setNotificationAsRead(id: string) {
        const notification = store.notifications().find(n => n.id === id);
        const isAlreadyRead = notification?.isRead || false;

        if (isAlreadyRead) return;

        const previousState = {
          notifications: [...store.notifications()],
          unreadCount: store.unreadCount(),
        };

        // Optimistically update the UI only if not already read
        if (!isAlreadyRead) {
          patchState(store, (state) => ({
            notifications: state.notifications.map(n =>
              n.id === id ? { ...n, isRead: true, readDate: new Date().toISOString() } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }));
        }

        // Always call the API to mark as read (backend handles idempotency)
        notificationsApiService.markNotificationAsRead(id).pipe(
              switchMap(() => notificationsApiService.getUnreadNotifications()),
              tap((response) => {
                // Only update unread count, don't replace notifications list
                patchState(store, () => ({
                  unreadCount: response.body?.totalCount || 0,
                }));
              })
        ).subscribe({
          error: (error) => {
            // Revert on error only if we made an optimistic update
            if (!isAlreadyRead) {
              patchState(store, {
                notifications: previousState.notifications,
                unreadCount: previousState.unreadCount,
              });
            }
            console.error('Failed to mark notification as read:', error);
          }
        });
      },

      markAllAsRead() {
        const unreadNotifications = store.notifications().filter(n => !n.isRead);
        if (unreadNotifications.length === 0) {
          return;
        }

        const previousState = {
          notifications: [...store.notifications()],
          unreadCount: store.unreadCount(),
        };

        // Optimistically update the UI
        patchState(store, (state) => ({
          notifications: state.notifications.map(n => ({
            ...n,
            isRead: true,
            readDate: n.readDate || new Date().toISOString()
          })),
          unreadCount: 0,
        }));

        // Call the API and refresh notifications after success
        notificationsApiService.markAllNotificationsAsRead().pipe(
              switchMap(() => notificationsApiService.getUnreadNotifications()),
              tap((response) => {
                // Only update unread count, don't replace notifications list
                const unreadCount = response.body?.totalCount || 0;
                patchState(store, () => ({
                  unreadCount: unreadCount,
                }));
              })
        ).subscribe({
          error: (error) => {
            // Revert on error
            patchState(store, {
              notifications: previousState.notifications,
              unreadCount: previousState.unreadCount,
            });
            console.error('Failed to mark all notifications as read:', error);
          }
        });
      },
    };
  })
);
