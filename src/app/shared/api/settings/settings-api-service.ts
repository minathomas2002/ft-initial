import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from '../../services/Base-HTTP/base-Http.service';
import { ISettingAutoAssign, ISettingAutoAssignResponse, ISettingSla, ISettingSlaReq } from '../../interfaces/ISetting';
import { IBaseApiResponse } from '../../interfaces';
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
}
