import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { catchError, finalize, map, tap, throwError } from 'rxjs';
import { DelegationApiService } from '../../api/system-employees/delegation-api-service';
import { I18nService } from '../../services/i18n/i18n.service';
import {
  ActiveEmployee,
  IAddDelegationRequest,
  IDelegationFilterRequest,
  IDelegationRecord,
  IEditDelegationRequest,
} from '../../interfaces/delegation.interface';

const initialState: {
  isLoading: boolean;
  isLoadingDetails: boolean;
  isProcessing: boolean;
  error: string | null;
  count: number;
  list: IDelegationRecord[];
  activeEmployees: ActiveEmployee[];
} = {
  isLoading: false,
  isLoadingDetails: false,
  isProcessing: false,
  error: null,
  count: 0,
  list: [],
  activeEmployees: [],
};
export const DelegationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const delegationApiService = inject(DelegationApiService);
    const i18n = inject(I18nService);
    return {
      getDelegationList(filter: IDelegationFilterRequest) {
        patchState(store, { isLoading: true, error: null });
        return delegationApiService.getDelegationList(filter).pipe(
          map((res) => {
            res.body.data = res.body.data.map((item: IDelegationRecord) => ({
              ...item,
              delegationActions: item.delegationActions || [],
            }));
            return res;
          }),
          tap((res) => {
            patchState(store, { list: res.body?.data || [] });
            patchState(store, { count: res.body?.pagination.totalCount || 0 });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || i18n.translate('delegation.errors.fetchList') });
            return throwError(() => new Error(i18n.translate('delegation.errors.fetchList')));
          }),
          finalize(() => {
            patchState(store, { isLoading: false });
          }),
        );
      },
      addDelegation(request: IAddDelegationRequest) {
        patchState(store, { isProcessing: true, error: null });
        return delegationApiService.addDelegation(request).pipe(
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            return throwError(() => new Error(error.errorMessage || i18n.translate('delegation.errors.add')));
          }),
        );
      },

      editDelegation(request: IEditDelegationRequest) {
        patchState(store, { isProcessing: true, error: null });
        return delegationApiService.editDelegation(request).pipe(
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            return throwError(() => new Error(error.errorMessage || i18n.translate('delegation.errors.edit')));
          }),
        );
      },

   getActiveEmployees() {
      patchState(store, { isLoadingDetails: true, error: null });

      return delegationApiService.getActiveEmployees().pipe(
        tap((res: any) => {
          const employees: ActiveEmployee[] =
            res?.body?.activeEmployees ?? [];

          patchState(store, { activeEmployees: employees });
        }),
        finalize(() => {
          patchState(store, { isLoadingDetails: false });
        }),
        catchError((error) => {
          patchState(store, {
            error: error?.errorMessage || i18n.translate('delegation.errors.fetchActiveEmployees'),
            activeEmployees: []
          });
          return throwError(() => new Error(i18n.translate('delegation.errors.fetchActiveEmployees')));
        }),
      );
    },

    deleteDelegation(id: string) {
        patchState(store, { isProcessing: true, error: null });
        return delegationApiService.deleteDelegation(id).pipe(
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            return throwError(() => new Error(error.errorMessage || i18n.translate('delegation.errors.delete')));
          }),
        );
      },

      cancelDelegation(id: string) {
        patchState(store, { isProcessing: true, error: null });
        return delegationApiService.cancleDelegation(id).pipe(
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            return throwError(() => new Error(error.errorMessage || i18n.translate('delegation.errors.cancel')));
          }),
        );
      }


    };
  }),
  withMethods((store) => {
    return {};
  }),
);
