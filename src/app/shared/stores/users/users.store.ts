import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { IRoleManagementRecord, IUser, IUserRecord, IUsersFilterRequest, IRoleManagementFilterRequest } from "../../interfaces";
import { UsersApiService } from "../../api/users/users-api-service";
import { inject } from "@angular/core";
import { catchError, finalize, tap, throwError } from "rxjs";
import { ERoles } from "../../enums";


const initialState: {
  loading: boolean;
  error: string | null;
  count: number;
  list: IUserRecord[]
  roleManagementList: IRoleManagementRecord[]
  roleManagementCount: number;
} = {
  loading: false,
  error: null,
  count: 0,
  list: [],
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
