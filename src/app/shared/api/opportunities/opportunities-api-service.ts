import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';
import { IOpportunitiesFilterRequest, IOpportunityRecord } from '../../interfaces/opportunities.interface';
import { Observable } from 'rxjs';
import { IApiPaginatedResponse, IBaseApiResponse } from '../../interfaces';
import { API_ENDPOINTS } from '../api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class OpportunitiesApiService {
  private readonly baseHttpService = inject(BaseHttpService);

  getOpportunities(filter: IOpportunitiesFilterRequest): Observable<IBaseApiResponse<IApiPaginatedResponse<IOpportunityRecord[]>>> {
    return this.baseHttpService.get<IApiPaginatedResponse<IOpportunityRecord[]>, unknown>(API_ENDPOINTS.opportunities.getOpportunities, filter);
  }

  getAdminOpportunities(filter: IOpportunitiesFilterRequest): Observable<IBaseApiResponse<IApiPaginatedResponse<IOpportunityRecord[]>>> {
    return this.baseHttpService.get<IApiPaginatedResponse<IOpportunityRecord[]>, unknown>(API_ENDPOINTS.opportunities.getAdminOpportunities, filter);
  }
}
