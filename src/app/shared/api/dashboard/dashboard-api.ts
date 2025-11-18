import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardApi {
  private readonly baseHttpService = inject(BaseHttpService);

	// getAll(): Observable<IBaseApiResponse<IAnnouncement[]>> {
	// 	return this.baseHttpService.get<IAnnouncement[], unknown>(API_ENDPOINTS.announcement.getAll);
	// }
}
