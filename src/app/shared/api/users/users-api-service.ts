import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';
import { Observable, of } from 'rxjs';
import { IApiPaginatedResponse, IBaseApiResponse, ISelectItem, IUser, IUserRecord, IUsersFilterRequest } from '../../interfaces';
import { API_ENDPOINTS } from '../api-endpoints';
import { ERoles } from '../../enums';

@Injectable({
  providedIn: 'root',
})
export class UsersApiService {
  private readonly baseHttpService = inject(BaseHttpService);

  getUserTitles(): Observable<IBaseApiResponse<ISelectItem[]>> {
    return of({
      body: [{ id: '1', name: 'Mr' }, { id: '2', name: 'Mrs' }, { id: '3', name: 'Ms' }, { id: '4', name: 'Dr' }, { id: '5', name: 'Prof' }],
      success: true,
      statusCode: 200,
      message: ['Success'],
      errors: null,
      timestamp: new Date().toISOString()
    });
  }


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

}
