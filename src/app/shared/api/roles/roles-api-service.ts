import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';
import { Observable } from 'rxjs';
import { IAssignRoleToUserRequest, IBaseApiResponse, IRole, IRoleLocalized } from '../../interfaces';
import { API_ENDPOINTS } from '../api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class RolesApiService {
  private readonly baseHttpService = inject(BaseHttpService);

  getAllRoles(): Observable<IBaseApiResponse<IRoleLocalized[]>> {
    return this.baseHttpService.get<IRoleLocalized[], unknown>(API_ENDPOINTS.roles.getRoles);
  }

  getSystemRoles(): Observable<IBaseApiResponse<IRoleLocalized[]>> {
    return this.baseHttpService.get<IRoleLocalized[], unknown>(API_ENDPOINTS.roles.getSystemRoles);
  }

  getFilteredRoles(employeeId: string): Observable<IBaseApiResponse<IRoleLocalized[]>> {
    return this.baseHttpService.get<IRoleLocalized[], unknown>(`${API_ENDPOINTS.roles.getFilteredRoles}?employeeId=${employeeId}`);
  }

  getRoleById(id: string): Observable<IBaseApiResponse<IRoleLocalized>> {
    return this.baseHttpService.get<IRoleLocalized, unknown>(`${API_ENDPOINTS.roles.getRoleById}/${id}`);
  }

  assignRoleToUser(request: IAssignRoleToUserRequest): Observable<IBaseApiResponse<void>> {
    return this.baseHttpService.post<void, IAssignRoleToUserRequest, unknown>(`${API_ENDPOINTS.roles.assignRoleToUser}`, request);
  }
}
