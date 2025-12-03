import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';
import { Observable } from 'rxjs';
import {
  IApiPaginatedResponse,
  IBaseApiResponse,
  IDashboardResponse,
  IOpportunitiesFilterRequest,
  IOpportunity,
  IOpportunityDetails,
  IAdminOpportunitiesFilterRequest,
  IAdminOpportunity
} from '../../interfaces';
import { API_ENDPOINTS } from '../api-endpoints';
import { EOpportunityStatus } from '../../enums';

@Injectable({
  providedIn: 'root',
})
export class OpportunitiesApiService {
  private readonly baseHttpService = inject(BaseHttpService);

  getOpportunities(filter: IOpportunitiesFilterRequest): Observable<IBaseApiResponse<IApiPaginatedResponse<IOpportunity[]>>> {
    return this.baseHttpService.get<IApiPaginatedResponse<IOpportunity[]>, IOpportunitiesFilterRequest>(API_ENDPOINTS.opportunities.getOpportunities, filter);
  }

  getAdminOpportunities(filter: IAdminOpportunitiesFilterRequest): Observable<IBaseApiResponse<IDashboardResponse<IAdminOpportunity[]>>> {
    return this.baseHttpService.get<IDashboardResponse<IAdminOpportunity[]>, IAdminOpportunitiesFilterRequest>(API_ENDPOINTS.opportunities.getAdminOpportunities, filter);
  }

  draftOpportunity(opportunity: FormData): Observable<IBaseApiResponse<IOpportunity>> {
    return this.baseHttpService.post<IOpportunity, unknown, FormData>(API_ENDPOINTS.opportunities.draftOpportunity, opportunity);
  }

  getOpportunityById(id: string): Observable<IBaseApiResponse<IOpportunityDetails>> {
    return this.baseHttpService.get<IOpportunityDetails, never>(`${API_ENDPOINTS.opportunities.getOpportunityById}/${id}`);
  }

  createOpportunity(opportunity: FormData): Observable<IBaseApiResponse<IOpportunity>> {
    return this.baseHttpService.post<IOpportunity, unknown, FormData>(API_ENDPOINTS.opportunities.createOpportunity, opportunity);
  }

  updateOpportunity(opportunity: FormData): Observable<IBaseApiResponse<IOpportunity>> {
    return this.baseHttpService.post<IOpportunity, unknown, FormData>(API_ENDPOINTS.opportunities.editOpportunity, opportunity);
  }

  deleteOpportunity(opportunityId: string): Observable<IBaseApiResponse<void>> {
    return this.baseHttpService.delete<void, never>(`${API_ENDPOINTS.opportunities.deleteOpportunity}/${opportunityId}`);
  }

  changeOpportunityStatus(opportunityId: string, status: EOpportunityStatus): Observable<IBaseApiResponse<IOpportunity>> {
    return this.baseHttpService.post<IOpportunity, {}, {}>(
      `${API_ENDPOINTS.opportunities.changeStatus}`,
      {},
      {
        params: {
          opportunityId,
          status,
        },
      }
    );
  }
}
