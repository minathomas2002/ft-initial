import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';
import { Observable } from 'rxjs';
import { IApiPaginatedResponse, IBaseApiResponse, IOpportunitiesFilterRequest, IOpportunity, IOpportunityDetails, IOpportunityDraftRequest } from '../../interfaces';
import { API_ENDPOINTS } from '../api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class OpportunitiesApiService {
  private readonly baseHttpService = inject(BaseHttpService);

  getOpportunities(filter: IOpportunitiesFilterRequest): Observable<IBaseApiResponse<IApiPaginatedResponse<IOpportunity[]>>> {
    return this.baseHttpService.get<IApiPaginatedResponse<IOpportunity[]>, IOpportunitiesFilterRequest>(API_ENDPOINTS.opportunities.getOpportunities, filter);
  }

  draftOpportunity(opportunity: FormData): Observable<IBaseApiResponse<IOpportunity>> {
    return this.baseHttpService.post<IOpportunity, unknown, FormData>(API_ENDPOINTS.opportunities.draftOpportunity, opportunity);
  }

  getOpportunityById(id: string): Observable<IBaseApiResponse<IOpportunityDetails>> {
    return this.baseHttpService.get<IOpportunityDetails, never>(`${API_ENDPOINTS.opportunities.getOpportunityById}/${id}`);
  }
}
