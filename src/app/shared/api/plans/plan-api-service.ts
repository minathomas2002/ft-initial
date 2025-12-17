import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';
import { Observable } from 'rxjs';
import { IActiveEmployee, IAssignRequest, IBaseApiResponse } from '../../interfaces';
import { API_ENDPOINTS } from '../api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class PlanApiService {
private readonly baseHttpService = inject(BaseHttpService);



  
  getActiveEmployeesForPlans(planId: string): Observable<IBaseApiResponse<IActiveEmployee[]>> {
    return this.baseHttpService.get<IActiveEmployee[], string>(API_ENDPOINTS.plans.getActiveEmployeesWithPlans+ planId);
  }

  assignEmployeeToPlan(req: IAssignRequest): Observable<IBaseApiResponse<boolean>> {
    return this.baseHttpService.post<boolean,IAssignRequest, unknown>(API_ENDPOINTS.plans.assign, req);
  }

   reassignEmployeeToPlan(req: IAssignRequest): Observable<IBaseApiResponse<boolean>> {
    return this.baseHttpService.post<boolean,IAssignRequest, unknown>(API_ENDPOINTS.plans.reassign, req);
  }
  
}
