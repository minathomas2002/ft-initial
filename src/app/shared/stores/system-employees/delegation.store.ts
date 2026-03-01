import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { catchError, finalize, map, tap, throwError } from 'rxjs';
import { DelegationApiService } from '../../api/system-employees/delegation-api-service';
import {
  ActiveEmployee,
  IAddDelegationRequest,
  IDelegationFilterRequest,
  IDelegationRecord,
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
            patchState(store, { error: error.errorMessage || 'Error fetching delegation list' });
            return throwError(() => new Error('Error fetching delegation list'));
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
            patchState(store, { error: error.errorMessage || 'Error adding delegation' });
            return throwError(() => new Error(error.errorMessage || 'Error adding delegation'));
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
            error: error?.errorMessage || 'Error fetching active employees',
            activeEmployees: []
          });
          return throwError(() => new Error('Error fetching active employees'));
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
            return throwError(() => new Error(error.errorMessage || 'Error deleting delegation'));
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
            return throwError(() => new Error(error.errorMessage || 'Error canceling delegation'));
          }),
        );
      }


    };
  }),
  withMethods((store) => {
    return {};
  }),
);
