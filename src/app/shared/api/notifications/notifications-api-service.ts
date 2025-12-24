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
    pageIndex: number = 0,
    pageSize: number = 20
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
}
