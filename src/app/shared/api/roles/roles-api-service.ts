import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';
import { Observable } from 'rxjs';
import { IAssignRoleToUserRequest, IBaseApiResponse, IRole } from '../../interfaces';
import { API_ENDPOINTS } from '../api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class RolesApiService {
  private readonly baseHttpService = inject(BaseHttpService);

  getAllRoles(): Observable<IBaseApiResponse<IRole[]>> {
    return this.baseHttpService.get<IRole[], unknown>(API_ENDPOINTS.roles.getRoles);
  }

  getSystemRoles(): Observable<IBaseApiResponse<IRole[]>> {
    return this.baseHttpService.get<IRole[], unknown>(API_ENDPOINTS.roles.getSystemRoles);
  }

  getFilteredRoles(): Observable<IBaseApiResponse<IRole[]>> {
    return this.baseHttpService.get<IRole[], unknown>(API_ENDPOINTS.roles.getFilteredRoles);
  }

  getRoleById(id: string): Observable<IBaseApiResponse<IRole>> {
    return this.baseHttpService.get<IRole, unknown>(`${API_ENDPOINTS.roles.getRoleById}/${id}`);
  }

  assignRoleToUser(request: IAssignRoleToUserRequest): Observable<IBaseApiResponse<void>> {
    return this.baseHttpService.post<void, IAssignRoleToUserRequest, unknown>(`${API_ENDPOINTS.roles.assignRoleToUser}`, request);
  }
}
