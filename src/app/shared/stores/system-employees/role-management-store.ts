import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { RoleManagement } from '../../api/system-employees/role-management/role-management';
import { IRoleManagementAssignmentFilterRequest, IRoleManagementAssignmentRecord, ITransferRoleRequest } from '../../interfaces';
import { ICurrentRoleHolders } from '../../interfaces';

const initialState: {
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  roleManagementList: IRoleManagementAssignmentRecord[];
  currentRoleHolders: ICurrentRoleHolders[];
} = {
  isLoading: false,
  isProcessing: false,
  error: null,
  roleManagementList: [],
  currentRoleHolders: [],
}

export const RoleManagementStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const roleManagementApiService = inject(RoleManagement);

    return {
      getRoleManagementList(filter: IRoleManagementAssignmentFilterRequest) {
        patchState(store, { isLoading: true, error: null });
        return roleManagementApiService.getRoleManagementList(filter).pipe(
          tap((res) => {
            patchState(store, { roleManagementList: res.body || [] });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error fetching role management list' });
            return throwError(() => new Error('Error fetching role management list'));
          }),
          finalize(() => {
            patchState(store, { isLoading: false });
          }),
        );
      },
      getCurrentRoleHolders() {
        patchState(store, { isLoading: true, error: null });
        return roleManagementApiService.getCurrentRoleHolders().pipe(
          tap((res) => {
            patchState(store, { currentRoleHolders: res.body || [] });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error fetching current role holders' });
            return throwError(() => new Error('Error fetching current role holders'));
          }),
          finalize(() => {
            patchState(store, { isLoading: false });
          }),
        );
      },
      transferRole(request: ITransferRoleRequest) {
        patchState(store, { isProcessing: true, error: null });
        return roleManagementApiService.transferRole(request).pipe(
          tap((res) => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error transferring role' });
            return throwError(() => new Error('Error transferring role'));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
        );
      },
    };
  }),
);
