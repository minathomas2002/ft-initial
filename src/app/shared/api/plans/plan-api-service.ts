import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { IActiveEmployee, IAssignActiveEmployee, IAssignee, IAssignReassignActiveEmployee, IAssignRequest, IBaseApiResponse, IPlanFilterRequest, IPlanRecord, IPlansResponse } from '../../interfaces';
import { API_ENDPOINTS } from '../api-endpoints';
import { IProductLocalizationPlanRequest, IProductPlanResponse, IServiceLocalizationPlanResponse, IServicePlanGetResponse, ITimeLineResponse, ReviewPlanRequest, IPlanCommentResponse } from '../../interfaces/plans.interface';
import { extractFilenameFromHeaders, handleBlobError } from '../../utils/file-download.utils';
import { EemployeePlanAction } from 'src/app/shared/enums';
import { I18nService } from '../../services/i18n/i18n.service';

@Injectable({
  providedIn: 'root',
})
export class PlanApiService {
  private readonly baseHttpService = inject(BaseHttpService);
  private readonly http = inject(HttpClient);
  private readonly i18nService = inject(I18nService);

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

  reSubmitProductPlan(req: FormData): Observable<IBaseApiResponse<boolean>> {
    return this.baseHttpService.post<boolean, FormData, unknown>(API_ENDPOINTS.plans.reSubmitProductPlan, req);
  }

  reSubmitServicePlan(req: FormData): Observable<IBaseApiResponse<boolean>> {
    return this.baseHttpService.post<boolean, FormData, unknown>(API_ENDPOINTS.plans.reSubmitServicePlan, req);
  }

  employeeTogglePlanStatus(req: { planId: string, status: EemployeePlanAction, reason: string | undefined }): Observable<IBaseApiResponse<boolean>> {
    return this.baseHttpService.post<boolean, { planId: string, status: EemployeePlanAction, reason: string | undefined }, unknown>(API_ENDPOINTS.plans.employeeTogglePlanStatus, req);
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

  generateProductPlanPdf(planId: string): Observable<{ blob: Blob; filename: string }> {
    return this.http
      .get(`${API_ENDPOINTS.baseUrl}/${API_ENDPOINTS.plans.generateProductPlanPdf}${planId}`, {
        responseType: 'blob',
        observe: 'response'
      })
      .pipe(
        map((response: HttpResponse<Blob>) => {
          const filename = extractFilenameFromHeaders(response.headers, 'product-plan.pdf');
          return {
            blob: response.body!,
            filename: filename
          };
        }),
        catchError(handleBlobError('Error downloading plan'))
      );
  }

  generateServicePlanPdf(planId: string): Observable<{ blob: Blob; filename: string }> {
    return this.http
      .get(`${API_ENDPOINTS.baseUrl}/${API_ENDPOINTS.plans.generateServicePlanPdf}${planId}`, {
        responseType: 'blob',
        observe: 'response'
      })
      .pipe(
        map((response: HttpResponse<Blob>) => {
          const filename = extractFilenameFromHeaders(response.headers, 'service-plan.pdf');
          return {
            blob: response.body!,
            filename: filename
          };
        }),
        catchError(handleBlobError('Error downloading plan'))
      );
  }

  sendPlanBackToInvestor(req: ReviewPlanRequest): Observable<IBaseApiResponse<boolean>> {
    return this.baseHttpService.post<boolean, ReviewPlanRequest, unknown>(API_ENDPOINTS.plans.reviewPlan, req);
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
    return this.baseHttpService.get<IAssignee[], string>(API_ENDPOINTS.plans.getPlanAssignees).pipe(
      map(response => {
        const currentLang = this.i18nService.currentLanguage();
        const mappedData: IAssignActiveEmployee[] = (response.body || []).map(emp => ({
          id: emp.id,
          name: currentLang === 'ar' ? (emp.name_Ar || emp.name_En || '') : (emp.name_En || emp.name_Ar || '')
        }));
        return {
          ...response,
          body: mappedData
        } as IBaseApiResponse<IAssignActiveEmployee[]>;
      })
    );
  }

  getPlanComment(planId: string): Observable<IBaseApiResponse<IPlanCommentResponse>> {
    return this.baseHttpService.post<IPlanCommentResponse, { planId: string }, unknown>(API_ENDPOINTS.plans.getPlanComment, { planId });
  }

}
