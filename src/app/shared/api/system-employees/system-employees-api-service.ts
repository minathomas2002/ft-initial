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
export class SystemEmployeesApiService {
  private readonly baseHttpService = inject(BaseHttpService);

  getEmployeeDateFromHR(employeeID: string): Observable<IBaseApiResponse<IEmployeeDateFromHR>> {
    return this.baseHttpService.get<IEmployeeDateFromHR, string>(API_ENDPOINTS.systemEmployees.getEmployeeDataFromHr + '/' + employeeID);
  }

  getActiveEmployees(): Observable<IBaseApiResponse<IActiveEmployee[]>> {
    return this.baseHttpService.get<IActiveEmployee[], string>(API_ENDPOINTS.systemEmployees.getActiveEmployees);
  }

  getEmployeeDetails(id: string): Observable<IBaseApiResponse<ISystemEmployeeDetails>> {
    return this.baseHttpService.get<ISystemEmployeeDetails, string>(API_ENDPOINTS.systemEmployees.getEmployeeDetails + '/' + id);
  }

  createSystemEmployee(employee: ICreateSystemEmployeeRequest): Observable<IBaseApiResponse<void>> {
    return this.baseHttpService.post<void, ICreateSystemEmployeeRequest, unknown>(API_ENDPOINTS.systemEmployees.createSystemEmployee, employee);
  }

  getSystemEmployeeList(filter: ISystemEmployeeFilterRequest): Observable<IBaseApiResponse<IApiPaginatedResponse<ISystemEmployeeRecord[]>>> {
    return this.baseHttpService.get<IApiPaginatedResponse<ISystemEmployeeRecord[]>, unknown>(API_ENDPOINTS.systemEmployees.getSystemEmployeeList, filter);
  }

  updateSystemEmployee(employee: IUpdateSystemEmployeeRequest): Observable<IBaseApiResponse<void>> {
    return this.baseHttpService.put<void, IUpdateSystemEmployeeRequest, unknown>(API_ENDPOINTS.systemEmployees.updateSystemEmployee, employee);
  }

  toggleSystemEmployeeStatus(id: string): Observable<IBaseApiResponse<void>> {
    return this.baseHttpService.put<void, string, unknown>(API_ENDPOINTS.systemEmployees.toggleEmployeeStatus + '/' + id);
  }
}
