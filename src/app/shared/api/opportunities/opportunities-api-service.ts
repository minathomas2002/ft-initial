import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';
import { IOpportunitiesFilterRequest, IOpportunityRecord } from '../../interfaces/opportunities.interface';
import { Observable } from 'rxjs';
import { IApiPaginatedResponse, IBaseApiResponse, IInvestorOpportunitiesFilterRequest, IInvestorOpportunity } from '../../interfaces';
import { API_ENDPOINTS } from '../api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class OpportunitiesApiService {
  private readonly baseHttpService = inject(BaseHttpService);

  getInvestorOpportunities(filter: IInvestorOpportunitiesFilterRequest): Observable<IBaseApiResponse<IApiPaginatedResponse<IInvestorOpportunity[]>>> {
    return this.baseHttpService.post<IApiPaginatedResponse<IInvestorOpportunity[]>, unknown, IInvestorOpportunitiesFilterRequest>(API_ENDPOINTS.opportunities.getOpportunities, filter);
  }
}
