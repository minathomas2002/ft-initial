import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';
import { Observable } from 'rxjs';
import { IBaseApiResponse, IRole } from '../../interfaces';
import { API_ENDPOINTS } from '../api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class RolesApiService {
  private readonly baseHttpService = inject(BaseHttpService);

  getRoles(): Observable<IBaseApiResponse<IRole[]>> {
    return this.baseHttpService.get<IRole[], unknown>(API_ENDPOINTS.roles.getRoles);
  }

  getUserRoles(): Observable<IBaseApiResponse<IRole[]>> {
    return this.baseHttpService.get<IRole[], unknown>(API_ENDPOINTS.roles.getUserRoles);
  }
}

