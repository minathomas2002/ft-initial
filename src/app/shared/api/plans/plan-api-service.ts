import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IActiveEmployee, IAssignActiveEmployee, IAssignReassignActiveEmployee, IAssignRequest, IBaseApiResponse, IPlanFilterRequest, IPlanRecord, IPlansResponse } from '../../interfaces';
import { API_ENDPOINTS } from '../api-endpoints';
import { IProductLocalizationPlanRequest, IProductPlanResponse, IServiceLocalizationPlanResponse, IServicePlanGetResponse, ITimeLineResponse } from '../../interfaces/plans.interface';
import { extractFilenameFromHeaders, handleBlobError } from '../../utils/file-download.utils';

@Injectable({
  providedIn: 'root',
})
export class PlanApiService {
  private readonly baseHttpService = inject(BaseHttpService);
  private readonly http = inject(HttpClient);

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

  saveAsDraftServiceLocalizationPlan(req: FormData): Observable<IBaseApiResponse<boolean>> {
    return this.baseHttpService.post<boolean, FormData, unknown>(API_ENDPOINTS.plans.saveAsDraftServiceLocalizationPlan, req);
  }

  submitProductLocalizationPlan(req: FormData): Observable<IBaseApiResponse<boolean>> {
    return this.baseHttpService.post<boolean, FormData, unknown>(API_ENDPOINTS.plans.submitProductLocalizationPlan, req);
  }

  submitServiceLocalizationPlan(req: FormData): Observable<IBaseApiResponse<boolean>> {
    return this.baseHttpService.post<boolean, FormData, unknown>(API_ENDPOINTS.plans.submitServiceLocalizationPlan, req);
  }

  getProductPlan(req: { planId: string }): Observable<IBaseApiResponse<IProductPlanResponse>> {
    return this.baseHttpService.post<IProductPlanResponse, { planId: string }, unknown>(API_ENDPOINTS.plans.getProductPlan, req);
  }

  getServicePlan(req: { planId: string }): Observable<IBaseApiResponse<IServiceLocalizationPlanResponse>> {
    return this.baseHttpService.post<IServiceLocalizationPlanResponse, { planId: string }, unknown>(API_ENDPOINTS.plans.getServicePlan, req);
  }

  getTimeLine(req: { planId: string }): Observable<IBaseApiResponse<ITimeLineResponse[]>> {
    return this.baseHttpService.post<ITimeLineResponse[], { planId: string }, unknown>(API_ENDPOINTS.plans.getTimelinePlan, req);
  }

  downloadPlan(planId: string): Observable<{ blob: Blob; filename: string }> {
    return this.http
      .get(`${API_ENDPOINTS.baseUrl}/${API_ENDPOINTS.plans.downloadPlan}${planId}`, {
        responseType: 'blob',
        observe: 'response'
      })
      .pipe(
        map((response: HttpResponse<Blob>) => {
          const filename = extractFilenameFromHeaders(response.headers, 'plan.pdf');
          return {
            blob: response.body!,
            filename: filename
          };
        }),
        catchError(handleBlobError('Error downloading plan'))
      );
  }

  getInvestorPlans(
    filter: IPlanFilterRequest
  ): Observable<IBaseApiResponse<IPlansResponse<IPlanRecord[]>>> {
    return this.baseHttpService.post(API_ENDPOINTS.plans.getInverstorPlans, filter);
  }

  getInternalUserPlans(
    filter: IPlanFilterRequest
  ): Observable<IBaseApiResponse<IPlansResponse<IPlanRecord[]>>> {
    return this.baseHttpService.post(API_ENDPOINTS.plans.getInternalUserPlans, filter);
  }

  getPlanAssignees(): Observable<IBaseApiResponse<IAssignActiveEmployee[]>> {
    // For now, using getActiveEmployees as placeholder and mapping to IAssignActiveEmployee format
    // This should be replaced with: return this.baseHttpService.get(API_ENDPOINTS.plans.getPlanAssignees);
    return this.baseHttpService.get<IAssignActiveEmployee[], string>(API_ENDPOINTS.systemEmployees.getActiveEmployees).pipe(
      map(response => ({
        ...response,
        body: {
          ...response.body,
          data: response.body as IAssignActiveEmployee[]
        }
      }))
    );
  }

}
