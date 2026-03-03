import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';
import { Observable } from 'rxjs';;
import { API_ENDPOINTS } from '../api-endpoints';
import {
  IActiveEmployee,
  IApiPaginatedResponse,
  IBaseApiResponse,
  ICreateSystemEmployeeRequest,
  IEmployeeDateFromHR,
  ISystemEmployeeDetails,
  ISystemEmployeeFilterRequest,
  ISystemEmployeeRecord,
  IUpdateSystemEmployeeRequest
} from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ContactUsApiService {
  private readonly baseHttpService = inject(BaseHttpService);

  add(message: { title: string; description: string }): Observable<IBaseApiResponse<void>> {
    return this.baseHttpService.post<void, { title: string; description: string }, unknown>(API_ENDPOINTS.contactUs.add, message);
  }


}
