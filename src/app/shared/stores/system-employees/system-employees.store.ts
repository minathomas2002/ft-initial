import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { SystemEmployeesApiService } from "../../api/system-employees/system-employees-api-service";
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


const initialState: {
  isLoading: boolean;
  isLoadingDetails: boolean;
  isProcessing: boolean;
  error: string | null;
  count: number;
  list: ISystemEmployeeRecord[]
  employeeDetails: ISystemEmployeeDetails | null;
  employeeDateFromHR: IEmployeeDateFromHR | null;
  activeEmployees: IActiveEmployee[] | null;
} = {
  isLoading: false,
  isLoadingDetails: false,
  isProcessing: false,
  error: null,
  count: 0,
  list: [],
  employeeDetails: null,
  employeeDateFromHR: null,
  activeEmployees: null,
}
export const SystemEmployeesStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods((store) => {
    const systemEmployeesApiService = inject(SystemEmployeesApiService);
    return {
      /* Get System Employee List */
      getSystemEmployeesList(filter: ISystemEmployeeFilterRequest) {
        patchState(store, { isLoading: true, error: null });
        return systemEmployeesApiService.getSystemEmployeesList(filter).pipe(
          map((res)=> {
             res.body.data = res.body.data.map((item: ISystemEmployeeRecord) => ({
                ...item,
                actions: item.actions?.filter(action => action !== EAdminUserActions.VIEW) || []
              }));
            return res;
          }),
          tap((res) => {
            patchState(store, { list: res.body?.data || [] });
            patchState(store, { count: res.body?.pagination.totalCount || 0 });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error fetching system employees' });
            return throwError(() => new Error('Error fetching system employees'));
          }),
          finalize(() => {
            patchState(store, { isLoading: false });
          }),
        );
      },

      /* Update System Employee */
      updateSystemEmployee(employee: IUpdateSystemEmployeeRequest) {
        patchState(store, { isProcessing: true, error: null });
        return systemEmployeesApiService.updateSystemEmployee(employee).pipe(
          tap((res) => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error updating system employee' });
            return throwError(() => new Error('Error updating system employee'));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
        );
      },

      /* Toggle System Employee Status */
      toggleSystemEmployeeStatus(id: string) {
        patchState(store, { isProcessing: true, error: null });
        return systemEmployeesApiService.toggleSystemEmployeeStatus(id).pipe(
          tap((res) => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error toggling system employee status' });
            return throwError(() => new Error('Error toggling system employee status'));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
        );
      },

      /* Create System Employee */
      createSystemEmployee(employee: ICreateSystemEmployeeRequest) {
        patchState(store, { isProcessing: true, error: null });
        return systemEmployeesApiService.createSystemEmployee(employee).pipe(
          tap((res) => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error creating system employee' });
            return throwError(() => new Error('Error creating system employee'));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
        );
      },

      /* Get System Employee Details */
      getSystemEmployeeDetails(id: string) {
        patchState(store, { isLoading: true, error: null });
        return systemEmployeesApiService.getEmployeeDetails(id).pipe(
          tap((res) => {
            patchState(store, { isLoading: false });
            patchState(store, { employeeDetails: res.body || null });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error getting system employee details' });
            return throwError(() => new Error('Error getting system employee details'));
          }),
          finalize(() => {
            patchState(store, { isLoading: false });
          }),
        );
      },

      /* Get Employee Date From HR */
      getEmployeeDateFromHR(employeeID: string) {
        patchState(store, { isLoadingDetails: true, error: null });
        return systemEmployeesApiService.getEmployeeDateFromHR(employeeID).pipe(
          tap((res) => {
            patchState(store, { isLoading: false });
            patchState(store, { employeeDateFromHR: res.body || null });
          }),
          catchError((error) => {
            patchState(store, {
              error: error.errorMessage || 'Error getting employee date from HR',
              employeeDateFromHR: null
            });
            return throwError(() => new Error('Error getting employee date from HR'));
          }),
          finalize(() => {
            patchState(store, { isLoadingDetails: false });
          }),
        );
      },

      /* Get Active Employees */
      getActiveEmployees() {
        patchState(store, { isLoading: true, error: null });
        return systemEmployeesApiService.getActiveEmployees().pipe(
          tap((res) => {
            patchState(store, { isLoading: false });
            patchState(store, { activeEmployees: res.body || [] });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error getting active employees' });
            return throwError(() => new Error('Error getting active employees'));
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
      /* Reset Employee Details */
      resetEmployeeDetails: () => {
        patchState(store, { employeeDetails: null });
      },
      /* Reset Employee Date From HR */
      resetEmployeeDateFromHR: () => {
        patchState(store, { employeeDateFromHR: null });
      },
      /* Reset Active Employees */
      resetActiveEmployees: () => {
        patchState(store, { activeEmployees: null });
      },
    };
  }),
);
