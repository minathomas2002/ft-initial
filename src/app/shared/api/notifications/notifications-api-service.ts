import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { INotification } from 'src/app/core/layouts/main-layout/models/notifications.interface';
import { API_ENDPOINTS } from 'src/app/shared/api/api-endpoints';
import { IApiPaginatedResponse, IBaseApiResponse } from 'src/app/shared/interfaces';
import { BaseHttpService } from 'src/app/shared/services/Base-HTTP/base-Http.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationsApiService {
  private readonly baseHttpService = inject(BaseHttpService);

  getNotifications(
    pageIndex: number,
    pageSize: number
  ): Observable<IBaseApiResponse<IApiPaginatedResponse<INotification[]>>> {
    const params = { pageIndex: pageIndex.toString(), pageSize: pageSize.toString() };
    return this.baseHttpService.get<any, unknown>(
      API_ENDPOINTS.notifications.getNotificationsPaginated,
      params
    );
  }

  getUnreadNotifications(): Observable<IBaseApiResponse<IApiPaginatedResponse<INotification[]>>> {
    return this.baseHttpService.get<any, unknown>(
      API_ENDPOINTS.notifications.getUnreadNotifications
    );
  }

  markNotificationAsRead(id: string): Observable<IBaseApiResponse<any>> {
    console.log('markNotificationAsRead called with id:', id);
    const endpoint = `${API_ENDPOINTS.notifications.markNotificationAsRead}/${id}/read`;
    console.log('Calling endpoint:', endpoint);
    return this.baseHttpService.put<any, any, unknown>(endpoint);
  }

  markAllNotificationsAsRead(): Observable<IBaseApiResponse<any>> {
    return this.baseHttpService.put<any, any, unknown>(
      API_ENDPOINTS.notifications.markAllNotificationsAsRead
    );
  }
}
