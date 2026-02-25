import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';
import { Observable } from 'rxjs';
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
import { IDelegationDetails, IDelegationFilterRequest, IDelegationRecord } from '../../interfaces/delegation.interface';
import { of } from 'rxjs';
import { EDelegationActions } from '../../enums/delegation-enum';

@Injectable({
  providedIn: 'root',
})
export class DelegationApiService  {
  private readonly baseHttpService = inject(BaseHttpService);

  getEmployeeDateFromHR(employeeID: string): Observable<IBaseApiResponse<IEmployeeDateFromHR>> {
    return this.baseHttpService.get<IEmployeeDateFromHR, string>(API_ENDPOINTS.systemEmployees.getEmployeeDataFromHr + '/' + employeeID);
  }

  getActiveEmployees(): Observable<IBaseApiResponse<IActiveEmployee[]>> {
    return this.baseHttpService.get<IActiveEmployee[], string>(API_ENDPOINTS.systemEmployees.getActiveEmployees);
  }

  getDelegationDetails(id: string): Observable<IBaseApiResponse<IDelegationDetails>> {

    const mockDetail: IDelegationDetails = {
      id: Number(id),
      delegator: 'John Doe',
      delegatee: 'Jane Smith',
      startDate: '2026-02-01',
      endDate: '2026-02-10',
      createdAt: '2026-01-25',
      createdBy: 'Admin1',
      lastModifiedBy: 'Admin2',
      lastModifiedDate: '2026-01-30',
      status: 'Active'
    };

    const response: IBaseApiResponse<IDelegationDetails> = {
      success: true,
      statusCode: 200,
      body: mockDetail,
      message: [],
      errors: null,
      timestamp: new Date().toISOString()
    };

    return of(response);
    return this.baseHttpService.get<IDelegationDetails, string>(API_ENDPOINTS.systemEmployees.getEmployeeDetails + '/' + id);

  }

  createSystemEmployee(employee: ICreateSystemEmployeeRequest): Observable<IBaseApiResponse<void>> {
    return this.baseHttpService.post<void, ICreateSystemEmployeeRequest, unknown>(API_ENDPOINTS.systemEmployees.createSystemEmployee, employee);
  }

  getDelegationList(filter: IDelegationFilterRequest): Observable<IBaseApiResponse<IApiPaginatedResponse<IDelegationRecord[]>>> {
    const mockData: IDelegationRecord[] = [
      {
        id: 1,
        delegator: 'John Doe',
        delegatee: 'Jane Smith',
        startDate: '2026-02-01',
        endDate: '2026-02-10',
        createdAt: '2026-01-25',
        createdBy: 'Admin1',
        lastModifiedBy: 'Admin2',
        lastModifiedDate: '2026-01-30',
        status: 'Active',
        actions: [EDelegationActions.EDIT, EDelegationActions.DELETE, EDelegationActions.CANCEL]
      },
      {
        id: 2,
        delegator: 'Alice Brown',
        delegatee: 'Bob White',
        startDate: '2026-03-01',
        endDate: '2026-03-15',
        createdAt: '2026-02-20',
        createdBy: 'Admin2',
        lastModifiedBy: 'Admin2',
        lastModifiedDate: '2026-02-25',
        status: 'Upcoming',
        actions: [EDelegationActions.EDIT, EDelegationActions.DELETE, EDelegationActions.CANCEL]

      },
      {
        id: 3,
        delegator: 'Charlie Black',
        delegatee: 'Diana Green',
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        createdAt: '2025-12-20',
        createdBy: 'Admin1',
        lastModifiedBy: 'Admin3',
        lastModifiedDate: '2026-01-05',
        status: 'Expired',
        actions: [EDelegationActions.EDIT, EDelegationActions.DELETE, EDelegationActions.CANCEL]

      }
    ];

    const response: IBaseApiResponse<IApiPaginatedResponse<IDelegationRecord[]>> = {
      success: true,
      statusCode: 200,
      body: {
        data: mockData,
        pagination: {
          currentPage: 1,
          hasNext: false,
          hasPrevious: false,
            totalPages: 1,
            pageSize: 10,
            totalCount : mockData.length,
        },
        totalCount: mockData.length
      },
      message: [],
      errors: null,
      timestamp: new Date().toISOString()
    };

    return of(response);
    return this.baseHttpService.post<IApiPaginatedResponse<IDelegationRecord[]>, IDelegationFilterRequest, unknown>(API_ENDPOINTS.systemEmployees.getSystemEmployeesList, filter);
  }

  updateSystemEmployee(employee: IUpdateSystemEmployeeRequest): Observable<IBaseApiResponse<void>> {
    return this.baseHttpService.put<void, IUpdateSystemEmployeeRequest, unknown>(API_ENDPOINTS.systemEmployees.updateSystemEmployee, employee);
  }

  toggleSystemEmployeeStatus(id: string): Observable<IBaseApiResponse<void>> {
    return this.baseHttpService.post<void, unknown, string>(API_ENDPOINTS.systemEmployees.toggleEmployeeStatus + '/' + id, {});
  }



}
