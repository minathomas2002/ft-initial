import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';
import { Observable, of } from 'rxjs';
import { IBaseApiResponse, ISelectItem, IUser, IUserRecord, IUsersFilterRequest } from '../../interfaces';
import { API_ENDPOINTS } from '../api-endpoints';
import { EAdminUserActions, EUserRole, EUserStatus } from '../../enums/users.enum';

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
      message: 'Success', 
      errors: null, 
      timestamp: new Date().toISOString() 
    });    
  }

  getUsers(filter: IUsersFilterRequest): Observable<IBaseApiResponse<IUserRecord[]>> {
    // return this.baseHttpService.get<IUser[], unknown>(API_ENDPOINTS.users.getUsers, filter);

    // Provide mock IUser objects with all required fields to satisfy the IUser interface
    const users: IUserRecord[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: EUserRole.Employee,
        status: EUserStatus.ACTIVE,
        joinDate: new Date().toISOString(),
        actions: [EAdminUserActions.ChangeRole, EAdminUserActions.Delete],
      },
      {
        id: '2',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        role: EUserRole.DV_Manager,
        status: EUserStatus.ACTIVE,
        joinDate: new Date().toISOString(),
        actions: [EAdminUserActions.ChangeRole, EAdminUserActions.Delete],
      },
      {
        id: '3',
        name: 'Jim Beam',
        email: 'jim.beam@example.com',
        role: EUserRole.Department_Manager,
        status: EUserStatus.BLOCKED,
        joinDate: new Date().toISOString(),
        actions: [EAdminUserActions.ChangeRole, EAdminUserActions.Delete],
      },
      {
        id: '4',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        role: EUserRole.Employee,
        status: EUserStatus.INACTIVE,
        joinDate: new Date().toISOString(),
        actions: [EAdminUserActions.ChangeRole, EAdminUserActions.Delete],
      },
    ];
    return of({ body: users, success: true, statusCode: 200, errors: null, timestamp: new Date().toISOString(), message: 'Success' });
  }

  changeUserRole(userId: string, roleId: EUserRole): Observable<IBaseApiResponse<Boolean>> {
    return of({ body: true, message: 'Success', status: 200, success: true, statusCode: 200, errors: null, timestamp: new Date().toISOString() });
  }
  deleteUser(userId: string): Observable<IBaseApiResponse<Boolean>> {
    return of({ body: true, success: true, statusCode: 200, errors: null, timestamp: new Date().toISOString(), message: 'Success' });
    // return this.baseHttpService.delete<Boolean, unknown>(API_ENDPOINTS.users.deleteUser, { userId });
  }

}
