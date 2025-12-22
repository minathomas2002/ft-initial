import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';
import { Observable } from 'rxjs';
import { IActiveEmployee, IAssignReassignActiveEmployee, IAssignRequest, IBaseApiResponse } from '../../interfaces';
import { API_ENDPOINTS } from '../api-endpoints';
import { IProductLocalizationPlanRequest, IProductPlanResponse } from '../../interfaces/plans.interface';

@Injectable({
  providedIn: 'root',
})
export class PlanApiService {
  private readonly baseHttpService = inject(BaseHttpService);

  getActiveEmployeesForPlans(planId: string): Observable<IBaseApiResponse<IAssignReassignActiveEmployee>> {
    return this.baseHttpService.get<IAssignReassignActiveEmployee, string>(API_ENDPOINTS.plans.getActiveEmployeesWithPlans + planId);
  }

  assignEmployeeToPlan(req: IAssignRequest): Observable<IBaseApiResponse<boolean>> {
    return this.baseHttpService.post<boolean, IAssignRequest, unknown>(API_ENDPOINTS.plans.assign, req);
  }

  reassignEmployeeToPlan(req: IAssignRequest): Observable<IBaseApiResponse<boolean>> {
    return this.baseHttpService.post<boolean, IAssignRequest, unknown>(API_ENDPOINTS.plans.reassign, req);
  }

  saveAsDraftProductLocalizationPlan(req: FormData): Observable<IBaseApiResponse<boolean>> {
    return this.baseHttpService.post<boolean, FormData, unknown>(API_ENDPOINTS.plans.saveAsDraftProductLocalizationPlan, req);
  }

  submitProductLocalizationPlan(req: FormData): Observable<IBaseApiResponse<boolean>> {
    return this.baseHttpService.post<boolean, FormData, unknown>(API_ENDPOINTS.plans.submitProductLocalizationPlan, req);
  }

  getProductPlan(req: { planId: string }): Observable<IBaseApiResponse<IProductPlanResponse>> {
    return this.baseHttpService.post<IProductPlanResponse, { planId: string }, unknown>(API_ENDPOINTS.plans.getProductPlan, req);
  }

}
