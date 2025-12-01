import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';
import { Observable, of } from 'rxjs';
import { IApiPaginatedResponse, IBaseApiResponse, ISelectItem, IUser, IUserRecord, IUsersFilterRequest, IRoleManagementRecord, IRoleManagementFilterRequest, IUserCreate, IUserCreateResponse, IUserEdit, IUserDetails, IUserUpdateStatus } from '../../interfaces';
import { API_ENDPOINTS } from '../api-endpoints';
import { ERoles } from '../../enums';

@Injectable({
  providedIn: 'root',
})
export class UsersApiService {
  private readonly baseHttpService = inject(BaseHttpService);

  getUsers(filter: IUsersFilterRequest): Observable<IBaseApiResponse<IApiPaginatedResponse<IUserRecord[]>>> {
    return this.baseHttpService.get<IApiPaginatedResponse<IUserRecord[]>, unknown>(API_ENDPOINTS.users.getEmployees, filter);
  }

  changeUserRole(userId: string, roleId: ERoles): Observable<IBaseApiResponse<Boolean>> {
    return of({ body: true, message: ['Success'], status: 200, success: true, statusCode: 200, errors: null, timestamp: new Date().toISOString() });
  }
  deleteUser(userId: string): Observable<IBaseApiResponse<Boolean>> {
    return of({ body: true, message: ['Success'], success: true, statusCode: 200, errors: null, timestamp: new Date().toISOString() });
    // return this.baseHttpService.delete<Boolean, unknown>(API_ENDPOINTS.users.deleteUser, { userId });
  }

  CreateEmployee(req: IUserCreate): Observable<IBaseApiResponse<IUserCreateResponse>> {
    return this.baseHttpService.post<IUserCreateResponse, IUserCreate,unknown>(API_ENDPOINTS.users.createEmployee, req);
  }

  UpdateEmployee(req: IUserEdit): Observable<IBaseApiResponse<IUserCreateResponse>> {
    return this.baseHttpService.put<IUserCreateResponse, IUserEdit, unknown>(API_ENDPOINTS.users.updateEmployee, req);
  }

  GetEmployeeDetailsById(employeeID: string): Observable<IBaseApiResponse<IUserDetails>> {
    return this.baseHttpService.get <IUserDetails, string>(API_ENDPOINTS.users.getEmployeeDetails+'/'+employeeID);
  }

  // hr Id 
  GetEmployeeByJob(employeeID: string): Observable<IBaseApiResponse<IUserCreate>> {
    return this.baseHttpService.get<IUserCreate, unknown>(API_ENDPOINTS.users.getEmployeeByHrId+'/'+employeeID);
  }

  ToggleEmployeeStatus(req: IUserUpdateStatus): Observable<IBaseApiResponse<boolean>> {
    return this.baseHttpService.post<boolean, unknown,unknown>(API_ENDPOINTS.users.toggleStatus+'/'+req.id, null);
  }
  getRoleManagementList(filter: IRoleManagementFilterRequest): Observable<IBaseApiResponse<IApiPaginatedResponse<IRoleManagementRecord[]>>> {
    return this.baseHttpService.get<IApiPaginatedResponse<IRoleManagementRecord[]>, unknown>(API_ENDPOINTS.users.getRoleManagementList, filter);
  }

}
