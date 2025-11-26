import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';
import {
  IApiPaginatedResponse,
  IBaseApiResponse,
  IInvestorsFilterRequest,
  IInvestorRecord,
} from '../../interfaces';
import { API_ENDPOINTS } from '../api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class InvestorsApiService {
  private readonly baseHttpService = inject(BaseHttpService);

  getInvestorsList(
    filter: IInvestorsFilterRequest
  ): Observable<IBaseApiResponse<IApiPaginatedResponse<IInvestorRecord[]>>> {
    return this.baseHttpService.get(API_ENDPOINTS.users.getInvestors, filter);
  }
}

