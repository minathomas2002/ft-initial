import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';
import {
  IApiPaginatedResponse,
  IBaseApiResponse,
  IPlanFilterRequest,
  IPlanRecord,
  IPlansDashboardResponse,
} from '../../interfaces';
import { API_ENDPOINTS } from '../api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class DashboardPlansApiService {
  private readonly baseHttpService = inject(BaseHttpService);

  getInvestorDashboardPlans(
    filter: IPlanFilterRequest
  ): Observable<IBaseApiResponse<IPlansDashboardResponse<IPlanRecord[]>>> {
    return this.baseHttpService.post(API_ENDPOINTS.plans.getInvestorDashboardPlans, filter);
  }
}

