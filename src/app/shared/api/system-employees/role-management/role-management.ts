import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from 'src/app/shared/services/Base-HTTP/base-Http.service';
import { API_ENDPOINTS } from '../../api-endpoints';
import { IBaseApiResponse, ICurrentRoleHolders, ITransferRoleRequest } from 'src/app/shared/interfaces';
import { IRoleManagementAssignmentFilterRequest, IRoleManagementAssignmentRecord } from 'src/app/shared/interfaces';

@Injectable({
  providedIn: 'root',
})
export class RoleManagement {
  private readonly baseHttpService = inject(BaseHttpService);

  getRoleManagementList(filter: IRoleManagementAssignmentFilterRequest): Observable<IBaseApiResponse<IRoleManagementAssignmentRecord[]>> {
    return this.baseHttpService.post<IRoleManagementAssignmentRecord[], IRoleManagementAssignmentFilterRequest, unknown>(API_ENDPOINTS.systemEmployees.RoleManagement.getRoleManagementList, filter);
  }

  getCurrentRoleHolders(): Observable<IBaseApiResponse<ICurrentRoleHolders[]>> {
    return this.baseHttpService.get<ICurrentRoleHolders[], unknown>(API_ENDPOINTS.systemEmployees.RoleManagement.getCurrentHolders);
  }

  transferRole(request: ITransferRoleRequest): Observable<IBaseApiResponse<boolean>> {
    return this.baseHttpService.post<boolean, ITransferRoleRequest, unknown>(API_ENDPOINTS.systemEmployees.RoleManagement.transferRole, request);
  }
}
