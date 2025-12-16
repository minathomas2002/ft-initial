import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';
<<<<<<< HEAD
import { ISettingAutoAssign, ISettingAutoAssignResponse, ISettingSla, ISettingSlaReq, IHolidaysManagementRecord, IHolidayManagementFilter, IHolidayCreating, INotificationSettingResponse, INotificationSettingUpdateRequest } from '../../interfaces/ISetting';
=======
import { ISettingAutoAssign, ISettingAutoAssignResponse, ISettingSla, ISettingSlaReq, IHolidaysManagementRecord, IHolidayManagementFilter, IHolidayCreating, IWorkingDay } from '../../interfaces/ISetting';
>>>>>>> sprint-2
import { IBaseApiResponse, IApiPaginatedResponse } from '../../interfaces';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class SettingsApiService {
  
  private readonly baseHttpService = inject(BaseHttpService);

  //Get admin settings 

  // get sla setting
    getSLASetting(): Observable<IBaseApiResponse<ISettingSla>> {
      return this.baseHttpService.get<ISettingSla, unknown>(API_ENDPOINTS.AdminSettings.getSlaSetting);
    }

  //// update sla setting
    updateSLASetting(req: ISettingSlaReq): Observable<IBaseApiResponse<boolean>> {
      return this.baseHttpService.post<boolean, ISettingSlaReq,unknown>(API_ENDPOINTS.AdminSettings.editSlaSetting, req);
    }
     // get sla setting
    getAutoAssignSetting(): Observable<IBaseApiResponse<ISettingAutoAssign>> {
      return this.baseHttpService.get<ISettingAutoAssign, unknown>(API_ENDPOINTS.AdminSettings.getAutoAssignSetting);
    }

  // update sla setting
    updateAutoAssignSetting(req: ISettingAutoAssign): Observable<IBaseApiResponse<ISettingAutoAssignResponse>> {
      return this.baseHttpService.post <ISettingAutoAssignResponse, ISettingAutoAssign, unknown>(API_ENDPOINTS.AdminSettings.editAutoAssignSetting, req);
    }

  // Holidays management
    getHolidaysList(filter: IHolidayManagementFilter): Observable<IBaseApiResponse<IApiPaginatedResponse<IHolidaysManagementRecord[]>>> {
      return this.baseHttpService.post<IApiPaginatedResponse<IHolidaysManagementRecord[]>, IHolidayManagementFilter, unknown>(API_ENDPOINTS.AdminSettings.getHolidaysList, filter);
    }

    createHoliday(req: IHolidayCreating): Observable<IBaseApiResponse<IHolidaysManagementRecord>> {
      return this.baseHttpService.post<IHolidaysManagementRecord, IHolidayCreating, unknown>(API_ENDPOINTS.AdminSettings.createHoliday, req);
    }

    updateHoliday(req: IHolidayCreating): Observable<IBaseApiResponse<IHolidaysManagementRecord>> {
      return this.baseHttpService.put<IHolidaysManagementRecord, IHolidayCreating, unknown>(API_ENDPOINTS.AdminSettings.updateHoliday, req);
    }

    deleteHoliday(id: string): Observable<IBaseApiResponse<boolean>> {
      return this.baseHttpService.delete<boolean, unknown>(`${API_ENDPOINTS.AdminSettings.deleteHoliday}/${id}`);
    }

    getNotificationSetting(channelId: number):Observable<IBaseApiResponse<INotificationSettingResponse[]>>{
      return this.baseHttpService.get<INotificationSettingResponse[], unknown>(API_ENDPOINTS.AdminSettings.getNotificationSetting+channelId);
    }

    updateNotificationSetting(req: INotificationSettingUpdateRequest): Observable<IBaseApiResponse<boolean>> {
      return this.baseHttpService.post<boolean, INotificationSettingUpdateRequest, unknown>(API_ENDPOINTS.AdminSettings.editNotificationSetting, req);
    }
      // Working Days management
    getWorkingDays(): Observable<IBaseApiResponse<IWorkingDay[]>> {
      return this.baseHttpService.get<IWorkingDay[], unknown>(API_ENDPOINTS.AdminSettings.getWorkingDays);
    }
}
