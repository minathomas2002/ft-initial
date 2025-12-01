import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { IBaseApiResponse, IUser, IUserCreate, IUserCreateResponse, IUserDetails, IUserEdit, IUserRecord, IUsersFilterRequest, IUserUpdateStatus } from "../../interfaces";
import { IRoleManagementRecord, IRoleManagementFilterRequest } from "../../interfaces";
import { UsersApiService } from "../../api/users/users-api-service";
import { inject } from "@angular/core";
import { catchError, finalize, Observable, tap, throwError } from "rxjs";
import { ERoles } from "../../enums";


const initialState: {
  loading: boolean;
  error: string | null;
  count: number;
  list: IUserRecord[]
  user :IUserDetails | null;
  roleManagementList: IRoleManagementRecord[]
  roleManagementCount: number;
} = {
  loading: false,
  error: null,
  count: 0,
  list: [],
  user : null,
  roleManagementList: [],
  roleManagementCount: 0,
}
export const UsersStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withComputed((store) => {
    return {};
  }),
  withMethods((store) => {
    const usersApiService = inject(UsersApiService);


    return {
      getUsers(filter: IUsersFilterRequest) {
        patchState(store, { loading: true });
        return usersApiService.getUsers(filter).pipe(
          tap((res) => {
            const totalCount = res.body.pagination?.totalCount ?? 0;
            
            patchState(store, { list: res.body.data || [], count: totalCount });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage });
            return throwError(() => new Error("error fetching data"));
          }),
          finalize(() => {
            patchState(store, { loading: false });
          }),
        );
      },
      changeUserRole(userId: string, roleId: ERoles) {
        patchState(store, { loading: false });
        return usersApiService.changeUserRole(userId, roleId).pipe(
          tap((res) => {
            if (!res.body) {
              patchState(store, { error: 'Failed to change user role' });
            }
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage });
            return throwError(() => new Error("error changing user role"));
          }),
          finalize(() => {
            patchState(store, { loading: false });
          }),
        );
      },
      deleteUser(userId: string) {
        patchState(store, { loading: true });
        return usersApiService.deleteUser(userId).pipe(
          tap((res) => {
            if (!res.body) {
              patchState(store, { error: 'Failed to delete user' });
            }
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage });
            return throwError(() => new Error("error deleting user"));
          }),
          finalize(() => {
            patchState(store, { loading: false });
          }),
        );
      },
      CreateEmployee(employee: IUserCreate): Observable<IBaseApiResponse<IUserCreateResponse>> {
        patchState(store, { loading: true });
        return usersApiService.CreateEmployee(employee).pipe(
          tap((res) => {
            if (!res.body) {
              patchState(store, { error: 'Failed to create user' });
            }
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage });
            return throwError(() => new Error("error creating user"));
          }),
          finalize(() => {
            patchState(store, { loading: false });
          }),
        );
      },
      updateEmployee(employee: IUserEdit): Observable<IBaseApiResponse<IUserCreateResponse>> {
        patchState(store, { loading: true });
        return usersApiService.UpdateEmployee(employee).pipe(
          tap((res) => {
            if (!res.body) {
              patchState(store, { error: 'Failed to update user' });
            }
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage });
            return throwError(() => new Error("error updating user"));
          }),
          finalize(() => {
            patchState(store, { loading: false });
          }),
        );
      },
    getUserByID(employeeID: string) {
        patchState(store, { loading: true });
        return usersApiService.GetEmployeeByJob(employeeID).pipe(
          tap((res) => {
             if (!res.body) {
              patchState(store, { error: 'Failed to get user' });
            }
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage });
            return throwError(() => new Error("error fetching user data"));
          }),
          finalize(() => {
            patchState(store, { loading: false });
          }),
        );
      },
      ToggleUserStatus (req: IUserUpdateStatus) {
        patchState(store, { loading: true });
        return usersApiService.ToggleEmployeeStatus(req).pipe(
          tap((res) => {
             if (!res.body) {
              patchState(store, { error: 'Failed to update user status' });
            }
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage });
            return throwError(() => new Error("error updating user status"));
          }),
          finalize(() => {
            patchState(store, { loading: false });
          }),
        );
      },
      getUserDetails(employeeID: string): Observable<IBaseApiResponse<IUserDetails>> {
        patchState(store, { loading: true });
        return usersApiService.GetEmployeeDetailsById(employeeID).pipe(
          tap((res) => {
            console.log('API result:', res);
            patchState(store, { user: res.body || null });
          }),
           catchError((error) => {
            patchState(store, { error: error.errorMessage });
            return throwError(() => new Error("error updating user status"));
          }),
          finalize(() => {
            patchState(store, { loading: false });
          }),
        );
      },
      getRoleManagmentList(filter: IRoleManagementFilterRequest) {
        patchState(store, { loading: true });
        return usersApiService.getRoleManagementList(filter).pipe(
          tap((res) => {
            const totalCount = res.body.pagination?.totalCount ?? 0;
            
            patchState(store, { roleManagementList: res.body.data || [], roleManagementCount: totalCount });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage });
            return throwError(() => new Error("error fetching role management data"));
          }),
          finalize(() => {
            patchState(store, { loading: false });
          }),
        );
      },
    }
  }),
);
