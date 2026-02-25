import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";
import { catchError, finalize, map, tap, throwError } from "rxjs";
import {
  IActiveEmployee,
  ICreateSystemEmployeeRequest,
  IEmployeeDateFromHR,
  ISystemEmployeeDetails,
  ISystemEmployeeFilterRequest,
  ISystemEmployeeRecord,
  IUpdateSystemEmployeeRequest,
} from "../../interfaces";
import { EAdminUserActions } from "../../enums";
import { DelegationApiService } from "../../api/system-employees/delegation-api-service";
import { IDelegationDetails, IDelegationFilterRequest, IDelegationRecord } from "../../interfaces/delegation.interface";


const initialState: {
  isLoading: boolean;
  isLoadingDetails: boolean;
  isProcessing: boolean;
  error: string | null;
  count: number;
  list: IDelegationRecord[]
  delegationDetails: IDelegationDetails | null;
} = {
  isLoading: false,
  isLoadingDetails: false,
  isProcessing: false,
  error: null,
  count: 0,
  list: [],
  delegationDetails: null
}
export const DelegationStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods((store) => {
    const delegationApiService = inject(DelegationApiService);
    return {
      getDelegationList(filter: IDelegationFilterRequest) {
        patchState(store, { isLoading: true, error: null });
        return delegationApiService.getDelegationList(filter).pipe(
          map((res)=> {
             res.body.data = res.body.data.map((item: IDelegationRecord) => ({
                ...item,
                actions: item.actions || []
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




      /* Get System Employee Details */
      getSystemEmployeeDetails(id: string) {
        patchState(store, { isLoading: true, error: null });
        return delegationApiService.getDelegationDetails(id).pipe(
          tap((res) => {
            patchState(store, { isLoading: false });
            patchState(store, { delegationDetails: res.body || null });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error getting delegation details' });
            return throwError(() => new Error('Error getting delegation details'));
          }),
          finalize(() => {
            patchState(store, { isLoading: false });
          }),
        );
      },




    }
  }),
  withMethods((store) => {
    return {
      /* Reset Delegation Details */
      resetDelegationDetails: () => {
        patchState(store, { delegationDetails: null });
      },
    };
  }),
);
