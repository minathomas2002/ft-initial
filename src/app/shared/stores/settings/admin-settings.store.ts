import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { ISettingAutoAssign, ISettingSla, ISettingSlaReq, IHolidaysManagementRecord, IHolidayManagementFilter, IHolidayCreating,IWorkingDay, INotificationSettingResponse, INotificationSettingUpdateRequest } from "../../interfaces/ISetting";
import { SettingsApiService } from "../../api/settings/settings-api-service";
import { inject } from "@angular/core";
import { catchError, finalize, map, tap, throwError } from "rxjs";
import { ENotificationChannel } from "../../enums/notificationSetting.enum";
import { I18nService } from "../../services/i18n/i18n.service";


const initialState: {
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  settingAutoAssign: ISettingAutoAssign;
  settingSla: ISettingSla | null;
  holidaysList: IHolidaysManagementRecord[];
  holidaysTotalCount: number;
  systemNotification: INotificationSettingResponse[];
  emailNotification: INotificationSettingResponse[];
  workingDaysList: IWorkingDay[];
} = {
  isLoading: false,
  isProcessing: false,
  error: null,
  settingAutoAssign: { isEnabled: false } as ISettingAutoAssign,
  settingSla: null,
  holidaysList: [],
  holidaysTotalCount: 0,
  systemNotification:[],
  emailNotification: [],
  workingDaysList: []
}


export const AdminSettingsStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods((store) => {

    const settingApiService = inject(SettingsApiService);
    const i18n = inject(I18nService);
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
              error: error.errorMessage || i18n.translate('setting.errors.getSlaSetting'),
              settingSla: null
            });
            return throwError(() => new Error(i18n.translate('setting.errors.getSlaSetting')));
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
            patchState(store, { error: error.errorMessage || i18n.translate('setting.errors.updateSlaSetting') });
            return throwError(() => new Error(i18n.translate('setting.errors.updateSlaSetting')));
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
              error: error.errorMessage || i18n.translate('setting.errors.getAutoAssignSetting'),
              settingAutoAssign: { isEnabled: false } as ISettingAutoAssign
            });
            return throwError(() => new Error(i18n.translate('setting.errors.getAutoAssignSetting')));
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
            patchState(store, { error: error.errorMessage || i18n.translate('setting.errors.updateAutoAssignSetting') });
            return throwError(() => new Error(i18n.translate('setting.errors.updateAutoAssignSetting')));
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
              error: error.errorMessage || i18n.translate('setting.errors.getHolidaysList'),
              holidaysList: [],
              holidaysTotalCount: 0
            });
            return throwError(() => new Error(i18n.translate('setting.errors.getHolidaysList')));
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
            patchState(store, { error: error.errorMessage || i18n.translate('setting.errors.createHoliday') });
            return throwError(() => new Error(i18n.translate('setting.errors.createHoliday')));
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
            patchState(store, { error: error.errorMessage || i18n.translate('setting.errors.updateHoliday') });
            return throwError(() => new Error(i18n.translate('setting.errors.updateHoliday')));
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
            patchState(store, { error: error.errorMessage || i18n.translate('setting.errors.deleteHoliday') });
            return throwError(() => new Error(i18n.translate('setting.errors.deleteHoliday')));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
        );
      },

      getNotificationSetting( channel: ENotificationChannel,stateKey: 'systemNotification' | 'emailNotification') {
        
        patchState(store, { isLoading: true, error: null });
        return settingApiService.getNotificationSetting(channel).pipe(
          tap((res) => {
            patchState(store, { isLoading: false });
            patchState(store, { [stateKey] : res.body });
          }),
          catchError((error) => {
            patchState(store, {
              error: error.errorMessage || i18n.translate('setting.errors.getNotificationSetting'),
              [stateKey]: []
            });
            return throwError(() => new Error(i18n.translate('setting.errors.getNotificationSetting')));
            }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
        );
      },
      /* Get Working Days List*/
      getWorkingDays() {
        patchState(store, { isLoading: true, error: null });
        return settingApiService.getWorkingDays().pipe(
          tap((res) => {
            patchState(store, {
              isLoading: false,
              workingDaysList: res.body || []
            });
          }),
          catchError((error) => {
            patchState(store, {
              error: error.errorMessage || i18n.translate('setting.errors.getWorkingDays'),
              workingDaysList: []
            });
            return throwError(() => new Error(i18n.translate('setting.errors.getWorkingDays')));
          }),
          finalize(() => {
            patchState(store, { isLoading: false });
          }),
        );
      },
      updateNotificationSetting(req: INotificationSettingUpdateRequest) {
        patchState(store, { isProcessing: true, error: null });
        return settingApiService.updateNotificationSetting(req).pipe(
          tap((res) => {
            patchState(store, { isProcessing: false });
            patchState(store, { systemNotification : [], emailNotification : [] });
           
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || i18n.translate('setting.errors.updateNotification') });
            return throwError(() => new Error(i18n.translate('setting.errors.updateNotification')));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
        );
      },


    }
  })
);
