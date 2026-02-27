import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../api-endpoints';
import {
  IApiPaginatedResponse,
  IBaseApiResponse
} from '../../interfaces';
import { ActiveEmployee, IAddDelegationRequest, IDelegationFilterRequest, IDelegationRecord } from '../../interfaces/delegation.interface';
import { of } from 'rxjs';
import { EDelegationActions } from '../../enums/delegation-enum';

@Injectable({
  providedIn: 'root',
})
export class DelegationApiService  {
  private readonly baseHttpService = inject(BaseHttpService);


  getDelegationList(filter: IDelegationFilterRequest): Observable<IBaseApiResponse<IApiPaginatedResponse<IDelegationRecord[]>>> {
    return this.baseHttpService.post<IApiPaginatedResponse<IDelegationRecord[]>, IDelegationFilterRequest, unknown>(API_ENDPOINTS.systemEmployees.Delegation.getDelegationList, filter);
  }

  addDelegation(request: IAddDelegationRequest): Observable<IBaseApiResponse<unknown>> {
    return this.baseHttpService.post<unknown, IAddDelegationRequest, unknown>(API_ENDPOINTS.systemEmployees.Delegation.addDelegation, request);
  }

  getActiveEmployees(): Observable<IBaseApiResponse<ActiveEmployee[]>> {
    return this.baseHttpService.get<ActiveEmployee[], unknown>(API_ENDPOINTS.systemEmployees.Delegation.getActiveEmployees);
  }

}
