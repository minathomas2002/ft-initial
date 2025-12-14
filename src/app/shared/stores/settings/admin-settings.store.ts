import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { ISettingAutoAssign, ISettingSla, ISettingSlaReq, IHolidaysManagementRecord, IHolidayManagementFilter, IHolidayCreating } from "../../interfaces/ISetting";
import { SettingsApiService } from "../../api/settings/settings-api-service";
import { inject } from "@angular/core";
import { catchError, finalize, map, tap, throwError } from "rxjs";


const initialState: {
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  settingAutoAssign: ISettingAutoAssign;
  settingSla: ISettingSla | null;
  holidaysList: IHolidaysManagementRecord[];
  holidaysTotalCount: number;
} = {
  isLoading: false,
  isProcessing: false,
  error: null,
  settingAutoAssign: { isEnabled: false } as ISettingAutoAssign,
  settingSla: null,
  holidaysList: [],
  holidaysTotalCount: 0
}


export const adminSettingsStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods((store) => {

    const settingApiService = inject(SettingsApiService);
    return {
      /* Get Sla setting*/
      getSlaSetting() {
        patchState(store, { isLoading: true, error: null });
        return settingApiService.getSLASetting().pipe(
          map((res) => {
            res.body.remainingDaysValidation = (res.body.remainingDaysValidation == 0) ? 1 : res.body.remainingDaysValidation;
            return res;
          }),
          tap((res) => {
            patchState(store, { isLoading: false });
            patchState(store, { settingSla: res.body || null });
          }),
          catchError((error) => {
            patchState(store, {
              error: error.errorMessage || 'Error getting sla setting',
              settingSla: null
            });
            return throwError(() => new Error('Error getting sla setting'));
          }),
          finalize(() => {
            patchState(store, { isLoading: false });
          }),
        );
      },
      /* Update Sla setting*/
      updateSlaSetting(req: ISettingSlaReq) {
        patchState(store, { isProcessing: true, error: null });
        return settingApiService.updateSLASetting(req).pipe(
          tap((res) => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error updating sla setting' });
            return throwError(() => new Error('Error updating sla setting'));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
        );
      },

      /* Get Sla setting*/
      getAutoAssignSetting() {
        patchState(store, { isLoading: true, error: null });
        return settingApiService.getAutoAssignSetting().pipe(
          tap((res) => {
            patchState(store, { isLoading: false });
            patchState(store, { settingAutoAssign: res.body });
          }),
          catchError((error) => {
            patchState(store, {
              error: error.errorMessage || 'Error getting auto assign setting',
              settingAutoAssign: { isEnabled: false } as ISettingAutoAssign
            });
            return throwError(() => new Error('Error getting auto assign setting'));
          }),
          finalize(() => {
            patchState(store, { isLoading: false });
          }),
        );
      },
      /* Update Sla setting*/
      updateAutoAssignSetting(req: ISettingAutoAssign) {
        patchState(store, { isProcessing: true, error: null });
        return settingApiService.updateAutoAssignSetting(req).pipe(
          tap((res) => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error updating auto assign setting' });
            return throwError(() => new Error('Error updating auto assign setting'));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
        );
      },

      /* Get Holidays List*/
      getHolidaysList(filter: IHolidayManagementFilter) {
        patchState(store, { isLoading: true, error: null });
        return settingApiService.getHolidaysList(filter).pipe(
          tap((res) => {
            const msPerDay = 1000 * 60 * 60 * 24;
            var resData = res.body.data.map((item: IHolidaysManagementRecord) => {
              item.numberOfDays =
                Math.floor(
                  (new Date(item.dateTo).getTime() - new Date(item.dateFrom).getTime()) / msPerDay
                ) + 1;
              return item;
            });
            patchState(store, {
              isLoading: false,
              holidaysList: resData || [],
              holidaysTotalCount: res.body.pagination?.totalCount || 0
            });
          }),
          catchError((error) => {
            patchState(store, {
              error: error.errorMessage || 'Error getting holidays list',
              holidaysList: [],
              holidaysTotalCount: 0
            });
            return throwError(() => new Error('Error getting holidays list'));
          }),
          finalize(() => {
            patchState(store, { isLoading: false });
          }),
        );
      },

      /* Create Holiday*/
      createHoliday(req: IHolidayCreating) {
        patchState(store, { isProcessing: true, error: null });
        return settingApiService.createHoliday(req).pipe(
          tap((res) => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error creating holiday' });
            return throwError(() => new Error('Error creating holiday'));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
        );
      },

      /* Update Holiday*/
      updateHoliday(req: IHolidayCreating) {
        patchState(store, { isProcessing: true, error: null });
        return settingApiService.updateHoliday(req).pipe(
          tap((res) => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error updating holiday' });
            return throwError(() => new Error('Error updating holiday'));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
        );
      },

      /* Delete Holiday*/
      deleteHoliday(id: string) {
        patchState(store, { isProcessing: true, error: null });
        return settingApiService.deleteHoliday(id).pipe(
          tap((res) => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error deleting holiday' });
            return throwError(() => new Error('Error deleting holiday'));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
        );
      },

    }
  })
);
