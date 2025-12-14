import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { ISettingAutoAssign, ISettingSla, ISettingSlaReq } from "../../interfaces/ISetting";
import { SettingsApiService } from "../../api/settings/settings-api-service";
import { inject } from "@angular/core";
import { catchError, finalize, map, tap, throwError } from "rxjs";


const initialState: {
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  settingAutoAssign: ISettingAutoAssign;
  settingSla: ISettingSla | null;

} = {
  isLoading: false,
  isProcessing: false,
  error: null,
  settingAutoAssign: { isEnabled: false } as ISettingAutoAssign,
  settingSla: null,
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
          map((res)=>{
            res.body.remainingDaysValidation = (res.body.remainingDaysValidation == 0)? 1 : res.body.remainingDaysValidation;
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
            patchState(store, { settingAutoAssign : res.body });
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

  }
  })
);
