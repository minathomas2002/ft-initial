import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { RoleManagement } from '../../api/system-employees/role-management/role-management';
import { I18nService } from '../../services/i18n/i18n.service';
import { IRoleManagementAssignmentFilterRequest, IRoleManagementAssignmentRecord, ITransferRoleRequest } from '../../interfaces';
import { ICurrentRoleHolders } from '../../interfaces';

const initialState: {
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  roleManagementList: IRoleManagementAssignmentRecord[];
  roleManagementCount: number;
  currentRoleHolders: ICurrentRoleHolders[];
} = {
  isLoading: false,
  isProcessing: false,
  error: null,
  roleManagementList: [],
  roleManagementCount: 0,
  currentRoleHolders: [],
}

export const RoleManagementStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const roleManagementApiService = inject(RoleManagement);
    const i18n = inject(I18nService);

    return {
      getRoleManagementList(filter: IRoleManagementAssignmentFilterRequest) {
        patchState(store, { isLoading: true, error: null });
        return roleManagementApiService.getRoleManagementList(filter).pipe(
          tap((res) => {
            // Handle both array and paginated response
            const data = Array.isArray(res.body) ? res.body : (res.body as any)?.data || [];
            const count = Array.isArray(res.body) ? data.length : (res.body as any)?.pagination?.totalCount || data.length;
            patchState(store, { roleManagementList: data, roleManagementCount: count });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || i18n.translate('users.errors.fetchRoleManagementList') });
            return throwError(() => new Error(i18n.translate('users.errors.fetchRoleManagementList')));
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
            patchState(store, { error: error.errorMessage || i18n.translate('users.errors.fetchCurrentRoleHolders') });
            return throwError(() => new Error(i18n.translate('users.errors.fetchCurrentRoleHolders')));
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
            patchState(store, { error: error.errorMessage || i18n.translate('users.errors.transferRole') });
            return throwError(() => new Error(i18n.translate('users.errors.transferRole')));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
        );
      },
    };
  }),
);
